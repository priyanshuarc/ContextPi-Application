/**
 * Test Catalogue State Store
 * Manages reactive/encapsulated state transitions for TestCatalog objects.
 * Guarantees immutability and enforces the 5-step approval workflow.
 */

import { CatalogEntry, TestCatalog } from '../../types/catalogue.js';
import { ProjectContext } from '../../types/context.js';
import { TargetApiContract } from '../../types/contract.js';
import { TestIntent } from '../../rules/intentModel.js';
import {
  createDraftCatalogue,
  selectEntry,
  deselectEntry,
  selectAll,
  deselectAll,
  approveCatalogue,
  getSelectedEntries,
  getApprovedEntries,
  getSummary,
  serializeCatalog,
  CatalogSummary
} from './catalogApprovalEngine.js';

export class CatalogStateStore {
  private currentCatalog: TestCatalog;

  constructor(initialCatalog: TestCatalog) {
    this.currentCatalog = initialCatalog;
  }

  /**
   * Factory method to create a StateStore initialized with a new draft catalogue
   */
  public static createDraft(
    context: ProjectContext,
    intents: TestIntent[],
    contract?: TargetApiContract
  ): CatalogStateStore {
    const catalog = createDraftCatalogue(context, intents, contract);
    return new CatalogStateStore(catalog);
  }

  /**
   * Returns current TestCatalog state
   */
  public getCatalog(): TestCatalog {
    return this.currentCatalog;
  }

  /**
   * Selects a test case by testId
   */
  public selectEntry(testId: string): TestCatalog {
    this.currentCatalog = selectEntry(this.currentCatalog, testId);
    return this.currentCatalog;
  }

  /**
   * Deselects a test case by testId
   */
  public deselectEntry(testId: string): TestCatalog {
    this.currentCatalog = deselectEntry(this.currentCatalog, testId);
    return this.currentCatalog;
  }

  /**
   * Selects all test cases
   */
  public selectAll(): TestCatalog {
    this.currentCatalog = selectAll(this.currentCatalog);
    return this.currentCatalog;
  }

  /**
   * Deselects all test cases
   */
  public deselectAll(): TestCatalog {
    this.currentCatalog = deselectAll(this.currentCatalog);
    return this.currentCatalog;
  }

  /**
   * Approves the catalogue
   */
  public approveCatalogue(): TestCatalog {
    this.currentCatalog = approveCatalogue(this.currentCatalog);
    return this.currentCatalog;
  }

  /**
   * Returns all currently selected entries
   */
  public getSelectedEntries(): CatalogEntry[] {
    return getSelectedEntries(this.currentCatalog);
  }

  /**
   * Returns approved entries (throws if status is DRAFT)
   */
  public getApprovedEntries(): CatalogEntry[] {
    return getApprovedEntries(this.currentCatalog);
  }

  /**
   * Returns summary analytics & preview metrics
   */
  public getSummary(): CatalogSummary {
    return getSummary(this.currentCatalog);
  }

  /**
   * Serializes current catalogue to JSON
   */
  public serialize(): string {
    return serializeCatalog(this.currentCatalog);
  }
}
