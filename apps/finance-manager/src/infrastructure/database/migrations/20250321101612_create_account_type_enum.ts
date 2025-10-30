import { Kysely, sql } from 'kysely';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function up(db: Kysely<any>): Promise<void> {
  await sql`
    CREATE TYPE account_type AS ENUM (
      'CASH', 
      'BANK', 
      'CREDIT', 
      'INVESTMENT', 
      'ASSET', 
      'LIABILITY'
    )
  `.execute(db);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function down(db: Kysely<any>): Promise<void> {
  await sql`DROP TYPE account_type`.execute(db);
}
