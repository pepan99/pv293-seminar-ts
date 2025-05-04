import { Insertable, Selectable, Updateable } from "kysely";
import { UserRole, Users } from "./db";

export type InsertableUser = Insertable<Omit<Users, "id">>;

export type UpdateableUser = Updateable<Users>;

export type SelectableUser = Selectable<Omit<Users, "password">>;

export type SelectableUserWithRoles = Selectable<Omit<Users, "password"> & { roles: UserRole[] }>;

export type SelectableUserWithPassword = Selectable<Users>;
