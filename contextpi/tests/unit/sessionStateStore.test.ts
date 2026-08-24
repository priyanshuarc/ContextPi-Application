/**
 * Session State Store & Identity Safeguards Unit Tests
 * Verifies AuthoritativeSessionState, reachability logic, session identity safeguards,
 * and strict cascade invalidation.
 */

import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { apiState } from '../../src/api/stateStore.js';
import { getMockProjectContext } from '../../src/context/mockMongoContext.js';

describe('Authoritative Session State & Identity Safeguard Unit Tests', () => {
  beforeEach(() => {
    apiState.clear();
  });

  it('should return DISCONNECTED and NOT_CONFIGURED when no context is loaded', () => {
    const session = apiState.getSessionState();

    assert.strictEqual(session.connectionMode, 'DISCONNECTED');
    assert.strictEqual(session.mongoStatus, 'NOT_CONNECTED');
    assert.strictEqual(session.apiStatus, 'NOT_CONFIGURED');
    assert.strictEqual(session.projectName, null);
    assert.strictEqual(session.catalogueId, null);
    assert.strictEqual(session.catalogueStatus, null);
    assert.strictEqual(session.selectedCount, 0);
    assert.strictEqual(session.generatedSpecCount, 0);
    assert.strictEqual(session.latestRunId, null);
    assert.strictEqual(session.passRatePercentage, undefined);
  });

  it('should reflect ADAPTER MODE when adapter/mock context is loaded', () => {
    const mockContext = getMockProjectContext('NexaSupplyAdapter');
    apiState.setActiveContext(mockContext);

    const session = apiState.getSessionState();

    assert.strictEqual(session.connectionMode, 'ADAPTER');
    assert.strictEqual(session.mongoStatus, 'ADAPTER');
    assert.strictEqual(session.projectName, 'NexaSupplyAdapter');
  });

  it('should reflect LIVE MONGODB and DISCONNECTED when real MongoDB context is loaded without verified API reachability', () => {
    const liveContext = getMockProjectContext('RealMongoApp');
    liveContext.useMock = false;
    liveContext.isAdapterMode = false;

    apiState.setActiveContext(liveContext);
    apiState.setApiReachable(false);

    const session = apiState.getSessionState();

    assert.strictEqual(session.connectionMode, 'LIVE');
    assert.strictEqual(session.mongoStatus, 'LIVE');
    assert.strictEqual(session.apiStatus, 'DISCONNECTED');
    assert.notStrictEqual(session.apiStatus, 'CONNECTED');
  });

  it('should update apiStatus to CONNECTED ONLY after explicit reachability verification', () => {
    const liveContext = getMockProjectContext('RealMongoApp');
    liveContext.useMock = false;
    liveContext.isAdapterMode = false;

    apiState.setActiveContext(liveContext);
    apiState.setApiReachable(true);

    const session = apiState.getSessionState();

    assert.strictEqual(session.connectionMode, 'LIVE');
    assert.strictEqual(session.mongoStatus, 'LIVE');
    assert.strictEqual(session.apiStatus, 'CONNECTED');
  });

  it('should strictly invalidate previous specs and runs when a new catalogue is generated', () => {
    const mockContext = getMockProjectContext('CascadeApp');
    apiState.setActiveContext(mockContext);

    // 1. Add catalogue
    const store1 = apiState.addCatalogue({
      projectName: 'CascadeApp',
      createdAt: new Date().toISOString(),
      status: 'APPROVED',
      entries: []
    });

    // 2. Set generated specs & run
    apiState.setGeneratedSpecs({
      generationId: 'gen-1',
      catalogueId: 'cat-1',
      sessionId: apiState.getSessionId(),
      generatedFiles: ['items.spec.ts'],
      testCount: 1,
      outputDir: 'test-output',
      generatedAt: new Date().toISOString(),
      traceabilitySummary: { totalSpecs: 1, categories: {}, priorities: {} }
    });

    assert.strictEqual(apiState.getSessionState().generatedSpecCount, 1);

    // 3. Add new catalogue -> MUST invalidate specs
    apiState.addCatalogue({
      projectName: 'CascadeApp',
      createdAt: new Date().toISOString(),
      status: 'DRAFT',
      entries: []
    });

    assert.strictEqual(apiState.getSessionState().generatedSpecCount, 0);
    assert.strictEqual(apiState.getSessionState().latestRunId, null);
    assert.strictEqual(apiState.getSessionState().passRatePercentage, undefined);
  });

  it('should reject stale generated specs or runs carrying an outdated sessionId safeguard', () => {
    const mockContext = getMockProjectContext('StaleTestApp');
    apiState.setActiveContext(mockContext);

    const oldSessionId = apiState.getSessionId();

    apiState.setGeneratedSpecs({
      generationId: 'gen-stale',
      catalogueId: 'cat-stale',
      sessionId: oldSessionId,
      generatedFiles: ['old.spec.ts'],
      testCount: 5,
      outputDir: 'test-output',
      generatedAt: new Date().toISOString(),
      traceabilitySummary: { totalSpecs: 5, categories: {}, priorities: {} }
    });

    assert.ok(apiState.getLatestGeneratedSpecs() !== undefined);

    // Reset session
    apiState.resetSessionState();

    // Outdated specs must not be returned
    assert.strictEqual(apiState.getLatestGeneratedSpecs(), undefined);
  });
});
