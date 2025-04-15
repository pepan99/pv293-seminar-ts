import { Module } from "@nestjs/common";
import { APP_PIPE } from "@nestjs/core";
import { ZodValidationPipe } from "nestjs-zod";
import { AuthModule } from "./modules/auth/auth.module";
import { UsersModule } from "./modules/users/users.module";
import { HealthModule } from "./modules/health/health.module";
import { AccountsModule } from "./modules/accounts/accounts.module";
import { appSchema } from "./modules/shared-kernel/infrastructure/env-config/env.schema";
import { EnvModule } from "./modules/shared-kernel/infrastructure/env-config/env.module";
import { CqrsModule } from "@nestjs/cqrs";

@Module({
    imports: [AuthModule, CqrsModule.forRoot()], //UsersModule, HealthModule, AccountsModule],
    providers: [
        {
            provide: APP_PIPE,
            useClass: ZodValidationPipe,
        },
    ],
})
export class AppModule {}
