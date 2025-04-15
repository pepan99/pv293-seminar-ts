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
import { ConfigService } from "@nestjs/config";
import { UsersRepository } from "./infrastructure/database/repositories/users.repository";
import { UserAggregateRepository } from "./infrastructure/database/repositories/users-aggregate.repository";
import { UserConfigModule } from "./infrastructure/config/user-config.module";
import { UserConfigService } from "./infrastructure/config/user-config.service";

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
        UserConfigModule,
        DatabaseModule.forFeatureAsync({
            imports: [UserConfigModule],
            injects: [UserConfigService],
            // @ts-ignore
            useFactory: (configService: UserConfigService) => ({
                host: configService.postgresHost,
                port: configService.postgresPort,
                user: configService.postgresUser,
                password: configService.postgresPassword,
                database: configService.postgresDB,
            }),
            inject: [UserConfigService],
        }),
    ],
    controllers: [UsersController],
    providers: [
        {
            provide: "IUsersRepository",
            useClass: UsersRepository,
        },
        {
            provide: "IUsersAggregateRepository",
            useClass: UserAggregateRepository,
        },
        ...commandHandlers,
        ...queryHandlers,
    ],
})
export class UsersModule {}
