import { config } from 'dotenv';
import * as bcrypt from 'bcrypt';
import { ConfigService } from '@nestjs/config';
import { Env } from '../modules/config/env';
import { Database } from '../modules/database/database';
import { EnvService } from '../modules/config/env.service';

config();

const configService = new ConfigService<Env, true>();
const envService = new EnvService(configService);

export async function up(db: Database) {
  const name = envService.get('ADMIN_NAME');
  const email = envService.get('ADMIN_EMAIL');
  const password = envService.get('ADMIN_PASSWORD');
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
    .insertInto('users_roles')
    .values({ user_id: id, role: 'admin' })
    .execute();
}

export async function down(db: Database) {
  const email = envService.get('ADMIN_EMAIL');

  await db.deleteFrom('users').where('email', '=', email).execute();
}
