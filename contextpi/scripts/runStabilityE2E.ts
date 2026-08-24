import { runCleanE2E } from './runCleanE2E.js';

async function main() {
  console.log('Starting 5-Run Contextπ E2E Stability Suite...');
  const runResults: Array<{ run: number; total: number; passed: number; failed: number }> = [];

  for (let i = 1; i <= 5; i++) {
    console.log(`\n>>> STARTING STABILITY RUN ${i} OF 5 <<<`);
    try {
      const res = await runCleanE2E();
      runResults.push({ run: i, total: res.total, passed: res.passed, failed: res.failed });
    } catch (err: any) {
      console.error(`RUN ${i} failed with error:`, err);
      runResults.push({ run: i, total: 148, passed: 0, failed: 148 });
    }
  }

  console.log('\n========================================');
  console.log('STABILITY TEST SUMMARY (5 RUNS)');
  console.log('========================================');
  for (const r of runResults) {
    console.log(`RUN ${r.run}: ${r.passed}/${r.total}`);
  }
  console.log('========================================\n');

  const allPassed = runResults.every(r => r.passed === r.total && r.failed === 0);
  if (!allPassed) {
    console.error('Stability verification FAILED: Not all runs achieved 100% pass rate.');
    process.exit(1);
  } else {
    console.log('Stability verification PASSED: 100% reproducible across 5 consecutive runs!');
  }
}

main().catch(err => {
  console.error('Stability test failed:', err);
  process.exit(1);
});
