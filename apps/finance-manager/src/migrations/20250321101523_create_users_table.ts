import {Kysely, sql} from 'kysely';

export async function up(db: Kysely<any>): Promise<void> {
  // Migration code
  await db.schema.createType('role').asEnum(['user', 'admin']).execute();

  await db.schema
    .createTable('users')
    .addColumn('id', 'varchar', (col) => col.primaryKey().notNull())
    .addColumn('name', 'varchar', (col) => col.notNull())
    .addColumn('email', 'varchar', (col) => col.notNull().unique())
    .addColumn('password', 'varchar', (col) => col.notNull())
    .addColumn('role', sql`role`, (col) => col.notNull())
    .addColumn('createdAt', 'timestamp', (col) =>
      col.notNull().defaultTo(sql`now()`),
    )
    .addColumn('updatedAt', 'timestamp', (col) =>
      col.notNull().defaultTo(sql`now()`),
    )
    .execute();
}

export async function down(db: Kysely<any>): Promise<void> {
  // Migration code
  await db.schema.dropTable('users').execute();
  await db.schema.dropType('role').execute();
}
