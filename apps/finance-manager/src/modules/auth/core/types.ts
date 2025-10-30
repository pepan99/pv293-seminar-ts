import { UserRole } from '../../../shared/types/db';

export type AccessTokenPayload = {
  sub: string;
  email: string;
  roles: UserRole[];
};
