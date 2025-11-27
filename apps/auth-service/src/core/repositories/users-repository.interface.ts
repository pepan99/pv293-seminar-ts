import { UserRole } from "../types/db";
import {
  InsertableUser,
  SelectableUser,
  SelectableUserWithPassword,
  SelectableUserWithRoles,
  UpdateableUser,
} from "../types/types";

export interface IUsersRepository {
  create(user: InsertableUser): Promise<SelectableUser>;
  findOne(id: string): Promise<SelectableUserWithRoles | undefined>;
  findByEmail(email: string): Promise<SelectableUserWithRoles | undefined>;
  findByEmailWithPassword(
    email: string,
  ): Promise<(SelectableUserWithPassword & { roles: UserRole[] }) | undefined>;
  update(id: string, user: UpdateableUser): Promise<SelectableUser | undefined>;
}
