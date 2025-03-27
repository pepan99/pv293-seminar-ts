import { group, sleep } from 'k6';
import { UsersTests } from './users-test-methods.js';
import http from 'k6/http';

const tests = new UsersTests();

export function setup() {
  tests.setupAuth();

  sleep(2);
}

// Main test function
export default function() {
  group('Users Tests', function() {
    const adminProfileCheck = http.get(
      `${tests.baseUrl}users/profile`,
      tests.adminParams,
    );
    const userProfileCheck = http.get(
      `${tests.baseUrl}users/profile`,
      tests.userParams,
    );

    if (adminProfileCheck.status !== 200 || userProfileCheck.status !== 200) {
      tests.setupAuth();
    }
    group('User Profile Tests', function() {
      group('Get User Profile Test', function() {
        tests.getUserProfileTest();
      });
      group('Get User Profile Unauthorized Test', function() {
        tests.getUserProfileUnauthorizedTest();
      });
      group('Update User Profile Test', function() {
        tests.updateProfileTest();
      });
      group('Update User Profile Unauthorized Test', function() {
        tests.updateProfileUnauthorizedTest();
      });
    });
    group('Password Management Tests', function() {
      group('Change Password Test', function() {
        tests.changePasswordTest();
      });
      group('Change Password with Invalid Current Password Test', function() {
        tests.changePasswordInvalidTest();
      });
      group('Change Password Unauthorized Test', function() {
        tests.changePasswordUnauthorizedTest();
      });
    });
    group('Admin - Get All Users Tests', function() {
      group('Get All Users Test', function() {
        tests.getAllUsersTest();
      });
      group('Get All Users Forbidden Test', function() {
        tests.getAllUsersForbiddenTest();
      });
      group('Get All Users Unauthorized Test', function() {
        tests.getAllUsersUnauthorizedTest();
      });
    });
    group('Admin - Get User by ID Tests', function() {
      group('Get User by ID Test', function() {
        tests.getUserByIdTest();
      });
      group('Get User by ID Not Found Test', function() {
        tests.getUserByIdNotFoundTest();
      });
      group('Get User by ID Forbidden Test', function() {
        tests.getUserByIdForbiddenTest();
      });
      group('Get User by ID Unauthorized Test', function() {
        tests.getUserByIdUnauthorizedTest();
      });
    });
    group('Admin - Update User Tests', function() {
      group('Update User Test', function() {
        tests.updateUserTest();
      });
      group('Update User Not Found Test', function() {
        tests.updateUserNotFoundTest();
      });
      group('Update User Forbidden Test', function() {
        tests.updateUserForbiddenTest();
      });
      group('Update User Unauthorized Test', function() {
        tests.updateUserUnauthorizedTest();
      });
    });
    group('Admin - Delete User Tests', function() {
      group('Delete User Test', function() {
        tests.removeUserTest();
      });
      group('Delete User Not Found Test', function() {
        tests.removeUserNotFoundTest();
      });
      group('Delete User Forbidden Test', function() {
        tests.removeUserForbiddenTest();
      });
      group('Delete User Unauthorized Test', function() {
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
