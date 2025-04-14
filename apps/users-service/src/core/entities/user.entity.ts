import { Selectable } from "kysely";
import { UserRole, Users } from "../../../shared-kernel/core/types/db";

export type UserWithRoles = Selectable<Users> & {
  roles: UserRole[];
};

export type UserWithoutPassword = Omit<UserWithRoles, "password">;

export type UserWithoutPasswordAndRoles = Omit<UserWithoutPassword, "roles">;
