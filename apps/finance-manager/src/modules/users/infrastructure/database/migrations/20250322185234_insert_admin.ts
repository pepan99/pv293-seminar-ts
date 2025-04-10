import { config } from 'dotenv';
import * as bcrypt from 'bcrypt';
import { ConfigService } from '@nestjs/config';
import { Kysely } from 'kysely';

config({ path: '../../../.env' });

const configService = new ConfigService();

export async function up(db: Kysely<unknown>) {
  const name: string | undefined = configService.get('ADMIN_NAME');
  const email: string | undefined = configService.get('ADMIN_EMAIL');
  const password: string | undefined = configService.get('ADMIN_PASSWORD');

  if (!name || !email || !password) {
    throw new Error('Define ADMIN_NAME, ADMIN_EMAIL and ADMIN_PASSWORD');
  }
  const hashedPassword = await bcrypt.hash(password, 10);

  const id = crypto.randomUUID();

  await db
    .insertInto('users')
    .values({
      id,
      email,
      password: hashedPassword,
      name,
    })
    .execute();

  await db
    .insertInto('usersRoles')
    .values({ userId: id, role: 'admin' })
    .execute();

  await db
    .insertInto('usersRoles')
    .values({ userId: id, role: 'user' })
    .execute();
}

export async function down(db: Kysely<unknown>) {
  const email: string | undefined = configService.get('ADMIN_EMAIL');
  if (!email) {
    throw new Error('Define ADMIN_EMAIL');
  }

  await db.deleteFrom('users').where('email', '=', email).execute();
}
