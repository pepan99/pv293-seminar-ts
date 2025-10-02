import { Insertable, Updateable, Selectable } from 'kysely';
import { Users, UserRole } from '../../../common/types/db';

export type UserInsertable = Insertable<Users>;
export type UserUpdateable = Updateable<Users>;
export type UserSelectable = Selectable<Users>;
export type UserWithRolesUpdateable = UserUpdateable & { roles: UserRole[] };
