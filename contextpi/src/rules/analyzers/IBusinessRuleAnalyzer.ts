/**
 * Business Rule Analyzer Interface
 * Pluggable provider abstraction for analyzing business requirement text.
 * Returns structured BusinessRuleConstraint objects ONLY.
 * Never generates executable Playwright source code directly.
 */

import { ProjectContext } from '../../types/context.js';
import { BusinessRuleConstraint } from '../../types/rules.js';

export interface BusinessRuleAnalysisResult {
  constraints: BusinessRuleConstraint[];
  diagnostics: Array<{
    ruleText: string;
    reason: string;
  }>;
}

export interface IBusinessRuleAnalyzer {
  analyzeRequirements(
    rawRequirementText: string,
    context: ProjectContext
  ): Promise<BusinessRuleAnalysisResult>;
}
