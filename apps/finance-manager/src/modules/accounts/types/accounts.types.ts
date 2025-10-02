import { Insertable, Updateable, Selectable } from 'kysely';
import { Accounts } from '../../../common/types/db';

export type AccountInsertable = Omit<Insertable<Accounts>, 'userId'>;
export type AccountUpdateable = Updateable<Accounts>;
export type AccountSelectable = Selectable<Accounts>;
