import { group } from 'k6';
import authTestAll from './auth/auth-test-all.ts';
import usersTestAll from './users/users-test-all.ts';

export const options = {
  thresholds: {
    checks: ['rate>=1.0'], // Only fail if checks fail
  },
};

export default function () {
  group('All tests', function () {
    authTestAll();
    usersTestAll();
  });
}
