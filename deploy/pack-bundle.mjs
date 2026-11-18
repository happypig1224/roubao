import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';

const frontendDir = 'D:/Java/roubao/frontend';
const stagingDir = 'D:/Java/roubao/deploy/staging-frontend';
const tarFile = 'D:/Java/roubao/deploy/frontend-bundle.tar.gz';

console.log('Cleaning staging dir...');
fs.rmSync(stagingDir, { recursive: true, force: true });
fs.mkdirSync(stagingDir, { recursive: true });

console.log('Copying standalone outputs...');
// 1. Copy standalone server.js and package.json
fs.copyFileSync(path.join(frontendDir, '.next/standalone/server.js'), path.join(stagingDir, 'server.js'));
fs.copyFileSync(path.join(frontendDir, '.next/standalone/package.json'), path.join(stagingDir, 'package.json'));

// 2. Copy standalone .next (excluding node_modules)
fs.cpSync(path.join(frontendDir, '.next/standalone/.next'), path.join(stagingDir, '.next'), { recursive: true });

// 3. Copy static folder
fs.cpSync(path.join(frontendDir, '.next/static'), path.join(stagingDir, '.next/static'), { recursive: true });

// 4. Copy public folder
fs.cpSync(path.join(frontendDir, 'public'), path.join(stagingDir, 'public'), { recursive: true });

// 5. Copy data folder (empty articles.json)
fs.cpSync(path.join(frontendDir, 'data'), path.join(stagingDir, 'data'), { recursive: true });

console.log('Creating tar.gz bundle...');
if (fs.existsSync(tarFile)) {
  fs.unlinkSync(tarFile);
}

execSync(`tar -czf "${tarFile}" -C "${stagingDir}" .`, { stdio: 'inherit' });
const sizeMb = (fs.statSync(tarFile).size / 1024 / 1024).toFixed(2);
console.log(`Bundle created successfully: ${tarFile} (${sizeMb} MB)`);
