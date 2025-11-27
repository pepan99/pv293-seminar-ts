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
  findAll(): Promise<SelectableUserWithRoles[]>;
  update(id: string, user: UpdateableUser): Promise<SelectableUser | undefined>;
  updateWithRoles(
    id: string,
    data: UpdateableUser & { roles: UserRole[] },
  ): Promise<SelectableUserWithRoles | undefined>;
  changePassword(id: string, password: string): Promise<unknown>;
  findOneWithPassword(
    id: string,
  ): Promise<(SelectableUserWithPassword & { roles: UserRole[] }) | undefined>;
  findByEmailWithPassword(
    email: string,
  ): Promise<(SelectableUserWithPassword & { roles: UserRole[] }) | undefined>;
  remove(id: string): Promise<boolean>;
}
