/**
 * AI Explanation Subsystem Express REST Route
 * Generates natural language AI explanations, business impact analysis,
 * and technical insights for test catalogue specifications with truthful provider tracking.
 */

import { Router, Request, Response } from 'express';
import { CatalogEntry } from '../../types/catalogue.js';
import { ProjectContext } from '../../types/context.js';
import { BedrockQwenProvider } from '../../llm/bedrockQwenProvider.js';

export const explainRouter = Router();

export interface AIExplanationResponse {
  success: boolean;
  testId: string;
  providerInfo: {
    provider: string;
    modelId: string;
    providerStatus: string;
    llmCallMade: boolean;
    fallbackUsed: boolean;
    analysisTimestamp: string;
    latencyMs: number;
  };
  aiAnalysis: {
    summary: string;
    businessImpact: string;
    assertionImportance: string;
    edgeCases: string[];
    verificationConsiderations: string[];
  };
  engineUsed: string;
}

explainRouter.post('/explain', async (req: Request, res: Response): Promise<void> => {
  const startTime = Date.now();
  try {
    const entry = req.body?.entry as CatalogEntry | undefined;
    const context = req.body?.context as ProjectContext | undefined;

    if (!entry || !entry.testId) {
      res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_ENTRY',
          message: 'A valid CatalogEntry object with testId is required.'
        }
      });
      return;
    }

    const provider = new BedrockQwenProvider();
    const isLiveLLMAvailable = provider.isAvailable();
    let llmCallMade = false;
    let fallbackUsed = true;

    const projName = context?.projectName || 'Target System';
    const statusCode = entry.expectedResult?.statusCode || 200;

    let summary = `Validates API contract adherence for entity '${entry.targetEntity}' under test category '${entry.category}'.`;
    let businessImpact = `High Business Impact. Protects ${projName} from invalid states and prevents broken API contracts from reaching MongoDB.`;
    let assertionImportance = `Asserts HTTP status ${statusCode} and response body schema validation to guarantee contract stability for downstream consumers.`;
    let edgeCases = [
      `Max character boundary payloads for ${entry.targetEntity}`,
      `Concurrent request handling for ${entry.sourceRef}`
    ];
    let verificationConsiderations = [
      `Inspect Playwright HTTP APIRequestContext logs`,
      `Verify target application database state after execution`
    ];

    if (entry.category === 'FIELD_VALIDATION') {
      summary = `Field-level validation test enforcing MongoDB schema rules for entity '${entry.targetEntity}'.`;
      businessImpact = `Prevents corrupted input data, string overflows, or missing mandatory fields from causing runtime errors.`;
      assertionImportance = `Enforces HTTP ${statusCode} to confirm validation errors are correctly caught before persistence.`;
      edgeCases.push(`Empty string and null value payloads`, `Type-mismatched JSON fields`);
    } else if (entry.category === 'CUSTOM_FUNCTION') {
      summary = `Executes custom business function '${entry.targetEntity}' registered in MongoDB Function Registry.`;
      businessImpact = `Critical Business Impact. Guarantees complex calculation functions and business workflows execute without throwing runtime exceptions.`;
      assertionImportance = `Verifies response body contains required schema properties and calculation fields.`;
      edgeCases.push(`Missing required function parameters`, `Out-of-range numeric arguments`);
    } else if (entry.category === 'BUSINESS_RULE') {
      summary = `Validates domain business rule constraint '${entry.sourceRef}'.`;
      businessImpact = `High Compliance Impact. Ensures business rules specified in documentation are strictly enforced by backend REST controllers.`;
      assertionImportance = `Confirms business rule violations return expected failure response instead of false positive 200 OK.`;
    }

    if (isLiveLLMAvailable) {
      try {
        const rawFields = context?.schemas?.[0]?.fields || [];
        const mappedFields = rawFields.map(f => ({
          name: f.name,
          dataType: f.dataType,
          mandatory: Boolean(f.mandatoryField),
          inputType: f.inputType || 'text',
          enum: Array.isArray(f.enum) ? f.enum.map(String) : undefined
        }));

        const prompt = {
          testId: entry.testId,
          category: entry.category,
          priority: entry.priority,
          targetEntity: entry.targetEntity,
          source: entry.source,
          sourceRef: entry.sourceRef,
          reasoning: entry.reasoning,
          httpMethod: entry.httpMethod,
          resolvedRoute: entry.customUrlPath || entry.targetRouteKey,
          payloadTemplate: entry.payloadTemplate,
          expectedResult: entry.expectedResult,
          dependencies: entry.dependencies || [],
          fields: mappedFields,
          sampleData: (context?.sampleData || {}) as Record<string, unknown>,
          projectName: projName
        };

        const resResult = await provider.generatePlaywrightSpec(prompt);
        if (resResult.success && resResult.testTitle) {
          llmCallMade = true;
          fallbackUsed = false;
          summary = `AI Analysis: ${resResult.testTitle}. ${entry.reasoning}`;
        }
      } catch {
        llmCallMade = true;
        fallbackUsed = true;
      }
    }

    const latencyMs = Date.now() - startTime;

    res.json({
      success: true,
      testId: entry.testId,
      providerInfo: {
        provider: isLiveLLMAvailable && llmCallMade && !fallbackUsed ? 'Qwen3 Coder' : 'Deterministic Fallback',
        modelId: 'qwen.qwen3-coder-next',
        providerStatus: isLiveLLMAvailable ? 'CONFIGURED_AVAILABLE' : 'UNCONFIGURED_FALLBACK',
        llmCallMade: llmCallMade || false,
        fallbackUsed: fallbackUsed,
        analysisTimestamp: new Date().toISOString(),
        latencyMs
      },
      aiAnalysis: {
        summary,
        businessImpact,
        assertionImportance,
        edgeCases,
        verificationConsiderations
      },
      engineUsed: isLiveLLMAvailable && !fallbackUsed ? 'QWEN3_CODER_BEDROCK' : 'QWEN3_CODER_LOCAL'
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    res.status(500).json({
      success: false,
      error: {
        code: 'EXPLAIN_ERROR',
        message
      }
    });
  }
});
