const { spawn } = require('child_process');
const path = require('path');
const { checkServiceHealth, colors, findK6Tests } = require('./helpers.cjs');
const process = require('process');
const treeKill = require('tree-kill');
const { config } = require('dotenv');
const { ConfigService } = require('@nestjs/config');

const K6_TESTS_DIR = path.resolve(__dirname, '../test/k6-tests');
const MAX_ATTEMPTS = 10;
const RETRY_DELAY = 2000;
const API_URL = 'http://localhost:8000/health';

config();

const configService = new ConfigService();

const ADMIN_EMAIL = configService.get('ADMIN_EMAIL');
const ADMIN_NAME = configService.get('ADMIN_NAME');
const ADMIN_PASSWORD = configService.get('ADMIN_PASSWORD');
const TEST_USER_EMAIL = configService.get('TEST_USER_EMAIL');
const TEST_USER_NAME = configService.get('TEST_USER_NAME');
const TEST_USER_PASSWORD = configService.get('TEST_USER_PASSWORD');

let runningProcesses = [];

process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);
process.on('uncaughtException', (error) => {
  console.error('Uncaught exception:', error);
  cleanup();
});

async function cleanup() {
  console.log(`\n${colors.yellow}Cleaning up processes...${colors.reset}`);

  for (const proc of [...runningProcesses].reverse()) {
    if (proc && proc.pid) {
      try {
        console.log(`Killing process with PID: ${proc.pid}`);
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

async function waitForService(
  serviceUrl,
  serviceName,
  serviceProcess,
  dependentProcess = null,
) {
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
        `${colors.red}Failed to connect to ${serviceName} after ${MAX_ATTEMPTS} attempts. Killing app...`,
      );
      console.log(`Aborting tests.${colors.reset}`);

      await cleanupProcess(serviceProcess);
      if (dependentProcess) {
        await cleanupProcess(dependentProcess);
      }
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
      stdio: 'pipe',
      detached: false,
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

    console.log(`Looking for k6 tests in ${K6_TESTS_DIR}`);
    const testFiles = await findK6Tests(K6_TESTS_DIR);

    if (testFiles.length === 0) {
      console.log(`${colors.yellow}No k6 test files found.${colors.reset}`);
      return;
    }

    const isUsingMainFile =
      testFiles.length === 1 && path.basename(testFiles[0]) === 'all-tests.ts';

    if (isUsingMainFile) {
      console.log(
        `${colors.blue}Using main aggregation file: ${testFiles[0]}${colors.reset}`,
      );
    } else {
      console.log(
        `Found ${testFiles.length} individual test files: ${testFiles.join(', ')}`,
      );
    }

    console.log(`${colors.blue}Starting NestJS application...${colors.reset}`);
    const apiProcess = spawn('pnpm', ['run', 'dev'], {
      detached: false,
      stdio: 'pipe',
    });

    runningProcesses.push(apiProcess);

    apiProcess.stdout.pipe(process.stdout);
    apiProcess.stderr.pipe(process.stderr);

    await waitForService(API_URL, 'API', apiProcess);

    console.log(
      `${colors.green}API is ready. Running k6 tests...${colors.reset}`,
    );

    let allTestsPassed = true;
    let failedTests = [];

    for (const testFile of testFiles) {
      console.log(`\n${colors.blue}Running test: ${testFile}${colors.reset}`);

      const cmdArgs = [
        'run',
        '-e',
        `API_URL=${API_URL}`,
        '-e',
        `ADMIN_EMAIL=${ADMIN_EMAIL}`,
        '-e',
        `ADMIN_NAME=${ADMIN_NAME}`,
        '-e',
        `ADMIN_PASSWORD=${ADMIN_PASSWORD}`,
        '-e',
        `TEST_USER_EMAIL=${TEST_USER_EMAIL}`,
        '-e',
        `TEST_USER_NAME=${TEST_USER_NAME}`,
        '-e',
        `TEST_USER_PASSWORD=${TEST_USER_PASSWORD}`,
        testFile,
      ];

      const result = await runProcess('k6', cmdArgs);

      const pattern = /checks.+?(\d+(\.\d+)?)%/;
      const match = result.stdout.match(pattern);

      const passedTestPercentage = '100';
      if (!match || !match[0].includes(passedTestPercentage)) {
        console.log(`${colors.red}Test failed: ${testFile}${colors.reset}`);
        allTestsPassed = false;
        failedTests.push(testFile);
      } else {
        console.log(`${colors.green}Test passed: ${testFile}${colors.reset}`);
      }
    }

    console.log(
      `${colors.blue}Stopping API process (PID: ${apiProcess.pid})...${colors.reset}`,
    );
    await cleanupProcess(apiProcess);

    console.log(`${colors.blue}Completed running k6 test(s)${colors.reset}`);

    if (!allTestsPassed) {
      console.log(
        `${colors.red}Some tests failed: ${failedTests.join(', ')}${colors.reset}`,
      );
      process.exit(1);
    }

    console.log(`${colors.green}All tests passed successfully!${colors.reset}`);
    process.exit(0);
  } catch (error) {
    console.error(
      `${colors.red}Error running tests:${colors.reset}`,
      error.message,
    );
    await cleanup();
    process.exit(1);
  }
}

main().catch(async (error) => {
  console.error('Unhandled error:', error);
  await cleanup();
  process.exit(1);
});
