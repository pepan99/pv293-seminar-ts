import { Injectable } from '@nestjs/common';
import { UserWithoutPassword, UserWithRoles } from '../entities/user.entity';
import { Database } from '../../database/database';
import { UserRole } from '../../../common/types/db';
import {
  CreateUserDto,
  UpdateUserAdminDto,
  UpdateUserDto,
} from '../dto/zod-dtos';

@Injectable()
export class UsersRepository {
  constructor(private readonly db: Database) {}

  async create(data: CreateUserDto): Promise<UserWithoutPassword> {
    const id = crypto.randomUUID();
    const roles = ['user'] as UserRole[];

    return await this.db.transaction().execute(async (trx) => {
      await trx
        .insertInto('users')
        .values({
          id,
          ...data,
          created_at: new Date(),
          updated_at: new Date(),
        })
        .execute();

      if (roles.length > 0) {
        await trx
          .insertInto('users_roles')
          .values(
            roles.map((role) => ({
              user_id: id,
              role,
            })),
          )
          .execute();
      }

      const user = await trx
        .selectFrom('users')
        .select(['id', 'email', 'name', 'updated_at', 'created_at'])
        .where('id', '=', id)
        .executeTakeFirst();

      if (!user) throw Error('Unable to create user');

      const userRoles = await trx
        .selectFrom('users_roles')
        .select('role')
        .where('user_id', '=', id)
        .execute();

      return { ...user, roles: userRoles.map((role) => role.role) };
    });
  }

  async findOne(id: string): Promise<UserWithoutPassword | undefined> {
    const user = await this.db
      .selectFrom('users')
      .select(['id', 'email', 'name', 'updated_at', 'created_at'])
      .where('id', '=', id)
      .executeTakeFirst();

    if (!user) return undefined;

    const roles = await this.db
      .selectFrom('users_roles')
      .select('role')
      .where('user_id', '=', id)
      .execute();

    return { ...user, roles: roles.map((role) => role.role) };
  }

  async findByEmail(email: string): Promise<UserWithoutPassword | undefined> {
    const user = await this.db
      .selectFrom('users')
      .select(['id', 'email', 'name', 'updated_at', 'created_at'])
      .where('email', '=', email)
      .executeTakeFirst();

    if (!user) return undefined;

    const roles = await this.db
      .selectFrom('users_roles')
      .select('role')
      .where('user_id', '=', user.id)
      .execute();

    return { ...user, roles: roles.map((role) => role.role) };
  }

  async findAll(): Promise<UserWithoutPassword[]> {
    const users = await this.db
      .selectFrom('users')
      .select(['id', 'email', 'name', 'created_at', 'updated_at'])
      .execute();

    const userIds = users.map((user) => user.id);

    const rolesMap = new Map<string, UserRole[]>();
    if (userIds.length > 0) {
      const roles = await this.db
        .selectFrom('users_roles')
        .select(['user_id', 'role'])
        .where('user_id', 'in', userIds)
        .execute();

      for (const role of roles) {
        const userRoles = rolesMap.get(role.user_id) || [];
        userRoles.push(role.role);
        rolesMap.set(role.user_id, userRoles);
      }
    }

    return users.map((user) => ({
      ...user,
      roles: rolesMap.get(user.id) || [],
    }));
  }

  async update(id: string, data: UpdateUserDto) {
    const user = await this.findOne(id);
    if (!user) {
      throw new Error(`User with ID ${id} not found`);
    }

    const updatedUser = await this.db
      .updateTable('users')
      .set({ ...data, updated_at: new Date() })
      .where('id', '=', id)
      .returning(['id', 'email', 'name', 'created_at', 'updated_at'])
      .executeTakeFirst();

    return updatedUser;
  }

  async changePassword(id: string, password: string) {
    const user = await this.findOne(id);
    if (!user) {
      throw new Error(`User with ID ${id} not found`);
    }
    const updatedUser = await this.db
      .updateTable('users')
      .set({ password, updated_at: new Date() })
      .where('id', '=', id)
      .executeTakeFirst();

    return updatedUser;
  }

  async updateWithRoles(
    id: string,
    data: UpdateUserAdminDto,
  ): Promise<UserWithoutPassword | undefined> {
    const { roles, ...userData } = data;
    return await this.db.transaction().execute(async (trx) => {
      const userResult = await trx
        .updateTable('users')
        .set({
          ...userData,
          updated_at: new Date(),
        })
        .where('id', '=', id)
        .returning(['id', 'email', 'name', 'created_at', 'updated_at'])
        .executeTakeFirst();

      if (!userResult) {
        return undefined;
      }

      await trx.deleteFrom('users_roles').where('user_id', '=', id).execute();

      const roleResults = await trx
        .insertInto('users_roles')
        .values(
          roles.map((role) => ({
            user_id: id,
            role: role as UserRole,
          })),
        )
        .returning('role')
        .execute();

      return {
        ...userResult,
        roles: roleResults.map((roleResult) => roleResult.role),
      };
    });
  }

  async findAllWithPassword(): Promise<
    (UserWithRoles & { password: string })[]
  > {
    const users = await this.db
      .selectFrom('users')
      .leftJoin('users_roles', 'users.id', 'users_roles.user_id')
      .select([
        'users.id',
        'users.email',
        'users.name',
        'users.password',
        'users.created_at',
        'users.updated_at',
      ])
      .groupBy('users.id')
      .execute();

    const userIds = users.map((user) => user.id);

    const rolesMap = new Map<string, UserRole[]>();
    if (userIds.length > 0) {
      const roles = await this.db
        .selectFrom('users_roles')
        .select(['user_id', 'role'])
        .where('user_id', 'in', userIds)
        .execute();

      for (const role of roles) {
        const userRoles = rolesMap.get(role.user_id) || [];
        userRoles.push(role.role);
        rolesMap.set(role.user_id, userRoles);
      }
    }

    return users.map((user) => ({
      ...user,
      roles: rolesMap.get(user.id) || [],
    }));
  }

  async findOneWithPassword(
    id: string,
  ): Promise<(UserWithRoles & { password: string }) | undefined> {
    const user = await this.db
      .selectFrom('users')
      .select([
        'users.id',
        'users.email',
        'users.name',
        'users.password',
        'users.created_at',
        'users.updated_at',
      ])
      .where('users.id', '=', id)
      .groupBy('users.id')
      .executeTakeFirst();

    if (!user) return undefined;

    const roles = await this.db
      .selectFrom('users_roles')
      .select('role')
      .where('user_id', '=', user.id)
      .execute();

    return {
      ...user,
      roles: roles.map((role) => role.role),
    };
  }

  async findByEmailWithPassword(
    email: string,
  ): Promise<UserWithRoles | undefined> {
    const user = await this.db
      .selectFrom('users')
      .leftJoin('users_roles', 'users.id', 'users_roles.user_id')
      .select([
        'users.id',
        'users.email',
        'users.name',
        'users.password',
        'users.created_at',
        'users.updated_at',
      ])
      .where('users.email', '=', email)
      .groupBy('users.id')
      .executeTakeFirst();

    if (!user) return undefined;

    const roles = await this.db
      .selectFrom('users_roles')
      .select('role')
      .where('user_id', '=', user.id)
      .execute();
    return {
      ...user,
      roles: roles.map((role) => role.role),
    };
  }

  async remove(id: string) {
    const user = await this.findOne(id);
    if (!user) {
      throw new Error(`User with ID ${id} not found`);
    }

    await this.db.deleteFrom('users').where('id', '=', id).executeTakeFirst();

    return true;
  }
}
