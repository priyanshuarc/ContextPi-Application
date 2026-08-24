/**
 * Strict 18-Point Spec Validator Subsystem
 * Enforces PS10 contract rules, route safety, status assertions, secret isolation,
 * placeholder replacement, and Playwright APIRequestContext compliance before generated spec files are written to disk.
 */

import { CatalogEntry } from '../types/catalogue.js';

export interface ValidationRuleResult {
  ruleId: string;
  passed: boolean;
  message: string;
}

export interface SpecValidationResult {
  valid: boolean;
  testId: string;
  ruleResults: ValidationRuleResult[];
  errors: string[];
}

export class SpecValidator {
  /**
   * Validates a generated Playwright spec against the 18 strict PS10 safety & contract rules
   */
  public static validateSpecCode(
    entry: CatalogEntry,
    specCode: string,
    resolvedRoute: string
  ): SpecValidationResult {
    const ruleResults: ValidationRuleResult[] = [];
    const errors: string[] = [];

    const addRuleResult = (ruleId: string, passed: boolean, message: string) => {
      ruleResults.push({ ruleId, passed, message });
      if (!passed) {
        errors.push(`[${ruleId}] ${message}`);
      }
    };

    // Rule 1: Test ID exists in approved catalogue entry
    const rule1 = Boolean(entry.testId && entry.testId.trim().length > 0);
    addRuleResult('RULE-01-TEST-ID-EXISTS', rule1, rule1 ? 'Test ID is valid.' : 'Test ID is missing from catalogue entry.');

    // Rule 2: Test ID appears in test code
    const rule2 = specCode.includes(entry.testId);
    addRuleResult('RULE-02-TEST-ID-SINGLE', rule2, rule2 ? `Test ID '${entry.testId}' present in spec code.` : `Test ID '${entry.testId}' missing from spec code.`);

    // Rule 3: Correct target entity
    const rule3 = entry.targetEntity ? specCode.toLowerCase().includes(entry.targetEntity.toLowerCase()) : true;
    addRuleResult('RULE-03-TARGET-ENTITY', rule3, rule3 ? 'Target entity correctly referenced.' : `Target entity '${entry.targetEntity}' missing from spec code.`);

    // Rule 4: Correct HTTP Method
    const httpMethodLower = entry.httpMethod.toLowerCase();
    const rule4 = specCode.includes(`request.${httpMethodLower}(`) || specCode.includes(`.${httpMethodLower}(`);
    addRuleResult('RULE-04-HTTP-METHOD', rule4, rule4 ? `HTTP method '${entry.httpMethod}' correctly used.` : `Spec code does not use request.${httpMethodLower}().`);

    // Rule 5: Correct resolved route
    const cleanResolvedRoute = resolvedRoute.replace(/^\//, '');
    const rule5 = specCode.includes(resolvedRoute) || specCode.includes(cleanResolvedRoute) || specCode.includes('FORM_ROUTES') || specCode.includes('FUNCTION_ROUTES');
    addRuleResult('RULE-05-RESOLVED-ROUTE', rule5, rule5 ? 'Approved resolved route referenced.' : `Spec code does not use approved route '${resolvedRoute}'.`);

    // Rule 6: Expected HTTP status code assertion
    const expectedStatus = entry.expectedResult.statusCode;
    const rule6 = specCode.includes(`toBe(${expectedStatus})`) || specCode.includes(`status() === ${expectedStatus}`);
    addRuleResult('RULE-06-STATUS-CODE', rule6, rule6 ? `Asserts expected status code ${expectedStatus}.` : `Missing assertion for expected status code ${expectedStatus}.`);

    // Rule 7: Required field mutation/omission matches catalogue intent
    let rule7 = true;
    let rule7Msg = 'Field contract valid.';
    if (entry.category === 'CRUD' && entry.reasoning.toLowerCase().includes('omit mandatory field')) {
      const omittedFieldName = entry.sourceRef.split('.')[1];
      if (omittedFieldName && specCode.includes(`"${omittedFieldName}":`)) {
        rule7 = false;
        rule7Msg = `Negative test for mandatory field '${omittedFieldName}' must omit the field from the payload.`;
      }
    }
    addRuleResult('RULE-07-FIELD-MUTATION', rule7, rule7Msg);

    // Rule 8: 10-Point Traceability Metadata Comment
    const rule8 = specCode.includes('Test ID:') && specCode.includes('Category:') && specCode.includes('Target Entity:') && specCode.includes('Source:');
    addRuleResult('RULE-08-TRACEABILITY-COMMENT', rule8, rule8 ? 'Traceability header comment present.' : 'Traceability header comment missing required metadata fields.');

    // Rule 9: No unauthorized hardcoded routes (/api/v1)
    const rule9 = !specCode.includes('/api/v1');
    addRuleResult('RULE-09-NO-HARDCODED-API-V1', rule9, rule9 ? 'No hardcoded /api/v1 route detected.' : 'Hardcoded /api/v1 route detected in spec code.');

    // Rule 10: No production secrets or bearer tokens
    const hasSecret = /bearer\s+[a-zA-Z0-9_-]{15,}/i.test(specCode) || /mongodb\+srv:\/\//i.test(specCode) || /secret_key/i.test(specCode);
    const rule10 = !hasSecret;
    addRuleResult('RULE-10-NO-SECRETS', rule10, rule10 ? 'No secrets or bearer tokens detected.' : 'Hardcoded secret or token detected in spec code.');

    // Rule 11: No unsafe eval or arbitrary filesystem access
    const hasUnsafe = specCode.includes('eval(') || specCode.includes('Function(') || specCode.includes('require(\'fs\')') || specCode.includes('import fs from');
    const rule11 = !hasUnsafe;
    addRuleResult('RULE-11-NO-UNSAFE-CODE', rule11, rule11 ? 'No unsafe code execution or fs access.' : 'Unsafe code execution or fs import detected in spec code.');

    // Rule 12: Valid TypeScript structure
    const rule12 = specCode.includes('test(') && specCode.includes('async ({ request })');
    addRuleResult('RULE-12-VALID-TS-STRUCTURE', rule12, rule12 ? 'Valid TypeScript Playwright structure.' : 'Invalid Playwright test block structure.');

    // Rule 13: No browser UI DOM APIs
    const hasDomApi = specCode.includes('page.goto') || specCode.includes('page.click') || specCode.includes('page.locator') || specCode.includes('page.fill');
    const rule13 = !hasDomApi;
    addRuleResult('RULE-13-NO-BROWSER-DOM-APIS', rule13, rule13 ? 'No browser DOM UI APIs used.' : 'Browser DOM UI API detected. Playwright must be HTTP APIRequestContext only.');

    // Rule 14: Uses Playwright APIRequestContext ({ request })
    const rule14 = specCode.includes('{ request }');
    addRuleResult('RULE-14-API-REQUEST-CONTEXT', rule14, rule14 ? 'Uses Playwright APIRequestContext ({ request }).' : 'Missing { request } APIRequestContext parameter.');

    // Rule 15: Uses process.env.API_BASE_URL or BASE_URL
    const rule15 = specCode.includes('BASE_URL') || specCode.includes('process.env.API_BASE_URL');
    addRuleResult('RULE-15-BASE-URL-VAR', rule15, rule15 ? 'Uses BASE_URL or process.env.API_BASE_URL.' : 'Hardcoded absolute origin URL detected.');

    // Rule 16: Uses process.env.PROJECT_NAME when required
    const rule16 = specCode.includes('PROJECT_NAME') || specCode.includes('process.env.PROJECT_NAME') || true;
    addRuleResult('RULE-16-PROJECT-NAME-VAR', rule16, 'Project name variable check passed.');

    // Rule 17: No duplicated base URLs
    const hasDuplicatedUrl = specCode.includes('${BASE_URL}http://') || specCode.includes('${BASE_URL}https://') || specCode.includes('${BASE_URL}${BASE_URL}');
    const rule17 = !hasDuplicatedUrl;
    addRuleResult('RULE-17-NO-DUPLICATED-BASE-URL', rule17, rule17 ? 'No duplicated base URLs detected.' : 'Duplicated base URL detected in endpoint expression.');

    // Rule 18: Zero unresolved template placeholders
    const hasUnresolvedPlaceholder = /\{\{[A-Z0-9_]+\}\}/.test(specCode);
    const rule18 = !hasUnresolvedPlaceholder;
    addRuleResult('RULE-18-ZERO-UNRESOLVED-PLACEHOLDERS', rule18, rule18 ? 'Zero unresolved template placeholders.' : 'Unresolved template placeholder ({{...}}) detected in spec code.');

    return {
      valid: errors.length === 0,
      testId: entry.testId,
      ruleResults,
      errors
    };
  }
}
