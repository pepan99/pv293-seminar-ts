import http from 'k6/http';
import { check } from 'k6';
import { ApiBase } from '../api-base.ts';
import { TestAdmin_1, TestUser_1 } from '../all-test-users.ts';
import {
  UpdateUserDto,
  ChangePasswordDto,
  UserDto,
  UpdateUserAdminDto,
} from '../../../src/modules/users/dto/zod-dtos.ts';
import { uuidv4 } from 'https://jslib.k6.io/k6-utils/1.4.0/index.js';
import { ErrorResponse } from '../types.ts';

const adminAuthorization = TestAdmin_1.auth;

const userAuthorization = TestUser_1.auth;

const updateName = 'Updated Name';
const newPassword = 'NewS3cure-Passwor34&';
const currentPassword = 'CurrentPassword123!';

const unauthorizedParams = {
  headers: {
    'Content-Type': 'application/json',
  },
};

const adminParams = {
  headers: {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${adminAuthorization}`,
  },
};

const userParams = {
  headers: {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${userAuthorization}`,
  },
};

export class UsersTests extends ApiBase {
  usersApiUrl: string;
  userId: string = '';

  constructor() {
    super();
    this.usersApiUrl = `${this.baseUrl}users/`;
  }

  getUserProfileTest(): boolean {
    const res = http.get(`${this.usersApiUrl}profile`, userParams);

    const resJson = res.json();
    if (!resJson) return false;

    const user = resJson as unknown as UserDto;

    check(res, {
      'Get profile is status 200': (r) => r.status === 200,
    });

    check(user, {
      'Profile has id': (user) => 'id' in user,
      'Profile has name field': (user) => 'name' in user,
      'Profile has email field': (user) => 'email' in user,
      'Profile has roles field': (user) => 'roles' in user,
    });

    return true;
  }

  getUserProfileUnauthorizedTest() {
    const res = http.get(`${this.usersApiUrl}profile`, unauthorizedParams);

    check(res, {
      'Unauthorized get profile is status 401': (r) => r.status === 401,
    });
  }

  updateProfileTest(): boolean {
    const updateProfileDto: UpdateUserDto = {
      name: updateName,
    };

    const payload = JSON.stringify(updateProfileDto);

    const res = http.put(`${this.usersApiUrl}profile`, payload, userParams);

    const resJson = res.json();
    if (!resJson) return false;

    const user = resJson as unknown as UserDto;

    check(res, {
      'Update profile is status 200': (r) => r.status === 200,
    });

    check(user, {
      'Updated profile has correct name field': (user) =>
        user.name === updateName,
    });

    return true;
  }

  updateProfileUnauthorizedTest() {
    const updateProfileDto: UpdateUserDto = {
      name: updateName,
    };

    const payload = JSON.stringify(updateProfileDto);

    const res = http.put(
      `${this.usersApiUrl}profile`,
      payload,
      unauthorizedParams,
    );

    check(res, {
      'Unauthorized update profile is status 401': (r) => r.status === 401,
    });
  }

  changePasswordTest() {
    const changePasswordDto: ChangePasswordDto = {
      currentPassword: currentPassword,
      newPassword: newPassword,
      confirmPassword: newPassword,
    };

    const payload = JSON.stringify(changePasswordDto);

    const res = http.post(
      `${this.usersApiUrl}change-password`,
      payload,
      userParams,
    );

    check(res, {
      'Change password is status 200': (r) => r.status === 200,
    });
  }

  changePasswordInvalidTest() {
    const changePasswordDto: ChangePasswordDto = {
      currentPassword: 'WrongPassword123!',
      newPassword: newPassword,
      confirmPassword: newPassword,
    };

    const payload = JSON.stringify(changePasswordDto);

    const res = http.post(
      `${this.usersApiUrl}change-password`,
      payload,
      userParams,
    );

    check(res, {
      'Invalid current password is status 400': (r) => r.status === 400,
    });
  }

  changePasswordUnauthorizedTest() {
    const changePasswordDto: ChangePasswordDto = {
      currentPassword: currentPassword,
      newPassword: newPassword,
      confirmPassword: newPassword,
    };

    const payload = JSON.stringify(changePasswordDto);

    const res = http.post(
      `${this.usersApiUrl}change-password`,
      payload,
      unauthorizedParams,
    );

    check(res, {
      'Unauthorized change password is status 401': (r) => r.status === 401,
    });
  }

  getAllUsersTest(): boolean {
    const res = http.get(this.usersApiUrl, adminParams);

    const resJson = res.json();
    if (!resJson) return false;

    const users = resJson as unknown as UserDto[];

    check(res, {
      'Get all users is status 200': (r) => r.status === 200,
    });

    check(users, {
      'Get all users returns array': (users) => Array.isArray(users),
      'Get all users array is not empty': (users) => users.length > 0,
    });

    return true;
  }

  getAllUsersForbiddenTest() {
    const res = http.get(this.usersApiUrl, userParams);

    check(res, {
      'Forbidden get all users is status 403': (r) => r.status === 403,
    });
  }

  getAllUsersUnauthorizedTest() {
    const res = http.get(this.usersApiUrl, unauthorizedParams);

    check(res, {
      'Unauthorized get all users is status 401': (r) => r.status === 401,
    });
  }

  getUserByIdTest(): boolean {
    const userRes = http.get(this.usersApiUrl, adminParams);
    const userJson = userRes.json();
    if (!userJson) return false;

    const usera = userJson as unknown as UserDto;

    this.userId = usera.id;

    const res = http.get(`${this.usersApiUrl}${this.userId}`, adminParams);

    const resJson = res.json();
    if (!resJson) return false;

    const user = resJson as unknown as UserDto;

    check(res, {
      'Get user by ID is status 200': (r) => r.status === 200,
    });

    check(user, {
      'Get user has correct id': (user) => user.id === this.userId,
      'Get user has name field': (user) => 'name' in user,
      'Get user has email field': (user) => 'email' in user,
      'Get user has roles field': (user) => 'roles' in user,
    });

    return true;
  }

  getUserByIdNotFoundTest() {
    const res = http.get(`${this.usersApiUrl}${uuidv4()}`, adminParams);

    check(res, {
      'Get non-existent user is status 404': (r) => r.status === 404,
    });
  }

  getUserByIdForbiddenTest() {
    const res = http.get(`${this.usersApiUrl}${this.userId}`, userParams);

    check(res, {
      'Forbidden get user by ID is status 403': (r) => r.status === 403,
    });
  }

  getUserByIdUnauthorizedTest() {
    const res = http.get(
      `${this.usersApiUrl}${this.userId}`,
      unauthorizedParams,
    );

    check(res, {
      'Unauthorized get user by ID is status 401': (r) => r.status === 401,
    });
  }

  updateUserTest(): boolean {
    const updateUserDto: UpdateUserAdminDto = {
      name: 'Admin Updated Name',
      roles: ['admin', 'student'],
    };

    const payload = JSON.stringify(updateUserDto);

    const res = http.put(
      `${this.usersApiUrl}${this.userId}`,
      payload,
      adminParams,
    );

    const resJson = res.json();
    if (!resJson) return false;

    const user = resJson as unknown as UserDto;

    check(res, {
      'Update user is status 200': (r) => r.status === 200,
    });

    check(user, {
      'Updated user has correct id': (user) => user.id === this.userId,
      'Updated user has correct name field': (user) =>
        user.name === 'Admin Updated Name',
      'Updated user has correct roles': (user) =>
        (user.roles?.includes('admin') && user.roles?.includes('student')) ||
        false,
    });

    return true;
  }

  updateUserNotFoundTest() {
    const updateUserDto: UpdateUserDto = {
      name: 'Non-existent User',
    };

    const payload = JSON.stringify(updateUserDto);

    const newUuid = uuidv4();
    const res = http.put(`${this.usersApiUrl}${newUuid}`, payload, adminParams);

    check(res, {
      'Update non-existent user is status 404': (r) => r.status === 404,
    });

    const resJson = res.json() as unknown as ErrorResponse;
    if (resJson) {
      check(resJson, {
        'Not Found Update contains correct error message': (body) =>
          body.message.includes(`not found`),
      });
    }
  }

  updateUserForbiddenTest() {
    const updateUserDto: UpdateUserDto = {
      name: 'Forbidden Update',
    };

    const payload = JSON.stringify(updateUserDto);

    const res = http.put(
      `${this.usersApiUrl}${this.userId}`,
      payload,
      userParams,
    );

    check(res, {
      'Forbidden update user is status 403': (r) => r.status === 403,
    });
  }

  updateUserUnauthorizedTest() {
    const updateUserDto: UpdateUserDto = {
      name: 'Unauthorized Update',
    };

    const payload = JSON.stringify(updateUserDto);

    const res = http.put(
      `${this.usersApiUrl}${this.userId}`,
      payload,
      unauthorizedParams,
    );

    check(res, {
      'Unauthorized update user is status 401': (r) => r.status === 401,
    });
  }

  removeUserTest() {
    const res = http.del(
      `${this.usersApiUrl}${this.userId}`,
      null,
      adminParams,
    );

    check(res, {
      'Delete user is status 200': (r) => r.status === 200,
    });

    const getRes = http.get(`${this.usersApiUrl}${this.userId}`, adminParams);

    check(getRes, {
      'Get deleted user is status 404': (r) => r.status === 404,
    });
  }

  removeUserNotFoundTest() {
    const newUuid = uuidv4();
    const res = http.del(`${this.usersApiUrl}${newUuid}`, null, adminParams);

    check(res, {
      'Delete non-existent user is status 404': (r) => r.status === 404,
    });
  }

  removeUserForbiddenTest() {
    const res = http.del(`${this.usersApiUrl}${this.userId}`, null, userParams);

    check(res, {
      'Forbidden delete user is status 403': (r) => r.status === 403,
    });
  }

  removeUserUnauthorizedTest() {
    const res = http.del(
      `${this.usersApiUrl}${this.userId}`,
      null,
      unauthorizedParams,
    );

    check(res, {
      'Unauthorized delete user is status 401': (r) => r.status === 401,
    });
  }
}
