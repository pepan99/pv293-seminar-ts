import { Selectable } from 'kysely';
import { Accounts } from '../../../shared/types/db';

export type Account = Selectable<Accounts>;
