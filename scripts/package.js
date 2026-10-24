#!/usr/bin/env node
/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('fs');
const path = require('path');
const { zipSync } = require('fflate');

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

const files = {};
for (const fileName of fs.readdirSync(DIST_DIR)) {
  const filePath = path.join(DIST_DIR, fileName);
  if (fs.statSync(filePath).isFile()) {
    files[fileName] = fs.readFileSync(filePath);
  }
}

fs.writeFileSync(archivePath, zipSync(files, { level: 9 }));

console.log(`Package complete: ${path.relative(ROOT_DIR, archivePath)}`);
