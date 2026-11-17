import { Client } from 'ssh2';
import fs from 'node:fs';

const host = '47.251.182.2';
const port = 22;
const username = 'root';
const privateKey = fs.readFileSync(process.env.USERPROFILE + '/.ssh/id_rsa');

function singleSSHAttempt(command, timeoutMs = 30000) {
  return new Promise((resolve, reject) => {
    const conn = new Client();
    let isDone = false;

    const timer = setTimeout(() => {
      if (!isDone) {
        isDone = true;
        try { conn.end(); } catch (e) {}
        reject(new Error(`SSH execution timed out after ${timeoutMs}ms`));
      }
    }, timeoutMs);

    conn.on('ready', () => {
      conn.exec(command, (err, stream) => {
        if (err) {
          if (!isDone) {
            isDone = true;
            clearTimeout(timer);
            try { conn.end(); } catch (e) {}
            return reject(err);
          }
        }
        let stdout = '';
        let stderr = '';
        stream.on('data', (d) => (stdout += d));
        stream.stderr.on('data', (d) => (stderr += d));
        stream.on('close', (code) => {
          if (!isDone) {
            isDone = true;
            clearTimeout(timer);
            try { conn.end(); } catch (e) {}
            resolve({ code, stdout, stderr });
          }
        });
      });
    });

    conn.on('error', (err) => {
      if (!isDone) {
        isDone = true;
        clearTimeout(timer);
        try { conn.end(); } catch (e) {}
        reject(err);
      }
    });

    conn.connect({
      host,
      port,
      username,
      privateKey,
      readyTimeout: 10000,
    });
  });
}

export async function runSSH(command, maxRetries = 5) {
  let lastErr;
  for (let i = 1; i <= maxRetries; i++) {
    try {
      return await singleSSHAttempt(command);
    } catch (err) {
      lastErr = err;
      if (i < maxRetries) {
        await new Promise((r) => setTimeout(r, 2000));
      }
    }
  }
  throw lastErr;
}

// CLI runner
if (process.argv[2]) {
  const cmd = process.argv.slice(2).join(' ');
  runSSH(cmd)
    .then((res) => {
      if (res.stdout) process.stdout.write(res.stdout);
      if (res.stderr) process.stderr.write(res.stderr);
      process.exit(res.code || 0);
    })
    .catch((err) => {
      console.error('SSH Error:', err.message);
      process.exit(1);
    });
}
