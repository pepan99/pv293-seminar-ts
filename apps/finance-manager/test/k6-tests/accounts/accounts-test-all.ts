// @ts-nocheck

import { group } from "k6";
import { AccountsTests } from "./accounts-test-methods.ts";
import http from "k6/http";

const tests = new AccountsTests();

// Initialize test setup
export function setup() {
    tests.setupAuth();
}

// in terminal run "k6 run <path-to-script>"
export default function () {
    group("Accounts API Tests", function () {
        const userProfileCheck = http.get(`${tests.baseUrl}users/profile`, tests.userParams);

        if (userProfileCheck.status !== 200) {
            tests.setupAuth();
        }
        group("Account Creation Tests", function () {
            group("Create Account Test", function () {
                tests.createAccountTest();
            });
            group("Create Account Unauthorized Test", function () {
                tests.createAccountUnauthorizedTest();
            });
        });

        group("Account Retrieval Tests", function () {
            group("Find All Accounts Test", function () {
                tests.findAllAccountsTest();
            });
            group("Find All Accounts Unauthorized Test", function () {
                tests.findAllAccountsUnauthorizedTest();
            });
            group("Find One Account Test", function () {
                tests.findOneAccountTest();
            });
            group("Find One Account Not Found Test", function () {
                tests.findOneAccountNotFoundTest();
            });
            group("Find One Account Unauthorized Test", function () {
                tests.findOneAccountUnauthorizedTest();
            });
        });

        group("Account Update Tests", function () {
            group("Update Account Test", function () {
                tests.updateAccountTest();
            });
            group("Update Account Not Found Test", function () {
                tests.updateAccountNotFoundTest();
            });
            group("Update Account Unauthorized Test", function () {
                tests.updateAccountUnauthorizedTest();
            });
        });

        group("Account Balance Tests", function () {
            group("Get Account Balance Test", function () {
                tests.getAccountBalanceTest();
            });
            group("Get Account Balance Not Found Test", function () {
                tests.getAccountBalanceNotFoundTest();
            });
            group("Get Account Balance Unauthorized Test", function () {
                tests.getAccountBalanceUnauthorizedTest();
            });
            group("Get Total Balance Test", function () {
                tests.getTotalBalanceTest();
            });
            group("Get Total Balance Unauthorized Test", function () {
                tests.getTotalBalanceUnauthorizedTest();
            });
        });
        group("Account Deletion Tests", function () {
            group("Remove Account Test", function () {
                tests.removeAccountTest();
            });
            group("Remove Account Not Found Test", function () {
                tests.removeAccountNotFoundTest();
            });
            group("Remove Account Unauthorized Test", function () {
                tests.removeAccountUnauthorizedTest();
            });
        });
    });
}

// Clean up test resources
export function teardown() {
    tests.cleanupTestUser();
}
