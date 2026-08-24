/**
 * LLM Provider Abstraction for Contextπ Playwright Spec Generation
 * Defines structured prompt input and Playwright generation output contracts.
 */

export interface PlaywrightGenerationPrompt {
  testId: string;
  category: string;
  priority: string;
  targetEntity: string;
  source: string;
  sourceRef: string;
  reasoning: string;
  httpMethod: string;
  resolvedRoute: string;
  targetRouteKey?: string;
  expectedResult: {
    statusCode: number;
    responseBodySchema?: Record<string, any>;
    errorMessagePattern?: string;
  };
  fields: Array<{
    name: string;
    dataType: string;
    mandatory: boolean;
    inputType: string;
    enum?: string[];
  }>;
  sampleData: Record<string, any>;
  payloadTemplate: Record<string, any>;
  dependencies: string[];
  projectName: string;
}

export interface PlaywrightGenerationResult {
  success: boolean;
  testId: string;
  testTitle: string;
  imports: string[];
  testCode: string;
  traceability: {
    category: string;
    priority: string;
    targetEntity: string;
    source: string;
    sourceRef: string;
    reasoning: string;
    dependencies: string[];
  };
  rawLLMOutput?: string;
  error?: string;
  durationMs: number;
  engineUsed: 'QWEN3_CODER' | 'DETERMINISTIC_FALLBACK';
}

export interface LLMProvider {
  generatePlaywrightSpec(prompt: PlaywrightGenerationPrompt): Promise<PlaywrightGenerationResult>;
}
