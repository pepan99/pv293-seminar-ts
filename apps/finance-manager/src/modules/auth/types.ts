import { UserRole } from '../../common/types/db';

export type AccessTokenPayload = {
  sub: string;
  email: string;
  roles: UserRole[];
};
