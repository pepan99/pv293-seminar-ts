import {Injectable} from '@nestjs/common';
import {Database} from '../../database/database';
import {Insertable, Selectable, Updateable, UpdateResult} from 'kysely';
import {Role, Users} from '../../../common/types/db';
import {UserWithoutPassword} from '../entities/user.entity';
import * as crypto from 'crypto';

type UserInsertable = Insertable<Omit<Users, 'id' | 'role'>>;
type UserUpdateable = Updateable<Users>;
type UserSelectable = Selectable<Users>;

@Injectable()
export class UsersRepository {
  constructor(private readonly db: Database) {}

  async create(data: UserInsertable): Promise<UserWithoutPassword> {
    const id = crypto.randomUUID();
    const role = 'user';

    return await this.db.transaction().execute(async (trx) => {
      await trx
        .insertInto('users')
        .values({
          ...data,
          id,
          role,
          createdAt: new Date(),
          updatedAt: new Date(),
        })
        .execute();

      const user = await trx
        .selectFrom('users')
        .select(['id', 'email', 'name', 'role', 'updatedAt', 'createdAt'])
        .where('id', '=', id)
        .executeTakeFirst();

      if (!user) {
        throw Error('Unable to create user');
      }

      return {...user, roles: user?.role ? [user.role] : []};
    });
  }

  async findOne(id: string): Promise<UserWithoutPassword | undefined> {
    const user = await this.db
      .selectFrom('users')
      .select(['id', 'email', 'name', 'role', 'updatedAt', 'createdAt'])
      .where('id', '=', id)
      .executeTakeFirst();

    return user
      ? {
          ...user,
          roles: user?.role ? [user.role] : [],
        }
      : undefined;
  }

  async findByEmail(email: string): Promise<UserWithoutPassword | undefined> {
    const user = await this.db
      .selectFrom('users')
      .select(['id', 'email', 'name', 'role', 'updatedAt', 'createdAt'])
      .where('email', '=', email)
      .executeTakeFirst();

    return user
      ? {
          ...user,
          roles: user?.role ? [user.role] : [],
        }
      : undefined;
  }

  async findAll(): Promise<UserWithoutPassword[]> {
    const users = await this.db
      .selectFrom('users')
      .select(['id', 'email', 'name', 'role', 'updatedAt', 'createdAt'])
      .execute();

    return users.map((user) => ({
      ...user,
      roles: user?.role ? [user.role] : [],
    }));
  }

  async update(
    id: string,
    data: UserUpdateable,
  ): Promise<UserWithoutPassword | undefined> {
    const user = await this.findOne(id);

    if (!user) {
      throw new Error(`User with ID ${id} not found`);
    }

    const updatedUser = await this.db
      .updateTable('users')
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where('id', '=', id)
      .returning(['id', 'email', 'name', 'role', 'updatedAt', 'createdAt'])
      .executeTakeFirst();

    return updatedUser
      ? {
          ...updatedUser,
          roles: updatedUser?.role ? [updatedUser.role] : [],
        }
      : undefined;
  }

  async changePassword(
    id: string,
    newPassword: string,
  ): Promise<UpdateResult | undefined> {
    const user = await this.findOne(id);

    if (!user) {
      throw new Error(`User with ID ${id} not found`);
    }

    const updatedUser = await this.db
      .updateTable('users')
      .set({
        password: newPassword,
        updatedAt: new Date(),
      })
      .where('id', '=', id)

      .executeTakeFirst();

    return updatedUser;
  }

  async updateWithRoles(
    id: string,
    data: UserUpdateable,
  ): Promise<UserWithoutPassword | undefined> {
    const user = await this.findOne(id);

    if (!user) {
      throw new Error(`User with ID ${id} not found`);
    }

    const {role: newRole, ...userData} = data;

    const updatedUser = await this.db
      .updateTable('users')
      .set({
        ...userData,
        role: newRole ?? (user.roles?.[0] as Role) ?? 'user',
        updatedAt: new Date(),
      })
      .where('id', '=', id)
      .returning(['id', 'email', 'name', 'role', 'updatedAt', 'createdAt'])
      .executeTakeFirst();

    return updatedUser
      ? {
          ...updatedUser,
          roles: updatedUser?.role ? [updatedUser.role] : [],
        }
      : undefined;
  }

  async findAllWithPassword(): Promise<UserSelectable[]> {
    const users = await this.db
      .selectFrom('users')
      .select([
        'id',
        'email',
        'name',
        'role',
        'password',
        'updatedAt',
        'createdAt',
      ])
      .execute();

    return users;
    /*.map((user) => ({
      ...user,
    }));*/
  }

  async findOneWithPassword(
    email: string,
  ): Promise<UserSelectable | undefined> {
    const user = await this.db
      .selectFrom('users')
      .select([
        'id',
        'email',
        'name',
        'role',
        'password',
        'updatedAt',
        'createdAt',
      ])
      .where('email', '=', email)
      .executeTakeFirst();

    return user
      ? {
          ...user,
        }
      : undefined;
  }

  async findByEmailWithPassword(
    email: string,
  ): Promise<UserSelectable | undefined> {
    const user = await this.db
      .selectFrom('users')
      .select([
        'id',
        'email',
        'name',
        'role',
        'password',
        'updatedAt',
        'createdAt',
      ])
      .where('email', '=', email)
      .executeTakeFirst();

    return user
      ? {
          ...user,
          role: user?.role ?? 'user',
        }
      : undefined;
  }

  async remove(id: string): Promise<boolean> {
    const user = await this.findOne(id);

    if (!user) {
      throw new Error(`User with ID ${id} not found`);
    }

    await this.db.deleteFrom('users').where('id', '=', id).execute();
    return true;
  }
}
