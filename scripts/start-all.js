import { spawn } from 'child_process';
import path from 'path';

const rootDir = process.cwd();

console.log('====================================================');
console.log('      Launching Contextπ Concurrent Monorepo');
console.log('====================================================');
console.log('1. NexaSupply Target Server:  http://localhost:3000');
console.log('2. Contextπ Backend Engine:   http://localhost:3001');
console.log('3. Contextπ Client UI:        http://localhost:5173');
console.log('====================================================\n');

function runService(name, command, args, cwd) {
  const child = spawn(command, args, { cwd, shell: true, stdio: 'pipe' });

  child.stdout.on('data', (data) => {
    process.stdout.write(`[${name}] ${data.toString()}`);
  });

  child.stderr.on('data', (data) => {
    process.stderr.write(`[${name} ERR] ${data.toString()}`);
  });

  child.on('close', (code) => {
    console.log(`[${name}] process exited with code ${code}`);
  });

  return child;
}

const nexa = runService('NexaSupply', 'npm', ['run', 'start'], path.join(rootDir, 'nexasupply'));
const backend = runService('Contextπ-Backend', 'npm', ['run', 'start'], path.join(rootDir, 'contextpi'));
const frontend = runService('Contextπ-Frontend', 'npm', ['run', 'dev'], path.join(rootDir, 'contextpi', 'client'));

process.on('SIGINT', () => {
  console.log('\nShutting down all monorepo services...');
  nexa.kill();
  backend.kill();
  frontend.kill();
  process.exit();
});
