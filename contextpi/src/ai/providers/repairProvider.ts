/**
 * Repair LLM Provider Interface
 * Abstraction for failure diagnosis and repair proposal generation.
 * Application-agnostic interface supporting multiple LLM backends or fallback providers.
 */

export interface RepairLLMProvider {
  isAvailable(): boolean;
  getModelId(): string;
  diagnose(prompt: string): Promise<string>;
}
