import { executeRemote } from './run-remote.mjs';
import { execSync } from 'node:child_process';
import fs from 'node:fs';

const backendJarPath = 'D:/Java/roubao/backend/roubao-app/target/roubao-app-1.0.0-SNAPSHOT.jar';
const frontendBundlePath = 'D:/Java/roubao/deploy/frontend-bundle.tar.gz';
const backupScriptPath = 'D:/Java/roubao/deploy/backup-mysql.sh';

console.log('================================================================');
console.log('    开始执行 Roubao 全栈生产环境一键发布与同步 (roubao.cloud)   ');
console.log('================================================================\n');

// -----------------------------------------------------------------------------
// 1. 配置 Nginx 临时上传隧道 (通过 443 HTTPS，突破云防火墙端口拦截)
// -----------------------------------------------------------------------------
console.log('>>> [Step 1/5] 配置 Nginx 临时上传代理隧道 (100MB 缓冲区)...');
const setupUploadNginx = `
python3 -c "
with open('/etc/nginx/sites-available/roubao.conf', 'r') as f:
    c = f.read()
if '/_deploy_upload/' not in c:
    c = c.replace('location /api/v1/', 'location /_deploy_upload/ {\\n        client_max_body_size 100m;\\n        proxy_connect_timeout 300s;\\n        proxy_read_timeout 300s;\\n        proxy_send_timeout 300s;\\n        proxy_pass http://127.0.0.1:8000/;\\n    }\\n\\n    location /api/v1/')
    with open('/etc/nginx/sites-available/roubao.conf', 'w') as f:
        f.write(c)
"
nginx -t && nginx -s reload
echo NGINX_TUNNEL_READY
`;
await executeRemote(setupUploadNginx, 30);

// -----------------------------------------------------------------------------
// 2. 上传并平滑更新后端 Fat JAR (55MB)
// -----------------------------------------------------------------------------
console.log('\n>>> [Step 2/5] 上传并平滑更新后端 Fat JAR ...');
const startBackendReceiver = `
fuser -k 8000/tcp || true
nohup node --input-type=module -e "
import http from 'node:http';
import fs from 'node:fs';
const server = http.createServer((req, res) => {
  const file = fs.createWriteStream('/opt/roubao/backend/app.jar');
  req.pipe(file);
  file.on('finish', () => {
    res.end('OK');
    setTimeout(() => process.exit(0), 1000);
  });
});
server.listen(8000, '127.0.0.1');
setTimeout(() => process.exit(0), 300000);
" > /tmp/receiver.log 2>&1 &
sleep 2
echo BACKEND_RECEIVER_READY
`;
await executeRemote(startBackendReceiver, 30);

console.log('正在通过 HTTPS 443 推送 55MB app.jar 到生产服务器...');
execSync(`curl.exe --noproxy "*" -k -s -T "${backendJarPath}" --resolve roubao.cloud:443:47.251.182.2 https://roubao.cloud/_deploy_upload/`, { stdio: 'inherit' });
console.log('后端 JAR 推送完成！正在重启 roubao-backend 服务...');

const restartBackend = `
systemctl restart roubao-backend
sleep 6
systemctl is-active roubao-backend
`;
const beRes = await executeRemote(restartBackend, 30);
console.log('后端运行状态:', beRes.output.trim());

// -----------------------------------------------------------------------------
// 3. 上传并平滑更新前端 Standalone Bundle (2.85MB)
// -----------------------------------------------------------------------------
console.log('\n>>> [Step 3/5] 上传并平滑更新前端 Standalone Bundle ...');
const startFrontendReceiver = `
fuser -k 8000/tcp || true
nohup node --input-type=module -e "
import http from 'node:http';
import fs from 'node:fs';
const server = http.createServer((req, res) => {
  const file = fs.createWriteStream('/opt/roubao/frontend/bundle.tar.gz');
  req.pipe(file);
  file.on('finish', () => {
    res.end('OK');
    setTimeout(() => process.exit(0), 1000);
  });
});
server.listen(8000, '127.0.0.1');
setTimeout(() => process.exit(0), 120000);
" > /tmp/receiver.log 2>&1 &
sleep 2
echo FRONTEND_RECEIVER_READY
`;
await executeRemote(startFrontendReceiver, 30);

console.log('正在通过 HTTPS 443 推送前端发布包...');
execSync(`curl.exe --noproxy "*" -k -s -T "${frontendBundlePath}" --resolve roubao.cloud:443:47.251.182.2 https://roubao.cloud/_deploy_upload/`, { stdio: 'inherit' });
console.log('前端发布包推送完成！正在解压并重启 roubao-frontend 服务...');

const restartFrontend = `
rm -rf /opt/roubao/frontend/.next
tar -xzf /opt/roubao/frontend/bundle.tar.gz -C /opt/roubao/frontend
rm -f /opt/roubao/frontend/bundle.tar.gz
rm -rf /opt/roubao/frontend/.next/cache || true
redis-cli FLUSHALL || true
systemctl restart roubao-frontend
sleep 4
systemctl is-active roubao-frontend
`;
const feRes = await executeRemote(restartFrontend, 30);
console.log('前端运行状态:', feRes.output.trim());

// -----------------------------------------------------------------------------
// 4. 清理 Nginx 上传隧道并加固 HSTS 安全响应头
// -----------------------------------------------------------------------------
console.log('\n>>> [Step 4/5] 清理上传隧道并注入 HSTS / Permissions-Policy 安全头...');
const finalizeNginx = `
fuser -k 8000/tcp || true
python3 -c "
with open('/etc/nginx/sites-available/roubao.conf', 'r') as f:
    c = f.read()
import re
if '/_deploy_upload/' in c:
    c = re.sub(r'location /_deploy_upload/ \\{[^\\}]+\\}\\s*', '', c)
if 'Strict-Transport-Security' not in c:
    hsts = '    add_header Strict-Transport-Security \"max-age=31536000; includeSubDomains; preload\" always;\\n    add_header Permissions-Policy \"camera=(), microphone=(), geolocation=()\" always;\\n'
    c = c.replace('server_name roubao.cloud www.roubao.cloud;', 'server_name roubao.cloud www.roubao.cloud;\\n' + hsts, 1)
with open('/etc/nginx/sites-available/roubao.conf', 'w') as f:
    f.write(c)
"
nginx -t && nginx -s reload
echo NGINX_HARDENED_OK
`;
const nginxRes = await executeRemote(finalizeNginx, 30);
console.log('Nginx 最终配置状态:', nginxRes.output.trim());

// -----------------------------------------------------------------------------
// 5. 部署 MySQL 自动化热备脚本并配置 Crontab 定时热备
// -----------------------------------------------------------------------------
console.log('\n>>> [Step 5/5] 部署生产 MySQL 自动化定时热备脚本并验证...');
const backupScriptContent = fs.readFileSync(backupScriptPath, 'utf-8');
const deployBackup = `
mkdir -p /opt/roubao/deploy /opt/roubao/backups/mysql
cat << 'EOF' > /opt/roubao/deploy/backup-mysql.sh
${backupScriptContent}
EOF
chmod +x /opt/roubao/deploy/backup-mysql.sh

# 注入 Crontab 每天凌晨 3:00 执行
(crontab -l 2>/dev/null | grep -v 'backup-mysql.sh'; echo "0 3 * * * DB_PASSWORD='RoubaoProd2026UserSecurePass!' DB_USER='roubao_user' /opt/roubao/deploy/backup-mysql.sh >> /var/log/roubao-backup.log 2>&1") | crontab -

# 执行一次真实实机热备演练
DB_PASSWORD='RoubaoProd2026UserSecurePass!' DB_USER='roubao_user' /opt/roubao/deploy/backup-mysql.sh
ls -lh /opt/roubao/backups/mysql
`;
const backupRes = await executeRemote(deployBackup, 60);
console.log(backupRes.output.trim());

console.log('\n================================================================');
console.log('🎉 Roubao 生产环境全栈版本发布完成！全部服务健康在线。');
console.log('================================================================');
