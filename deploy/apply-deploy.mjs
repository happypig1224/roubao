import fs from 'node:fs';
import { executeRemote } from './run-remote.mjs';

const script = fs.readFileSync('C:/Users/33046/.gemini/antigravity/brain/47d78e8b-b163-4aa2-8954-1a7e16da7241/scratch/deploy_services.sh', 'utf-8');

console.log('Sending deployment script to remote server...');
const res = await executeRemote(script, 180);
console.log('ExitCode:', res.exitCode);
console.log('Output:\n' + res.output);
if (res.exitCode !== 0) {
  process.exit(res.exitCode || 1);
}
