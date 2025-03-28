import { Selectable } from 'kysely';
import { Accounts } from '../../../common/types/db';

export type Account = Selectable<Accounts>;
