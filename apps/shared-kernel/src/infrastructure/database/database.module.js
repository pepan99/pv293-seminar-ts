"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DatabaseModule = void 0;
const common_1 = require("@nestjs/common");
const database_module_definition_1 = require("./database.module-definition");
const pg_1 = require("pg");
const kysely_1 = require("kysely");
let DatabaseModule = class DatabaseModule extends database_module_definition_1.ConfigurableDatabaseModule {
};
exports.DatabaseModule = DatabaseModule;
exports.DatabaseModule = DatabaseModule = __decorate([
    (0, common_1.Module)({
        exports: [kysely_1.Kysely],
        providers: [
            {
                provide: kysely_1.Kysely,
                inject: [database_module_definition_1.DATABASE_OPTIONS],
                useFactory: (databaseOptions) => {
                    const dialect = new kysely_1.PostgresDialect({
                        pool: new pg_1.Pool({
                            host: databaseOptions.host,
                            port: databaseOptions.port,
                            user: databaseOptions.user,
                            password: databaseOptions.password,
                            database: databaseOptions.database,
                        }),
                    });
                    return new kysely_1.Kysely({
                        dialect,
                        plugins: [new kysely_1.CamelCasePlugin()],
                    });
                },
            },
        ],
    })
], DatabaseModule);
//# sourceMappingURL=database.module.js.map