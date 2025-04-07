import { Insertable, Selectable, Updateable } from 'kysely';
import { Accounts as AccountsDbType } from '../../../../shared-kernel/core/types/db';

export type SelectableAccounts = Selectable<AccountsDbType>;

export type InsertableAccounts = Insertable<Omit<AccountsDbType, 'id'>>;

export type UpdateableAccounts = Updateable<AccountsDbType>;
