import { executeRemote } from './run-remote.mjs';

const cmd = `
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
echo ALL_DEPLOYED_SUCCESSFULLY
`;

const res = await executeRemote(cmd, 60);
console.log(res.output);
