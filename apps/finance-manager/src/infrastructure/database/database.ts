import { Kysely } from 'kysely';
import { DB } from '../../shared-kernel/core/types/db';

export class Database extends Kysely<DB> {}
