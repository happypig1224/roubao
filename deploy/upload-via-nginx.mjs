import { executeRemote } from './run-remote.mjs';
import { execSync } from 'node:child_process';
import fs from 'node:fs';

const bundlePath = 'D:/Java/roubao/deploy/frontend-bundle.tar.gz';
const bundleSize = fs.statSync(bundlePath).size;
console.log(`Frontend bundle size: ${(bundleSize / 1024 / 1024).toFixed(2)} MB`);

// 1. Configure nginx reverse proxy for upload and start node receiver on 127.0.0.1:8000
const prepareCmd = `
fuser -k 8000/tcp || true
python3 -c "
with open('/etc/nginx/sites-available/roubao.conf', 'r') as f:
    c = f.read()
if '/_deploy_upload/' not in c:
    c = c.replace('location /api/v1/', 'location /_deploy_upload/ {\\n        client_max_body_size 50m;\\n        proxy_pass http://127.0.0.1:8000/;\\n    }\\n\\n    location /api/v1/')
    with open('/etc/nginx/sites-available/roubao.conf', 'w') as f:
        f.write(c)
"
nginx -t && nginx -s reload

node --input-type=module -e "
import http from 'node:http';
import fs from 'node:fs';
const server = http.createServer((req, res) => {
  console.log('Receiving bundle...');
  const file = fs.createWriteStream('/opt/roubao/frontend/bundle.tar.gz');
  req.pipe(file);
  file.on('finish', () => {
    console.log('Saved /opt/roubao/frontend/bundle.tar.gz');
    res.end('OK');
    setTimeout(() => process.exit(0), 1000);
  });
});
server.listen(8000, '127.0.0.1', () => console.log('RECEIVER_LISTENING'));
setTimeout(() => process.exit(0), 120000);
" &
sleep 2
echo PREPARE_DONE
`;

console.log('Configuring Nginx and starting receiver on server...');
const prepRes = await executeRemote(prepareCmd, 30);
console.log(prepRes.output);

// 2. Upload bundle via HTTPS (port 443) through Nginx
console.log('Uploading bundle via HTTPS port 443...');
execSync(`curl.exe --noproxy "*" -k -s -T "${bundlePath}" --resolve roubao.cloud:443:47.251.182.2 https://roubao.cloud/_deploy_upload/`, { stdio: 'inherit' });
console.log('Upload complete!');

// 3. Extract, cleanup data, restart frontend, and cleanup Nginx route
const finishCmd = `
rm -rf /opt/roubao/frontend/.next
tar -xzf /opt/roubao/frontend/bundle.tar.gz -C /opt/roubao/frontend
rm -f /opt/roubao/frontend/bundle.tar.gz
mkdir -p /opt/roubao/frontend/data
echo "[]" > /opt/roubao/frontend/data/articles.json
rm -rf /opt/roubao/frontend/.next/cache || true
redis-cli FLUSHALL || true
systemctl restart roubao-frontend
sleep 3
systemctl is-active roubao-frontend

python3 -c "
with open('/etc/nginx/sites-available/roubao.conf', 'r') as f:
    c = f.read()
if '/_deploy_upload/' in c:
    import re
    c = re.sub(r'location /_deploy_upload/ \\{[^\\}]+\\}\\s*', '', c)
    with open('/etc/nginx/sites-available/roubao.conf', 'w') as f:
        f.write(c)
"
nginx -t && nginx -s reload
echo DEPLOY_SUCCESS
`;

console.log('Extracting, cleaning up data, restarting frontend...');
const finishRes = await executeRemote(finishCmd, 60);
console.log(finishRes.output);

console.log('=== All Done Successfully ===');
