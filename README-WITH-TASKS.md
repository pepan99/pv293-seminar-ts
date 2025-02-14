# First seminar - NestJS project initialization

Welcome to the first seminar. In this seminar we will focus on project initialization.

## Description

This guide demonstrates how to set up a robust NestJS project using TurboRepo, along with essential tooling for code quality, documentation, performance testing, and deployment workflows.

## Prerequisites

- Node.js (v18 or newer) -- `nvm` is useful for managing node versions
- pnpm (`npm install -g pnpm`, `brew install pnpm`...)
- k6 (`brew install k6` or equivalent for your OS)

## Project Initialization

### 1. Create TurboRepo project

```bash
# Create a new turborepo workspace
pnpm dlx create-turbo@latest
```

### 2. Add NestJS API package

```bash
mkdir -p apps/api
cd apps/api

# Initialize NestJS project
pnpm dlx @nestjs/cli new . --package-manager pnpm --skip-git --skip-install

# Return to the root
cd ../..

# Install dependencies from the root
pnpm install
```

## Code Quality Setup

### 1. ESLint and Prettier

```bash
# Install ESLint and Prettier dependencies
pnpm add -D -w eslint prettier eslint-config-prettier eslint-plugin-prettier
pnpm add -D -w @typescript-eslint/eslint-plugin @typescript-eslint/parser
```

Create `.eslintrc.js` in the root:

```javascript
module.exports = {
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: 'tsconfig.json',
    sourceType: 'module',
  },
  plugins: ['@typescript-eslint/eslint-plugin'],
  extends: [
    'plugin:@typescript-eslint/recommended',
    'plugin:prettier/recommended',
  ],
  root: true,
  env: {
    node: true,
    jest: true,
  },
  ignorePatterns: ['.eslintrc.js'],
  rules: {
    '@typescript-eslint/interface-name-prefix': 'off',
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/no-explicit-any': 'off',
  },
};
```

Create `.prettierrc` in the root:

```json
{
  "singleQuote": true,
  "trailingComma": "all",
  "printWidth": 100,
  "tabWidth": 2,
  "semi": true
}
```

### 2. Add scripts to package.json

Update the root `package.json`:

```json
{
  "scripts": {
    "lint": "turbo run lint",
    "format": "prettier --write \"**/*.{ts,tsx,md}\""
  }
}
```

## Swagger Documentation

### 1. Install Swagger dependencies in the API package

```bash
cd apps/api
pnpm add @nestjs/swagger swagger-ui-express
```

### 2. Configure Swagger in main.ts

```typescript
// apps/api/src/main.ts
import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  const config = new DocumentBuilder()
    .setTitle('API Documentation')
    .setDescription('The API description')
    .setVersion('1.0')
    .addTag('api')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);
  
  await app.listen(3000);
}
bootstrap();
```

## Git Hooks with Husky, Lint-staged, and Commitlint

### 1. Install dependencies

```bash
pnpm add -D -w husky lint-staged @commitlint/cli @commitlint/config-conventional
```

### 2. Configure Husky

```bash
# Initialize Husky
pnpm dlx husky install
npm pkg set scripts.prepare="husky install"

# Add pre-commit hook
pnpm dlx husky add .husky/pre-commit "pnpm dlx lint-staged"

# Add commit-msg hook
pnpm dlx husky add .husky/commit-msg "pnpm dlx --no -- commitlint --edit ${1}"

# Add pre-push hook for k6 tests
pnpm dlx husky add .husky/pre-push "cd apps/api && node scripts/run-k6-tests.js"
```

### 3. Create lint-staged config

Create `.lintstagedrc` in the root:

```json
{
  "*.{js,ts}": ["eslint --fix", "prettier --write"],
  "*.{json,md}": ["prettier --write"]
}
```

### 4. Create commitlint config

Create `commitlint.config.js` in the root:

```javascript
module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'body-leading-blank': [1, 'always'],
    'body-max-line-length': [2, 'always', 100],
    'footer-leading-blank': [1, 'always'],
    'footer-max-line-length': [2, 'always', 100],
    'header-max-length': [2, 'always', 100],
    'scope-case': [2, 'always', 'lower-case'],
    'subject-case': [
      2,
      'never',
      ['sentence-case', 'start-case', 'pascal-case', 'upper-case'],
    ],
    'subject-empty': [2, 'never'],
    'subject-full-stop': [2, 'never', '.'],
    'type-case': [2, 'always', 'lower-case'],
    'type-empty': [2, 'never'],
    'type-enum': [
      2,
      'always',
      [
        'build',
        'chore',
        'ci',
        'docs',
        'feat',
        'fix',
        'perf',
        'refactor',
        'revert',
        'style',
        'test',
      ],
    ],
  },
};
```

## k6 Performance Testing

### 1. Create k6 test directory and script

```bash
mkdir -p apps/api/test/k6-tests
```

Create `apps/api/test/k6-tests/all-tests.js`:

```javascript
import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  vus: 10,
  duration: '30s',
  thresholds: {
    http_req_duration: ['p(95)<500'], // 95% of requests should be below 500ms
    http_req_failed: ['rate<0.01'], // Less than 1% of requests should fail
  },
};

export default function() {
  const apiUrl = __ENV.API_URL || 'http://localhost:3000';
  
  const res = http.get(`${apiUrl}/health`);
  
  check(res, {
    'status is 200': (r) => r.status === 200,
    'response time < 200ms': (r) => r.timings.duration < 200,
  });
  
  sleep(1);
}
```

### 2. Create helper scripts

Create `apps/api/scripts/helpers.cjs`:

```javascript
const fs = require('fs');
const path = require('path');
const http = require('http');
const https = require('https');

function checkServiceHealth(url) {
  return new Promise((resolve, reject) => {
    const httpModule = url.startsWith('https') ? https : http;
    
    const req = httpModule.get(url, (res) => {
      resolve({
        statusCode: res.statusCode,
        success: res.statusCode >= 200 && res.statusCode < 300
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
  reset: '\x1b[0m'
};

async function findK6Tests(directory) {
  const mainTestFile = path.join(directory, 'all-tests.js');
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
        files.push(...await traverseDir(fullPath));
      } else if (entry.isFile() && entry.name.endsWith('.js')) {
        const content = await fs.promises.readFile(fullPath, 'utf8');
        if (content.includes('import http from \'k6/http\'') || 
            content.includes('import { check') || 
            content.includes('export default function')) {
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
  findK6Tests
};
```

Create `apps/api/scripts/run-k6-tests.js`:

```javascript
const { spawn } = require('child_process');
const path = require('path');
const { checkServiceHealth, colors, findK6Tests } = require('./helpers.cjs');
const treeKill = require('tree-kill');

// Constants
const K6_TESTS_DIR = path.resolve(__dirname, '../test/k6-tests');
const MAX_ATTEMPTS = 10;
const RETRY_DELAY = 2000;
const API_URL = 'http://localhost:3000/api/health';

// Keep track of spawned processes for cleanup
let runningProcesses = [];

// Register cleanup handler for unexpected termination
process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);

async function cleanup() {
  console.log(`\n${colors.yellow}Cleaning up processes...${colors.reset}`);
  
  for (const proc of [...runningProcesses].reverse()) {
    if (proc && proc.pid) {
      try {
        await new Promise((resolve) => {
          treeKill(proc.pid, 'SIGKILL', (err) => {
            if (err) console.error(`Error killing process ${proc.pid}:`, err);
            resolve();
          });
        });
      } catch (error) {
        console.error(`Failed to kill process ${proc.pid}:`, error);
      }
    }
  }
  
  runningProcesses = [];
  process.exit(1);
}

async function waitForService(serviceUrl, serviceName, serviceProcess) {
  let attempts = 0;
  console.log(`Running ${serviceName}...`);

  while (true) {
    console.log(`Waiting for ${serviceName}...`);

    try {
      const response = await checkServiceHealth(serviceUrl);
      console.log(response);
      if (response.success) {
        break;
      }
    } catch (error) {
      console.log(error.message);
    }

    attempts++;
    if (attempts >= MAX_ATTEMPTS) {
      console.log(
        `${colors.red}Failed to connect to ${serviceName} after ${MAX_ATTEMPTS} attempts.${colors.reset}`
      );
      await cleanup();
      process.exit(1);
    }

    await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY));
  }
}

async function cleanupProcess(proc) {
  if (proc && proc.pid) {
    try {
      return new Promise((resolve) => {
        treeKill(proc.pid, 'SIGKILL', (err) => {
          if (err) console.error(`Error killing process ${proc.pid}:`, err);
          const index = runningProcesses.indexOf(proc);
          if (index !== -1) {
            runningProcesses.splice(index, 1);
          }
          resolve();
        });
      });
    } catch (error) {
      console.error(`Failed to kill process ${proc.pid}:`, error);
    }
  }
}

function runProcess(command, args) {
  return new Promise((resolve, reject) => {
    console.log(`Running command: ${command} ${args.join(' ')}`);

    const proc = spawn(command, args, {
      shell: process.platform === 'win32',
      stdio: 'pipe'
    });
    
    runningProcesses.push(proc);

    let stdoutData = '';
    let stderrData = '';

    proc.stdout.on('data', (data) => {
      const dataStr = data.toString();
      stdoutData += dataStr;
      process.stdout.write(dataStr);
    });

    proc.stderr.on('data', (data) => {
      const dataStr = data.toString();
      stderrData += dataStr;
      process.stderr.write(dataStr);
    });

    proc.on('close', async (code) => {
      const index = runningProcesses.indexOf(proc);
      if (index !== -1) {
        runningProcesses.splice(index, 1);
      }
      resolve({ code, stdout: stdoutData, stderr: stderrData });
    });

    proc.on('error', (error) => {
      const index = runningProcesses.indexOf(proc);
      if (index !== -1) {
        runningProcesses.splice(index, 1);
      }
      reject(error);
    });
  });
}

async function main() {
  try {
    console.log(`${colors.blue}Starting k6 test runner${colors.reset}`);

    const testFiles = await findK6Tests(K6_TESTS_DIR);

    if (testFiles.length === 0) {
      console.log(`${colors.yellow}No k6 test files found.${colors.reset}`);
      return;
    }

    console.log(`${colors.blue}Starting NestJS application...${colors.reset}`);
    const apiProcess = spawn('pnpm', ['run', 'start:dev'], {
      detached: false,
      stdio: 'pipe',
    });
    
    runningProcesses.push(apiProcess);
    apiProcess.stdout.pipe(process.stdout);
    apiProcess.stderr.pipe(process.stderr);

    await waitForService(API_URL, 'API', apiProcess);
    console.log(`${colors.green}API is ready. Running k6 tests...${colors.reset}`);

    let allTestsPassed = true;
    let failedTests = [];

    for (const testFile of testFiles) {
      console.log(`\n${colors.blue}Running test: ${testFile}${colors.reset}`);
      const cmdArgs = ['run', '-e', `API_URL=${API_URL}`, testFile];
      const result = await runProcess('k6', cmdArgs);

      const pattern = /checks.+?(\d+(\.\d+)?)%/;
      const match = result.stdout.match(pattern);

      const passedTestPercentage = '100';
      if (
        result.stderr ||
        result.code !== 0 ||
        !match ||
        !match[0].includes(passedTestPercentage)
      ) {
        console.log(`${colors.red}Test failed: ${testFile}${colors.reset}`);
        allTestsPassed = false;
        failedTests.push(testFile);
      } else {
        console.log(`${colors.green}Test passed: ${testFile}${colors.reset}`);
      }
    }

    console.log(`${colors.blue}Stopping API process...${colors.reset}`);
    await cleanupProcess(apiProcess);

    console.log(`${colors.blue}Completed running k6 test(s)${colors.reset}`);

    if (!allTestsPassed) {
      console.log(
        `${colors.red}Some tests failed: ${failedTests.join(', ')}${colors.reset}`
      );
      process.exit(1);
    }

    console.log(`${colors.green}All tests passed successfully!${colors.reset}`);
    process.exit(0);
  } catch (error) {
    console.error(`${colors.red}Error running tests:${colors.reset}`, error.message);
    await cleanup();
    process.exit(1);
  }
}

main().catch(async (error) => {
  console.error('Unhandled error:', error);
  await cleanup();
  process.exit(1);
});
```

### 3. Install tree-kill for process management

```bash
cd apps/api
pnpm add -D tree-kill
```

### 4. Update package.json for k6 testing

Update `apps/api/package.json`:

```json
{
  "scripts": {
    "test:k6": "node scripts/run-k6-tests.js"
  }
}
```

## Update TurboRepo Configuration

Update `turbo.json` in the root:

```json
{
  "$schema": "https://turbo.build/schema.json",
  "globalDependencies": ["**/.env.*local"],
  "pipeline": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**", ".next/**"]
    },
    "lint": {
      "outputs": []
    },
    "dev": {
      "cache": false,
      "persistent": true
    },
    "test": {
      "dependsOn": ["build"],
      "outputs": [],
      "inputs": ["src/**/*.tsx", "src/**/*.ts", "test/**/*.ts", "test/**/*.tsx"]
    },
    "test:k6": {
      "cache": false
    }
  }
}
```

## Final Project Structure

Your project structure should now look like this:

```
my-monorepo/
├── .husky/
│   ├── pre-commit
│   ├── commit-msg
│   └── pre-push
├── apps/
│   ├── api/
│   │   ├── src/
│   │   ├── test/
│   │   │   └── k6-tests/
│   │   │       └── all-tests.js
│   │   ├── scripts/
│   │   │   ├── helpers.cjs
│   │   │   └── run-k6-tests.js
│   │   ├── nest-cli.json
│   │   ├── package.json
│   │   └── tsconfig.json
│   └── web/ (if applicable)
├── packages/ (shared libraries)
├── .eslintrc.js
├── .lintstagedrc
├── .prettierrc
├── commitlint.config.js
├── package.json
└── turbo.json
```

## Usage

### Development

```bash
# Start development servers for all apps
pnpm dev

# Start only API development server
pnpm dev --filter=api
```

### Linting

```bash
# Run linting across all packages
pnpm lint
```

### Performance Testing

```bash
# Run k6 tests for the API
cd apps/api
pnpm test:k6
```

### Commits

Follow conventional commits for your commit messages:

```
feat: add user authentication
fix: resolve issue with database connection
docs: update API documentation
```

## CI/CD Integration

For CI/CD pipelines (GitHub Actions, GitLab CI, etc.), you can leverage TurboRepo's caching capabilities:

```yaml
# Example GitHub Actions workflow
name: CI

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: pnpm/action-setup@v2
        with:
          version: 7
      - uses: actions/setup-node@v3
        with:
          node-version: 16
          cache: 'pnpm'
      - run: pnpm install
      - uses: actions/cache@v3
        with:
          path: .turbo
          key: ${{ runner.os }}-turbo-${{ github.sha }}
          restore-keys: |
            ${{ runner.os }}-turbo-
      - run: pnpm lint
      - run: pnpm build
      - run: pnpm test
```

## Best Practices

1. **Modular Architecture**: Structure your NestJS application following modular architecture principles
2. **API Documentation**: Keep Swagger documentation up-to-date with all API changes
3. **Performance Testing**: Add k6 tests for critical API endpoints
4. **Commit Standards**: Follow conventional commit standards for better changelog generation
5. **Shared Code**: Extract common code into shared packages in the `packages/` directory

## Conclusion

This setup provides a robust foundation for developing NestJS applications within a TurboRepo monorepo. It includes all the essential tools for maintaining code quality, enforcing standards, documenting APIs, and testing performance.

By leveraging TurboRepo's caching and task orchestration, you can maintain a highly efficient development workflow even as your project grows.
