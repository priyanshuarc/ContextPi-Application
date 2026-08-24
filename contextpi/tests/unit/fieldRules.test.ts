import { describe, it } from 'node:test';
import assert from 'node:assert';

import { getMockProjectContext } from '../../src/context/mockMongoContext.js';
import { evaluateFieldRules } from '../../src/rules/fieldRules.js';
import { ProjectContext } from '../../src/types/context.js';

describe('Field Rule Engine Subsystem', () => {
  it('should generate intents for mandatory, numeric, url, phone, multiSelect, default, and enum constraints', () => {
    const ctx = getMockProjectContext('FieldTestProject');
    const intents = evaluateFieldRules(ctx);

    // Mandatory field test
    assert.ok(intents.some(i => i.description.includes("Missing Mandatory Field 'itemCode'")));

    // Numeric wrong-type test
    assert.ok(intents.some(i => i.description.includes("Wrong Data Type for Numeric Field 'price'")));

    // URL test
    assert.ok(intents.some(i => i.description.includes("Malformed URL for Field 'supplierWebsite'")));

    // Phone format tests
    assert.ok(intents.some(i => i.description.includes("Valid Phone Format for Field 'supportPhone'")));
    assert.ok(intents.some(i => i.description.includes("Invalid Phone Format for Field 'supportPhone'")));

    // Multi-select array and scalar tests
    assert.ok(intents.some(i => i.description.includes("Array Payload for Multi-Select Field 'tags'")));
    assert.ok(intents.some(i => i.description.includes("Non-array Scalar Payload for Multi-Select Field 'tags'")));

    // Default value verification test
    assert.ok(intents.some(i => i.description.includes("Default Value Verification for Field 'stockQuantity'")));

    // Enum allowed & invalid tests
    assert.ok(intents.some(i => i.description.includes("Allowed Enum Value for Field 'category'")));
    assert.ok(intents.some(i => i.description.includes("Unlisted Enum Value for Field 'category'")));
  });

  it('should safely preserve unknown/custom dataType and inputType without inventing false tests or crashing', () => {
    const customCtx: ProjectContext = {
      projectName: 'CustomFieldApp',
      schemas: [
        {
          schemaName: 'customNodes',
          active: true,
          fields: [
            {
              name: 'telemetryKey',
              dataType: 'CustomQuantumHash',
              mandatoryField: false,
              inputType: 'custom-widget'
            }
          ]
        }
      ],
      functions: []
    };

    const intents = evaluateFieldRules(customCtx);
    // Should not crash and should not generate invented tests for unknown type
    assert.strictEqual(intents.length, 0);
  });
});
