import { group } from 'k6';
import { AuthTests } from './auth-test-methods.ts';

const tests = new AuthTests();

// in terminal run "k6 run <path-to-script>"

export default function () {
  group('Authentication Tests', function () {
    group('Registration Tests', function () {
      group('Register User Test', function () {
        tests.registerUserTest();
      });
      group('Register with Duplicate Email Test', function () {
        tests.registerDuplicateEmailTest();
      });
      group('Register with Invalid Data Test', function () {
        tests.registerInvalidDataTest();
      });
    });

    group('Login Tests', function () {
      group('Login with Valid Credentials Test', function () {
        tests.loginTest();
      });
      group('Login with Invalid Credentials Test', function () {
        tests.loginInvalidCredentialsTest();
      });
      group('Login with Non-existent User Test', function () {
        tests.loginNonExistentUserTest();
      });
    });

    group('Token Management Tests', function () {
      group('Refresh Token Test', function () {
        tests.refreshTokenTest();
      });
      group('Refresh Token with Invalid Token Test', function () {
        tests.refreshTokenInvalidTest();
      });
      group('Validate Token Test', function () {
        tests.validateTokenTest();
      });
      group('Validate Invalid Token Test', function () {
        tests.validateTokenInvalidTest();
      });
    });
  });
}

export function teardown(data) {}
