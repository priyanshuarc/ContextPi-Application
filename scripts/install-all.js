import { execSync } from 'child_process';
import path from 'path';

const rootDir = process.cwd();

console.log('====================================================');
console.log('      Contextπ Application Monorepo Setup');
console.log('====================================================');

try {
  console.log('\n[1/3] Installing Contextπ Backend Dependencies...');
  execSync('npm install', { cwd: path.join(rootDir, 'contextpi'), stdio: 'inherit' });

  console.log('\n[2/3] Installing Contextπ Client Dependencies...');
  execSync('npm install', { cwd: path.join(rootDir, 'contextpi', 'client'), stdio: 'inherit' });

  console.log('\n[3/3] Installing NexaSupply Target Dependencies...');
  execSync('npm install', { cwd: path.join(rootDir, 'nexasupply'), stdio: 'inherit' });

  console.log('\n====================================================');
  console.log('   All dependencies installed successfully! 🎉');
  console.log('====================================================');
} catch (error) {
  console.error('\n❌ Setup failed:', error.message);
  process.exit(1);
}
