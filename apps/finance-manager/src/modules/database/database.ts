import { Kysely } from 'kysely';
import { DB } from '../../common/types/db';

export class Database extends Kysely<DB> {}
