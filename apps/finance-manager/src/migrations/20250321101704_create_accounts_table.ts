import {Kysely, sql} from 'kysely';

export async function up(db: Kysely<any>): Promise<void> {
  // Migration code
  await db.schema
    .createTable('accounts')
    .addColumn('id', 'varchar', (col) => col.primaryKey().notNull())
    .addColumn('name', 'varchar', (col) => col.notNull())
    .addColumn('description', 'varchar', (col) => col.notNull())
    .addColumn('accountType', sql`account_type`, (col) => col.notNull())
    .addColumn('initialBalance', 'numeric', (col) => col.notNull())
    .addColumn('currency', 'varchar', (col) => col.notNull())
    .addColumn('isActive', 'boolean', (col) => col.notNull().defaultTo(true))
    .addColumn('lastReconciled', 'timestamp', (col) => col.notNull())
    .addColumn('icon', 'varchar', (col) => col)
    .addColumn('color', 'varchar', (col) => col)
    .addColumn('userId', 'varchar', (col) =>
      col.notNull().references('users.id').onDelete('cascade'),
    )
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
  await db.schema.dropTable('accounts').execute();
}
