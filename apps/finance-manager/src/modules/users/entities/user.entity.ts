import { Selectable } from 'kysely';
import { Users } from '../../../common/types/db';

export type User = Selectable<Users>;

export type UserWithoutPassword = Omit<User, 'password'>;

export type RequestUserEntity = {
  userId: string;
  email: string;
};
