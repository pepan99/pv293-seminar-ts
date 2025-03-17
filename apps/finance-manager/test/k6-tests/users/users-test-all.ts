import { group } from 'k6';
import { UsersTests } from './users-test-methods.ts';

const tests = new UsersTests();

// in terminal run "k6 run <path-to-script>"

export default function () {
  group('Users Tests', function () {
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
