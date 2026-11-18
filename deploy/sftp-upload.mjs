import { Client } from 'ssh2';
import fs from 'node:fs';
import { executeRemote } from './run-remote.mjs';

const host = '47.251.182.2';
const port = 22;
const username = 'root';
const privateKey = fs.readFileSync(process.env.USERPROFILE + '/.ssh/id_rsa');
const bundlePath = 'D:/Java/roubao/deploy/frontend-bundle.tar.gz';
const remotePath = '/opt/roubao/frontend/bundle.tar.gz';

function singleSFTPUpload() {
  return new Promise((resolve, reject) => {
    const conn = new Client();
    let isDone = false;

    const timer = setTimeout(() => {
      if (!isDone) {
        isDone = true;
        try { conn.end(); } catch {}
        reject(new Error('SFTP upload timed out after 60s'));
      }
    }, 60000);

    conn.on('ready', () => {
      console.log('SSH connection ready, requesting SFTP...');
      conn.sftp((err, sftp) => {
        if (err) {
          if (!isDone) {
            isDone = true;
            clearTimeout(timer);
            try { conn.end(); } catch {}
            return reject(err);
          }
        }
        console.log(`Uploading ${bundlePath} to ${remotePath}...`);
        sftp.fastPut(bundlePath, remotePath, (fastPutErr) => {
          if (!isDone) {
            isDone = true;
            clearTimeout(timer);
            try { conn.end(); } catch {}
            if (fastPutErr) return reject(fastPutErr);
            resolve();
          }
        });
      });
    });

    conn.on('error', (err) => {
      if (!isDone) {
        isDone = true;
        clearTimeout(timer);
        try { conn.end(); } catch {}
        reject(err);
      }
    });

    conn.connect({
      host,
      port,
      username,
      privateKey,
      readyTimeout: 15000,
    });
  });
}

async function uploadWithRetry(maxRetries = 5) {
  for (let i = 1; i <= maxRetries; i++) {
    try {
      console.log(`[Attempt ${i}/${maxRetries}] Uploading frontend bundle via SFTP...`);
      await singleSFTPUpload();
      console.log('Upload succeeded!');
      return;
    } catch (e) {
      console.warn(`Attempt ${i} failed: ${e.message}`);
      if (i < maxRetries) {
        await new Promise((r) => setTimeout(r, 2000));
      } else {
        throw e;
      }
    }
  }
}

async function main() {
  await uploadWithRetry();

  console.log('Extracting bundle and restarting frontend on remote server...');
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
`;
  const res = await executeRemote(cmd, 60);
  console.log('Server deployment output:\n' + res.output);
  console.log('Deployment complete!');
}

main().catch((err) => {
  console.error('Fatal deployment error:', err);
  process.exit(1);
});
