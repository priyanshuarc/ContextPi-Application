/**
 * Failure Trace Formatting & Decoding Helper
 * Safely normalizes arbitrary test failure traces (objects, strings, arrays, ANSI escape sequences)
 * into structured, human-readable FailureTrace objects.
 * Prevents React Error #31 (attempting to render raw objects in JSX).
 */

export interface FailureTrace {
  message: string;
  stack?: string;
  location?: string;
  humanSummary?: string;
  whatHappened?: string;
  expected?: string;
  actual?: string;
  failedAssertion?: string;
  likelyRootCause?: string;
  suggestedNextAction?: string;
  rawDecodedMessage?: string;
}

/**
 * Strips ANSI control characters and color escape codes from terminal string output
 */
export function stripAnsi(text: string): string {
  if (!text || typeof text !== 'string') return '';
  return text
    // Strip standard ANSI color & control escape codes
    .replace(/[\u001b\u009b][\[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nxy=><]/g, '')
    .replace(/\x1b\[[0-9;]*m/g, '')
    .replace(/\[\d+m/g, '')
    .trim();
}

/**
 * Parses raw failure information into structured, human-readable sections
 */
export function formatFailureTrace(value: any): FailureTrace {
  if (value === null || value === undefined) {
    return {
      message: 'No failure trace was provided.',
      humanSummary: 'Execution failed without providing an error traceback.',
      whatHappened: 'Playwright test execution ended without output.',
      likelyRootCause: 'The target test suite or network request terminated unexpectedly.',
      suggestedNextAction: 'Verify target application server is online and accessible.'
    };
  }

  let rawMessage = '';
  let stack: string | undefined = undefined;
  let location: string | undefined = undefined;

  if (typeof value === 'string') {
    rawMessage = value;
  } else if (Array.isArray(value)) {
    rawMessage = value
      .map((item) => (typeof item === 'string' ? item : typeof item === 'object' && item ? item.message || JSON.stringify(item) : String(item)))
      .join('\n');
  } else if (typeof value === 'object') {
    rawMessage = typeof value.message === 'string' && value.message.trim().length > 0
      ? value.message
      : typeof value.error === 'string' && value.error.trim().length > 0
      ? value.error
      : JSON.stringify(value, null, 2);

    stack = typeof value.stack === 'string' ? value.stack : undefined;
    location = typeof value.location === 'string' ? value.location : undefined;
  } else {
    rawMessage = String(value);
  }

  const cleanMessage = stripAnsi(rawMessage);
  const cleanStack = stack ? stripAnsi(stack) : undefined;

  // Extract expected vs actual status codes if present in Playwright assertion output
  const statusMatch =
    cleanMessage.match(/Expected:\s*(\d+)[\s\S]*?Received:\s*(\d+)/i) ||
    cleanMessage.match(/Expected status\s*(\d+)[\s\S]*?received\s*(\d+)/i) ||
    cleanMessage.match(/status code (\d+) instead of (\d+)/i);
  let expected = 'HTTP 200/201 Success';
  let actual = 'Execution Error';

  if (statusMatch) {
    expected = `HTTP ${statusMatch[1]}`;
    actual = `HTTP ${statusMatch[2]}`;
  } else {
    const recvMatch = cleanMessage.match(/Received:\s*(\d+)/i);
    if (recvMatch) {
      actual = `HTTP ${recvMatch[1]}`;
    }
  }

  // Derive Human Summary
  let humanSummary = 'Playwright API assertion failure detected during HTTP execution.';
  if (cleanMessage.includes('expect(received).toBe(expected)')) {
    humanSummary = `Target API returned status ${actual} when ${expected} was expected by test assertion.`;
  } else if (cleanMessage.includes('Prerequisite record creation failed')) {
    humanSummary = 'Test execution halted because dependent record creation failed during setup step.';
  } else if (cleanMessage.includes('404')) {
    humanSummary = 'Target API endpoint or resource ID was not found (HTTP 404).';
  } else if (cleanMessage.includes('400')) {
    humanSummary = 'Target API rejected request payload with validation error (HTTP 400).';
  }

  // Derive What Happened
  const whatHappened = `Sent HTTP API request to target server. Server responded with unexpected result or status (${actual}).`;

  // Derive Failed Assertion
  let failedAssertion = 'expect(response.status()).toBe(expectedStatus);';
  if (cleanMessage.includes('expect(')) {
    const lines = cleanMessage.split('\n');
    const expLine = lines.find(l => l.includes('expect('));
    if (expLine) failedAssertion = expLine.trim();
  }

  // Derive Location
  if (!location && cleanStack) {
    const locMatch = cleanStack.match(/(\w+\/\w+\.spec\.ts:\d+:\d+)/i) || cleanStack.match(/(\w+\.spec\.ts:\d+)/i);
    if (locMatch) location = locMatch[1];
  }

  // Derive Root Cause & Next Action
  let likelyRootCause = 'Mismatch between test request payload/schema constraints and target API server handler.';
  let suggestedNextAction = 'Inspect request payload fields in Failure Trace and check target API schema rules.';

  if (actual.includes('400')) {
    likelyRootCause = 'Payload field violated target database schema validation (e.g. required field missing, length mismatch, or wrong enum).';
    suggestedNextAction = 'Enable AI Self-Healing repair or adjust catalog payload template to match target schema requirements.';
  } else if (actual.includes('404')) {
    likelyRootCause = 'The requested endpoint route key or referenced resource ID is not registered on the target server.';
    suggestedNextAction = 'Verify target API base URL and ensure route prefix contract is correctly configured.';
  }

  return {
    message: cleanMessage || 'Execution failure detected',
    stack: cleanStack,
    location,
    humanSummary,
    whatHappened,
    expected,
    actual,
    failedAssertion,
    likelyRootCause,
    suggestedNextAction,
    rawDecodedMessage: cleanMessage
  };
}
