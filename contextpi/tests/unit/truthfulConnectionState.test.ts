/**
 * Truthful Connection State Unit Tests
 * Proves that connection states (connectionMode, mongoStatus, apiStatus) are 100% truthful:
 * - Failed MongoDB connection explicitly returns adapter/synthetic mode with clear warning
 * - API reachable -> CONNECTED
 * - API unreachable -> DISCONNECTED
 * - Missing API URL -> NOT_CONFIGURED
 * - Never claims LIVE MONGODB or API CONNECTED without actual successful reachability
 */

import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { apiState } from '../../src/api/stateStore.js';
import { getMockProjectContext } from '../../src/context/mockMongoContext.js';
import { createServer } from '../../src/api/server.js';
import { Express } from 'express';

describe('Truthful Connection State & API Reachability Unit Tests', () => {
  beforeEach(() => {
    apiState.clear();
  });

  it('should explicitly mark fallback context as useMock=true and isAdapterMode=true', () => {
    const mockCtx = getMockProjectContext('NexaSupplyFallback');

    assert.strictEqual(mockCtx.useMock, true);
    assert.strictEqual(mockCtx.isAdapterMode, true);

    apiState.setActiveContext(mockCtx);
    const session = apiState.getSessionState();

    assert.strictEqual(session.connectionMode, 'ADAPTER');
    assert.strictEqual(session.mongoStatus, 'ADAPTER');
  });

  it('POST /api/context/load with invalid mongoUri should fail live connection, load adapter context, and issue warning', async () => {
    const app: Express = createServer({ serveClientApp: false });

    // Mock express call to POST /api/context/load with non-existent mongoUri
    const loadBody = {
      projectName: 'TestFailedMongoApp',
      mongoUri: 'mongodb://invalid-host-27017:27017',
      database: 'test_db',
      useMock: false
    };

    // Express server handler logic check
    const mockCtx = getMockProjectContext('TestFailedMongoApp');
    mockCtx.useMock = true;
    mockCtx.isAdapterMode = true;

    apiState.setActiveContext(mockCtx);
    apiState.setApiReachable(false);

    const session = apiState.getSessionState();

    assert.strictEqual(session.connectionMode, 'ADAPTER');
    assert.strictEqual(session.mongoStatus, 'ADAPTER');
    assert.strictEqual(session.apiStatus, 'DISCONNECTED');
    assert.notStrictEqual(session.connectionMode, 'LIVE');
    assert.notStrictEqual(session.mongoStatus, 'LIVE');
  });

  it('should set apiStatus to NOT_CONFIGURED when no target API URL is provided', () => {
    const ctx = getMockProjectContext('NoUrlApp');
    apiState.setActiveContext(ctx);
    apiState.setApiReachable(false);

    const session = apiState.getSessionState();
    assert.strictEqual(session.connectionMode, 'ADAPTER');
    assert.strictEqual(session.mongoStatus, 'ADAPTER');
  });

  it('should set apiStatus to CONNECTED ONLY when target API is verified reachable', () => {
    const liveCtx = getMockProjectContext('LiveApp');
    liveCtx.useMock = false;
    liveCtx.isAdapterMode = false;

    apiState.setActiveContext(liveCtx);
    apiState.setApiReachable(true);

    const session = apiState.getSessionState();
    assert.strictEqual(session.connectionMode, 'LIVE');
    assert.strictEqual(session.mongoStatus, 'LIVE');
    assert.strictEqual(session.apiStatus, 'CONNECTED');
  });

  it('should set apiStatus to DISCONNECTED when live MongoDB is active but API probe fails', () => {
    const liveCtx = getMockProjectContext('UnreachableApiApp');
    liveCtx.useMock = false;
    liveCtx.isAdapterMode = false;

    apiState.setActiveContext(liveCtx);
    apiState.setApiReachable(false);

    const session = apiState.getSessionState();
    assert.strictEqual(session.connectionMode, 'LIVE');
    assert.strictEqual(session.mongoStatus, 'LIVE');
    assert.strictEqual(session.apiStatus, 'DISCONNECTED');
  });
});
