/**
 * Test Catalogue Approval Engine
 * Implements 5-Step Approval Gate, selection toggles, dependency conflict validation,
 * state safety, summary preview computation, and JSON serialization.
 */

import { ProjectContext } from '../../types/context.js';
import { TargetApiContract } from '../../types/contract.js';
import { TestIntent } from '../../rules/intentModel.js';
import {
  CatalogEntry,
  TestCatalog,
  TestCategory,
  TestPriority,
  RequirementSource,
  CatalogueStatus
} from '../../types/catalogue.js';
import { validateTestCatalog } from '../../types/validation.js';
import { buildTestCatalog, validateDependencyGraph, CatalogBuilderOptions } from '../catalogBuilder.js';

export class CatalogApprovalError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'CatalogApprovalError';
  }
}

export interface CatalogSummary {
  projectName: string;
  createdAt: string;
  status: CatalogueStatus;
  totalTests: number;
  selectedCount: number;
  unselectedCount: number;
  dependencyCount: number;
  testsByCategory: Record<TestCategory, number>;
  testsByPriority: Record<TestPriority, number>;
  testsBySource: Record<RequirementSource, number>;
  diagnostics: string[];
}

/**
 * Step 1: Creates a new draft catalogue from ProjectContext & Rule Engine Intents
 */
export function createDraftCatalogue(
  context: ProjectContext,
  intents: TestIntent[],
  contract?: TargetApiContract,
  options?: CatalogBuilderOptions
): TestCatalog {
  return buildTestCatalog(context, intents, contract, options);
}

/**
 * Deep clones a TestCatalog object to enforce immutability
 */
function cloneCatalog(catalog: TestCatalog): TestCatalog {
  return JSON.parse(JSON.stringify(catalog)) as TestCatalog;
}

/**
 * Selects a specific test case in the catalogue
 * Resets APPROVED status to DRAFT on any mutation
 */
export function selectEntry(catalog: TestCatalog, testId: string): TestCatalog {
  const next = cloneCatalog(catalog);
  const target = next.entries.find(e => e.testId === testId);

  if (!target) {
    throw new CatalogApprovalError(`Test case with ID '${testId}' not found in catalogue`);
  }

  target.selected = true;
  next.status = 'DRAFT'; // Any mutation reverts status to DRAFT
  return validateTestCatalog(next);
}

/**
 * Deselects a specific test case in the catalogue
 * Resets APPROVED status to DRAFT on any mutation
 */
export function deselectEntry(catalog: TestCatalog, testId: string): TestCatalog {
  const next = cloneCatalog(catalog);
  const target = next.entries.find(e => e.testId === testId);

  if (!target) {
    throw new CatalogApprovalError(`Test case with ID '${testId}' not found in catalogue`);
  }

  target.selected = false;
  next.status = 'DRAFT'; // Any mutation reverts status to DRAFT
  return validateTestCatalog(next);
}

/**
 * Selects all test cases in the catalogue
 */
export function selectAll(catalog: TestCatalog): TestCatalog {
  const next = cloneCatalog(catalog);
  next.entries.forEach(e => {
    e.selected = true;
  });
  next.status = 'DRAFT';
  return validateTestCatalog(next);
}

/**
 * Deselects all test cases in the catalogue
 */
export function deselectAll(catalog: TestCatalog): TestCatalog {
  const next = cloneCatalog(catalog);
  next.entries.forEach(e => {
    e.selected = false;
  });
  next.status = 'DRAFT';
  return validateTestCatalog(next);
}

/**
 * Validates dependency completeness across selected entries
 */
export function validateSelectedDependencies(catalog: TestCatalog): string[] {
  const conflicts: string[] = [];
  const selectedIds = new Set(catalog.entries.filter(e => e.selected).map(e => e.testId));

  for (const entry of catalog.entries) {
    if (!entry.selected) continue;

    for (const depId of entry.dependencies) {
      if (!selectedIds.has(depId)) {
        conflicts.push(
          `Selected test '${entry.testId}' (${entry.description}) depends on unselected test '${depId}'`
        );
      }
    }
  }

  return conflicts;
}

/**
 * Step 5: Approval Gate
 * Transitions DRAFT catalogue to APPROVED status if all approval rules pass
 */
export function approveCatalogue(catalog: TestCatalog): TestCatalog {
  const next = cloneCatalog(catalog);

  // Rule 1: Validate structural integrity of catalog
  validateTestCatalog(next);

  // Rule 2: Must have at least 1 selected entry
  const selectedEntries = next.entries.filter(e => e.selected);
  if (selectedEntries.length === 0) {
    throw new CatalogApprovalError('Cannot approve catalogue: No test cases are selected');
  }

  // Rule 3: Validate dependency graph integrity
  try {
    validateDependencyGraph(next.entries);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    throw new CatalogApprovalError(`Cannot approve catalogue due to invalid dependency graph: ${msg}`);
  }

  // Rule 4: Validate selected dependencies completeness
  const dependencyConflicts = validateSelectedDependencies(next);
  if (dependencyConflicts.length > 0) {
    throw new CatalogApprovalError(
      `Cannot approve catalogue due to unselected dependencies:\n${dependencyConflicts.join('\n')}`
    );
  }

  // Prune unselected dependency references for selected entries so custom test selections approve cleanly
  const selectedIds = new Set(selectedEntries.map(e => e.testId));
  for (const entry of next.entries) {
    if (entry.dependencies && entry.dependencies.length > 0) {
      entry.dependencies = entry.dependencies.filter(depId => selectedIds.has(depId));
    }
  }

  next.status = 'APPROVED';
  return validateTestCatalog(next);
}

/**
 * Returns all currently selected entries
 */
export function getSelectedEntries(catalog: TestCatalog): CatalogEntry[] {
  return catalog.entries.filter(e => e.selected);
}

/**
 * Returns selected entries ONLY if the catalogue is in APPROVED state
 */
export function getApprovedEntries(catalog: TestCatalog): CatalogEntry[] {
  if (catalog.status !== 'APPROVED') {
    throw new CatalogApprovalError(
      `Cannot retrieve approved test entries from catalogue with status '${catalog.status}'. Catalogue must be APPROVED first.`
    );
  }
  return getSelectedEntries(catalog);
}

/**
 * Computes summary analytics & preview metrics for a catalogue
 */
export function getSummary(catalog: TestCatalog): CatalogSummary {
  const testsByCategory: Record<TestCategory, number> = {
    CRUD: 0,
    FIELD_VALIDATION: 0,
    RELATIONSHIP: 0,
    CUSTOM_FUNCTION: 0,
    BUSINESS_RULE: 0,
    REGISTRY: 0,
    BULK_UPLOAD: 0
  };

  const testsByPriority: Record<TestPriority, number> = {
    CRITICAL: 0,
    HIGH: 0,
    MEDIUM: 0,
    LOW: 0
  };

  const testsBySource: Record<RequirementSource, number> = {
    MONGO_SCHEMA: 0,
    FUNCTION_REGISTRY: 0,
    BUSINESS_REQUIREMENT: 0
  };

  let selectedCount = 0;
  let unselectedCount = 0;
  let dependencyCount = 0;

  for (const entry of catalog.entries) {
    testsByCategory[entry.category] = (testsByCategory[entry.category] || 0) + 1;
    testsByPriority[entry.priority] = (testsByPriority[entry.priority] || 0) + 1;
    testsBySource[entry.source] = (testsBySource[entry.source] || 0) + 1;

    if (entry.selected) {
      selectedCount++;
    } else {
      unselectedCount++;
    }

    dependencyCount += entry.dependencies.length;
  }

  const diagnostics = validateSelectedDependencies(catalog);

  return {
    projectName: catalog.projectName,
    createdAt: catalog.createdAt,
    status: catalog.status,
    totalTests: catalog.entries.length,
    selectedCount,
    unselectedCount,
    dependencyCount,
    testsByCategory,
    testsByPriority,
    testsBySource,
    diagnostics
  };
}

/**
 * Serializes TestCatalog to JSON string suitable for REST API or Web Dashboard
 */
export function serializeCatalog(catalog: TestCatalog): string {
  return JSON.stringify(catalog, null, 2);
}

/**
 * Deserializes JSON string back to validated TestCatalog
 */
export function deserializeCatalog(jsonString: string): TestCatalog {
  try {
    const raw = JSON.parse(jsonString);
    return validateTestCatalog(raw);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    throw new CatalogApprovalError(`Failed to deserialize TestCatalog: ${msg}`);
  }
}
