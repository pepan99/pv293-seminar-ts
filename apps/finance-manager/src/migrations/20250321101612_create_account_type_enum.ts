import {Kysely} from 'kysely';

export async function up(db: Kysely<any>): Promise<void> {
  // Migration code
  await db.schema
    .createType('account_type')
    .asEnum(['CASH', 'BANK', 'CREDIT', 'INVESTMENT', 'ASSET', 'LIABILITY'])
    .execute();
}

export async function down(db: Kysely<any>): Promise<void> {
  // Migration code
  await db.schema.dropType('account_type').execute();
}
