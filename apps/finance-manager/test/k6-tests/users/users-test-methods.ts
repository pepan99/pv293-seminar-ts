import http from 'k6/http';
import { check } from 'k6';
import { ApiBase } from '../api-base.ts';
import { uuidv4 } from 'https://jslib.k6.io/k6-utils/1.4.0/index.js';

const adminEmail = __ENV.ADMIN_EMAIL || 'admin@admin.com';
const adminPassword = __ENV.ADMIN_PASSWORD || 'InitialAdmin123';

const testUserEmailPrefix = 'test-user-';
const testUserEmailSuffix = '@example.com';
const testUserEmail = `${testUserEmailPrefix}${Date.now()}${testUserEmailSuffix}`;
const testUserPassword = __ENV.TEST_USER_PASSWORD || 'Test123!@#';
const testUserName = 'Test User';

const updateName = 'Updated Name';
const newPassword = 'NewS3cure-Passwor34&';

export class UsersTests extends ApiBase {
  usersApiUrl: string;
  userId: string = '';
  adminAuthorization: string = '';
  userAuthorization: string = '';
  testUserPassword: string = testUserPassword;
  testUserEmail: string = testUserEmail;

  unauthorizedParams: object;
  adminParams: object;
  userParams: object;

  constructor() {
    super();
    this.usersApiUrl = `${this.baseUrl}users/`;

    this.unauthorizedParams = {
      headers: {
        'Content-Type': 'application/json',
      },
    };

    this.adminParams = {
      headers: {
        'Content-Type': 'application/json',
      },
    };

    this.userParams = {
      headers: {
        'Content-Type': 'application/json',
      },
    };
  }

  setupAuth() {
    const adminLoginRes = http.post(
      `${this.baseUrl}auth/login`,
      JSON.stringify({
        email: adminEmail,
        password: adminPassword,
      }),
      { headers: { 'Content-Type': 'application/json' } },
    );

    if (adminLoginRes.status === 200) {
      try {
        const adminData = JSON.parse(adminLoginRes.body);
        this.adminAuthorization = adminData.access_token;

        if (!this.adminAuthorization) {
          console.error('No admin token received');
        } else {
          this.adminParams = {
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${this.adminAuthorization}`,
            },
          };
        }
      } catch (e) {
        console.error(`Admin authentication error: ${e.message}`);
      }
    } else {
      console.log(`Response: ${adminLoginRes.body}`);
    }

    this.setupTestUser();
  }

  setupTestUser() {
    const loginRes = http.post(
      `${this.baseUrl}auth/login`,
      JSON.stringify({
        email: this.testUserEmail,
        password: this.testUserPassword,
      }),
      { headers: { 'Content-Type': 'application/json' } },
    );

    if (loginRes.status === 200) {
      try {
        const userData = JSON.parse(loginRes.body);
        this.userAuthorization = userData.access_token;

        const profileRes = http.get(`${this.usersApiUrl}profile`, {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${this.userAuthorization}`,
          },
        });

        if (profileRes.status === 200) {
          try {
            const profile = JSON.parse(profileRes.body);
            this.userId = profile.id;
          } catch (e) {
            console.error(`Error parsing profile: ${e.message}`);
          }
        }

        this.userParams = {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${this.userAuthorization}`,
          },
        };

        return;
      } catch (e) {
        console.error(`Error parsing login response: ${e.message}`);

        this.testUserEmail = `${testUserEmailPrefix}${Date.now()}${testUserEmailSuffix}`;
      }
    }

    const registerRes = http.post(
      `${this.baseUrl}auth/register`,
      JSON.stringify({
        email: this.testUserEmail,
        password: this.testUserPassword,
        name: testUserName,
      }),
      { headers: { 'Content-Type': 'application/json' } },
    );

    if (registerRes.status !== 201) {
      if (
        registerRes.status === 400 &&
        registerRes.body.includes('already exists')
      ) {
        this.testUserEmail = `${testUserEmailPrefix}${Date.now()}${testUserEmailSuffix}`;
        return this.setupTestUser();
      }

      throw new Error('Test user creation failed');
    }

    const newLoginRes = http.post(
      `${this.baseUrl}auth/login`,
      JSON.stringify({
        email: this.testUserEmail,
        password: this.testUserPassword,
      }),
      { headers: { 'Content-Type': 'application/json' } },
    );

    if (newLoginRes.status !== 200) {
      console.error(
        `Failed to login as test user. Status: ${newLoginRes.status}`,
      );
      throw new Error('Test user login failed');
    }

    try {
      const userData = JSON.parse(newLoginRes.body);
      this.userAuthorization = userData.access_token;

      this.userParams = {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.userAuthorization}`,
        },
      };

      const profileRes = http.get(
        `${this.usersApiUrl}profile`,
        this.userParams,
      );

      if (profileRes.status === 200) {
        try {
          const profile = JSON.parse(profileRes.body);
          this.userId = profile.id;
        } catch (e) {
          console.error(`Error parsing profile: ${e.message}`);
        }
      }
    } catch (e) {
      console.error(`Error in test user setup: ${e.message}`);
      throw e;
    }
  }

  cleanupTestUser() {
    if (!this.userId || !this.adminAuthorization) {
      return;
    }

    http.del(`${this.usersApiUrl}${this.userId}`, null, this.adminParams);
  }

  getUserProfileTest() {
    const res = http.get(`${this.usersApiUrl}profile`, this.userParams);

    check(res, {
      'Get profile is status 200': (r) => r.status === 200,
    });

    if (res.status === 200) {
      const user = JSON.parse(res.body);

      check(user, {
        'Profile has id': (user) => 'id' in user,
        'Profile has name field': (user) => 'name' in user,
        'Profile has email field': (user) => 'email' in user,
        'Profile has roles field': (user) => 'roles' in user,
      });
    }
  }

  getUserProfileUnauthorizedTest() {
    const res = http.get(`${this.usersApiUrl}profile`, this.unauthorizedParams);

    check(res, {
      'Unauthorized get profile is status 401': (r) => r.status === 401,
    });
  }

  updateProfileTest() {
    const updateProfileDto = {
      name: updateName,
      email: this.testUserEmail,
    };

    const payload = JSON.stringify(updateProfileDto);

    const res = http.put(
      `${this.usersApiUrl}profile`,
      payload,
      this.userParams,
    );

    check(res, {
      'Update profile is status 200': (r) => r.status === 200,
    });

    if (res.status === 200) {
      const user = JSON.parse(res.body);

      check(user, {
        'Updated profile has correct name field': (user) =>
          user.name === updateName,
      });
    }
  }

  updateProfileUnauthorizedTest() {
    const updateProfileDto = {
      name: updateName,
      email: this.testUserEmail,
    };

    const payload = JSON.stringify(updateProfileDto);

    const res = http.put(
      `${this.usersApiUrl}profile`,
      payload,
      this.unauthorizedParams,
    );

    check(res, {
      'Unauthorized update profile is status 401': (r) => r.status === 401,
    });
  }

  changePasswordTest() {
    const changePasswordDto = {
      currentPassword: this.testUserPassword,
      newPassword: newPassword,
      confirmPassword: newPassword,
    };

    const payload = JSON.stringify(changePasswordDto);

    const res = http.put(
      `${this.usersApiUrl}change-password`,
      payload,
      this.userParams,
    );

    check(res, {
      'Change password is status 200': (r) => r.status === 200,
    });

    if (res.status === 200) {
      this.testUserPassword = newPassword;
    }
  }

  changePasswordInvalidTest() {
    const changePasswordDto = {
      currentPassword: 'WrongPassword123!',
      newPassword: newPassword,
      confirmPassword: newPassword,
    };

    const payload = JSON.stringify(changePasswordDto);

    const res = http.put(
      `${this.usersApiUrl}change-password`,
      payload,
      this.userParams,
    );

    check(res, {
      'Invalid current password is status 400': (r) => r.status === 400,
    });
  }

  changePasswordUnauthorizedTest() {
    const changePasswordDto = {
      currentPassword: this.testUserPassword,
      newPassword: newPassword,
      confirmPassword: newPassword,
    };

    const payload = JSON.stringify(changePasswordDto);

    const res = http.put(
      `${this.usersApiUrl}change-password`,
      payload,
      this.unauthorizedParams,
    );

    check(res, {
      'Unauthorized change password is status 401': (r) => r.status === 401,
    });
  }

  getAllUsersTest() {
    const res = http.get(this.usersApiUrl, this.adminParams);

    check(res, {
      'Get all users is status 200': (r) => r.status === 200,
    });

    if (res.status === 200) {
      const users = JSON.parse(res.body);

      check(users, {
        'Get all users returns array': (users) => Array.isArray(users),
        'Get all users array is not empty': (users) => users.length > 0,
      });
    }
  }

  getAllUsersForbiddenTest() {
    const res = http.get(this.usersApiUrl, this.userParams);

    check(res, {
      'Forbidden get all users is status 403': (r) => r.status === 403,
    });
  }

  getAllUsersUnauthorizedTest() {
    const res = http.get(this.usersApiUrl, this.unauthorizedParams);

    check(res, {
      'Unauthorized get all users is status 401': (r) => r.status === 401,
    });
  }

  getUserByIdTest() {
    if (!this.userId) {
      console.log('No user ID available, running getAllUsersTest first');
      this.getAllUsersTest();

      if (!this.userId) {
        console.log('Still no user ID available, skipping test');
        return;
      }
    }

    const res = http.get(`${this.usersApiUrl}${this.userId}`, this.adminParams);

    check(res, {
      'Get user by ID is status 200': (r) => r.status === 200,
    });

    if (res.status === 200) {
      try {
        const user = JSON.parse(res.body);

        check(user, {
          'Get user has correct id': (user) => user.id === this.userId,
          'Get user has name field': (user) => 'name' in user,
          'Get user has email field': (user) => 'email' in user,
          'Get user has roles field': (user) => 'roles' in user,
        });
      } catch (e) {
        console.error(`Error parsing user response: ${e.message}`);
      }
    }
  }

  getUserByIdNotFoundTest() {
    const randomId = uuidv4();
    const res = http.get(`${this.usersApiUrl}${randomId}`, this.adminParams);

    check(res, {
      'Get non-existent user is status 404': (r) => r.status === 404,
    });
  }

  getUserByIdForbiddenTest() {
    if (!this.userId) {
      console.log('No user ID available, running getAllUsersTest first');
      this.getAllUsersTest();

      if (!this.userId) {
        console.log('Still no user ID available, skipping test');
        return;
      }
    }

    const res = http.get(`${this.usersApiUrl}${this.userId}`, this.userParams);

    check(res, {
      'Forbidden get user by ID is status 403': (r) => r.status === 403,
    });
  }

  getUserByIdUnauthorizedTest() {
    if (!this.userId) {
      console.log('No user ID available, running getAllUsersTest first');
      this.getAllUsersTest();

      if (!this.userId) {
        console.log('Still no user ID available, skipping test');
        return;
      }
    }

    const res = http.get(
      `${this.usersApiUrl}${this.userId}`,
      this.unauthorizedParams,
    );

    check(res, {
      'Unauthorized get user by ID is status 401': (r) => r.status === 401,
    });
  }

  updateUserTest() {
    const updateUserDto = {
      email: this.testUserEmail,
      name: 'Updated Name',
      roles: ['admin', 'user'],
    };

    const payload = JSON.stringify(updateUserDto);

    const res = http.put(
      `${this.usersApiUrl}${this.userId}`,
      payload,
      this.adminParams,
    );

    check(res, {
      'Update user is status 200': (r) => r.status === 200,
    });

    if (res.status === 200) {
      try {
        const user = JSON.parse(res.body);

        check(user, {
          'Updated user has correct id': (user) => user.id === this.userId,
          'Updated user has correct name field': (user) =>
            user.name === 'Updated Name',
          'Updated user has admin role': (user) =>
            user.roles?.includes('admin') || false,
        });
      } catch (e) {
        console.error(`Error parsing user response: ${e.message}`);
      }
    }
  }

  updateUserNotFoundTest() {
    const updateUserDto = {
      email: 'test@aasdf.com',
      roles: ['admin', 'user'],
      name: 'Non-existent User',
    };

    const payload = JSON.stringify(updateUserDto);

    const randomId = uuidv4();
    const res = http.put(
      `${this.usersApiUrl}${randomId}`,
      payload,
      this.adminParams,
    );

    check(res, {
      'Update non-existent user is status 404': (r) => r.status === 404,
    });

    if (res.status === 404) {
      try {
        const errorRes = JSON.parse(res.body);

        check(errorRes, {
          'Not Found Update contains correct error message': (body) =>
            body.message?.includes('not found'),
        });
      } catch (e) {
        console.log(`Error response might not be JSON: ${res.body}`);
      }
    }
  }

  updateUserForbiddenTest() {
    if (!this.userId) {
      console.log('No user ID available, running getAllUsersTest first');
      this.getAllUsersTest();

      if (!this.userId) {
        console.log('Still no user ID available, skipping test');
        return;
      }
    }

    const updateUserDto = {
      name: 'Forbidden Update',
    };

    const payload = JSON.stringify(updateUserDto);

    const res = http.put(
      `${this.usersApiUrl}${this.userId}`,
      payload,
      this.userParams,
    );

    check(res, {
      'Forbidden update user is status 403': (r) => r.status === 403,
    });
  }

  updateUserUnauthorizedTest() {
    if (!this.userId) {
      console.log('No user ID available, running getAllUsersTest first');
      this.getAllUsersTest();

      if (!this.userId) {
        console.log('Still no user ID available, skipping test');
        return;
      }
    }

    const updateUserDto = {
      name: 'Unauthorized Update',
    };

    const payload = JSON.stringify(updateUserDto);

    const res = http.put(
      `${this.usersApiUrl}${this.userId}`,
      payload,
      this.unauthorizedParams,
    );

    check(res, {
      'Unauthorized update user is status 401': (r) => r.status === 401,
    });
  }

  removeUserTest() {
    if (this.userId) {
      const userRes = http.get(
        `${this.usersApiUrl}${this.userId}`,
        this.adminParams,
      );

      if (userRes.status === 200) {
        try {
          const userData = JSON.parse(userRes.body);
          if (userData.email === adminEmail) {
            console.log(
              `Avoiding deletion of admin user. Creating test user instead.`,
            );
            this.userId = null;
          }
        } catch (e) {
          console.log('Error checking user before deletion');
        }
      }
    }

    if (!this.userId) {
      const deleteUserEmail = `delete-user-${Date.now()}@example.com`;
      const deleteUserPassword = 'Delete123!@#';

      const registerRes = http.post(
        `${this.baseUrl}auth/register`,
        JSON.stringify({
          email: deleteUserEmail,
          password: deleteUserPassword,
          name: 'Delete Test User',
        }),
        { headers: { 'Content-Type': 'application/json' } },
      );

      if (registerRes.status !== 201) {
        console.log(
          `Failed to create user for deletion test, using existing user ID`,
        );
      } else {
        const loginRes = http.post(
          `${this.baseUrl}auth/login`,
          JSON.stringify({
            email: deleteUserEmail,
            password: deleteUserPassword,
          }),
          { headers: { 'Content-Type': 'application/json' } },
        );

        if (loginRes.status === 200) {
          try {
            const loginData = JSON.parse(loginRes.body);
            const token = loginData.access_token;

            if (token) {
              const profileRes = http.get(`${this.baseUrl}users/profile`, {
                headers: {
                  'Content-Type': 'application/json',
                  Authorization: `Bearer ${token}`,
                },
              });

              if (profileRes.status === 200) {
                const profileData = JSON.parse(profileRes.body);
                this.userId = profileData.id;
                console.log(
                  `Created new user for deletion test: ${this.userId}`,
                );
              }
            }
          } catch (e) {
            console.log('Error getting new user data for deletion test');
          }
        }
      }
    }

    if (!this.userId) {
      console.log('No user ID available for deletion test, skipping');
      return;
    }

    console.log(`Deleting user with ID: ${this.userId}`);
    const res = http.del(
      `${this.usersApiUrl}${this.userId}`,
      null,
      this.adminParams,
    );

    check(res, {
      'Delete user is status 200': (r) => r.status === 200,
    });

    const getRes = http.get(
      `${this.usersApiUrl}${this.userId}`,
      this.adminParams,
    );

    check(getRes, {
      'Get deleted user is status 404': (r) => r.status === 404,
    });
  }

  removeUserNotFoundTest() {
    const randomId = uuidv4();
    const res = http.del(
      `${this.usersApiUrl}${randomId}`,
      null,
      this.adminParams,
    );

    check(res, {
      'Delete non-existent user is status 404': (r) => r.status === 404,
    });
  }

  removeUserForbiddenTest() {
    const allUsersRes = http.get(this.usersApiUrl, this.adminParams);
    if (allUsersRes.status === 200) {
      try {
        const users = JSON.parse(allUsersRes.body);
        if (Array.isArray(users) && users.length > 0) {
          this.userId = users[0].id;
        }
      } catch (e) {
        console.log('Error parsing users data');
      }
    }

    if (!this.userId) {
      console.log('No user ID available for forbidden delete test, skipping');
      return;
    }

    const res = http.del(
      `${this.usersApiUrl}${this.userId}`,
      null,
      this.userParams,
    );

    check(res, {
      'Forbidden delete user is status 403': (r) => r.status === 403,
    });
  }

  removeUserUnauthorizedTest() {
    if (!this.userId) {
      const allUsersRes = http.get(this.usersApiUrl, this.adminParams);
      if (allUsersRes.status === 200) {
        try {
          const users = JSON.parse(allUsersRes.body);
          if (Array.isArray(users) && users.length > 0) {
            this.userId = users[0].id;
          }
        } catch (e) {
          console.log('Error parsing users data');
        }
      }
    }

    if (!this.userId) {
      console.log(
        'No user ID available for unauthorized delete test, skipping',
      );
      return;
    }

    const res = http.del(
      `${this.usersApiUrl}${this.userId}`,
      null,
      this.unauthorizedParams,
    );

    check(res, {
      'Unauthorized delete user is status 401': (r) => r.status === 401,
    });
  }
}
