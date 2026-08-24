import http from 'http';
import net from 'net';
import fs from 'fs';
import path from 'path';

const rootDir = process.cwd();

console.log('====================================================');
console.log('   Contextπ Application Monorepo Readiness Check');
console.log('====================================================\n');

function checkPort(port, host = '127.0.0.1') {
  return new Promise((resolve) => {
    const socket = new net.Socket();
    socket.setTimeout(1500);

    socket.on('connect', () => {
      socket.destroy();
      resolve(true);
    });

    socket.on('timeout', () => {
      socket.destroy();
      resolve(false);
    });

    socket.on('error', () => {
      socket.destroy();
      resolve(false);
    });

    socket.connect(port, host);
  });
}

function checkHttp(url) {
  return new Promise((resolve) => {
    http.get(url, (res) => {
      resolve(res.statusCode >= 200 && res.statusCode < 400);
    }).on('error', () => {
      resolve(false);
    });
  });
}

async function runVerification() {
  const mongoOk = await checkPort(27017);
  const nexaOk = await checkHttp('http://localhost:3000/api/health') || await checkPort(3000);
  const backendOk = await checkHttp('http://localhost:3001/api/health') || await checkPort(3001);
  const frontendOk = await checkHttp('http://localhost:5173/') || await checkPort(5173) || await checkPort(5173, '::1');

  const envExists = fs.existsSync(path.join(rootDir, '.env.example')) &&
                    fs.existsSync(path.join(rootDir, 'contextpi', '.env.example')) &&
                    fs.existsSync(path.join(rootDir, 'nexasupply', '.env.example'));

  const buildsExist = fs.existsSync(path.join(rootDir, 'nexasupply', 'dist')) &&
                      fs.existsSync(path.join(rootDir, 'contextpi', 'dist')) &&
                      fs.existsSync(path.join(rootDir, 'contextpi', 'client', 'dist'));

  console.log(`MongoDB (27017):         ${mongoOk ? 'OK ✅' : 'NOT RUNNING ⚠️ (Adapter Mode available)'}`);
  console.log(`NexaSupply Target (3000): ${nexaOk ? 'OK ✅' : 'NOT STARTED ⚠️'}`);
  console.log(`Contextπ Backend (3001):  ${backendOk ? 'OK ✅' : 'NOT STARTED ⚠️'}`);
  console.log(`Contextπ Frontend (5173): ${frontendOk ? 'OK ✅' : 'NOT STARTED ⚠️'}`);
  console.log(`Environment Templates:    ${envExists ? 'OK ✅' : 'MISSING ❌'}`);
  console.log(`Build Artifacts:          ${buildsExist ? 'OK ✅' : 'MISSING ❌ (Run npm run build)'}`);

  console.log('\n====================================================');
  if (buildsExist && envExists) {
    console.log('   Contextπ Monorepo Verification: PASSED 🎉');
  } else {
    console.log('   Contextπ Monorepo Verification: WARNINGS ENCOUNTERED');
  }
  console.log('====================================================');
}

runVerification();
