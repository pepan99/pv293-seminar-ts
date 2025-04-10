import { Injectable } from '@nestjs/common';
import { Database } from '../../../../../infrastructure/database/database';
import {
  UserWithoutPassword,
  UserWithRoles,
} from '../../../core/entities/user.entity';
import { UserRole } from '../../../../../shared-kernel/core/types/db';
import {
  CreateUserDto,
  UpdateUserAdminDto,
  UpdateUserDto,
} from '../../../api/dto/zod-dtos';

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
          createdAt: new Date(),
          updatedAt: new Date(),
        })
        .execute();

      if (roles.length > 0) {
        await trx
          .insertInto('usersRoles')
          .values(
            roles.map((role) => ({
              userId: id,
              role,
            })),
          )
          .execute();
      }

      const user = await trx
        .selectFrom('users')
        .select(['id', 'email', 'name', 'updatedAt', 'createdAt'])
        .where('id', '=', id)
        .executeTakeFirst();

      if (!user) throw Error('Unable to create user');

      const userRoles = await trx
        .selectFrom('usersRoles')
        .select('role')
        .where('userId', '=', id)
        .execute();

      return { ...user, roles: userRoles.map((role) => role.role) };
    });
  }

  async findOne(id: string): Promise<UserWithoutPassword | null> {
    const user = await this.db
      .selectFrom('users')
      .select(['id', 'email', 'name', 'updatedAt', 'createdAt'])
      .where('id', '=', id)
      .executeTakeFirst();

    if (!user) return null;

    const roles = await this.db
      .selectFrom('usersRoles')
      .select('role')
      .where('userId', '=', id)
      .execute();

    return { ...user, roles: roles.map((role) => role.role) };
  }

  async findByEmail(email: string): Promise<UserWithoutPassword | null> {
    const user = await this.db
      .selectFrom('users')
      .select(['id', 'email', 'name', 'updatedAt', 'createdAt'])
      .where('email', '=', email)
      .executeTakeFirst();

    if (!user) return null;

    const roles = await this.db
      .selectFrom('usersRoles')
      .select('role')
      .where('userId', '=', user.id)
      .execute();

    return { ...user, roles: roles.map((role) => role.role) };
  }

  async findAll(): Promise<UserWithoutPassword[]> {
    const users = await this.db
      .selectFrom('users')
      .select(['id', 'email', 'name', 'createdAt', 'updatedAt'])
      .execute();

    const userIds = users.map((user) => user.id);

    const rolesMap = new Map<string, UserRole[]>();
    if (userIds.length > 0) {
      const roles = await this.db
        .selectFrom('usersRoles')
        .select(['userId', 'role'])
        .where('userId', 'in', userIds)
        .execute();

      for (const role of roles) {
        const userRoles = rolesMap.get(role.userId) || [];
        userRoles.push(role.role);
        rolesMap.set(role.userId, userRoles);
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
      .set({ ...data, updatedAt: new Date() })
      .where('id', '=', id)
      .returning(['id', 'email', 'name', 'createdAt', 'updatedAt'])
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
      .set({ password, updatedAt: new Date() })
      .where('id', '=', id)
      .executeTakeFirst();

    return updatedUser;
  }

  async updateWithRoles(
    id: string,
    data: UpdateUserAdminDto,
  ): Promise<UserWithoutPassword | null> {
    const { roles, ...userData } = data;
    return await this.db.transaction().execute(async (trx) => {
      const userResult = await trx
        .updateTable('users')
        .set({
          ...userData,
          updatedAt: new Date(),
        })
        .where('id', '=', id)
        .returning(['id', 'email', 'name', 'createdAt', 'updatedAt'])
        .executeTakeFirst();

      if (!userResult) {
        return null;
      }

      await trx.deleteFrom('usersRoles').where('userId', '=', id).execute();

      const roleResults = await trx
        .insertInto('usersRoles')
        .values(
          roles.map((role) => ({
            userId: id,
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
      .leftJoin('usersRoles', 'users.id', 'usersRoles.userId')
      .select([
        'users.id',
        'users.email',
        'users.name',
        'users.password',
        'users.createdAt',
        'users.updatedAt',
      ])
      .groupBy('users.id')
      .execute();

    const userIds = users.map((user) => user.id);

    const rolesMap = new Map<string, UserRole[]>();
    if (userIds.length > 0) {
      const roles = await this.db
        .selectFrom('usersRoles')
        .select(['userId', 'role'])
        .where('userId', 'in', userIds)
        .execute();

      for (const role of roles) {
        const userRoles = rolesMap.get(role.userId) || [];
        userRoles.push(role.role);
        rolesMap.set(role.userId, userRoles);
      }
    }

    return users.map((user) => ({
      ...user,
      roles: rolesMap.get(user.id) || [],
    }));
  }

  async findOneWithPassword(
    id: string,
  ): Promise<(UserWithRoles & { password: string }) | null> {
    const user = await this.db
      .selectFrom('users')
      .select([
        'users.id',
        'users.email',
        'users.name',
        'users.password',
        'users.createdAt',
        'users.updatedAt',
      ])
      .where('users.id', '=', id)
      .groupBy('users.id')
      .executeTakeFirst();

    if (!user) return null;

    const roles = await this.db
      .selectFrom('usersRoles')
      .select('role')
      .where('userId', '=', user.id)
      .execute();

    return {
      ...user,
      roles: roles.map((role) => role.role),
    };
  }

  async findByEmailWithPassword(email: string): Promise<UserWithRoles | null> {
    const user = await this.db
      .selectFrom('users')
      .leftJoin('usersRoles', 'users.id', 'usersRoles.userId')
      .select([
        'users.id',
        'users.email',
        'users.name',
        'users.password',
        'users.createdAt',
        'users.updatedAt',
      ])
      .where('users.email', '=', email)
      .groupBy('users.id')
      .executeTakeFirst();

    if (!user) return null;

    const roles = await this.db
      .selectFrom('usersRoles')
      .select('role')
      .where('userId', '=', user.id)
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
