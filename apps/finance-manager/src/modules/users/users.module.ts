import { Module } from "@nestjs/common";
import { CqrsModule } from "@nestjs/cqrs";
import { UsersController } from "./api/controllers/users.controller";
import { CreateUserCommandHandler } from "./application/commands/create-user.handler";
import { UpdateUserCommandHandler } from "./application/commands/update-user.handler";
import { UpdateUserAdminCommandHandler } from "./application/commands/update-user-admin.handler";
import { RemoveUserCommandHandler } from "./application/commands/remove-user.handler";
import { ChangePasswordCommandHandler } from "./application/commands/change-password.handler";
import { GetAllUsersQueryHandler } from "./application/queries/get-all-users.handler";
import { GetUserByIdQueryHandler } from "./application/queries/get-user-by-id.handler";
import { GetUserByEmailQueryHandler } from "./application/queries/get-user-by-email.handler";
import { DatabaseModule } from "../shared-kernel/infrastructure/database/database.module";
import { ConfigModule } from "@nestjs/config";
import { UsersRepository } from "./infrastructure/database/repositories/users.repository";
import { UserAggregateRepository } from "./infrastructure/database/repositories/users-aggregate.repository";
import {
    DbEnv,
    defaultEnvSchema,
    RabbitmqEnv,
} from "../shared-kernel/infrastructure/env-config/env.schema";
import { EnvModule } from "../shared-kernel/infrastructure/env-config/env.module";
import { EnvService } from "../shared-kernel/infrastructure/env-config/env.service";
import { RabbitMQModule } from "@golevelup/nestjs-rabbitmq";
import { UserCreatedEvent } from "./core/events/user-created.event";
import { UserDeactivatedEvent } from "./core/events/user-deactivated.event";
import { UserPasswordChangedEvent } from "./core/events/user-password-changed.event";
import { UserRemovedEvent } from "./core/events/user-removed.event";
import { UserRolesChangedEvent } from "./core/events/user-roles-changed.event";
import { UserUpdatedEvent } from "./core/events/user-updated.event";

const commandHandlers = [
    CreateUserCommandHandler,
    UpdateUserCommandHandler,
    UpdateUserAdminCommandHandler,
    RemoveUserCommandHandler,
    ChangePasswordCommandHandler,
];

const queryHandlers = [
    GetUserByIdQueryHandler,
    GetUserByEmailQueryHandler,
    GetAllUsersQueryHandler,
];

const events = [
    UserCreatedEvent,
    UserDeactivatedEvent,
    UserPasswordChangedEvent,
    UserRemovedEvent,
    UserRolesChangedEvent,
    UserUpdatedEvent,
];

@Module({
    imports: [
        CqrsModule,
        ConfigModule.forRoot({
            envFilePath: ["./src/modules/users/.env"],
            validate: (config) => {
                const result = defaultEnvSchema.safeParse(config);
                if (!result.success) {
                    throw new Error(`Config validation error}`);
                }
                return result.data;
            },
        }),
        EnvModule,
        RabbitMQModule.forRootAsync({
            imports: [EnvModule],
            inject: [EnvService],
            useFactory: (envService: EnvService<RabbitmqEnv>) => {
                return {
                    uri: envService.get("RABBITMQ_URI"),
                    connectionInitOptions: { wait: false },
                };
            },
        }),
        DatabaseModule.forRootAsync({
            imports: [EnvModule],
            inject: [EnvService],
            useFactory: (envService: EnvService<DbEnv>) => ({
                host: envService.get("POSTGRES_HOST"),
                port: envService.get("POSTGRES_PORT"),
                user: envService.get("POSTGRES_USER"),
                password: envService.get("POSTGRES_PASSWORD"),
                database: envService.get("POSTGRES_DB"),
            }),
        }),
    ],
    controllers: [UsersController],
    providers: [
        UsersRepository,
        UserAggregateRepository,
        ...commandHandlers,
        ...queryHandlers,
        {
            provide: "EVENTS",
            useValue: events,
        },
    ],
    exports: [
        UsersRepository,
        UserAggregateRepository,
        GetUserByIdQueryHandler,
        GetUserByEmailQueryHandler,
    ],
})
export class UsersModule {}
