/**
 * Central Rule Engine Orchestrator
 * Evaluates CRUD, Field, Relationship, Function, and Business Rules.
 * Produces a combined array of deterministic TestIntents.
 */

import { ProjectContext } from '../types/context.js';
import { TestIntent } from './intentModel.js';
import { evaluateCrudRules } from './crudRules.js';
import { evaluateFieldRules } from './fieldRules.js';
import { evaluateRelationshipRules } from './relationshipRules.js';
import { evaluateFunctionRules } from './functionRules.js';
import { generateBusinessRuleIntents } from './businessRules.js';
import { IBusinessRuleAnalyzer } from './analyzers/IBusinessRuleAnalyzer.js';
import { DeterministicBusinessRuleAnalyzer } from './analyzers/DeterministicBusinessRuleAnalyzer.js';

export interface RuleEvaluationResult {
  intents: TestIntent[];
  diagnostics: Array<{ ruleText: string; reason: string }>;
}

export async function evaluateAllRules(
  context: ProjectContext,
  analyzer: IBusinessRuleAnalyzer = new DeterministicBusinessRuleAnalyzer()
): Promise<RuleEvaluationResult> {
  const crudIntents = evaluateCrudRules(context);
  const fieldIntents = evaluateFieldRules(context);
  const relationshipIntents = evaluateRelationshipRules(context);
  const functionIntents = evaluateFunctionRules(context);

  let businessIntents: TestIntent[] = [];
  let diagnostics: Array<{ ruleText: string; reason: string }> = [];

  if (context.requirement && context.requirement.trim() !== '') {
    const analysis = await analyzer.analyzeRequirements(context.requirement, context);
    diagnostics = analysis.diagnostics;
    businessIntents = generateBusinessRuleIntents(analysis.constraints, context);
  }

  const intents = [
    ...crudIntents,
    ...fieldIntents,
    ...relationshipIntents,
    ...functionIntents,
    ...businessIntents
  ];

  return { intents, diagnostics };
}
