import {Kysely} from 'kysely';
import {EnvService} from '../modules/config/env.service';
import {config} from 'dotenv';
import {Env} from '../modules/config/env';
import {ConfigService} from '@nestjs/config/dist/config.service';
import * as bcrypt from 'bcrypt';

config();

const configService = new ConfigService<Env, true>();
const envService = new EnvService(configService);
const adminId = 'admin-id';

export async function up(db: Kysely<any>): Promise<void> {
  // Migration code
  const name = envService.get('ADMIN_NAME');
  const email = envService.get('ADMIN_EMAIL');
  const password = await bcrypt.hash(envService.get('ADMIN_PASSWORD'), 10);

  await db
    .insertInto('users')
    .values({
      id: adminId,
      name: name,
      email: email,
      password: password,
      role: 'admin',
    })
    .execute();
}

export async function down(db: Kysely<any>): Promise<void> {
  // Migration code
  await db.deleteFrom('users').where('users.id', '==', adminId).execute();
}
