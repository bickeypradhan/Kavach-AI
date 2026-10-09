import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const isWin = process.platform === 'win32';
const npmCmd = isWin ? 'npm.cmd' : 'npm';

console.log('🚀 Starting SafeFactory AI Ecosystem...');

// 1. Start Python AI Service
const aiProc = spawn('python', ['-m', 'uvicorn', 'app.main:app', '--reload', '--port', '8000'], {
  cwd: path.join(rootDir, 'ai-service'),
  stdio: 'inherit',
  shell: isWin
});

// 2. Start Node Backend
const backendProc = spawn(npmCmd, ['run', 'dev'], {
  cwd: path.join(rootDir, 'backend'),
  stdio: 'inherit',
  shell: isWin
});

// 3. Start React Frontend
const frontendProc = spawn(npmCmd, ['run', 'dev'], {
  cwd: path.join(rootDir, 'frontend'),
  stdio: 'inherit',
  shell: isWin
});

const cleanup = () => {
  console.log('\n🛑 Shutting down all services...');
  aiProc.kill();
  backendProc.kill();
  frontendProc.kill();
  process.exit(0);
};

process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);
