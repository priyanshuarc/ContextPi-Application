/**
 * Target API Contract & Route Resolution Engine
 * Provides safe, configurable route resolution for Form and Custom Function operations.
 * Decouples Contextπ from target API path structure, enforcing path safety and sanitization.
 */

import { FormRoutesContract, FunctionRoutesContract, TargetApiContract } from '../types/contract.js';
import { validateTargetApiContract } from '../types/validation.js';

export class RouteResolutionError extends Error {
  constructor(message: string) {
    super(`[RouteResolutionError] ${message}`);
    this.name = 'RouteResolutionError';
  }
}

export interface RouteResolutionOptions {
  schemaName?: string;
  functionName?: string;
  queryParams?: Record<string, string | number | boolean>;
}

export class RouteResolver {
  private readonly contract: TargetApiContract;

  constructor(contract: TargetApiContract) {
    this.contract = validateTargetApiContract(contract);
  }

  public getContract(): TargetApiContract {
    return this.contract;
  }

  /**
   * Resolves a Form route key (formGet, formCreate, formUpdate, formDelete, formBulkupload, query)
   * into a fully qualified URL.
   */
  public resolveFormRoute(
    routeKey: keyof FormRoutesContract,
    options?: RouteResolutionOptions
  ): string {
    const routePath = this.contract.formRoutes[routeKey];
    if (!routePath) {
      throw new RouteResolutionError(`Unknown form route key: '${String(routeKey)}'`);
    }

    let path = routePath;

    if (options?.schemaName) {
      const sanitizedSchema = this.sanitizeIdentifier(options.schemaName, 'schemaName');
      if (path.includes(':schemaName') || path.includes(':schema')) {
        path = path.replace(':schemaName', sanitizedSchema).replace(':schema', sanitizedSchema);
      } else if (routeKey !== 'query') {
        path = `${path.replace(/\/+$/, '')}/${sanitizedSchema}`;
      }
    }

    this.validatePathSafety(path);
    return this.buildFullUrl(path, options?.queryParams);
  }

  /**
   * Resolves a Function route key (executeFunction, createFunction, getAllFunction)
   * into a fully qualified URL.
   */
  public resolveFunctionRoute(
    routeKey: keyof FunctionRoutesContract,
    options?: RouteResolutionOptions
  ): string {
    const routePath = this.contract.functionRoutes[routeKey];
    if (!routePath) {
      throw new RouteResolutionError(`Unknown function route key: '${String(routeKey)}'`);
    }

    let path = routePath;

    if (path.includes(':name') || path.includes(':functionName')) {
      if (!options?.functionName || options.functionName.trim() === '') {
        throw new RouteResolutionError(
          `Function route '${routeKey}' requires options.functionName to substitute ':name'`
        );
      }
      const sanitizedFn = this.sanitizeIdentifier(options.functionName, 'functionName');
      path = path.replace(':name', sanitizedFn).replace(':functionName', sanitizedFn);
    }

    this.validatePathSafety(path);
    return this.buildFullUrl(path, options?.queryParams);
  }

  /**
   * Sanitizes identifiers (schemaName, functionName) to prevent path traversal or malformed characters.
   */
  private sanitizeIdentifier(input: string, fieldName: string): string {
    const trimmed = input.trim();
    if (trimmed === '') {
      throw new RouteResolutionError(`${fieldName} cannot be empty`);
    }
    // Prevent path traversal
    if (trimmed.includes('..') || trimmed.includes('/') || trimmed.includes('\\')) {
      throw new RouteResolutionError(
        `Invalid ${fieldName}: Path traversal or slashes not allowed in '${trimmed}'`
      );
    }
    // Only allow alphanumeric, hyphen, underscore
    if (!/^[a-zA-Z0-9_-]+$/.test(trimmed)) {
      throw new RouteResolutionError(
        `Invalid ${fieldName}: Contains disallowed characters '${trimmed}'`
      );
    }
    return encodeURIComponent(trimmed);
  }

  /**
   * Validates that all placeholder parameters have been resolved and no path traversal tokens exist.
   */
  private validatePathSafety(path: string): void {
    if (/:[a-zA-Z0-9_-]+/.test(path)) {
      const match = path.match(/:[a-zA-Z0-9_-]+/);
      throw new RouteResolutionError(
        `Unresolved placeholder in path: '${match ? match[0] : path}'`
      );
    }
    if (path.includes('..')) {
      throw new RouteResolutionError(`Path traversal detected in path: '${path}'`);
    }
  }

  /**
   * Safely constructs full URL joining baseUrl and path with query parameters.
   */
  private buildFullUrl(
    path: string,
    queryParams?: Record<string, string | number | boolean>
  ): string {
    const base = this.contract.baseUrl.replace(/\/+$/, '');
    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    const url = new URL(`${base}${cleanPath}`);

    if (queryParams) {
      for (const [k, v] of Object.entries(queryParams)) {
        url.searchParams.append(k, String(v));
      }
    }

    return url.toString();
  }
}
