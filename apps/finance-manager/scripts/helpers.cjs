const fs = require('fs');
const path = require('path');
const http = require('http');
const https = require('https');

/**
 * Makes an HTTP request to check if a service is running
 * @param {string} url - URL to check
 * @returns {Promise<{statusCode: number, success: boolean}>} - Response info
 */
function checkServiceHealth(url) {
  return new Promise((resolve, reject) => {
    const httpModule = url.startsWith('https') ? https : http;

    const req = httpModule.get(url, (res) => {
      resolve({
        statusCode: res.statusCode,
        success: res.statusCode >= 200 && res.statusCode < 300,
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.setTimeout(5000, () => {
      req.destroy();
      reject(new Error(`Request to ${url} timed out`));
    });

    req.end();
  });
}

const colors = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
};

/**
 * Find the main k6 test file or individual k6 test files in a directory
 * @param {string} directory - Directory to search in
 * @returns {Promise<string[]>} - Array of file paths
 */
async function findK6Tests(directory) {
  const mainTestFile = path.join(directory, 'all-tests.ts');
  if (fs.existsSync(mainTestFile)) {
    console.log(`Found main test aggregation file: ${mainTestFile}`);
    return [mainTestFile];
  }

  async function traverseDir(dir) {
    const files = [];
    const entries = await fs.promises.readdir(dir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);

      if (entry.isDirectory()) {
        files.push(...(await traverseDir(fullPath)));
      } else if (entry.isFile() && entry.name.endsWith('.ts') || entry.name.endsWith('.js')) {
        const content = await fs.promises.readFile(fullPath, 'utf8');
        if (
          content.includes("import http from 'k6/http'") ||
          content.includes('import { check') ||
          content.includes('export default function')
        ) {
          files.push(fullPath);
        }
      }
    }

    return files;
  }

  if (!fs.existsSync(directory)) {
    console.error(`Test directory ${directory} does not exist`);
    return [];
  }

  const testFiles = await traverseDir(directory);
  return testFiles;
}

module.exports = {
  checkServiceHealth,
  colors,
  findK6Tests,
};
