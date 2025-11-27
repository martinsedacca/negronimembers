#!/usr/bin/env node
/**
 * Generates a unique version for the service worker based on:
 * - Git commit SHA (if available)
 * - Timestamp as fallback
 */
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Get version from git or timestamp
let version;
try {
  // Try to get short git commit SHA
  version = execSync('git rev-parse --short HEAD', { encoding: 'utf8' }).trim();
} catch {
  // Fallback to timestamp
  version = Date.now().toString(36);
}

const swPath = path.join(__dirname, '../public/sw.js');
let swContent = fs.readFileSync(swPath, 'utf8');

// Replace the version
swContent = swContent.replace(
  /const SW_VERSION = ['"].*['"]/,
  `const SW_VERSION = '${version}'`
);

fs.writeFileSync(swPath, swContent);
console.log(`✅ Service Worker version updated to: ${version}`);
