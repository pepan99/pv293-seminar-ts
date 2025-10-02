import {Kysely, sql} from 'kysely';
import {DB} from '../common/types/db';

export async function up(db: Kysely<DB>): Promise<void> {
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

export async function down(db: Kysely<DB>): Promise<void> {
  await sql`DROP TYPE account_type`.execute(db);
}
