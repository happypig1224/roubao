import { executeRemote } from './run-remote.mjs';
import { execSync } from 'node:child_process';
import fs from 'node:fs';

const bundlePath = 'D:/Java/roubao/deploy/frontend-bundle.tar.gz';
const bundleSize = fs.statSync(bundlePath).size;
console.log(`Frontend bundle size: ${(bundleSize / 1024 / 1024).toFixed(2)} MB`);

// 1. Start HTTP receiver on server
const receiverCmd = `
node -e "
import http from 'node:http';
import fs from 'node:fs';
const server = http.createServer((req, res) => {
  const file = fs.createWriteStream('/opt/roubao/frontend/bundle.tar.gz');
  req.pipe(file);
  file.on('finish', () => {
    res.end('OK');
    setTimeout(() => process.exit(0), 500);
  });
});
server.listen(8000, '0.0.0.0', () => console.log('RECEIVER_READY'));
setTimeout(() => process.exit(0), 60000);
" &
sleep 2
echo RECEIVER_DISPATCHED
`;

console.log('Dispatching remote HTTP receiver on port 8000...');
await executeRemote(receiverCmd, 30);

// 2. Upload bundle via curl
console.log('Uploading bundle via HTTP stream...');
execSync(`curl.exe -s -T "${bundlePath}" http://47.251.182.2:8000/`, { stdio: 'inherit' });
console.log('Upload complete!');

// 3. Extract and restart frontend
const extractAndRestart = `
tar -xzf /opt/roubao/frontend/bundle.tar.gz -C /opt/roubao/frontend
rm -f /opt/roubao/frontend/bundle.tar.gz
rm -rf /opt/roubao/frontend/.next/cache || true
systemctl restart roubao-frontend
sleep 3
systemctl is-active roubao-frontend
`;

console.log('Extracting bundle and restarting frontend...');
const restartRes = await executeRemote(extractAndRestart, 60);
console.log('Server response:\n' + restartRes.output);

console.log('All done!');
