/**
 * Deterministic Business Rule Analyzer (Phase 1 Implementation)
 * Zero external LLM APIs. Parses plain-text business requirements into
 * structured BusinessRuleConstraint objects using deterministic pattern matching.
 * Validates referenced target fields against ProjectContext.
 */

import { ProjectContext } from '../../types/context.js';
import { BusinessRuleConstraint } from '../../types/rules.js';
import { IBusinessRuleAnalyzer, BusinessRuleAnalysisResult } from './IBusinessRuleAnalyzer.js';

export class DeterministicBusinessRuleAnalyzer implements IBusinessRuleAnalyzer {
  public async analyzeRequirements(
    rawRequirementText: string,
    context: ProjectContext
  ): Promise<BusinessRuleAnalysisResult> {
    const constraints: BusinessRuleConstraint[] = [];
    const diagnostics: Array<{ ruleText: string; reason: string }> = [];

    if (!rawRequirementText || rawRequirementText.trim() === '') {
      return { constraints, diagnostics };
    }

    // Build index of valid fields across all active schemas in ProjectContext
    const validFieldsMap = new Map<string, { schemaName: string; fieldName: string }>();
    for (const schema of context.schemas) {
      if (!schema.active) continue;
      for (const field of schema.fields) {
        validFieldsMap.set(field.name.toLowerCase(), { schemaName: schema.schemaName, fieldName: field.name });
        validFieldsMap.set(`${schema.schemaName.toLowerCase()}.${field.name.toLowerCase()}`, {
          schemaName: schema.schemaName,
          fieldName: field.name
        });
      }
    }

    // Split text into individual statement lines
    const statements = rawRequirementText
      .split(/[;\n]/)
      .map(s => s.trim())
      .filter(s => s.length > 0);

    let ruleCounter = 1;

    for (const stmt of statements) {
      // Find referenced field in statement
      let matchedFieldInfo: { schemaName: string; fieldName: string } | null = null;
      for (const [key, info] of validFieldsMap.entries()) {
        const regex = new RegExp(`\\b${key}\\b`, 'i');
        if (regex.test(stmt)) {
          matchedFieldInfo = info;
          break;
        }
      }

      if (!matchedFieldInfo) {
        diagnostics.push({
          ruleText: stmt,
          reason: `No matching field or entity found in ProjectContext for statement '${stmt}'`
        });
        continue;
      }

      const targetFieldRef = `${matchedFieldInfo.schemaName}.${matchedFieldInfo.fieldName}`;
      const ruleId = `BR-RULE-${ruleCounter++}`;

      // Pattern 1: EXACT_DIGITS
      const exactDigitsMatch = stmt.match(/\b(\d+)\s+(?:digits|characters|chars)/i);
      if (exactDigitsMatch) {
        constraints.push({
          ruleId,
          targetFieldOrEntity: targetFieldRef,
          constraintType: 'EXACT_DIGITS',
          parameters: { digits: parseInt(exactDigitsMatch[1], 10) },
          reasoning: `Statement requirement specifies exactly ${exactDigitsMatch[1]} digits/characters for ${targetFieldRef}`
        });
        continue;
      }

      // Pattern 2: NON_NEGATIVE
      if (/(?:non-negative|non negative|cannot be negative|>= 0)/i.test(stmt)) {
        constraints.push({
          ruleId,
          targetFieldOrEntity: targetFieldRef,
          constraintType: 'NON_NEGATIVE',
          parameters: { min: 0 },
          reasoning: `Statement requirement specifies ${targetFieldRef} must be non-negative (>= 0)`
        });
        continue;
      }

      // Pattern 3: GREATER_THAN
      const greaterThanMatch = stmt.match(/(?:greater than|more than|>)\s+(-?\d+(?:\.\d+)?)/i);
      if (greaterThanMatch) {
        constraints.push({
          ruleId,
          targetFieldOrEntity: targetFieldRef,
          constraintType: 'GREATER_THAN',
          parameters: { threshold: parseFloat(greaterThanMatch[1]) },
          reasoning: `Statement requirement specifies ${targetFieldRef} > ${greaterThanMatch[1]}`
        });
        continue;
      }

      // Pattern 4: LESS_THAN
      const lessThanMatch = stmt.match(/(?:less than|under|<)\s+(-?\d+(?:\.\d+)?)/i);
      if (lessThanMatch) {
        constraints.push({
          ruleId,
          targetFieldOrEntity: targetFieldRef,
          constraintType: 'LESS_THAN',
          parameters: { threshold: parseFloat(lessThanMatch[1]) },
          reasoning: `Statement requirement specifies ${targetFieldRef} < ${lessThanMatch[1]}`
        });
        continue;
      }

      // Pattern 5: BETWEEN
      const betweenMatch = stmt.match(/(?:between)\s+(-?\d+(?:\.\d+)?)\s+(?:and|-)\s+(-?\d+(?:\.\d+)?)/i);
      if (betweenMatch) {
        constraints.push({
          ruleId,
          targetFieldOrEntity: targetFieldRef,
          constraintType: 'BETWEEN',
          parameters: { min: parseFloat(betweenMatch[1]), max: parseFloat(betweenMatch[2]) },
          reasoning: `Statement requirement specifies ${targetFieldRef} between ${betweenMatch[1]} and ${betweenMatch[2]}`
        });
        continue;
      }

      // Pattern 6: NOT_EMPTY
      if (/(?:not|cannot)\s+be\s+empty|non-empty|must not be empty/i.test(stmt)) {
        constraints.push({
          ruleId,
          targetFieldOrEntity: targetFieldRef,
          constraintType: 'NOT_EMPTY',
          parameters: {},
          reasoning: `Statement requirement specifies ${targetFieldRef} must not be empty`
        });
        continue;
      }

      // Pattern 7: VALID_URL
      if (/(?:valid url|url format)/i.test(stmt)) {
        constraints.push({
          ruleId,
          targetFieldOrEntity: targetFieldRef,
          constraintType: 'VALID_URL',
          parameters: {},
          reasoning: `Statement requirement specifies ${targetFieldRef} must be a valid URL`
        });
        continue;
      }

      // Pattern 8: VALID_EMAIL
      if (/(?:valid email|email format)/i.test(stmt)) {
        constraints.push({
          ruleId,
          targetFieldOrEntity: targetFieldRef,
          constraintType: 'VALID_EMAIL',
          parameters: {},
          reasoning: `Statement requirement specifies ${targetFieldRef} must be a valid email`
        });
        continue;
      }

      // Ambiguous rule statement that did not match known deterministic pattern
      diagnostics.push({
        ruleText: stmt,
        reason: `Ambiguous requirement statement; could not deterministically extract constraint pattern`
      });
    }

    return { constraints, diagnostics };
  }
}
