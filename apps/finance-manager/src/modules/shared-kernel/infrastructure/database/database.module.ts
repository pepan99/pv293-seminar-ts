import { Module } from "@nestjs/common";
import { ConfigurableDatabaseModule, DATABASE_OPTIONS } from "./database.module-definition";
import { DatabaseOptions } from "./database-options";
import { Pool } from "pg";
import { CamelCasePlugin, Kysely, PostgresDialect } from "kysely";

@Module({
    exports: [Kysely],
    providers: [
        {
            provide: Kysely,
            inject: [DATABASE_OPTIONS],
            useFactory: (databaseOptions: DatabaseOptions) => {
                const dialect = new PostgresDialect({
                    pool: new Pool({
                        host: databaseOptions.host,
                        port: databaseOptions.port,
                        user: databaseOptions.user,
                        password: databaseOptions.password,
                        database: databaseOptions.database,
                    }),
                });

                return new Kysely({
                    dialect,
                    plugins: [new CamelCasePlugin()],
                });
            },
        },
    ],
})
export class DatabaseModule extends ConfigurableDatabaseModule {}
