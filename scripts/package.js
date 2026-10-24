#!/usr/bin/env node
/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const ROOT_DIR = path.join(__dirname, '..');
const DIST_DIR = path.join(ROOT_DIR, 'dist');
const manifest = JSON.parse(
  fs.readFileSync(path.join(DIST_DIR, 'manifest.json'), 'utf8'),
);
const archivePath = path.join(
  ROOT_DIR,
  `${manifest.id}-${manifest.version}.zip`,
);

if (!fs.existsSync(path.join(DIST_DIR, 'plugin.js'))) {
  console.error('Packaging failed: dist/plugin.js is missing.');
  process.exit(1);
}

if (fs.existsSync(archivePath)) {
  fs.unlinkSync(archivePath);
}

const result = spawnSync(
  'zip',
  ['-qr', archivePath, '.'],
  { cwd: DIST_DIR, stdio: 'inherit' },
);

if (result.error) {
  console.error(`Packaging failed: ${result.error.message}`);
  process.exit(1);
}
if (result.status !== 0) {
  process.exit(result.status ?? 1);
}

console.log(`Package complete: ${path.relative(ROOT_DIR, archivePath)}`);
