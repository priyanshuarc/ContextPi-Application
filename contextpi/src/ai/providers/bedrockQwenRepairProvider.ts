/**
 * Bedrock Qwen Coder Repair Provider
 * Concrete RepairLLMProvider using the hackathon-provided Qwen3 Coder model.
 * Constructs repair-specific prompts (not generation prompts).
 * Falls back to deterministic structural diagnosis when Bedrock is unavailable.
 * Application-agnostic: never references specific target application entities.
 */

import { RepairLLMProvider } from './repairProvider.js';

export class BedrockQwenRepairProvider implements RepairLLMProvider {
  private bearerToken: string;
  private modelId: string;
  private baseUrl: string;

  constructor(config?: {
    bearerToken?: string;
    modelId?: string;
    baseUrl?: string;
  }) {
    this.bearerToken = config?.bearerToken || process.env.AWS_BEARER_TOKEN_BEDROCK || '';
    this.modelId = config?.modelId || process.env.BEDROCK_MODEL_ID || 'qwen.qwen3-coder-next';
    this.baseUrl = (config?.baseUrl || process.env.BEDROCK_BASE_URL || 'https://bedrock-runtime.us-east-1.amazonaws.com').replace(/\/$/, '');
  }

  public isAvailable(): boolean {
    return this.bearerToken.trim().length > 10 && !this.bearerToken.includes('your_bedrock');
  }

  public getModelId(): string {
    return this.modelId;
  }

  /**
   * Send repair prompt to Bedrock and return raw JSON response string.
   * Falls back to deterministic diagnosis if Bedrock is unavailable.
   */
  public async diagnose(prompt: string): Promise<string> {
    if (!this.isAvailable()) {
      return this.generateFallbackDiagnosis(prompt);
    }

    const endpoint = `${this.baseUrl}/model/${this.modelId}/invoke`;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.bearerToken}`
    };

    const requestBody = {
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ],
      max_tokens: 1500,
      temperature: 0.1
    };

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers,
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        const errText = await response.text();
        console.warn(`[BedrockQwenRepairProvider Warning] HTTP ${response.status}: ${errText}. Using deterministic fallback.`);
        return this.generateFallbackDiagnosis(prompt);
      }

      const resData: any = await response.json();
      const rawText = resData?.output?.text || resData?.choices?.[0]?.message?.content || JSON.stringify(resData);
      return rawText;
    } catch (err: any) {
      console.warn(`[BedrockQwenRepairProvider Warning] Call failed: ${err.message}. Using deterministic fallback.`);
      return this.generateFallbackDiagnosis(prompt);
    }
  }

  /**
   * Deterministic structural fallback diagnosis when Bedrock is offline or unreachable.
   * Application-agnostic rule engine for common API failures.
   */
  private generateFallbackDiagnosis(prompt: string): string {
    // Extract actual status and expected status from prompt if present
    const actualStatusMatch = prompt.match(/Actual HTTP Status:\s*(\d+)/i);
    const actualStatus = actualStatusMatch ? parseInt(actualStatusMatch[1], 10) : undefined;

    const actualBodyMatch = prompt.match(/Actual Response Body:\s*([\s\S]*?)(?=\n-|\n#|$)/i);
    const actualBody = actualBodyMatch ? actualBodyMatch[1].trim() : '';

    const payloadMatch = prompt.match(/Request Payload:\s*([\s\S]*?)(?=\n-|\n#|$)/i);
    let payloadObj: Record<string, any> = {};
    if (payloadMatch) {
      try {
        payloadObj = JSON.parse(payloadMatch[1].trim());
      } catch {
        // Ignored
      }
    }

    // Rule 1: HTTP 400 with missing or malformed payload field
    if (actualStatus === 400 && payloadObj && typeof payloadObj === 'object') {
      const repairedPayload = { ...payloadObj };
      const bodyText = typeof actualBody === 'string' ? actualBody : JSON.stringify(actualBody);

      // A. Check for exact length constraints (e.g. "must be exactly N characters")
      const lengthMatch = bodyText.match(/(\w+)\s+must be exactly\s+(\d+)\s+characters/i);
      if (lengthMatch) {
        const fieldName = lengthMatch[1];
        const targetLen = parseInt(lengthMatch[2], 10);
        if (fieldName && targetLen > 0) {
          const currentVal = String(repairedPayload[fieldName] || 'VAL');
          const prefix = currentVal.length >= 3 ? currentVal.substring(0, 3).toUpperCase() : 'CODE';
          const padding = '10999888777666'.substring(0, targetLen - prefix.length);
          repairedPayload[fieldName] = (prefix + padding).substring(0, targetLen);
        }
      }

      // B. Check for numeric data type issues (e.g. "must be a number")
      const numberMatch = bodyText.match(/(\w+)\s+must be a number/i);
      if (numberMatch) {
        const fieldName = numberMatch[1];
        if (fieldName && typeof repairedPayload[fieldName] !== 'number') {
          repairedPayload[fieldName] = 100;
        }
      }

      // C. Check for relationship reference issues (e.g. "must reference an existing")
      const refMatch = bodyText.match(/(\w+)\s+must reference an existing/i);
      if (refMatch) {
        const fieldName = refMatch[1];
        if (fieldName) {
          repairedPayload[fieldName] = "67bb6c8a789a012b3c4d5e6f";
        }
      }

      // D. Check for enum selection issues (e.g. "must be one of: A, B, C")
      const enumMatch = bodyText.match(/(\w+)\s+must be one of\s*:?\s*\[?([^\]\n]+)\]?/i);
      if (enumMatch) {
        const fieldName = enumMatch[1];
        const rawEnums = enumMatch[2];
        const enums = rawEnums.split(/,|\s+/).map(s => s.replace(/['"\s]/g, '')).filter(Boolean);
        if (fieldName && enums.length > 0) {
          repairedPayload[fieldName] = enums[0];
        }
      }

      // E. Check for missing required field (e.g. "fieldName is required")
      const reqMatch = bodyText.match(/(\w+)\s+is required/i);
      if (reqMatch) {
        const fieldName = reqMatch[1];
        if (fieldName && (repairedPayload[fieldName] === undefined || repairedPayload[fieldName] === '')) {
          repairedPayload[fieldName] = `VALID_${fieldName.toUpperCase()}`;
        }
      }

      return JSON.stringify({
        diagnosis: `Target API validation error: ${bodyText.substring(0, 100)}`,
        confidence: 0.85,
        repairType: "PAYLOAD",
        reason: "Adjusted request payload values to satisfy dynamic schema constraints.",
        proposedChange: {
          payload: repairedPayload
        }
      }, null, 2);
    }

    // Rule 2: HTTP 404 (Route or Resource ID missing)
    if (actualStatus === 404) {
      return JSON.stringify({
        diagnosis: "Target API returned HTTP 404 Not Found for requested route or entity ID.",
        confidence: 0.80,
        repairType: "ROUTE",
        reason: "The request path or referenced record ID was not found on target server.",
        proposedChange: {}
      }, null, 2);
    }

    // Default fallback
    return JSON.stringify({
      diagnosis: "Structural failure detected during Playwright execution.",
      confidence: 0.50,
      repairType: "NO_SAFE_REPAIR",
      reason: "Execution failure could not be safely repaired without violating safety policy.",
      proposedChange: {}
    }, null, 2);
  }
}
