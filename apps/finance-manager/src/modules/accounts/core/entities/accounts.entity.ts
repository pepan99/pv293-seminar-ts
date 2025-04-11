import { Selectable } from 'kysely';
import { Accounts } from '../../../shared-kernel/core/types/db';

export type Account = Selectable<Accounts>;
