import { group, sleep } from 'k6';
import { UsersTests } from './users-test-methods.ts';
import http from 'k6/http';

// Create an instance of the UsersTests class
const tests = new UsersTests();

// Setup function to run once at the beginning of the test
export function setup() {
  // Log available environment variables

  // Set up authentication before running tests
  try {
    tests.setupAuth();
  } catch (e) {
    throw e;
  }

  // Give a short delay to ensure everything is set up

  sleep(2);
}

// Main test function
export default function () {
  group('Users Tests', function () {
    // Verify authentication tokens are still valid before proceeding
    const adminProfileCheck = http.get(
      `${tests.baseUrl}users/profile`,
      tests.adminParams,
    );
    const userProfileCheck = http.get(
      `${tests.baseUrl}users/profile`,
      tests.userParams,
    );

    if (adminProfileCheck.status !== 200 || userProfileCheck.status !== 200) {
      try {
        tests.setupAuth();
      } catch (e) {
        return;
      }
    }
    group('User Profile Tests', function () {
      group('Get User Profile Test', function () {
        tests.getUserProfileTest();
      });
      group('Get User Profile Unauthorized Test', function () {
        tests.getUserProfileUnauthorizedTest();
      });
      group('Update User Profile Test', function () {
        tests.updateProfileTest();
      });
      group('Update User Profile Unauthorized Test', function () {
        tests.updateProfileUnauthorizedTest();
      });
    });
    group('Password Management Tests', function () {
      group('Change Password Test', function () {
        tests.changePasswordTest();
      });
      group('Change Password with Invalid Current Password Test', function () {
        tests.changePasswordInvalidTest();
      });
      group('Change Password Unauthorized Test', function () {
        tests.changePasswordUnauthorizedTest();
      });
    });
    group('Admin - Get All Users Tests', function () {
      group('Get All Users Test', function () {
        tests.getAllUsersTest();
      });
      group('Get All Users Forbidden Test', function () {
        tests.getAllUsersForbiddenTest();
      });
      group('Get All Users Unauthorized Test', function () {
        tests.getAllUsersUnauthorizedTest();
      });
    });
    group('Admin - Get User by ID Tests', function () {
      group('Get User by ID Test', function () {
        tests.getUserByIdTest();
      });
      group('Get User by ID Not Found Test', function () {
        tests.getUserByIdNotFoundTest();
      });
      group('Get User by ID Forbidden Test', function () {
        tests.getUserByIdForbiddenTest();
      });
      group('Get User by ID Unauthorized Test', function () {
        tests.getUserByIdUnauthorizedTest();
      });
    });
    group('Admin - Update User Tests', function () {
      group('Update User Test', function () {
        tests.updateUserTest();
      });
      group('Update User Not Found Test', function () {
        tests.updateUserNotFoundTest();
      });
      group('Update User Forbidden Test', function () {
        tests.updateUserForbiddenTest();
      });
      group('Update User Unauthorized Test', function () {
        tests.updateUserUnauthorizedTest();
      });
    });
    group('Admin - Delete User Tests', function () {
      group('Delete User Test', function () {
        tests.removeUserTest();
      });
      group('Delete User Not Found Test', function () {
        tests.removeUserNotFoundTest();
      });
      group('Delete User Forbidden Test', function () {
        tests.removeUserForbiddenTest();
      });
      group('Delete User Unauthorized Test', function () {
        tests.removeUserUnauthorizedTest();
      });
    });
  });
}

// Teardown function to clean up after tests
export function teardown(data) {
  if (tests.adminAuthorization && tests.userId) {
    tests.cleanupTestUser();
  } else {
    if (data && data.testUserId) {
      const adminLoginRes = http.post(
        `${tests.baseUrl}auth/login`,
        JSON.stringify({
          email: __ENV.ADMIN_EMAIL || 'admin@admin.com',
          password: __ENV.ADMIN_PASSWORD || 'InitialAdmin123',
        }),
        { headers: { 'Content-Type': 'application/json' } },
      );

      if (adminLoginRes.status === 200) {
        const adminData = JSON.parse(adminLoginRes.body);
        const adminToken = adminData.access_token;

        if (adminToken) {
          const deleteRes = http.del(
            `${tests.baseUrl}users/${data.testUserId}`,
            null,
            {
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${adminToken}`,
              },
            },
          );
        }
      }
    }
    console.log('Teardown complete!');
  }
}
