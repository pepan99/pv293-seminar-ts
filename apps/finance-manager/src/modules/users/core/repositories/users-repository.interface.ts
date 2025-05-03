import {
  InsertableUser,
  SelectableUser,
  SelectableUserWithPassword,
  SelectableUserWithRoles,
  UpdateableUser,
} from '../types/types';
import { UserRole } from '../../../../shared-kernel/core/types/db';

export interface IUsersRepository {
  create(data: InsertableUser): Promise<SelectableUser>;

  findOne(id: string): Promise<SelectableUserWithRoles | undefined>;

  findByEmail(email: string): Promise<SelectableUserWithRoles | undefined>;

  findAll(): Promise<SelectableUserWithRoles[]>;

  update(id: string, data: UpdateableUser): Promise<SelectableUser | undefined>;

  changePassword(id: string, password: string): Promise<unknown>;

  updateWithRoles(
    id: string,
    data: UpdateableUser & { roles?: UserRole[] },
  ): Promise<SelectableUserWithRoles | undefined>;

  findAllWithPassword(): Promise<SelectableUserWithPassword[]>;

  findOneWithPassword(
    id: string,
  ): Promise<(SelectableUserWithPassword & { roles: UserRole[] }) | undefined>;

  findByEmailWithPassword(
    email: string,
  ): Promise<(SelectableUserWithPassword & { roles: UserRole[] }) | undefined>;

  remove(id: string): Promise<boolean>;
}
