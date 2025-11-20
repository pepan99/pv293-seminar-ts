import { config } from "dotenv";
import * as bcrypt from "bcryptjs";
import { ConfigService } from "@nestjs/config";
import { Kysely } from "kysely";
import { DB } from "../../../core/types/db";

config();

const configService = new ConfigService();

export async function up(db: Kysely<DB>) {
    const name = configService.get<string>("ADMIN_NAME");
    const email = configService.get<string>("ADMIN_EMAIL");
    const password = configService.get<string>("ADMIN_PASSWORD")!;
    const hashedPassword = await bcrypt.hash(password, 10);

    const id = crypto.randomUUID();

    await db
        .insertInto("users")
        .values({
            id,
            email: email!,
            password: hashedPassword,
            name: name!,
        })
        .execute();

    await db.insertInto("usersRoles").values({ userId: id, role: "admin" }).execute();

    await db.insertInto("usersRoles").values({ userId: id, role: "user" }).execute();
}

export async function down(db: Kysely<DB>) {
    const email = configService.get<string>("ADMIN_EMAIL");

    await db.deleteFrom("users").where("email", "=", email!).execute();
}
