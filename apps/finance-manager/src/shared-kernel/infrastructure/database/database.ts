import { Kysely } from 'kysely';
import { DB } from '../../core/types/db';

export class Database extends Kysely<DB> {}
