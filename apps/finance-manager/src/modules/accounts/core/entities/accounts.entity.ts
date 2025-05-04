import { Insertable, Selectable, Updateable } from "kysely";
import { Accounts } from "../types/db";

export type SelectableAccounts = Selectable<Accounts>;

export type InsertableAccounts = Insertable<Omit<Accounts, "id" | "userId">>;

export type UpdateableAccounts = Updateable<Accounts>;
