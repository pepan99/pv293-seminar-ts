import { Kysely } from 'kysely';
import { DB } from '../../shared/types/db';

export class Database extends Kysely<DB> {}
