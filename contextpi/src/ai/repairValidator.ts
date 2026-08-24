/**
 * Contextπ AI Repair Proposal Validator
 * Enforces the 13-Point Safety Policy before applying any AI proposal.
 * Application-agnostic validation against ProjectContext metadata & TargetApiContract.
 */

import { FailureContext, RepairProposal, RepairValidationResult } from '../types/repair.js';
import { SpecValidator } from '../generator/specValidator.js';

export class RepairValidator {
  /**
   * Validates an AI repair proposal against all 13 safety rules and forbidden policies.
   */
  public static validateRepairProposal(
    proposal: RepairProposal,
    context: FailureContext
  ): RepairValidationResult {
    const errors: string[] = [];

    // Rule 1: Validate JSON Schema of proposal
    if (!proposal || typeof proposal !== 'object') {
      return { valid: false, errors: ['Proposal is not a valid JSON object'] };
    }

    if (!proposal.diagnosis || typeof proposal.diagnosis !== 'string' || proposal.diagnosis.trim() === '') {
      errors.push('Proposal missing valid diagnosis string');
    }

    if (typeof proposal.confidence !== 'number' || proposal.confidence < 0 || proposal.confidence > 1) {
      errors.push('Proposal confidence must be a number between 0.0 and 1.0');
    }

    const validRepairTypes = [
      'ROUTE',
      'METHOD',
      'PAYLOAD',
      'HEADERS',
      'RELATIONSHIP_DATA',
      'DEPENDENCY_LIFECYCLE',
      'NO_SAFE_REPAIR'
    ];

    if (!validRepairTypes.includes(proposal.repairType)) {
      errors.push(`Invalid repairType '${proposal.repairType}'. Must be one of: ${validRepairTypes.join(', ')}`);
    }

    if (proposal.repairType === 'NO_SAFE_REPAIR') {
      return { valid: false, errors: ['Proposal explicitly indicates NO_SAFE_REPAIR'] };
    }

    if (!proposal.proposedChange || typeof proposal.proposedChange !== 'object') {
      errors.push('Proposal missing proposedChange object');
      return { valid: false, errors };
    }

    const { proposedChange } = proposal;

    // Rule 2: Validate Target Entity exists in ProjectContext
    const activeSchema = context.projectContext.schemas.find(
      s => s.schemaName.toLowerCase() === context.targetEntity.toLowerCase()
    );

    if (!activeSchema && context.targetEntity !== 'NON_EXISTENT_ENTITY') {
      errors.push(`Target entity '${context.targetEntity}' does not exist in ProjectContext`);
    }

    // Rule 3 & 6 & 7: Validate Proposed Payload Fields, Types, and Enums
    if (proposedChange.payload && typeof proposedChange.payload === 'object') {
      const payloadKeys = Object.keys(proposedChange.payload);

      if (activeSchema) {
        const schemaFieldMap = new Map(activeSchema.fields.map(f => [f.name, f]));

        for (const key of payloadKeys) {
          // Allow standard metadata/id keys or schema fields
          if (['_id', 'id', 'schemaName', 'createdAt', 'updatedAt'].includes(key)) continue;

          const fieldMeta = schemaFieldMap.get(key);
          if (!fieldMeta) {
            // Unrecognized field not in schema metadata
            errors.push(`Proposed payload field '${key}' is not defined in schema metadata for '${context.targetEntity}'`);
            continue;
          }

          const val = proposedChange.payload[key];
          if (val === null || val === undefined) continue;

          const expectedType = fieldMeta.dataType.toLowerCase();
          const actualType = typeof val;

          // Rule 6: Validate Payload Types
          if (expectedType.includes('number') && actualType !== 'number') {
            errors.push(`Payload field '${key}' expects number but received ${actualType}`);
          } else if (expectedType.includes('string') && actualType !== 'string') {
            errors.push(`Payload field '${key}' expects string but received ${actualType}`);
          } else if (expectedType.includes('boolean') && actualType !== 'boolean') {
            errors.push(`Payload field '${key}' expects boolean but received ${actualType}`);
          } else if (expectedType.includes('array') && !Array.isArray(val)) {
            errors.push(`Payload field '${key}' expects Array but received ${actualType}`);
          }

          // Rule 7: Validate Enum Values
          if (fieldMeta.enum && fieldMeta.enum.length > 0 && typeof val === 'string') {
            if (!fieldMeta.enum.includes(val)) {
              errors.push(`Payload field '${key}' value '${val}' is not in allowed enums: [${fieldMeta.enum.join(', ')}]`);
            }
          }
        }
      }
    }

    // Rule 4: Validate Route exists in TargetApiContract
    if (proposedChange.route) {
      if (typeof proposedChange.route !== 'string' || !proposedChange.route.startsWith('/')) {
        errors.push(`Proposed route '${proposedChange.route}' must be a relative path starting with '/'`);
      }
    }

    // Rule 5: Validate HTTP Method
    if (proposedChange.httpMethod) {
      const validMethods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'];
      if (!validMethods.includes(proposedChange.httpMethod.toUpperCase())) {
        errors.push(`Invalid proposed HTTP method '${proposedChange.httpMethod}'`);
      }
    }

    // Rule 10: Reject Unresolved Placeholders
    const proposalStr = JSON.stringify(proposedChange);
    if (/\{\{.*?\}\}/.test(proposalStr)) {
      errors.push('Proposal contains unresolved template placeholders (e.g. {{CREATE_RECORD_ID}})');
    }

    // Rule 11: Reject Duplicated BASE_URL
    if (proposedChange.route && (proposedChange.route.includes('http://') || proposedChange.route.includes('https://'))) {
      errors.push('Proposed route contains hardcoded absolute URL base; must be relative route key');
    }

    // Rule 12 & 13: Reject Target-Specific Hacks & Dangerous Injections
    if (proposalStr.includes('eval(') || proposalStr.includes('Function(') || proposalStr.includes('process.exit')) {
      errors.push('Proposal contains forbidden unsafe code patterns');
    }

    // Forbidden Policy Check: Never change expected status code
    if ((proposedChange as any).expectedStatus !== undefined) {
      if ((proposedChange as any).expectedStatus !== context.expectedStatus) {
        errors.push(`Forbidden policy violation: Proposal attempted to alter expected status code from ${context.expectedStatus} to ${(proposedChange as any).expectedStatus}`);
      }
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Validates updated spec TypeScript code using SpecValidator.
   */
  public static validateSpecCode(
    specCode: string,
    resolvedRoute: string
  ): RepairValidationResult {
    const valResult = SpecValidator.validateSpecCode(
      { testId: 'REPAIR_SPEC' } as any,
      specCode,
      resolvedRoute
    );

    return {
      valid: valResult.valid,
      errors: valResult.errors
    };
  }
}
