/**
 * Target Independence & AI Repair Engine Unit Tests
 * Proves that Contextπ's AIRepairEngine is 100% application-agnostic.
 * Tests TWO distinct synthetic domains without any source-code changes to Contextπ.
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { AIRepairEngine } from '../../src/ai/aiRepairEngine.ts';
import { RepairValidator } from '../../src/ai/repairValidator.ts';
import { BedrockQwenRepairProvider } from '../../src/ai/providers/bedrockQwenRepairProvider.ts';
import { FailureContext, RepairProposal } from '../../src/types/repair.ts';
import { ProjectContext } from '../../src/types/context.ts';
import { CatalogEntry } from '../../src/types/catalogue.ts';

// Mock LLM Provider returning predictable synthetic proposals
class SyntheticRepairLLMProvider {
  constructor(private expectedProposal: RepairProposal) {}
  public isAvailable(): boolean { return true; }
  public getModelId(): string { return 'synthetic-qwen3-coder'; }
  public async diagnose(): Promise<string> {
    return JSON.stringify(this.expectedProposal);
  }
}

test('TARGET INDEPENDENCE TEST — Domain A: Shipments & Warehouses & DispatchOrder', async () => {
  const domainAContext: ProjectContext = {
    projectName: 'GlobalLogistics',
    schemas: [
      {
        schemaName: 'shipments',
        active: true,
        fields: [
          { name: 'shipmentCode', dataType: 'String', mandatoryField: true, inputType: 'text', unique: true },
          { name: 'weightKg', dataType: 'Number', mandatoryField: true, inputType: 'number' },
          { name: 'status', dataType: 'String', mandatoryField: true, inputType: 'select', enum: ['pending', 'dispatched', 'delivered'] }
        ],
        relationships: []
      },
      {
        schemaName: 'warehouses',
        active: true,
        fields: [
          { name: 'warehouseCode', dataType: 'String', mandatoryField: true, inputType: 'text' },
          { name: 'capacity', dataType: 'Number', mandatoryField: false, inputType: 'number' }
        ],
        relationships: []
      }
    ],
    functions: [
      {
        functionName: 'dispatchOrder',
        description: 'Dispatch shipment to warehouse',
        active: true,
        route: '/function/dispatchOrder',
        parameters: [{ name: 'shipmentId', type: 'string', required: true }]
      }
    ]
  };

  const domainACatalogEntry: CatalogEntry = {
    testId: 'TC-SHIPMENTS-CRUD-001',
    category: 'CRUD',
    targetEntity: 'shipments',
    source: 'MONGO_SCHEMA',
    sourceRef: 'shipments',
    reasoning: 'Create shipment happy path',
    priority: 'HIGH',
    dependencies: [],
    payloadTemplate: { shipmentCode: 'SHP10001', weightKg: 'INVALID_WEIGHT', status: 'pending' },
    httpMethod: 'POST',
    targetRouteKey: 'formCreate',
    expectedResult: { statusCode: 400 },
    selected: true
  };

  const failureContext: FailureContext = {
    testId: 'TC-SHIPMENTS-CRUD-001',
    targetEntity: 'shipments',
    projectContext: domainAContext,
    schema: domainAContext.schemas[0],
    catalogEntry: domainACatalogEntry,
    originalSpecCode: `test('TC-SHIPMENTS-CRUD-001 — Create shipment', async ({ request }) => {
      const payload = { "shipmentCode": "SHP10001", "weightKg": "INVALID_WEIGHT", "status": "pending" };
      const response = await request.post('/forms/formCreate/shipments', { data: payload });
      expect(response.status()).toBe(400);
    });`,
    httpMethod: 'POST',
    url: 'http://localhost:3000/forms/formCreate/shipments',
    requestPayload: { shipmentCode: 'SHP10001', weightKg: 'INVALID_WEIGHT', status: 'pending' },
    expectedStatus: 400,
    actualStatus: 400,
    actualResponseBody: { error: { message: 'weightKg must be a number' } },
    executionError: 'Expected 400, received 201'
  };

  const expectedProposal: RepairProposal = {
    diagnosis: "Field 'weightKg' must be a numeric value.",
    confidence: 0.95,
    repairType: 'PAYLOAD',
    reason: "Correcting weightKg data type from string to number in payload.",
    proposedChange: {
      payload: { shipmentCode: 'SHP10001', weightKg: 150, status: 'pending' }
    }
  };

  const provider = new SyntheticRepairLLMProvider(expectedProposal);
  const engine = new AIRepairEngine(provider as any);

  const diagnosis = await engine.diagnoseFailure(failureContext);
  assert.equal(diagnosis.proposal.repairType, 'PAYLOAD');
  assert.equal(diagnosis.proposal.confidence, 0.95);

  const validation = engine.validateRepair(diagnosis.proposal, failureContext);
  assert.equal(validation.valid, true, `Validation failed: ${validation.errors.join(', ')}`);

  const updatedSpec = engine.applyRepair(diagnosis.proposal, failureContext);
  assert.ok(updatedSpec.includes('"weightKg": 150'), 'Repaired spec code should contain numeric weightKg');
});

test('TARGET INDEPENDENCE TEST — Domain B: Patients & Appointments & ScheduleDoctor', async () => {
  const domainBContext: ProjectContext = {
    projectName: 'HealthCareSystem',
    schemas: [
      {
        schemaName: 'patients',
        active: true,
        fields: [
          { name: 'patientId', dataType: 'String', mandatoryField: true, inputType: 'text', unique: true },
          { name: 'fullName', dataType: 'String', mandatoryField: true, inputType: 'text' },
          { name: 'bloodType', dataType: 'String', mandatoryField: false, inputType: 'select', enum: ['A+', 'O+', 'B+', 'AB+'] }
        ],
        relationships: []
      },
      {
        schemaName: 'appointments',
        active: true,
        fields: [
          { name: 'appointmentId', dataType: 'String', mandatoryField: true, inputType: 'text' },
          { name: 'patientId', dataType: 'String', mandatoryField: true, inputType: 'text' },
          { name: 'status', dataType: 'String', mandatoryField: true, inputType: 'select', enum: ['scheduled', 'completed', 'cancelled'] }
        ],
        relationships: []
      }
    ],
    functions: [
      {
        functionName: 'scheduleDoctor',
        description: 'Schedule doctor appointment shift',
        active: true,
        route: '/function/scheduleDoctor',
        parameters: [{ name: 'doctorId', type: 'string', required: true }]
      }
    ]
  };

  const domainBCatalogEntry: CatalogEntry = {
    testId: 'TC-PATIENTS-CRUD-001',
    category: 'CRUD',
    targetEntity: 'patients',
    source: 'MONGO_SCHEMA',
    sourceRef: 'patients',
    reasoning: 'Create patient happy path',
    priority: 'HIGH',
    dependencies: [],
    payloadTemplate: { patientId: 'PAT10001', fullName: 'Jane Doe', bloodType: 'INVALID_TYPE' },
    httpMethod: 'POST',
    targetRouteKey: 'formCreate',
    expectedResult: { statusCode: 400 },
    selected: true
  };

  const failureContext: FailureContext = {
    testId: 'TC-PATIENTS-CRUD-001',
    targetEntity: 'patients',
    projectContext: domainBContext,
    schema: domainBContext.schemas[0],
    catalogEntry: domainBCatalogEntry,
    originalSpecCode: `test('TC-PATIENTS-CRUD-001 — Create patient', async ({ request }) => {
      const payload = { "patientId": "PAT10001", "fullName": "Jane Doe", "bloodType": "INVALID_TYPE" };
      const response = await request.post('/forms/formCreate/patients', { data: payload });
      expect(response.status()).toBe(400);
    });`,
    httpMethod: 'POST',
    url: 'http://localhost:3000/forms/formCreate/patients',
    requestPayload: { patientId: 'PAT10001', fullName: 'Jane Doe', bloodType: 'INVALID_TYPE' },
    expectedStatus: 400,
    actualStatus: 400,
    actualResponseBody: { error: { message: 'bloodType must be a valid enum' } },
    executionError: 'Expected 400, received 201'
  };

  const expectedProposal: RepairProposal = {
    diagnosis: "Field 'bloodType' contains an invalid enum value.",
    confidence: 0.90,
    repairType: 'PAYLOAD',
    reason: "Replacing invalid bloodType string with valid enum 'O+'.",
    proposedChange: {
      payload: { patientId: 'PAT10001', fullName: 'Jane Doe', bloodType: 'O+' }
    }
  };

  const provider = new SyntheticRepairLLMProvider(expectedProposal);
  const engine = new AIRepairEngine(provider as any);

  const diagnosis = await engine.diagnoseFailure(failureContext);
  assert.equal(diagnosis.proposal.repairType, 'PAYLOAD');

  const validation = engine.validateRepair(diagnosis.proposal, failureContext);
  assert.equal(validation.valid, true, `Validation failed: ${validation.errors.join(', ')}`);

  const updatedSpec = engine.applyRepair(diagnosis.proposal, failureContext);
  assert.ok(updatedSpec.includes('"bloodType": "O+"'), 'Repaired spec should contain valid bloodType O+');
});

test('13-POINT SAFETY POLICY — Enforces strict proposal validation', async () => {
  const dummyContext: ProjectContext = {
    projectName: 'SafetyTest',
    schemas: [
      {
        schemaName: 'items',
        active: true,
        fields: [{ name: 'price', dataType: 'Number', mandatoryField: true, inputType: 'number' }],
        relationships: []
      }
    ],
    functions: []
  };

  const failureContext: FailureContext = {
    testId: 'TC-001',
    targetEntity: 'items',
    projectContext: dummyContext,
    schema: dummyContext.schemas[0],
    catalogEntry: {
      testId: 'TC-001',
      category: 'CRUD',
      targetEntity: 'items',
      source: 'MONGO_SCHEMA',
      sourceRef: 'items',
      reasoning: 'Test',
      priority: 'HIGH',
      dependencies: [],
      payloadTemplate: {},
      httpMethod: 'POST',
      targetRouteKey: 'formCreate',
      expectedResult: { statusCode: 400 },
      selected: true
    },
    originalSpecCode: 'code',
    httpMethod: 'POST',
    url: 'http://localhost:3000/forms/formCreate/items',
    expectedStatus: 400,
    executionError: 'Failed'
  };

  // Forbidden Check 1: Changing expectedStatus
  const badProposal1: RepairProposal = {
    diagnosis: 'Try changing expected status to 200',
    confidence: 0.9,
    repairType: 'PAYLOAD',
    reason: 'Cheating expected status',
    proposedChange: {
      expectedStatus: 200
    } as any
  };

  const val1 = RepairValidator.validateRepairProposal(badProposal1, failureContext);
  assert.equal(val1.valid, false);
  assert.ok(val1.errors.some(e => e.includes('Forbidden policy violation')), 'Should reject changing expectedStatus');

  // Safety Rule Check 2: Unresolved placeholders
  const badProposal2: RepairProposal = {
    diagnosis: 'Use placeholder',
    confidence: 0.9,
    repairType: 'PAYLOAD',
    reason: 'Placeholder left in proposal',
    proposedChange: {
      payload: { id: '{{CREATE_RECORD_ID}}' }
    }
  };

  const val2 = RepairValidator.validateRepairProposal(badProposal2, failureContext);
  assert.equal(val2.valid, false);
  assert.ok(val2.errors.some(e => e.includes('unresolved template placeholders')), 'Should reject placeholders');

  // Safety Rule Check 3: Code Injection
  const badProposal3: RepairProposal = {
    diagnosis: 'Code injection',
    confidence: 0.9,
    repairType: 'PAYLOAD',
    reason: 'Inject code',
    proposedChange: {
      payload: { hack: 'eval(process.exit(1))' }
    }
  };

  const val3 = RepairValidator.validateRepairProposal(badProposal3, failureContext);
  assert.equal(val3.valid, false);
  assert.ok(val3.errors.some(e => e.includes('forbidden unsafe code patterns')), 'Should reject code injection');
});
