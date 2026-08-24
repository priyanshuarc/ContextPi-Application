import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { BedrockQwenProvider } from '../../src/llm/bedrockQwenProvider.js';
import { PlaywrightGenerationPrompt } from '../../src/llm/LLMProvider.js';

describe('Bedrock Qwen LLM Provider Unit Tests', () => {
  const samplePrompt: PlaywrightGenerationPrompt = {
    testId: 'TC-ITEMS-CRUD-001',
    category: 'CRUD',
    priority: 'CRITICAL',
    targetEntity: 'items',
    source: 'MONGO_SCHEMA',
    sourceRef: 'items',
    reasoning: 'Create items happy path',
    httpMethod: 'POST',
    resolvedRoute: '/forms/formCreate',
    expectedResult: { statusCode: 201 },
    fields: [{ name: 'itemCode', dataType: 'String', mandatory: true, inputType: 'text' }],
    sampleData: { itemCode: 'ITEM-001' },
    payloadTemplate: { itemCode: 'ITEM-001' },
    dependencies: [],
    projectName: 'SyntheticProject'
  };

  it('should reflect unconfigured availability when bearer token is missing', () => {
    const provider = new BedrockQwenProvider({ bearerToken: '' });
    assert.strictEqual(provider.isAvailable(), false);
  });

  it('should reflect available state when bearer token is provided', () => {
    const provider = new BedrockQwenProvider({ bearerToken: 'test-bearer-token-12345' });
    assert.strictEqual(provider.isAvailable(), true);
  });

  it('should return AI GENERATION UNAVAILABLE error when token is missing', async () => {
    const provider = new BedrockQwenProvider({ bearerToken: '' });
    const result = await provider.generatePlaywrightSpec(samplePrompt);
    assert.strictEqual(result.success, false);
    assert.strictEqual(result.engineUsed, 'QWEN3_CODER');
    assert.ok(result.error?.includes('AI GENERATION UNAVAILABLE'));
  });

  it('APPLICATION-AGNOSTICISM TEST: Generate LLM prompt structure for distinct synthetic domains with zero code changes', async () => {
    const domainAPrompt: PlaywrightGenerationPrompt = {
      ...samplePrompt,
      targetEntity: 'items',
      resolvedRoute: '/forms/formCreate/items'
    };

    const domainBPrompt: PlaywrightGenerationPrompt = {
      ...samplePrompt,
      testId: 'TC-PATIENTS-CRUD-001',
      targetEntity: 'patients',
      resolvedRoute: '/forms/formCreate/patients'
    };

    const provider = new BedrockQwenProvider({ bearerToken: '' });
    const resA = await provider.generatePlaywrightSpec(domainAPrompt);
    const resB = await provider.generatePlaywrightSpec(domainBPrompt);

    assert.strictEqual(resA.testId, 'TC-ITEMS-CRUD-001');
    assert.strictEqual(resB.testId, 'TC-PATIENTS-CRUD-001');
    assert.strictEqual(resA.traceability.targetEntity, 'items');
    assert.strictEqual(resB.traceability.targetEntity, 'patients');
  });
});
