import { describe, it } from 'node:test';
import assert from 'node:assert';
import { SyntheticTargetAdapter } from '../../src/adapter/syntheticTargetAdapter.js';
import { ProjectContext } from '../../src/types/context.js';
import { evaluateAllRules } from '../../src/rules/index.js';
import { createDraftCatalogue } from '../../src/catalogue/approval/catalogApprovalEngine.js';

describe('Application-Agnostic Multi-Domain Synthetic Execution Tests', () => {
  // Domain A: Logistics (shipments, warehouses, dispatchOrder)
  const domainAContext: ProjectContext = {
    projectName: 'LogisticsDomain',
    projectVersion: '1.0.0',
    discoveredAt: new Date().toISOString(),
    mongoUri: 'mongodb://mock-a',
    databaseName: 'logistics_db',
    isAdapterMode: true,
    schemas: [
      {
        schemaName: 'warehouses',
        collectionName: 'warehouses',
        fields: [
          { name: 'warehouseCode', dataType: 'string', mandatoryField: true, rules: 'Required' },
          { name: 'capacity', dataType: 'number', mandatoryField: true, rules: 'Positive' }
        ]
      },
      {
        schemaName: 'shipments',
        collectionName: 'shipments',
        fields: [
          { name: 'trackingNumber', dataType: 'string', mandatoryField: true, rules: 'Required' },
          { name: 'weight', dataType: 'number', mandatoryField: true, rules: 'Positive' }
        ]
      }
    ],
    functions: [],
    relationships: [],
    businessRules: []
  };

  // Domain B: Healthcare (patients, appointments, scheduleDoctor)
  const domainBContext: ProjectContext = {
    projectName: 'HealthcareDomain',
    projectVersion: '1.0.0',
    discoveredAt: new Date().toISOString(),
    mongoUri: 'mongodb://mock-b',
    databaseName: 'healthcare_db',
    isAdapterMode: true,
    schemas: [
      {
        schemaName: 'patients',
        collectionName: 'patients',
        fields: [
          { name: 'patientId', dataType: 'string', mandatoryField: true, rules: 'Required' },
          { name: 'age', dataType: 'number', mandatoryField: true, rules: 'Positive' }
        ]
      },
      {
        schemaName: 'appointments',
        collectionName: 'appointments',
        fields: [
          { name: 'appointmentDate', dataType: 'string', mandatoryField: true, rules: 'Required' },
          { name: 'reason', dataType: 'string', mandatoryField: false, rules: 'Optional' }
        ]
      }
    ],
    functions: [],
    relationships: [],
    businessRules: []
  };

  it('Domain A: Should generate catalogue and execute against SyntheticTargetAdapter with zero domain changes', async () => {
    const rulesRes = await evaluateAllRules(domainAContext);
    const catalog = createDraftCatalogue(domainAContext, rulesRes.intents);
    catalog.status = 'APPROVED';

    const adapter = new SyntheticTargetAdapter(domainAContext);
    const postRes = adapter.handleRequest('POST', '/api/forms/shipments', {}, {
      trackingNumber: 'TRK-1001',
      weight: 45.5
    });

    assert.strictEqual(postRes.statusCode, 201);
    assert.strictEqual(postRes.body.success, true);

    const getRes = adapter.handleRequest('GET', `/api/forms/shipments/${postRes.body.id}`, {}, {});
    assert.strictEqual(getRes.statusCode, 200);
    assert.strictEqual(getRes.body.data.trackingNumber, 'TRK-1001');
  });

  it('Domain B: Should generate catalogue and execute against SyntheticTargetAdapter with zero domain changes', async () => {
    const rulesRes = await evaluateAllRules(domainBContext);
    const catalog = createDraftCatalogue(domainBContext, rulesRes.intents);
    catalog.status = 'APPROVED';

    const adapter = new SyntheticTargetAdapter(domainBContext);
    const postRes = adapter.handleRequest('POST', '/api/forms/patients', {}, {
      patientId: 'PAT-8800',
      age: 34
    });

    assert.strictEqual(postRes.statusCode, 201);
    assert.strictEqual(postRes.body.success, true);

    const getRes = adapter.handleRequest('GET', `/api/forms/patients/${postRes.body.id}`, {}, {});
    assert.strictEqual(getRes.statusCode, 200);
    assert.strictEqual(getRes.body.data.patientId, 'PAT-8800');
  });
});
