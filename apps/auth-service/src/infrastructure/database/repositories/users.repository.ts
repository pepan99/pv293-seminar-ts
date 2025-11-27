import { Injectable } from "@nestjs/common";
import { IUsersRepository } from "../../../core/repositories/users-repository.interface";
import {
  InsertableUser,
  SelectableUser,
  SelectableUserWithPassword,
  SelectableUserWithRoles,
  UpdateableUser,
} from "../../../core/types/types";
import { DB, UserRole } from "../../../core/types/db";
import { Kysely } from "kysely";

@Injectable()
export class UsersRepository implements IUsersRepository {
  constructor(private readonly db: Kysely<DB>) {}

  async create(data: InsertableUser): Promise<SelectableUser> {
    const id = crypto.randomUUID();
    const roles = ["user"] as UserRole[];

    return await this.db.transaction().execute(async (trx) => {
      await trx
        .insertInto("users")
        .values({
          id,
          ...data,
          createdAt: new Date(),
          updatedAt: new Date(),
        })
        .execute();

      if (roles.length > 0) {
        await trx
          .insertInto("usersRoles")
          .values(
            roles.map((role) => ({
              userId: id,
              role,
            })),
          )
          .execute();
      }

      const user = await trx
        .selectFrom("users")
        .select(["id", "email", "name", "updatedAt", "createdAt"])
        .where("id", "=", id)
        .executeTakeFirst();

      if (!user) throw Error("Unable to create user");

      const userRoles = await trx
        .selectFrom("usersRoles")
        .select("role")
        .where("userId", "=", id)
        .execute();

      return { ...user, roles: userRoles.map((role) => role.role) };
    });
  }

  async findOne(id: string): Promise<SelectableUserWithRoles | undefined> {
    const user = await this.db
      .selectFrom("users")
      .select(["id", "email", "name", "updatedAt", "createdAt"])
      .where("id", "=", id)
      .executeTakeFirst();

    if (!user) return undefined;

    const roles = await this.db
      .selectFrom("usersRoles")
      .select("role")
      .where("userId", "=", id)
      .execute();

    return { ...user, roles: roles.map((role) => role.role) };
  }

  async findByEmail(
    email: string,
  ): Promise<SelectableUserWithRoles | undefined> {
    const user = await this.db
      .selectFrom("users")
      .select(["id", "email", "name", "updatedAt", "createdAt"])
      .where("email", "=", email)
      .executeTakeFirst();

    if (!user) return undefined;

    const roles = await this.db
      .selectFrom("usersRoles")
      .select("role")
      .where("userId", "=", user.id)
      .execute();

    return { ...user, roles: roles.map((role) => role.role) };
  }

  async findByEmailWithPassword(
    email: string,
  ): Promise<(SelectableUserWithPassword & { roles: UserRole[] }) | undefined> {
    const user = await this.db
      .selectFrom("users")
      .select([
        "users.id",
        "users.email",
        "users.name",
        "users.password",
        "users.createdAt",
        "users.updatedAt",
      ])
      .where("users.email", "=", email)
      .executeTakeFirst();

    if (!user) return undefined;

    const roles = await this.db
      .selectFrom("usersRoles")
      .select("role")
      .where("userId", "=", user.id)
      .execute();
    return {
      ...user,
      roles: roles.map((role) => role.role),
    };
  }

  async update(id: string, data: UpdateableUser) {
    const user = await this.findOne(id);
    if (!user) {
      throw new Error(`User with ID ${id} not found`);
    }

    const updatedUser = await this.db
      .updateTable("users")
      .set({ ...data, updatedAt: new Date() })
      .where("id", "=", id)
      .returning(["id", "email", "name", "createdAt", "updatedAt"])
      .executeTakeFirst();

    return updatedUser;
  }
}
