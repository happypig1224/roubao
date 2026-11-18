import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import crypto from 'node:crypto';
import https from 'node:https';

const INSTANCE_ID = process.env.INSTANCE_ID || '01102cd6e9bb463b96d63722db6ba1be';
const REGION_ID = process.env.REGION_ID || 'us-west-1';

const configPath = path.join(os.homedir(), '.workbench', 'config.json');
const cfg = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
const profile = cfg.profiles?.default || {};
const ak = profile.access_key_id || cfg.access_key_id;
const sk = profile.access_key_secret || cfg.access_key_secret;

export function percentEncode(val) {
  return encodeURIComponent(String(val))
    .replace(/!/g, '%21')
    .replace(/'/g, '%27')
    .replace(/\(/g, '%28')
    .replace(/\)/g, '%29')
    .replace(/\*/g, '%2A')
    .replace(/\+/g, '%20')
    .replace(/%7E/g, '~');
}

export function signParams(params, secret, method = 'GET') {
  const sortedKeys = Object.keys(params).sort();
  const queryStr = sortedKeys.map((k) => `${percentEncode(k)}=${percentEncode(params[k])}`).join('&');
  const stringToSign = `${method}&%2F&${percentEncode(queryStr)}`;
  const hmac = crypto.createHmac('sha1', `${secret}&`);
  hmac.update(stringToSign, 'utf-8');
  return hmac.digest('base64');
}

import { execFile } from 'node:child_process';
import util from 'node:util';

const execFileAsync = util.promisify(execFile);

export async function callSwasApi(action, extraParams = {}, retries = 5) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const params = {
        Action: action,
        Version: '2020-06-01',
        Format: 'JSON',
        AccessKeyId: ak,
        SignatureMethod: 'HMAC-SHA1',
        Timestamp: new Date().toISOString().replace(/\.\d{3}Z$/, 'Z'),
        SignatureVersion: '1.0',
        SignatureNonce: crypto.randomUUID(),
        RegionId: REGION_ID,
        ...extraParams,
      };
      params.Signature = signParams(params, sk, 'POST');
      const sortedKeys = Object.keys(params).sort();
      const bodyStr = sortedKeys.map((k) => `${percentEncode(k)}=${percentEncode(params[k])}`).join('&');
      const url = `https://swas.${REGION_ID}.aliyuncs.com/`;

      const tmpBodyFile = path.join(os.tmpdir(), `swas_req_${Date.now()}_${Math.random().toString(36).slice(2)}.tmp`);
      fs.writeFileSync(tmpBodyFile, bodyStr, 'utf-8');
      try {
        const { stdout } = await execFileAsync('curl.exe', [
          '-s',
          '--connect-timeout',
          '15',
          '--retry',
          '2',
          '-X',
          'POST',
          '-H',
          'Content-Type: application/x-www-form-urlencoded',
          '--data-binary',
          `@${tmpBodyFile}`,
          url,
        ]);
        return JSON.parse(stdout);
      } finally {
        try { fs.unlinkSync(tmpBodyFile); } catch {}
      }
    } catch (err) {
      if (attempt === retries) throw err;
      await new Promise((r) => setTimeout(r, 1000 * attempt));
    }
  }
}

export async function executeRemote(command, timeoutSeconds = 600) {
  const cmdName = `exec_${Date.now()}`;
  const runRes = await callSwasApi('RunCommand', {
    Name: cmdName,
    InstanceId: INSTANCE_ID,
    Type: 'RunShellScript',
    CommandContent: command,
    Timeout: String(timeoutSeconds),
  });

  const invokeId = runRes.InvokeId;
  if (!invokeId) {
    throw new Error(`RunCommand failed: ${JSON.stringify(runRes)}`);
  }

  const startTime = Date.now();
  while (Date.now() - startTime < timeoutSeconds * 1000) {
    await new Promise((r) => setTimeout(r, 2000));
    let descRes;
    try {
      descRes = await callSwasApi('DescribeInvocationResult', {
        InstanceId: INSTANCE_ID,
        InvokeId: invokeId,
      });
    } catch (e) {
      continue;
    }
    const item = descRes?.InvocationResult;
    if (item) {
      const status = item.InvocationStatus;
      if (['Success', 'Failed', 'TimedOut', 'Cancelled', 'Aborted'].includes(status)) {
        const rawOut = item.Output || '';
        const output = Buffer.from(rawOut, 'base64').toString('utf-8');
        return {
          status,
          output,
          exitCode: item.ExitCode,
          invokeId,
        };
      }
    }
  }
  throw new Error(`Execution timed out after ${timeoutSeconds}s (InvokeId: ${invokeId})`);
}

const cmd = process.argv.slice(2).join(' ');
if (cmd) {
  executeRemote(cmd)
    .then((res) => {
      process.stdout.write(res.output || '');
      if (res.exitCode !== 0) {
        process.exit(res.exitCode || 1);
      }
    })
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}
