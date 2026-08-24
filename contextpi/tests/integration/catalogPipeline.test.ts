import { describe, it } from 'node:test';
import assert from 'node:assert';

import { getMockProjectContext } from '../../src/context/mockMongoContext.js';
import { evaluateAllRules } from '../../src/rules/index.js';
import {
  createDraftCatalogue,
  approveCatalogue,
  getApprovedEntries,
  getSummary,
  serializeCatalog
} from '../../src/catalogue/approval/catalogApprovalEngine.js';
import { ProjectContext } from '../../src/types/context.js';

describe('Catalogue Subsystem End-to-End Pipeline Integration Test', () => {
  it('should run full context -> rules -> intents -> catalogue -> approval pipeline', async () => {
    // 1. Load context
    const ctx = getMockProjectContext('IntegrationPipelineProject');

    // 2. Evaluate rule engines
    const { intents, diagnostics } = await evaluateAllRules(ctx);
    assert.strictEqual(diagnostics.length, 0);
    assert.ok(intents.length > 20);

    // 3. Build Draft Catalogue
    const draftCatalog = createDraftCatalogue(ctx, intents);
    assert.strictEqual(draftCatalog.projectName, 'IntegrationPipelineProject');
    assert.strictEqual(draftCatalog.status, 'DRAFT');
    assert.ok(draftCatalog.entries.length > 0);

    // 4. Verify summary preview
    const summary = getSummary(draftCatalog);
    assert.strictEqual(summary.totalTests, draftCatalog.entries.length);
    assert.strictEqual(summary.selectedCount, draftCatalog.entries.length);
    assert.strictEqual(summary.unselectedCount, 0);

    // 5. Approve Catalogue
    const approvedCatalog = approveCatalogue(draftCatalog);
    assert.strictEqual(approvedCatalog.status, 'APPROVED');

    // 6. Retrieve approved entries for spec generation
    const approvedEntries = getApprovedEntries(approvedCatalog);
    assert.strictEqual(approvedEntries.length, draftCatalog.entries.length);

    // Verify all 10 traceability fields present on every approved entry
    for (const entry of approvedEntries) {
      assert.ok(entry.testId.startsWith('TC-'));
      assert.ok(entry.category);
      assert.ok(entry.targetEntity);
      assert.ok(entry.description);
      assert.ok(entry.source);
      assert.ok(entry.sourceRef);
      assert.ok(entry.reasoning);
      assert.ok(entry.expectedResult.statusCode);
      assert.ok(entry.priority);
      assert.ok(Array.isArray(entry.dependencies));
      assert.strictEqual(entry.selected, true);
    }
  });

  it('APPLICATION-AGNOSTICISM TEST: Process TWO distinct synthetic domains into approved catalogues with zero code changes', async () => {
    // Domain A: Logistics (shipments, warehouses, dispatchOrder)
    const domainA: ProjectContext = {
      projectName: 'LogisticsSystem',
      schemas: [
        {
          schemaName: 'shipments',
          active: true,
          fields: [
            { name: 'trackingCode', dataType: 'String', mandatoryField: true, inputType: 'text' },
            { name: 'weightKg', dataType: 'Number', mandatoryField: true, inputType: 'number' }
          ]
        },
        {
          schemaName: 'warehouses',
          active: true,
          fields: [
            { name: 'warehouseCode', dataType: 'String', mandatoryField: true, inputType: 'text' },
            { name: 'shipmentRef', dataType: 'ObjectId', mandatoryField: true, inputType: 'text', mappedTableRef: 'shipments' }
          ]
        }
      ],
      functions: [
        {
          name: 'dispatchOrder',
          isActive: true,
          parameters: [{ name: 'trackingCode', type: 'string', isActive: true, required: true }],
          expectedResponseFields: [{ name: 'dispatchId', type: 'string', required: true }]
        }
      ],
      requirement: 'weightKg must be non-negative; trackingCode length 8 digits'
    };

    // Domain B: Healthcare (patients, appointments, scheduleDoctor)
    const domainB: ProjectContext = {
      projectName: 'HealthcareSystem',
      schemas: [
        {
          schemaName: 'patients',
          active: true,
          fields: [
            { name: 'patientId', dataType: 'String', mandatoryField: true, inputType: 'text' },
            { name: 'bloodGroup', dataType: 'String', mandatoryField: true, inputType: 'select', enum: ['A+', 'O+', 'B+'] }
          ]
        },
        {
          schemaName: 'appointments',
          active: true,
          fields: [
            { name: 'appointmentId', dataType: 'String', mandatoryField: true, inputType: 'text' },
            { name: 'patientRef', dataType: 'ObjectId', mandatoryField: true, inputType: 'text', mappedTableRef: 'patients' }
          ]
        }
      ],
      functions: [
        {
          name: 'scheduleDoctor',
          isActive: true,
          parameters: [{ name: 'patientId', type: 'string', isActive: true, required: true }],
          expectedResponseFields: [{ name: 'confirmationCode', type: 'string', required: true }]
        }
      ],
      requirement: 'patientId length 8 digits'
    };

    const resA = await evaluateAllRules(domainA);
    const resB = await evaluateAllRules(domainB);

    const catA = approveCatalogue(createDraftCatalogue(domainA, resA.intents));
    const catB = approveCatalogue(createDraftCatalogue(domainB, resB.intents));

    assert.strictEqual(catA.projectName, 'LogisticsSystem');
    assert.strictEqual(catA.status, 'APPROVED');
    assert.ok(catA.entries.some(e => e.targetEntity === 'shipments'));
    assert.ok(catA.entries.some(e => e.targetEntity === 'warehouses'));
    assert.ok(catA.entries.some(e => e.targetEntity === 'dispatchOrder'));

    assert.strictEqual(catB.projectName, 'HealthcareSystem');
    assert.strictEqual(catB.status, 'APPROVED');
    assert.ok(catB.entries.some(e => e.targetEntity === 'patients'));
    assert.ok(catB.entries.some(e => e.targetEntity === 'appointments'));
    assert.ok(catB.entries.some(e => e.targetEntity === 'scheduleDoctor'));

    // Verify zero NexaSupply hardcoding
    const jsonA = serializeCatalog(catA);
    const jsonB = serializeCatalog(catB);
    assert.strictEqual(jsonA.includes('NexaSupply'), false);
    assert.strictEqual(jsonB.includes('NexaSupply'), false);
  });
});
