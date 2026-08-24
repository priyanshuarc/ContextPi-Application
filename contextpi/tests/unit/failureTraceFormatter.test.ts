import { describe, it } from 'node:test';
import assert from 'node:assert';
import { formatFailureTrace, stripAnsi } from '../../client/src/utils/failureTraceFormatter.js';

describe('Failure Trace Formatter, ANSI Stripper & Structured Sections', () => {
  it('should strip ANSI escape sequences cleanly', () => {
    const rawAnsi = '\u001b[31mError: expect(\u001b[39m\u001b[31mreceived\u001b[39m\u001b[31m).toBe(\u001b[39m\u001b[32mexpected\u001b[39m\u001b[31m)\u001b[39m\n\nExpected: 201\nReceived: 400';
    const cleanText = stripAnsi(rawAnsi);

    assert.strictEqual(cleanText.includes('\u001b['), false);
    assert.ok(cleanText.includes('Error: expect(received).toBe(expected)'));
    assert.ok(cleanText.includes('Expected: 201'));
    assert.ok(cleanText.includes('Received: 400'));
  });

  it('should format structured object trace containing message, stack, location cleanly without throwing', () => {
    const rawError = {
      message: 'Expected status 201, received 400',
      stack: 'Error: expect(received).toBe(expected)\n  at forms/items.spec.ts:42:5',
      location: 'forms/items.spec.ts:42'
    };

    const trace = formatFailureTrace(rawError);

    assert.ok(trace.message.includes('Expected status 201, received 400'));
    assert.strictEqual(trace.location, 'forms/items.spec.ts:42');
    assert.strictEqual(typeof trace.message, 'string');
    assert.strictEqual(trace.expected, 'HTTP 201');
    assert.strictEqual(trace.actual, 'HTTP 400');
    assert.ok(trace.humanSummary?.includes('400'));
  });

  it('should format direct string trace values correctly', () => {
    const rawError = 'Target API returned HTTP 500 Internal Server Error';
    const trace = formatFailureTrace(rawError);

    assert.strictEqual(trace.message, 'Target API returned HTTP 500 Internal Server Error');
    assert.strictEqual(typeof trace.message, 'string');
  });

  it('should handle null and undefined failure trace inputs safely', () => {
    const traceNull = formatFailureTrace(null);
    assert.strictEqual(traceNull.message, 'No failure trace was provided.');
    assert.strictEqual(typeof traceNull.message, 'string');

    const traceUndefined = formatFailureTrace(undefined);
    assert.strictEqual(traceUndefined.message, 'No failure trace was provided.');
    assert.strictEqual(typeof traceUndefined.message, 'string');
  });

  it('should safely serialize unknown/arbitrary object traces without message/stack/location', () => {
    const rawError = { code: 'ERR_FAIL', internalDetails: { status: 400, body: 'Bad Request' } };
    const trace = formatFailureTrace(rawError);

    assert.strictEqual(typeof trace.message, 'string');
    assert.ok(trace.message.includes('ERR_FAIL'));
    assert.ok(trace.message.includes('Bad Request'));
  });

  it('should format array failure traces into human readable string entries', () => {
    const rawError = [
      'Assertion 1 failed: statusCode === 200',
      { message: 'Assertion 2 failed: body.id exists' }
    ];

    const trace = formatFailureTrace(rawError);
    assert.strictEqual(typeof trace.message, 'string');
    assert.ok(trace.message.includes('Assertion 1 failed'));
    assert.ok(trace.message.includes('Assertion 2 failed'));
  });
});
