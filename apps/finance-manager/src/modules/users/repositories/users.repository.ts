import { Injectable } from '@nestjs/common';
import { CreateUserDto } from '../dto/zod-dtos';
import { UserWithoutPassword, User } from '../entities/user.entity';
import { Database } from '../../database/database';

@Injectable()
export class UsersRepository {
  constructor(private readonly db: Database) {}

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

    return result;
  }

  async findAll(): Promise<UserWithoutPassword[]> {
    const users = await this.db
      .selectFrom('users')
      .select(['id', 'email', 'name', 'roles', 'createdAt', 'updatedAt'])
      .execute();

    return users;
  }

  async findOne(id: string): Promise<UserWithoutPassword | undefined> {
    const user = await this.db
      .selectFrom('users')
      .select(['id', 'email', 'name', 'roles', 'createdAt', 'updatedAt'])
      .where('id', '=', id)
      .executeTakeFirst();

    if (!user) return undefined;

    return user;
  }

  async findOneWithPassword(id: string): Promise<User | undefined> {
    const user = await this.db
      .selectFrom('users')
      .selectAll()
      .where('id', '=', id)
      .executeTakeFirst();

    if (!user) return undefined;

    return user;
  }

  async findByEmail(email: string): Promise<UserWithoutPassword | undefined> {
    const user = await this.db
      .selectFrom('users')
      .select(['id', 'email', 'name', 'roles', 'createdAt', 'updatedAt'])
      .where('email', '=', email)
      .executeTakeFirst();

    if (!user) return undefined;

    return user;
  }

  async findByEmailWithPassword(email: string): Promise<User | undefined> {
    const user = await this.db
      .selectFrom('users')
      .selectAll()
      .where('email', '=', email)
      .executeTakeFirst();

    if (!user) return undefined;

    return user;
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

    return result;
  }

  async updatePassword(id: string, password: string) {
    const result = await this.db
      .updateTable('users')
      .set({
        password,
        updatedAt: new Date(),
      })
      .where('id', '=', id)
      .execute();

    return result;
  }

  async remove(id: string) {
    const result = await this.db
      .deleteFrom('users')
      .where('id', '=', id)
      .execute();

    return result;
  }
}
