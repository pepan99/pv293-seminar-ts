import {Insertable, Updateable, Selectable} from 'kysely';
import {Accounts} from '../../../common/types/db';

export type AccountInsertable = Omit<
  Omit<Insertable<Accounts>, 'id'>,
  'userId'
>;
export type AccountUpdateable = Updateable<Accounts>;
export type AccountSelectable = Selectable<Accounts>;
