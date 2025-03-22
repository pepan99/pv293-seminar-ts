import { Injectable } from '@nestjs/common';
import { Kysely } from 'kysely';
import { CreateUserDto } from '../dto/zod-dtos';
import { DB, UserRole } from '../../../common/types/db';
import { UserWithoutPassword, User } from '../entities/user.entity';

@Injectable()
export class UsersRepository {
  constructor(private readonly db: Kysely<DB>) {}

  async create(
    createUserDto: CreateUserDto & { password: string },
  ): Promise<UserWithoutPassword> {
    const result = await this.db
      .insertInto('users')
      .values({
        id: crypto.randomUUID(), // Generate a UUID for new users
        email: createUserDto.email,
        name: createUserDto.name,
        password: createUserDto.password,
      })
      .returning(['id', 'email', 'name', 'roles', 'createdAt', 'updatedAt'])
      .executeTakeFirstOrThrow();

    return {
      ...result,
    };
  }

  async findAll(): Promise<UserWithoutPassword[]> {
    const users = await this.db
      .selectFrom('users')
      .select(['id', 'email', 'name', 'roles', 'createdAt', 'updatedAt'])
      .execute();

    return users.map((user) => ({
      ...user,
      roles: user.roles,
    }));
  }

  async findOne(id: string): Promise<UserWithoutPassword | undefined> {
    const user = await this.db
      .selectFrom('users')
      .select(['id', 'email', 'name', 'roles', 'createdAt', 'updatedAt'])
      .where('id', '=', id)
      .executeTakeFirst();

    if (!user) return undefined;

    return {
      ...user,
      roles: user.roles as UserRole[], // Already typed correctly from DB
    };
  }

  async findOneWithPassword(id: string): Promise<User | undefined> {
    const user = await this.db
      .selectFrom('users')
      .selectAll()
      .where('id', '=', id)
      .executeTakeFirst();

    if (!user) return undefined;

    return {
      ...user,
      roles: user.roles,
    };
  }

  async findByEmail(email: string): Promise<UserWithoutPassword | undefined> {
    const user = await this.db
      .selectFrom('users')
      .select(['id', 'email', 'name', 'roles', 'createdAt', 'updatedAt'])
      .where('email', '=', email)
      .executeTakeFirst();

    if (!user) return undefined;

    return {
      ...user,
      roles: user.roles,
    };
  }

  async findByEmailWithPassword(email: string): Promise<User | undefined> {
    const user = await this.db
      .selectFrom('users')
      .selectAll()
      .where('email', '=', email)
      .executeTakeFirst();

    if (!user) return undefined;

    return {
      ...user,
      roles: user.roles,
    };
  }

  async update(
    id: string,
    userData: Partial<User> & { id: string },
  ): Promise<UserWithoutPassword | undefined> {
    const { password: _, ...updateData } = userData;

    const result = await this.db
      .updateTable('users')
      .set({
        ...updateData,
        updatedAt: new Date(),
      })
      .where('id', '=', id)
      .returning(['id', 'email', 'name', 'roles', 'createdAt', 'updatedAt'])
      .executeTakeFirst();

    if (!result) return undefined;

    return {
      ...result,
      roles: result.roles as UserRole[], // Already typed correctly from DB
    };
  }

  async updatePassword(id: string, password: string): Promise<void> {
    await this.db
      .updateTable('users')
      .set({
        password,
        updatedAt: new Date(),
      })
      .where('id', '=', id)
      .execute();
  }

  async remove(id: string): Promise<void> {
    await this.db.deleteFrom('users').where('id', '=', id).execute();
  }
}
