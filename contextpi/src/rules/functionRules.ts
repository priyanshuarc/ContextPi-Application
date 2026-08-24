/**
 * Custom Function Rule Engine Subsystem
 * Generates structured test intents for custom functions in the Function Registry.
 * Evaluates function happy path, missing required parameters, unknown function,
 * response field type assertions, project mismatch, and registry lifecycle.
 */

import { ProjectContext, FunctionParameter } from '../types/context.js';
import { TestIntent, generateStableIntentId } from './intentModel.js';
import { determinePriority } from './priority.js';
import { JsonObject, JsonValue } from '../types/json.js';

function generateSampleValueForParam(param: FunctionParameter): JsonValue {
  const typeLower = param.type.toLowerCase();
  if (typeLower.includes('number') || typeLower.includes('float') || typeLower.includes('int')) {
    return 10;
  }
  if (typeLower.includes('boolean')) {
    return true;
  }
  if (typeLower.includes('array')) {
    return ['sample'];
  }
  return `SAMPLE_${param.name.toUpperCase()}`;
}

export function evaluateFunctionRules(context: ProjectContext): TestIntent[] {
  const intents: TestIntent[] = [];

  for (const fn of context.functions) {
    if (!fn.isActive) continue;

    const fnName = fn.name;
    const fnRef = `FunctionRegistry.${fnName}`;

    // Construct valid payload matching structured FunctionParameters
    const happyPayload: JsonObject = {};
    for (const param of fn.parameters) {
      if (param.isActive) {
        happyPayload[param.name] = generateSampleValueForParam(param);
      }
    }

    // 1. Happy Path Execution
    const happyIntentId = generateStableIntentId(context.projectName, 'CUSTOM_FUNCTION', fnName, 'HAPPY_PATH', fnName);
    intents.push({
      intentId: happyIntentId,
      category: 'CUSTOM_FUNCTION',
      targetEntity: fnName,
      description: `Custom Function: Execute '${fnName}' - Happy Path`,
      source: 'FUNCTION_REGISTRY',
      sourceRef: fnRef,
      reasoning: `Execute function '${fnName}' with valid active parameters returns HTTP 200`,
      expectedResult: { statusCode: 200 },
      priority: determinePriority('CUSTOM_FUNCTION', 'HAPPY_PATH'),
      dependencies: [],
      payloadTemplate: happyPayload,
      httpMethod: 'POST',
      targetRouteKey: 'executeFunction'
    });

    // 2. Missing Required Parameter
    const requiredParam = fn.parameters.find(p => p.isActive && p.required);
    if (requiredParam) {
      const missingPayload = { ...happyPayload };
      delete missingPayload[requiredParam.name];
      const missingParamIntentId = generateStableIntentId(context.projectName, 'CUSTOM_FUNCTION', fnName, 'MISSING_PARAM', requiredParam.name);
      intents.push({
        intentId: missingParamIntentId,
        category: 'CUSTOM_FUNCTION',
        targetEntity: fnName,
        description: `Custom Function: Execute '${fnName}' - Missing Required Parameter '${requiredParam.name}'`,
        source: 'FUNCTION_REGISTRY',
        sourceRef: `${fnRef}.${requiredParam.name}`,
        reasoning: `Required parameter '${requiredParam.name}' omitted; function execution returns HTTP 400`,
        expectedResult: { statusCode: 400, errorMessagePattern: requiredParam.name },
        priority: determinePriority('CUSTOM_FUNCTION', 'MISSING_PARAM'),
        dependencies: [],
        payloadTemplate: missingPayload,
        httpMethod: 'POST',
        targetRouteKey: 'executeFunction'
      });
    }

    // 3. Unknown Function Test
    const unknownFnIntentId = generateStableIntentId(context.projectName, 'CUSTOM_FUNCTION', fnName, 'UNKNOWN_FUNCTION', 'NON_EXISTENT_FN');
    intents.push({
      intentId: unknownFnIntentId,
      category: 'CUSTOM_FUNCTION',
      targetEntity: 'NON_EXISTENT_FUNCTION',
      description: `Custom Function: Target Unknown Function Route`,
      source: 'FUNCTION_REGISTRY',
      sourceRef: `FunctionRegistry.NON_EXISTENT_FUNCTION`,
      reasoning: `Executing unregistered function returns HTTP 404`,
      expectedResult: { statusCode: 404 },
      priority: determinePriority('CUSTOM_FUNCTION', 'UNKNOWN_FUNCTION'),
      dependencies: [],
      payloadTemplate: { functionName: 'NON_EXISTENT_FUNCTION' },
      httpMethod: 'POST',
      targetRouteKey: 'executeFunction'
    });

    // 4. Response Schema Assertions
    if (fn.expectedResponseFields && fn.expectedResponseFields.length > 0) {
      const responseSchemaTemplate: JsonObject = {};
      for (const rf of fn.expectedResponseFields) {
        responseSchemaTemplate[rf.name] = { expectedType: rf.type, required: rf.required };
      }

      const responseSchemaIntentId = generateStableIntentId(context.projectName, 'CUSTOM_FUNCTION', fnName, 'RESPONSE_SCHEMA_ASSERT', fnName);
      intents.push({
        intentId: responseSchemaIntentId,
        category: 'CUSTOM_FUNCTION',
        targetEntity: fnName,
        description: `Custom Function: Assert Response Schema for '${fnName}'`,
        source: 'FUNCTION_REGISTRY',
        sourceRef: fnRef,
        reasoning: `Assert returned response payload contains expected structured response fields`,
        expectedResult: {
          statusCode: 200,
          responseBodySchema: responseSchemaTemplate
        },
        priority: determinePriority('CUSTOM_FUNCTION', 'RESPONSE_SCHEMA_ASSERTION'),
        dependencies: [happyIntentId],
        payloadTemplate: happyPayload,
        httpMethod: 'POST',
        targetRouteKey: 'executeFunction'
      });
    }

    // 5. Project Mismatch Test
    const projectMismatchIntentId = generateStableIntentId(context.projectName, 'CUSTOM_FUNCTION', fnName, 'PROJECT_MISMATCH', fnName);
    intents.push({
      intentId: projectMismatchIntentId,
      category: 'CUSTOM_FUNCTION',
      targetEntity: fnName,
      description: `Custom Function: Execute '${fnName}' under Invalid Project Context`,
      source: 'FUNCTION_REGISTRY',
      sourceRef: fnRef,
      reasoning: `Executing function under wrong project scope returns HTTP 403 or 404`,
      expectedResult: { statusCode: 403 },
      priority: determinePriority('CUSTOM_FUNCTION', 'PROJECT_MISMATCH'),
      dependencies: [],
      payloadTemplate: { ...happyPayload, projectName: 'INVALID_PROJECT_NAME_XYZ' },
      httpMethod: 'POST',
      targetRouteKey: 'executeFunction'
    });
  }

  // 6. PS10 Function Registry Lifecycle Intents (TC-REG-01 to TC-REG-05)
  if (context.functions.length > 0) {
    // TC-REG-01: Create function
    const regCreateId = generateStableIntentId(context.projectName, 'REGISTRY', 'FunctionRegistry', 'CREATE_FUNCTION', 'registry');
    intents.push({
      intentId: regCreateId,
      category: 'REGISTRY',
      targetEntity: 'FunctionRegistry',
      description: `Function Registry: Create Custom Function (TC-REG-01)`,
      source: 'FUNCTION_REGISTRY',
      sourceRef: 'FunctionRegistry',
      reasoning: `Register new custom function definition returns HTTP 201`,
      expectedResult: { statusCode: 201 },
      priority: determinePriority('REGISTRY', 'CREATE_FUNCTION'),
      dependencies: [],
      payloadTemplate: { name: 'syntheticDynamicFn', isActive: true, parameters: [], expectedResponseFields: [] },
      httpMethod: 'POST',
      targetRouteKey: 'createFunction'
    });

    // TC-REG-02: Duplicate function
    const regDupId = generateStableIntentId(context.projectName, 'REGISTRY', 'FunctionRegistry', 'DUPLICATE_REJECTION', 'registry');
    intents.push({
      intentId: regDupId,
      category: 'REGISTRY',
      targetEntity: 'FunctionRegistry',
      description: `Function Registry: Reject Duplicate Registration (TC-REG-02)`,
      source: 'FUNCTION_REGISTRY',
      sourceRef: 'FunctionRegistry',
      reasoning: `Attempting to register existing function name returns HTTP 400 or 409`,
      expectedResult: { statusCode: 400 },
      priority: determinePriority('REGISTRY', 'DUPLICATE_REJECTION'),
      dependencies: [regCreateId],
      payloadTemplate: { name: 'syntheticDynamicFn', isActive: true, parameters: [], expectedResponseFields: [] },
      httpMethod: 'POST',
      targetRouteKey: 'createFunction'
    });

    // TC-REG-03: Get function definition
    const regGetId = generateStableIntentId(context.projectName, 'REGISTRY', 'FunctionRegistry', 'GET_FUNCTION_DEF', 'registry');
    intents.push({
      intentId: regGetId,
      category: 'REGISTRY',
      targetEntity: 'FunctionRegistry',
      description: `Function Registry: Get Function Definition by Name (TC-REG-03)`,
      source: 'FUNCTION_REGISTRY',
      sourceRef: 'FunctionRegistry',
      reasoning: `Fetch registered custom function schema definition returns HTTP 200`,
      expectedResult: { statusCode: 200 },
      priority: determinePriority('REGISTRY', 'GET_FUNCTION_DEF'),
      dependencies: [regCreateId],
      payloadTemplate: { name: 'syntheticDynamicFn' },
      httpMethod: 'GET',
      targetRouteKey: 'getAllFunction'
    });

    // TC-REG-04: List all functions
    const regListId = generateStableIntentId(context.projectName, 'REGISTRY', 'FunctionRegistry', 'GET_ALL_FUNCTIONS', 'registry');
    intents.push({
      intentId: regListId,
      category: 'REGISTRY',
      targetEntity: 'FunctionRegistry',
      description: `Function Registry: List All Functions (TC-REG-04)`,
      source: 'FUNCTION_REGISTRY',
      sourceRef: 'FunctionRegistry',
      reasoning: `Fetch list of all registered custom functions returns HTTP 200`,
      expectedResult: { statusCode: 200 },
      priority: determinePriority('REGISTRY', 'GET_ALL_FUNCTIONS'),
      dependencies: [regCreateId],
      payloadTemplate: {},
      httpMethod: 'GET',
      targetRouteKey: 'getAllFunction'
    });

    // TC-REG-05: Execute function after create
    const regExecId = generateStableIntentId(context.projectName, 'REGISTRY', 'FunctionRegistry', 'EXECUTE_AFTER_CREATE', 'registry');
    intents.push({
      intentId: regExecId,
      category: 'REGISTRY',
      targetEntity: 'syntheticDynamicFn',
      description: `Function Registry: Execute Custom Function After Create (TC-REG-05)`,
      source: 'FUNCTION_REGISTRY',
      sourceRef: 'FunctionRegistry.syntheticDynamicFn',
      reasoning: `Execute newly registered custom function definition returns HTTP 200`,
      expectedResult: { statusCode: 200 },
      priority: determinePriority('REGISTRY', 'EXECUTE_AFTER_CREATE'),
      dependencies: [regCreateId],
      payloadTemplate: {},
      httpMethod: 'POST',
      targetRouteKey: 'executeFunction'
    });
  }

  return intents;
}
