import { group } from 'k6';
import usersTestAll from './users/users-test-all.ts';
import authTestAll from './auth/auth-test-all.ts';

export default function () {
  group('All tests', function () {
    authTestAll();
    usersTestAll();
  });
}
