import { execSync } from 'child_process';
import path from 'path';

const rootDir = process.cwd();

console.log('====================================================');
console.log('      Seeding NexaSupply Database');
console.log('====================================================');

try {
  execSync('npm run seed', { cwd: path.join(rootDir, 'nexasupply'), stdio: 'inherit' });
  console.log('\nNexaSupply database seeded successfully.');
} catch (error) {
  console.error('\n❌ Seeding failed:', error.message);
  process.exit(1);
}
