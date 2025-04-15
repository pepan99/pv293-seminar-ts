import { Selectable } from "kysely";
import { Accounts } from "shared-kernel/src/core/types/db";

export type Account = Selectable<Accounts>;
