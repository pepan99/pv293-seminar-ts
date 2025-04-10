import { Kysely, sql } from "kysely";
import { DB } from "../../../shared-kernel/core/types/db";

export async function up(db: Kysely<DB>): Promise<void> {
  await db.schema
    .createTable("accounts")
    .addColumn("id", "text", (col) => col.primaryKey().notNull())
    .addColumn("name", "text", (col) => col.notNull())
    .addColumn("description", "text")
    .addColumn("account_type", sql`account_type`, (col) => col.notNull())
    .addColumn("initial_balance", "numeric", (col) =>
      col.notNull().defaultTo(0),
    )
    .addColumn("currency", "text", (col) => col.notNull().defaultTo("EUR"))
    .addColumn("is_active", "boolean", (col) => col.notNull().defaultTo(true))
    .addColumn("last_reconciled", "timestamp")
    .addColumn("icon", "text")
    .addColumn("color", "text")
    .addColumn("user_id", "text", (col) =>
      col.notNull().references("users.id").onDelete("cascade"),
    )
    .addColumn("created_at", "timestamp", (col) =>
      col.notNull().defaultTo(sql`CURRENT_TIMESTAMP`),
    )
    .addColumn("updated_at", "timestamp", (col) =>
      col.notNull().defaultTo(sql`CURRENT_TIMESTAMP`),
    )
    .execute();

  // Create index on user_id for faster joins and lookups
  await db.schema
    .createIndex("accounts_user_id_idx")
    .on("accounts")
    .column("user_id")
    .execute();
}

export async function down(db: Kysely<DB>): Promise<void> {
  await db.schema.dropIndex("accounts_user_id_idx").execute();
  await db.schema.dropTable("accounts").execute();
}
