import { UserRole } from '../../../shared-kernel/core/types/db';

export type AccessTokenPayload = {
  sub: string;
  email: string;
  roles: UserRole[];
};
