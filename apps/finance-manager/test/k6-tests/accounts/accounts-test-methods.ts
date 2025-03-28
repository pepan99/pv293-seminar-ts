import http from 'k6/http';
import { check } from 'k6';
import { ApiBase } from '../api-base.ts';
import { uuidv4 } from 'https://jslib.k6.io/k6-utils/1.4.0/index.js';
import { AuthResponse } from '../types.ts';
import { Account } from '../../../src/modules/accounts/entities/accounts.entity.ts';

const adminEmail = __ENV.ADMIN_EMAIL || 'admin@admin.com';
const adminPassword = __ENV.ADMIN_PASSWORD || 'InitialAdmin123';

const testUserEmailPrefix = 'test-user-';
const testUserEmailSuffix = '@example.com';
const testUserEmail = `${testUserEmailPrefix}${Date.now()}${testUserEmailSuffix}`;
const testUserPassword = __ENV.TEST_USER_PASSWORD || 'Test123!@#';
const testUserName = 'Test User';

export class AccountsTests extends ApiBase {
  accountsApiUrl: string;
  userId = '';
  userAuthorization = '';
  testUserEmail = testUserEmail;
  testUserPassword = testUserPassword;

  testAccountId = '';
  testAccountName = 'Test Account';
  updatedAccountName = 'Updated Account';

  unauthorizedParams: object;
  userParams: object;

  constructor() {
    super();
    this.accountsApiUrl = `${this.baseUrl}accounts/`;

    // Initialize the unauthorized params
    this.unauthorizedParams = {
      headers: {
        'Content-Type': 'application/json',
      },
    };

    // Initialize the user params with just Content-Type
    // Authorization will be added after login
    this.userParams = {
      headers: {
        'Content-Type': 'application/json',
      },
    };
  }

  setupAuth() {
    const registerRes = http.post(
      `${this.baseUrl}auth/register`,
      JSON.stringify({
        email: this.testUserEmail,
        password: this.testUserPassword,
        name: testUserName,
      }),
      { headers: { 'content-type': 'application/json' } },
    );

    const registerResJson = registerRes.json() as unknown as AuthResponse;

    console.log(registerRes);

    this.userParams = {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${registerResJson.access_token}`,
      },
    };

    this.userId = registerResJson.user.id;

    // Create a test account
    this.createTestAccount();
  }

  createTestAccount() {
    console.log('Creating test account...');
    console.log(
      `User params for createTestAccount: ${JSON.stringify(this.userParams)}`,
    );

    const createAccountDto = {
      name: this.testAccountName,
      description: 'Test account description',
      accountType: 'CASH',
      currency: 'EUR',
      icon: 'bank',
      color: 'green',
    };

    const payload = JSON.stringify(createAccountDto);
    const res = http.post(this.accountsApiUrl, payload, this.userParams);

    console.log(`Create test account status: ${res.status}`);

    if (res.status === 201) {
      try {
        const account = JSON.parse(res.body);
        this.testAccountId = account.id;
        console.log(`Created test account with ID: ${this.testAccountId}`);
      } catch (e) {
        console.error(`Error parsing account creation response: ${e.message}`);
      }
    } else {
      console.error(`Failed to create test account. Status: ${res.status}`);
      console.error(`Response body: ${res.body}`);
    }
  }

  cleanupTestUser() {
    if (!this.userId) {
      return;
    }

    // First delete all accounts for this user
    const accountsRes = http.get(this.accountsApiUrl, this.userParams);
    if (accountsRes.status === 200) {
      try {
        const accounts = JSON.parse(accountsRes.body);
        for (const account of accounts) {
          http.del(
            `${this.accountsApiUrl}${account.id}`,
            null,
            this.userParams,
          );
        }
      } catch (e) {
        console.error(`Error cleaning up accounts: ${e.message}`);
      }
    }

    // Then try to delete the user - we'll need admin permissions for this
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
        const adminToken = adminData.access_token;

        if (adminToken) {
          http.del(`${this.baseUrl}users/${this.userId}`, null, {
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${adminToken}`,
            },
          });
        }
      } catch (e) {
        console.error(`Error in admin login for cleanup: ${e.message}`);
      }
    }
  }

  // Test Cases

  createAccountTest() {
    const createAccountDto = {
      name: 'New Test Account',
      description: 'A newly created test account',
      color: 'blue',
      icon: 'wallet',
      currency: 'EUR',
      accountType: 'BANK',
    };

    const payload = JSON.stringify(createAccountDto);
    const res = http.post(this.accountsApiUrl, payload, this.userParams);

    check(res, {
      'Create account is status 201': (r) => r.status === 201,
    });

    if (res.status === 201) {
      const account = res.json() as unknown as Account;

      check(account, {
        'Account has id': (account) => 'id' in account,
        'Account has name field': (account) =>
          account.name === createAccountDto.name,
        'Account has description field': (account) =>
          account.description === createAccountDto.description,
        'Account has color field': (account) =>
          account.color === createAccountDto.color,
        'Account has icon field': (account) =>
          account.icon === createAccountDto.icon,
        'Account has currency field': (account) =>
          account.currency === createAccountDto.currency,
        'Account has userId field': (account) => account.userId === this.userId,
      });
    }
  }

  createAccountUnauthorizedTest() {
    const createAccountDto = {
      name: 'Unauthorized Test Account',
      description: 'This account should not be created',
      currency: 'USD',
    };

    const payload = JSON.stringify(createAccountDto);
    const res = http.post(
      this.accountsApiUrl,
      payload,
      this.unauthorizedParams,
    );

    check(res, {
      'Unauthorized create account is status 401': (r) => r.status === 401,
    });
  }

  findAllAccountsTest() {
    const res = http.get(this.accountsApiUrl, this.userParams);

    check(res, {
      'Get all accounts is status 200': (r) => r.status === 200,
    });

    if (res.status === 200) {
      const accounts = JSON.parse(res.body);

      check(accounts, {
        'Get all accounts returns array': (accounts) => Array.isArray(accounts),
        'Get all accounts array is not empty': (accounts) =>
          accounts.length > 0,
      });
    }
  }

  findAllAccountsUnauthorizedTest() {
    const res = http.get(this.accountsApiUrl, this.unauthorizedParams);

    check(res, {
      'Unauthorized get all accounts is status 401': (r) => r.status === 401,
    });
  }

  findOneAccountTest() {
    const res = http.get(
      `${this.accountsApiUrl}${this.testAccountId}`,
      this.userParams,
    );

    check(res, {
      'Get account by ID is status 200': (r) => r.status === 200,
    });

    if (res.status === 200) {
      try {
        const account = JSON.parse(res.body);

        check(account, {
          'Get account has correct id': (account) =>
            account.id === this.testAccountId,
          'Get account has name field': (account) =>
            account.name === this.testAccountName,
          'Get account has userId field': (account) =>
            account.userId === this.userId,
        });
      } catch (e) {
        console.error(`Error parsing account response: ${e.message}`);
      }
    }
  }

  findOneAccountNotFoundTest() {
    const randomId = uuidv4();
    const res = http.get(`${this.accountsApiUrl}${randomId}`, this.userParams);

    check(res, {
      'Get non-existent account is status 404': (r) => r.status === 404,
    });
  }

  findOneAccountUnauthorizedTest() {
    const res = http.get(
      `${this.accountsApiUrl}${this.testAccountId}`,
      this.unauthorizedParams,
    );

    check(res, {
      'Unauthorized get account by ID is status 401': (r) => r.status === 401,
    });
  }

  updateAccountTest() {
    const updateAccountDto = {
      name: this.updatedAccountName,
      description: 'Updated description',
      color: 'red',
    };

    const payload = JSON.stringify(updateAccountDto);
    const res = http.patch(
      `${this.accountsApiUrl}${this.testAccountId}`,
      payload,
      this.userParams,
    );

    check(res, {
      'Update account is status 200': (r) => r.status === 200,
    });

    if (res.status === 200) {
      try {
        const account = JSON.parse(res.body);

        check(account, {
          'Updated account has correct id': (account) =>
            account.id === this.testAccountId,
          'Updated account has correct name field': (account) =>
            account.name === this.updatedAccountName,
          'Updated account has correct description field': (account) =>
            account.description === 'Updated description',
          'Updated account has correct color field': (account) =>
            account.color === 'red',
        });

        // Update the test account name to reflect the change
        this.testAccountName = this.updatedAccountName;
      } catch (e) {
        console.error(`Error parsing account response: ${e.message}`);
      }
    }
  }

  updateAccountNotFoundTest() {
    const updateAccountDto = {
      name: 'Non-existent Account',
      description: 'This account should not exist',
    };

    const payload = JSON.stringify(updateAccountDto);
    const randomId = uuidv4();
    const res = http.patch(
      `${this.accountsApiUrl}${randomId}`,
      payload,
      this.userParams,
    );

    check(res, {
      'Update non-existent account is status 404': (r) => r.status === 404,
    });
  }

  updateAccountUnauthorizedTest() {
    const updateAccountDto = {
      name: 'Unauthorized Update',
    };

    const payload = JSON.stringify(updateAccountDto);
    const res = http.patch(
      `${this.accountsApiUrl}${this.testAccountId}`,
      payload,
      this.unauthorizedParams,
    );

    check(res, {
      'Unauthorized update account is status 401': (r) => r.status === 401,
    });
  }

  removeAccountTest() {
    const createAccountDto = {
      name: 'Account To Delete',
      description: 'This account will be deleted',
      currency: 'EUR',
      accountType: 'INVESTMENT',
    };

    const createPayload = JSON.stringify(createAccountDto);
    const createRes = http.post(
      this.accountsApiUrl,
      createPayload,
      this.userParams,
    );

    let accountToDeleteId: string | undefined;
    if (createRes.status === 201) {
      try {
        const account = createRes.json() as { id: string };
        accountToDeleteId = account.id;
      } catch (e) {
        console.error(`Error parsing account creation response: ${e.message}`);
      }
    }

    const res = http.del(
      `${this.accountsApiUrl}${accountToDeleteId}`,
      null,
      this.userParams,
    );

    check(res, {
      'Delete account is status 200': (r) => r.status === 200,
    });

    const getRes = http.get(
      `${this.accountsApiUrl}${accountToDeleteId}`,
      this.userParams,
    );

    check(getRes, {
      'Get deleted account is status 404': (r) => r.status === 404,
    });
  }

  removeAccountNotFoundTest() {
    const randomId = uuidv4();
    const res = http.del(
      `${this.accountsApiUrl}${randomId}`,
      null,
      this.userParams,
    );

    check(res, {
      'Delete non-existent account is status 404': (r) => r.status === 404,
    });
  }

  removeAccountUnauthorizedTest() {
    const res = http.del(
      `${this.accountsApiUrl}${this.testAccountId}`,
      null,
      this.unauthorizedParams,
    );

    check(res, {
      'Unauthorized delete account is status 401': (r) => r.status === 401,
    });
  }

  getAccountBalanceTest() {
    const res = http.get(
      `${this.accountsApiUrl}${this.testAccountId}/balance`,
      this.userParams,
    );

    check(res, {
      'Get account balance is status 200': (r) => r.status === 200,
    });

    if (res.status === 200) {
      try {
        const balanceData = JSON.parse(res.body);

        check(balanceData, {
          'Balance data has balance field': (data) => 'balance' in data,
          'Balance is a number': (data) => typeof data.balance === 'number',
        });
      } catch (e) {
        console.error(`Error parsing balance response: ${e.message}`);
      }
    }
  }

  getAccountBalanceNotFoundTest() {
    const randomId = uuidv4();
    const res = http.get(
      `${this.accountsApiUrl}${randomId}/balance`,
      this.userParams,
    );

    check(res, {
      'Get balance for non-existent account is status 404': (r) =>
        r.status === 404,
    });
  }

  getAccountBalanceUnauthorizedTest() {
    const res = http.get(
      `${this.accountsApiUrl}${this.testAccountId}/balance`,
      this.unauthorizedParams,
    );

    check(res, {
      'Unauthorized get account balance is status 401': (r) => r.status === 401,
    });
  }

  getTotalBalanceTest() {
    const res = http.get(
      `${this.accountsApiUrl}total-balance`,
      this.userParams,
    );

    console.log(res);

    check(res, {
      'Get total balance is status 200': (r) => r.status === 200,
    });

    if (res.status === 200) {
      try {
        const totalBalance = JSON.parse(res.body);

        check(totalBalance, {
          'Total balance is a number': (data) => typeof data === 'number',
        });
      } catch (e) {
        console.error(`Error parsing total balance response: ${e.message}`);
      }
    }
  }

  getTotalBalanceUnauthorizedTest() {
    const res = http.get(
      `${this.accountsApiUrl}total-balance`,
      this.unauthorizedParams,
    );

    check(res, {
      'Unauthorized get total balance is status 401': (r) => r.status === 401,
    });
  }
}
