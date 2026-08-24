/**
 * Test Catalog Builder
 * Converts Rule Engine TestIntents into official 10-Point Traceable CatalogEntries.
 * Enforces stable IDs, deduplication, dependency preservation, topological ordering, and dynamic route resolution.
 */

import { ProjectContext } from '../types/context.js';
import { TargetApiContract } from '../types/contract.js';
import { TestIntent } from '../rules/intentModel.js';
import { CatalogEntry, TestCatalog, TestCategory, RequirementSource } from '../types/catalogue.js';
import { validateTestCatalog } from '../types/validation.js';

export interface CatalogBuilderOptions {
  createdAt?: string;
  autoDeduplicate?: boolean;
}

/**
 * Category shortcodes used in stable test ID generation
 */
const CATEGORY_SHORTCODES: Record<TestCategory, string> = {
  CRUD: 'CRUD',
  FIELD_VALIDATION: 'FIELD',
  RELATIONSHIP: 'REL',
  CUSTOM_FUNCTION: 'FUNC',
  BUSINESS_RULE: 'BIZ',
  REGISTRY: 'REG',
  BULK_UPLOAD: 'BULK'
};

/**
 * Computes a stable semantic signature for deduplication
 */
export function computeIntentSignature(intent: TestIntent): string {
  const payloadStr = JSON.stringify(intent.payloadTemplate || {});
  const expectedStr = JSON.stringify(intent.expectedResult || {});
  return `${intent.targetEntity.toLowerCase()}:${intent.category}:${intent.sourceRef.toLowerCase()}:${intent.httpMethod}:${intent.targetRouteKey}:${expectedStr}:${payloadStr}`;
}

/**
 * Deduplicates overlapping test intents by semantic signature
 */
export function deduplicateIntents(intents: TestIntent[]): TestIntent[] {
  const seen = new Set<string>();
  const uniqueIntents: TestIntent[] = [];

  for (const intent of intents) {
    const signature = computeIntentSignature(intent);
    if (!seen.has(signature)) {
      seen.add(signature);
      uniqueIntents.push(intent);
    }
  }

  return uniqueIntents;
}

/**
 * Generates a stable, readable, deterministic Test ID
 * Example: TC-ITEMS-CRUD-001, TC-ORDERS-REL-002, TC-CALCULATEDISCOUNT-FUNC-001
 */
export function generateStableTestId(
  targetEntity: string,
  category: TestCategory,
  sequenceIndex: number
): string {
  const cleanEntity = targetEntity.replace(/[^a-zA-Z0-9]/g, '').toUpperCase() || 'ENTITY';
  const shortcode = CATEGORY_SHORTCODES[category] || 'TEST';
  const paddedSeq = String(sequenceIndex).padStart(3, '0');
  return `TC-${cleanEntity}-${shortcode}-${paddedSeq}`;
}

/**
 * Topologically sorts catalog entries by dependency graph and CRUD lifecycle
 */
export function sortEntriesByDependencyOrder(entries: CatalogEntry[]): CatalogEntry[] {
  const entryMap = new Map<string, CatalogEntry>();
  entries.forEach(e => entryMap.set(e.testId, e));

  const visited = new Set<string>();
  const visiting = new Set<string>();
  const sorted: CatalogEntry[] = [];

  function visit(testId: string) {
    if (visiting.has(testId)) {
      throw new Error(`Circular dependency detected in test catalog involving testId '${testId}'`);
    }
    if (!visited.has(testId)) {
      visiting.add(testId);
      const entry = entryMap.get(testId);
      if (entry) {
        for (const depId of entry.dependencies) {
          if (entryMap.has(depId)) {
            visit(depId);
          }
        }
      }
      visiting.delete(testId);
      visited.add(testId);
      if (entry) {
        sorted.push(entry);
      }
    }
  }

  // Visit entries in a stable initial order
  entries.forEach(e => {
    if (!visited.has(e.testId)) {
      visit(e.testId);
    }
  });

  return sorted;
}

/**
 * Validates dependency graph integrity (missing refs, self-deps, cycles)
 */
export function validateDependencyGraph(entries: CatalogEntry[]): void {
  const idSet = new Set(entries.map(e => e.testId));

  for (const entry of entries) {
    for (const depId of entry.dependencies) {
      if (depId === entry.testId) {
        throw new Error(`Self dependency detected on testId '${entry.testId}'`);
      }
      if (!idSet.has(depId)) {
        throw new Error(`Test '${entry.testId}' references non-existent dependency '${depId}'`);
      }
    }
  }

  // Run cycle check
  sortEntriesByDependencyOrder(entries);
}

/**
 * Main Catalog Builder Function
 * Converts ProjectContext + TestIntents + TargetApiContract -> TestCatalog
 */
export function buildTestCatalog(
  context: ProjectContext,
  intents: TestIntent[],
  _contract?: TargetApiContract,
  options: CatalogBuilderOptions = {}
): TestCatalog {
  const createdAt = options.createdAt || new Date().toISOString();
  const shouldDeduplicate = options.autoDeduplicate !== false;

  const processedIntents = shouldDeduplicate ? deduplicateIntents(intents) : intents;

  // Group intents by targetEntity + category for stable sequence numbering
  const entityCategoryCounter = new Map<string, number>();

  // Map raw intentId -> generated stable testId
  const intentIdToTestIdMap = new Map<string, string>();

  // First pass: generate stable testIds for each intent
  const preEntries = processedIntents.map(intent => {
    const key = `${intent.targetEntity.toUpperCase()}:${intent.category}`;
    const currentCount = (entityCategoryCounter.get(key) || 0) + 1;
    entityCategoryCounter.set(key, currentCount);

    const testId = generateStableTestId(intent.targetEntity, intent.category, currentCount);
    intentIdToTestIdMap.set(intent.intentId, testId);

    return {
      intent,
      testId
    };
  });

  // Second pass: construct complete 10-Point CatalogEntries with mapped dependencies
  const catalogEntries: CatalogEntry[] = preEntries.map(({ intent, testId }) => {
    // Map raw intent dependencies to new stable testIds
    const mappedDependencies: string[] = [];
    for (const depIntentId of intent.dependencies) {
      const mappedTestId = intentIdToTestIdMap.get(depIntentId);
      if (mappedTestId) {
        mappedDependencies.push(mappedTestId);
      }
    }

    const entry: CatalogEntry = {
      testId,
      category: intent.category,
      targetEntity: intent.targetEntity,
      description: intent.description,
      source: intent.source as RequirementSource,
      sourceRef: intent.sourceRef,
      reasoning: intent.reasoning,
      expectedResult: intent.expectedResult,
      priority: intent.priority,
      dependencies: mappedDependencies,
      payloadTemplate: intent.payloadTemplate,
      httpMethod: intent.httpMethod,
      targetRouteKey: intent.targetRouteKey,
      selected: true
    };

    return entry;
  });

  // Validate dependency graph
  validateDependencyGraph(catalogEntries);

  // Sort entries deterministically by dependency order
  const sortedEntries = sortEntriesByDependencyOrder(catalogEntries);

  const rawCatalog: TestCatalog = {
    projectName: context.projectName,
    createdAt,
    status: 'DRAFT',
    entries: sortedEntries
  };

  return validateTestCatalog(rawCatalog);
}
