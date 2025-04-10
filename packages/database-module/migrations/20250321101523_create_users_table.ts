import { Kysely, sql } from "kysely";
import { DB } from "../../../shared-kernel/core/types/db";

export async function up(db: Kysely<DB>): Promise<void> {
  await db.schema.createType("user_role").asEnum(["admin", "user"]).execute();

  await db.schema
    .createTable("users_roles")
    .addColumn("user_id", "text", (col) => col.notNull())
    .addColumn("role", sql`user_role`, (col) => col.notNull())
    .execute();

  await db.schema
    .createTable("users")
    .addColumn("id", "text", (col) => col.primaryKey().notNull())
    .addColumn("name", "text", (col) => col.notNull())
    .addColumn("email", "text", (col) => col.notNull().unique())
    .addColumn("password", "text", (col) => col.notNull())
    .addColumn("created_at", "timestamp", (col) =>
      col.notNull().defaultTo(sql`CURRENT_TIMESTAMP`),
    )
    .addColumn("updated_at", "timestamp", (col) =>
      col.notNull().defaultTo(sql`CURRENT_TIMESTAMP`),
    )
    .execute();

  await db.schema
    .createIndex("users_email_idx")
    .on("users")
    .column("email")
    .execute();
}

export async function down(db: Kysely<DB>): Promise<void> {
  await db.schema.dropIndex("users_email_idx").execute();
  await db.schema.dropTable("users").execute();
  await db.schema.dropTable("users_roles").execute();
  await db.schema.dropType("user_role").execute();
}
