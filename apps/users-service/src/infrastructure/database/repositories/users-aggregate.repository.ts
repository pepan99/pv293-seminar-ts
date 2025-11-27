import { Injectable } from "@nestjs/common";
import { EventPublisher } from "@nestjs/cqrs";
import { Kysely } from "kysely";
import { DB } from "../../../core/types/db";
import { IUserAggregateRepository } from "../../../core/repositories/user-aggregate-repository.interface";
import { UserAggregate } from "../../../core/aggregates/users.aggregate";

@Injectable()
export class UserAggregateRepository implements IUserAggregateRepository {
  constructor(
    private readonly db: Kysely<DB>,
    private readonly publisher: EventPublisher,
  ) {}

  async findById(id: string): Promise<UserAggregate | null> {
    const userData = await this.db
      .selectFrom("users")
      .select(["id", "email", "name", "password", "createdAt", "updatedAt"])
      .where("id", "=", id)
      .executeTakeFirst();

    if (!userData) return null;

    const roles = await this.db
      .selectFrom("usersRoles")
      .select("role")
      .where("userId", "=", id)
      .execute();

    const userAggregate = this.publisher.mergeObjectContext(
      new UserAggregate(userData.id),
    );

    userAggregate.loadState({
      ...userData,
      roles: roles.map((r) => r.role),
    });

    return userAggregate;
  }

  async findByEmail(email: string): Promise<UserAggregate | null> {
    const userData = await this.db
      .selectFrom("users")
      .select(["id", "email", "name", "password", "createdAt", "updatedAt"])
      .where("email", "=", email)
      .executeTakeFirst();

    if (!userData) return null;

    const roles = await this.db
      .selectFrom("usersRoles")
      .select("role")
      .where("userId", "=", userData.id)
      .execute();

    const userAggregate = this.publisher.mergeObjectContext(
      new UserAggregate(userData.id),
    );

    userAggregate.loadState({
      ...userData,
      roles: roles.map((r) => r.role),
    });

    return userAggregate;
  }

  save(userAggregate: UserAggregate): void {
    userAggregate.commit();
  }

  saveWithTransaction(userAggregate: UserAggregate): void {
    userAggregate.commit();
  }

  async createUser(aggregate: UserAggregate): Promise<void> {
    const id = aggregate.id;
    const roles = aggregate.roles;

    await this.db.transaction().execute(async (trx) => {
      await trx
        .insertInto("users")
        .values({
          id,
          email: aggregate.email,
          name: aggregate.name,
          password: aggregate.password,
          createdAt: aggregate.createdAt,
          updatedAt: aggregate.updatedAt,
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
    });

    aggregate.commit();
  }

  async updateUser(aggregate: UserAggregate): Promise<void> {
    await this.db
      .updateTable("users")
      .set({
        email: aggregate.email,
        name: aggregate.name,
        updatedAt: aggregate.updatedAt,
      })
      .where("id", "=", aggregate.id)
      .execute();

    aggregate.commit();
  }

  async updateUserWithRoles(aggregate: UserAggregate): Promise<void> {
    const id = aggregate.id;
    const roles = aggregate.roles;

    await this.db.transaction().execute(async (trx) => {
      await trx
        .updateTable("users")
        .set({
          email: aggregate.email,
          name: aggregate.name,
          updatedAt: aggregate.updatedAt,
        })
        .where("id", "=", id)
        .execute();

      await trx.deleteFrom("usersRoles").where("userId", "=", id).execute();

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
    });

    aggregate.commit();
  }

  async updatePassword(aggregate: UserAggregate): Promise<void> {
    await this.db
      .updateTable("users")
      .set({
        password: aggregate.password,
        updatedAt: aggregate.updatedAt,
      })
      .where("id", "=", aggregate.id)
      .execute();

    aggregate.commit();
  }

  async removeUser(aggregate: UserAggregate): Promise<void> {
    await this.db.transaction().execute(async (trx) => {
      await trx
        .deleteFrom("usersRoles")
        .where("userId", "=", aggregate.id)
        .execute();

      await trx.deleteFrom("users").where("id", "=", aggregate.id).execute();
    });

    aggregate.commit();
  }
}
