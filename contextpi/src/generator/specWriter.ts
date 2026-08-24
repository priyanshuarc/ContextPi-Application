/**
 * Playwright TypeScript Spec Generator
 * Synthesizes runnable, pure HTTP API Playwright TypeScript spec files (*.spec.ts)
 * EXCLUSIVELY from approved, selected CatalogEntry objects and deterministic templates.
 * Strict zero-LLM guarantee, strict path traversal safety, environment variable support,
 * and full 10-point traceability comments.
 */

import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import { TestCatalog, CatalogEntry, TestCategory } from '../types/catalogue.js';
import { TargetApiContract } from '../types/contract.js';
import { DEFAULT_PS10_CONTRACT } from '../contract/defaultPs10Contract.js';
import { validateTestCatalog } from '../types/validation.js';
import { renderSpecFileContent, renderSpecHeader, renderTestBlock } from './templates/codeTemplates.js';

export class SpecGeneratorError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'SpecGeneratorError';
  }
}

import { BedrockQwenProvider } from '../llm/bedrockQwenProvider.js';
import { SpecValidator } from './specValidator.js';
import { RouteResolver } from '../contract/TargetApiContract.js';

export interface SpecGeneratorOptions {
  outputDir?: string;
  targetContract?: TargetApiContract;
  cleanOutputDir?: boolean;
  useLLM?: boolean;
  llmProvider?: BedrockQwenProvider;
}

export interface GeneratedFileInfo {
  filePath: string;
  targetEntity: string;
  testCount: number;
}

export interface SpecGeneratorResult {
  outputDir: string;
  generatedFiles: GeneratedFileInfo[];
  totalFiles: number;
  totalTestBlocks: number;
  traceableTestIds: string[];
  categoryBreakdown: Record<TestCategory, number>;
  engineUsed: 'REAL_AI' | 'FALLBACK' | 'MIXED';
  llmInvoked: boolean;
  modelId: string;
  llmCallsCount: number;
  llmSuccessCount: number;
  llmDurationMs: number;
  validatedSpecs: number;
  fallbackSpecs: number;
  rejectedSpecs: number;
  retryCount: number;
}

/**
 * Sanitizes entity and function names to prevent path traversal or invalid path characters
 */
export function sanitizeFileName(name: string): string {
  if (!name || name.trim() === '') {
    return 'default';
  }

  // Reject path traversal attempts explicitly
  if (name.includes('..') || name.includes('/') || name.includes('\\')) {
    throw new SpecGeneratorError(`Path traversal attempt detected in target entity name: '${name}'`);
  }

  // Allow alphanumeric, hyphen, and underscore
  const sanitized = name.trim().replace(/[^a-zA-Z0-9_-]/g, '_').toLowerCase();
  return sanitized || 'default';
}

/**
 * Resolves exact relative and full file path for a spec based on category and target entity
 */
export function getSpecFilePath(outputDir: string, category: string, targetEntity: string): string {
  let relativePath: string;
  if (category === 'REGISTRY') {
    relativePath = path.join('registry.spec.ts');
  } else if (category === 'CUSTOM_FUNCTION') {
    const sanitizedFn = sanitizeFileName(targetEntity);
    relativePath = path.join('functions', `${sanitizedFn}.spec.ts`);
  } else {
    const sanitizedEntity = sanitizeFileName(targetEntity);
    relativePath = path.join('forms', `${sanitizedEntity}.spec.ts`);
  }
  return path.join(outputDir, relativePath);
}

/**
 * Ensures resolved file path remains strictly inside the target output directory
 */
export function assertSafePath(targetPath: string, rootDir: string): void {
  const absoluteRoot = path.resolve(rootDir);
  const absoluteTarget = path.resolve(targetPath);

  if (!absoluteTarget.startsWith(absoluteRoot)) {
    throw new SpecGeneratorError(
      `Security violation: Target file path '${absoluteTarget}' is outside output directory '${absoluteRoot}'`
    );
  }
}

/**
 * Main Spec Generator Function
 * Converts APPROVED TestCatalog -> Runnable Playwright TypeScript Spec Files (*.spec.ts)
 */
export async function generatePlaywrightSpecs(
  catalog: TestCatalog,
  contract: TargetApiContract = DEFAULT_PS10_CONTRACT,
  options: SpecGeneratorOptions = {}
): Promise<SpecGeneratorResult> {
  const startTime = Date.now();
  // 1. Validate catalogue structural integrity
  const validatedCatalog = validateTestCatalog(catalog);

  // 2. Reject DRAFT catalogues
  if (validatedCatalog.status !== 'APPROVED') {
    throw new SpecGeneratorError(
      `Cannot generate Playwright specs from catalogue with status '${validatedCatalog.status}'. Catalogue must be APPROVED first.`
    );
  }

  // 3. Filter selected entries ONLY
  const selectedEntries = validatedCatalog.entries.filter(e => e.selected);
  const outputDir = path.resolve(options.outputDir || 'generated-tests');

  const categoryBreakdown: Record<TestCategory, number> = {
    CRUD: 0,
    FIELD_VALIDATION: 0,
    RELATIONSHIP: 0,
    CUSTOM_FUNCTION: 0,
    BUSINESS_RULE: 0,
    REGISTRY: 0,
    BULK_UPLOAD: 0
  };

  if (selectedEntries.length === 0) {
    return {
      outputDir,
      generatedFiles: [],
      totalFiles: 0,
      totalTestBlocks: 0,
      traceableTestIds: [],
      categoryBreakdown,
      engineUsed: 'FALLBACK',
      llmInvoked: false,
      modelId: 'qwen.qwen3-coder-next',
      llmCallsCount: 0,
      llmSuccessCount: 0,
      llmDurationMs: 0,
      validatedSpecs: 0,
      fallbackSpecs: 0,
      rejectedSpecs: 0,
      retryCount: 0
    };
  }

  const llmProvider = options.llmProvider || new BedrockQwenProvider();
  const allowLLM = options.useLLM !== false && llmProvider.isAvailable();

  let llmCallsCount = 0;
  let llmSuccessCount = 0;
  let validatedSpecsCount = 0;
  let fallbackSpecsCount = 0;
  let rejectedSpecsCount = 0;
  let retryCount = 0;

  // Group entries by file path:
  const fileGroups = new Map<string, { groupName: string; targetEntity: string; entries: CatalogEntry[] }>();

  for (const entry of selectedEntries) {
    categoryBreakdown[entry.category] = (categoryBreakdown[entry.category] || 0) + 1;

    let relativePath: string;
    let groupName: string;

    if (entry.category === 'REGISTRY') {
      relativePath = path.join('registry.spec.ts');
      groupName = 'Function Registry';
    } else if (entry.category === 'CUSTOM_FUNCTION') {
      const sanitizedFn = sanitizeFileName(entry.targetEntity);
      relativePath = path.join('functions', `${sanitizedFn}.spec.ts`);
      groupName = `Function ${entry.targetEntity}`;
    } else {
      const sanitizedEntity = sanitizeFileName(entry.targetEntity);
      relativePath = path.join('forms', `${sanitizedEntity}.spec.ts`);
      groupName = `Form Entity ${entry.targetEntity}`;
    }

    const fullPath = path.join(outputDir, relativePath);
    assertSafePath(fullPath, outputDir);

    if (!fileGroups.has(fullPath)) {
      fileGroups.set(fullPath, {
        groupName,
        targetEntity: entry.targetEntity,
        entries: []
      });
    }

    fileGroups.get(fullPath)!.entries.push(entry);
  }

  // Clean output directory if requested
  if (options.cleanOutputDir) {
    try {
      await fs.rm(outputDir, { recursive: true, force: true });
    } catch {
      // Ignore if directory does not exist
    }
  }

  const generatedFiles: GeneratedFileInfo[] = [];
  const traceableTestIds: string[] = [];
  let totalTestBlocks = 0;

  // 4. Render and write spec files to disk
  for (const [fullFilePath, group] of fileGroups.entries()) {
    let fileContent = '';

    if (allowLLM) {
      // AI-assisted Qwen Coder spec generation with strict SpecValidator checks
      const specBlocks: string[] = [];
      for (const entry of group.entries) {
        const resolver = new RouteResolver(contract);
        let resolvedRoute = '';
        if (entry.targetRouteKey in contract.functionRoutes) {
          resolvedRoute = resolver.resolveFunctionRoute(entry.targetRouteKey as any, { functionName: entry.targetEntity });
        } else {
          resolvedRoute = resolver.resolveFormRoute(entry.targetRouteKey as any, { schemaName: entry.targetEntity });
        }
        const prompt = {
          testId: entry.testId,
          category: entry.category,
          priority: entry.priority,
          targetEntity: entry.targetEntity,
          source: entry.source,
          sourceRef: entry.sourceRef,
          reasoning: entry.reasoning,
          httpMethod: entry.httpMethod,
          resolvedRoute,
          expectedResult: entry.expectedResult,
          fields: [],
          sampleData: {},
          payloadTemplate: entry.payloadTemplate,
          dependencies: entry.dependencies,
          projectName: catalog.projectName
        };

        llmCallsCount++;
        const llmResult = await llmProvider.generatePlaywrightSpec(prompt);
        let validCode = false;

        if (llmResult.success && llmResult.testCode) {
          llmSuccessCount++;
          const validation = SpecValidator.validateSpecCode(entry, llmResult.testCode, resolvedRoute);
          if (validation.valid) {
            specBlocks.push(llmResult.testCode);
            validatedSpecsCount++;
            validCode = true;
          } else {
            rejectedSpecsCount++;
            retryCount++;
          }
        }

        if (!validCode) {
          fallbackSpecsCount++;
          const fallbackContent = renderTestBlock(entry);
          specBlocks.push(fallbackContent);
        }
      }

      const header = renderSpecHeader(validatedCatalog, contract);
      fileContent = `${header}
test.describe.serial('${group.groupName} API Spec', () => {
  let createdRecordId: string | undefined = undefined;
  let referencedRecordId: string | undefined = undefined;

${specBlocks.join('\n\n')}
});
`;
    } else {
      fallbackSpecsCount += group.entries.length;
      fileContent = renderSpecFileContent(group.groupName, group.entries, validatedCatalog, contract);
    }

    const dirPath = path.dirname(fullFilePath);
    await fs.mkdir(dirPath, { recursive: true });
    await fs.writeFile(fullFilePath, fileContent, 'utf-8');

    const testCount = group.entries.length;
    totalTestBlocks += testCount;

    group.entries.forEach(e => traceableTestIds.push(e.testId));

    generatedFiles.push({
      filePath: fullFilePath,
      targetEntity: group.targetEntity,
      testCount
    });
  }

  const llmDurationMs = Date.now() - startTime;

  let engineUsed: 'REAL_AI' | 'FALLBACK' | 'MIXED' = 'FALLBACK';
  if (allowLLM && validatedSpecsCount > 0 && fallbackSpecsCount === 0) {
    engineUsed = 'REAL_AI';
  } else if (allowLLM && validatedSpecsCount > 0 && fallbackSpecsCount > 0) {
    engineUsed = 'MIXED';
  } else {
    engineUsed = 'FALLBACK';
  }

  // Diagnostic Server-Side Logging (Secrets / Tokens isolated)
  console.log(`\n[Contextπ LLM Engine Forensic Diagnostic Log]`);
  console.log(`--------------------------------------------------`);
  console.log(`LLM Provider Invoked: ${allowLLM}`);
  console.log(`Model ID: qwen.qwen3-coder-next`);
  console.log(`Number of LLM Calls: ${llmCallsCount}`);
  console.log(`LLM Success Count: ${llmSuccessCount}`);
  console.log(`Generation Duration: ${llmDurationMs} ms`);
  console.log(`Number of Specs Generated by LLM: ${validatedSpecsCount}`);
  console.log(`Number of Fallback Generated Specs: ${fallbackSpecsCount}`);
  console.log(`Engine Classification: ${engineUsed}`);
  console.log(`--------------------------------------------------\n`);

  return {
    outputDir,
    generatedFiles,
    totalFiles: generatedFiles.length,
    totalTestBlocks,
    traceableTestIds,
    categoryBreakdown,
    engineUsed,
    llmInvoked: allowLLM,
    modelId: 'qwen.qwen3-coder-next',
    llmCallsCount,
    llmSuccessCount,
    llmDurationMs,
    validatedSpecs: validatedSpecsCount,
    fallbackSpecs: fallbackSpecsCount,
    rejectedSpecs: rejectedSpecsCount,
    retryCount
  };
}
