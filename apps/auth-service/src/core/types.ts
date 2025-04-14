import { UserRole } from "shared-kernel/src";

export type AccessTokenPayload = {
  sub: string;
  email: string;
  roles: UserRole[];
};
