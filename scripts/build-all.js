import { execSync } from 'child_process';
import path from 'path';

const rootDir = process.cwd();

console.log('====================================================');
console.log('      Building Contextπ Application Monorepo');
console.log('====================================================');

try {
  console.log('\n[1/3] Building NexaSupply Target Server...');
  execSync('npm run build', { cwd: path.join(rootDir, 'nexasupply'), stdio: 'inherit' });

  console.log('\n[2/3] Building Contextπ Backend Engine...');
  execSync('npm run build', { cwd: path.join(rootDir, 'contextpi'), stdio: 'inherit' });

  console.log('\n[3/3] Building Contextπ Client Web Bundle...');
  execSync('npm run build', { cwd: path.join(rootDir, 'contextpi', 'client'), stdio: 'inherit' });

  console.log('\n====================================================');
  console.log('   All monorepo builds completed successfully! 🚀');
  console.log('====================================================');
} catch (error) {
  console.error('\n❌ Build failed:', error.message);
  process.exit(1);
}
