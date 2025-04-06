import { Selectable } from 'kysely';
import { Accounts } from 'kysely-codegen';

export type Account = Selectable<Accounts>;
