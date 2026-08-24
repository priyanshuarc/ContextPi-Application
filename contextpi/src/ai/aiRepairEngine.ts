/**
 * Contextπ Generic AI-Assisted Playwright Repair Engine
 * Application-agnostic failure diagnosis, repair validation, and self-healing execution loop.
 * Operates purely on dynamic metadata, ProjectContext, and TargetApiContract.
 */

import * as crypto from 'node:crypto';
import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import {
  FailureContext,
  RepairProposal,
  RepairResult,
  RepairValidationResult,
  RepairOptions,
  RepairTraceabilityRecord
} from '../types/repair.js';
import { RepairLLMProvider } from './providers/repairProvider.js';
import { BedrockQwenRepairProvider } from './providers/bedrockQwenRepairProvider.js';
import { buildRepairPrompt } from './repairPromptBuilder.js';
import { RepairValidator } from './repairValidator.js';
import { runPlaywrightSpecs } from '../runner/playwrightRunner.js';
import { getSpecFilePath } from '../generator/specWriter.js';

export const SERVER_BUILD_INFO = {
  version: '1.0.0-repair-v2',
  startedAt: new Date().toISOString(),
  engineHash: 'sha256-repair-engine-v2'
};

export class AIRepairEngine {
  private defaultProvider: RepairLLMProvider;

  constructor(provider?: RepairLLMProvider) {
    this.defaultProvider = provider || new BedrockQwenRepairProvider();
  }

  public getProvider(): RepairLLMProvider {
    return this.defaultProvider;
  }

  /**
   * 1. Diagnose Failure using RepairLLMProvider with safe deterministic fallback
   */
  public async diagnoseFailure(
    context: FailureContext,
    provider?: RepairLLMProvider
  ): Promise<{ proposal: RepairProposal; rawResponse: string; providerCalled: boolean; providerAvailable: boolean; modelId: string }> {
    const activeProvider = provider || this.defaultProvider;
    const prompt = buildRepairPrompt(context);
    const providerAvailable = activeProvider.isAvailable();
    const modelId = activeProvider.getModelId();

    if (providerAvailable) {
      try {
        const rawResponse = await activeProvider.diagnose(prompt);
        const proposal = this.parseRepairResponse(rawResponse);
        return { proposal, rawResponse, providerCalled: true, providerAvailable, modelId };
      } catch (err: any) {
        const fallbackProposal = this.buildDeterministicFallbackProposal(context);
        return { proposal: fallbackProposal, rawResponse: `ERROR_FALLBACK: ${err.message}`, providerCalled: true, providerAvailable, modelId };
      }
    } else {
      const fallbackProposal = this.buildDeterministicFallbackProposal(context);
      return { proposal: fallbackProposal, rawResponse: `DETERMINISTIC_FALLBACK`, providerCalled: false, providerAvailable: false, modelId };
    }
  }

  /**
   * Constructs a safe, metadata-driven fallback repair proposal when LLM is unconfigured
   */
  private buildDeterministicFallbackProposal(context: FailureContext): RepairProposal {
    const schema = context.schema;
    const currentPayload = { ...(context.requestPayload || {}) };

    if (schema && Array.isArray(schema.fields)) {
      for (const field of schema.fields) {
        // Fix missing mandatory fields
        if (field.mandatoryField && (currentPayload[field.name] === undefined || currentPayload[field.name] === null || currentPayload[field.name] === '')) {
          if (field.dataType === 'number' || field.dataType === 'integer') {
            currentPayload[field.name] = 100;
          } else if (field.dataType === 'boolean') {
            currentPayload[field.name] = true;
          } else if (Array.isArray(field.enum) && field.enum.length > 0) {
            currentPayload[field.name] = field.enum[0];
          } else {
            currentPayload[field.name] = `Sample ${field.name}`;
          }
        }

        // Fix primitive type mismatches
        if (field.dataType === 'number' || field.dataType === 'integer') {
          if (typeof currentPayload[field.name] === 'string') {
            const num = Number(currentPayload[field.name]);
            currentPayload[field.name] = !isNaN(num) ? num : 100;
          }
        }
      }
    }

    return {
      diagnosis: `Deterministic Metadata Diagnosis: Resolved missing fields and data types for entity '${context.targetEntity}'`,
      confidence: 0.9,
      repairType: 'PAYLOAD',
      reason: `Applied safe schema payload adjustment based on discovered metadata for entity '${context.targetEntity}'`,
      proposedChange: {
        payload: currentPayload
      }
    };
  }

  /**
   * 2. Validate Repair Proposal against 13-Point Safety Policy
   */
  public validateRepair(
    proposal: RepairProposal,
    failureContext: FailureContext
  ): RepairValidationResult {
    return RepairValidator.validateRepairProposal(proposal, failureContext);
  }

  /**
   * 3. Apply Repair to original spec code (Scoped specifically to failureContext.testId)
   */
  public applyRepair(
    proposal: RepairProposal,
    failureContext: FailureContext
  ): string {
    let specCode = failureContext.originalSpecCode;
    const { proposedChange } = proposal;

    if (!proposedChange) return specCode;

    const testId = failureContext.testId;
    const testEscaped = testId.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
    
    // Regex matching test block for this specific testId
    const testBlockRegex = new RegExp(`(test\\(['"]${testEscaped}[\\s\\S]*?async\\s*\\(\\{[^}]*\\}\\)\\s*=>\\s*\\{)([\\s\\S]*?)(\\n\\s*\\}\\);)`, 'm');
    const match = specCode.match(testBlockRegex);

    if (!match) {
      return this.applyGlobalRepairFallback(specCode, proposedChange);
    }

    const prefix = match[1];
    let blockBody = match[2];
    const suffix = match[3];

    // Scoped Payload Repair
    if (proposedChange.payload && typeof proposedChange.payload === 'object') {
      const payloadStr = JSON.stringify(proposedChange.payload, null, 4);
      const payloadRegex = /const payload = \{[\s\S]*?\};/;
      if (payloadRegex.test(blockBody)) {
        blockBody = blockBody.replace(payloadRegex, `const payload = ${payloadStr};`);
      }
    }

    // Scoped Route Repair
    if (proposedChange.route && typeof proposedChange.route === 'string') {
      const routeRegex = /FORM_ROUTES\.\w+\([^)]*\)/g;
      if (routeRegex.test(blockBody)) {
        blockBody = blockBody.replace(routeRegex, `'${proposedChange.route.replace(/^\/forms\//, '')}'`);
      }
    }

    // Scoped Headers Repair
    if (proposedChange.headers && typeof proposedChange.headers === 'object') {
      const headersStr = JSON.stringify(proposedChange.headers, null, 6);
      const headersRegex = /headers: \{[\s\S]*?\}/;
      if (headersRegex.test(blockBody)) {
        blockBody = blockBody.replace(headersRegex, `headers: ${headersStr}`);
      }
    }

    return specCode.replace(testBlockRegex, `${prefix}${blockBody}${suffix}`);
  }

  private applyGlobalRepairFallback(specCode: string, proposedChange: any): string {
    let code = specCode;
    if (proposedChange.payload && typeof proposedChange.payload === 'object') {
      const payloadStr = JSON.stringify(proposedChange.payload, null, 4);
      const payloadRegex = /const payload = \{[\s\S]*?\};/;
      if (payloadRegex.test(code)) {
        code = code.replace(payloadRegex, `const payload = ${payloadStr};`);
      }
    }
    return code;
  }

  /**
   * 4. Self-Healing Execution Loop (Max 3 Attempts)
   */
  public async repairAndReexecute(
    failureContext: FailureContext,
    options: RepairOptions = {}
  ): Promise<RepairResult> {
    const maxAttempts = options.maxAttempts || 3;
    const specDir = options.generatedTestsDir || 'generated-tests';
    const targetUrl = options.targetApiBaseUrl || process.env.API_BASE_URL || 'http://localhost:3000';

    const originalSpecHash = crypto.createHash('sha256').update(failureContext.originalSpecCode).digest('hex').substring(0, 12);
    let currentSpecCode = failureContext.originalSpecCode;
    let lastProposal: RepairProposal | undefined = undefined;
    let lastValidation: RepairValidationResult = { valid: true, errors: [] };
    let attempt = 1;

    // Single test catalog wrapper for Playwright runner re-execution
    const singleCatalog = {
      projectName: failureContext.projectContext.projectName,
      catalogId: `repair-${Date.now()}`,
      createdAt: new Date().toISOString(),
      status: 'APPROVED' as const,
      entries: [failureContext.catalogEntry],
      version: 1
    };

    while (attempt <= maxAttempts) {
      // Request AI / Deterministic Repair Proposal
      const diagResult = await this.diagnoseFailure(failureContext);
      lastProposal = diagResult.proposal;
      lastValidation = this.validateRepair(lastProposal, failureContext);

      const specFilePath = getSpecFilePath(specDir, failureContext.catalogEntry.category, failureContext.targetEntity);

      let repairState: import('../types/repair.js').RepairState = 'NO_SAFE_REPAIR';

      if (!diagResult.providerAvailable && !diagResult.providerCalled) {
        repairState = 'PROVIDER_UNAVAILABLE';
      } else if (lastProposal.repairType === 'NO_SAFE_REPAIR') {
        repairState = 'NO_SAFE_REPAIR';
      } else if (!lastValidation.valid) {
        repairState = 'VALIDATION_REJECTED';
      }

      if (!lastValidation.valid) {
        const record: RepairTraceabilityRecord = {
          testId: failureContext.testId,
          originalSpecHash,
          failureResponse: {
            status: failureContext.actualStatus,
            body: failureContext.actualResponseBody,
            error: failureContext.executionError
          },
          repairType: lastProposal.repairType,
          repairReasoning: lastProposal.reason,
          validationResult: lastValidation,
          retryCount: attempt,
          finalResult: 'FAIL',
          repairState,
          providerCalled: diagResult.providerCalled,
          providerAvailable: diagResult.providerAvailable,
          modelId: diagResult.modelId,
          patchedSpec: false,
          reExecuted: false,
          timestamp: new Date().toISOString()
        };

        return {
          testId: failureContext.testId,
          repaired: false,
          retryCount: attempt,
          originalSpecHash,
          finalSpecCode: currentSpecCode,
          repairState,
          proposal: lastProposal,
          validation: lastValidation,
          traceability: record
        };
      }

      // Apply Valid Repair Code
      const previousCode = currentSpecCode;
      currentSpecCode = this.applyRepair(lastProposal, failureContext);
      const patchedSuccessfully = currentSpecCode !== previousCode || currentSpecCode.includes(failureContext.testId);

      if (!patchedSuccessfully) {
        repairState = 'PATCH_FAILED';
      }

      // Save repaired spec to disk
      try {
        await fs.mkdir(path.dirname(specFilePath), { recursive: true });
        await fs.writeFile(specFilePath, currentSpecCode, 'utf-8');
      } catch (err: any) {
        console.warn(`[AI Repair Engine] Failed to save spec to ${specFilePath}: ${err.message}`);
      }

      // Execute repaired spec using Playwright runner
      let reExStatus: number | undefined = undefined;

      try {
        const execOutput = await runPlaywrightSpecs(singleCatalog, {
          generatedTestsDir: specDir,
          targetApiBaseUrl: targetUrl,
          filterTestIds: [failureContext.testId]
        });

        const testResult = execOutput.results.find(r => r.testId === failureContext.testId);
        reExStatus = testResult?.statusCodeReceived;

        if (testResult && testResult.passed) {
          repairState = 'REPAIRED_PASS';

          // REPAIR SUCCESS!
          const record: RepairTraceabilityRecord = {
            testId: failureContext.testId,
            originalSpecHash,
            failureResponse: {
              status: failureContext.actualStatus,
              body: failureContext.actualResponseBody,
              error: failureContext.executionError
            },
            repairType: lastProposal.repairType,
            repairReasoning: lastProposal.reason,
            validationResult: lastValidation,
            retryCount: attempt,
            finalResult: 'PASS',
            repairState,
            providerCalled: diagResult.providerCalled,
            providerAvailable: diagResult.providerAvailable,
            modelId: diagResult.modelId,
            patchedSpec: true,
            reExecuted: true,
            reExecutionStatus: `HTTP ${reExStatus || 200}`,
            timestamp: new Date().toISOString()
          };

          (testResult as any).repairTraceability = record;
          (testResult as any).isRepaired = true;
          (testResult as any).repairType = lastProposal.repairType;
          (testResult as any).repairReason = lastProposal.reason;
          (testResult as any).repairState = repairState;

          return {
            testId: failureContext.testId,
            repaired: true,
            retryCount: attempt,
            originalSpecHash,
            finalSpecCode: currentSpecCode,
            repairState,
            proposal: lastProposal,
            validation: lastValidation,
            executionResult: testResult,
            traceability: record
          };
        } else {
          repairState = 'REEXECUTION_FAILED';
        }
      } catch (execErr: any) {
        repairState = 'REEXECUTION_FAILED';
      }

      attempt++;
    }

    // Failure retained if attempts exhausted
    const finalRecord: RepairTraceabilityRecord = {
      testId: failureContext.testId,
      originalSpecHash,
      failureResponse: {
        status: failureContext.actualStatus,
        body: failureContext.actualResponseBody,
        error: failureContext.executionError
      },
      repairType: lastProposal?.repairType,
      repairReasoning: lastProposal?.reason,
      validationResult: lastValidation,
      retryCount: maxAttempts,
      finalResult: 'FAIL',
      repairState: 'REEXECUTION_FAILED',
      timestamp: new Date().toISOString()
    };

    return {
      testId: failureContext.testId,
      repaired: false,
      retryCount: maxAttempts,
      originalSpecHash,
      finalSpecCode: currentSpecCode,
      repairState: 'REEXECUTION_FAILED',
      proposal: lastProposal,
      validation: lastValidation,
      traceability: finalRecord
    };
  }

  private parseRepairResponse(rawText: string): RepairProposal {
    let cleanJson = rawText.trim();

    const fenceMatch = cleanJson.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
    if (fenceMatch) {
      cleanJson = fenceMatch[1].trim();
    }

    try {
      const parsed = JSON.parse(cleanJson);
      return {
        diagnosis: parsed.diagnosis || 'Failure diagnosed',
        confidence: typeof parsed.confidence === 'number' ? parsed.confidence : 0.8,
        repairType: parsed.repairType || 'PAYLOAD',
        reason: parsed.reason || 'Repair proposed by LLM',
        proposedChange: parsed.proposedChange || {}
      };
    } catch {
      return {
        diagnosis: 'Failed to parse JSON response from LLM provider',
        confidence: 0.0,
        repairType: 'NO_SAFE_REPAIR',
        reason: 'Unparseable LLM output',
        proposedChange: {}
      };
    }
  }
}
