import { Module } from "@nestjs/common";
import { APP_PIPE } from "@nestjs/core";
import { ZodValidationPipe } from "nestjs-zod";
import { AuthModule } from "./modules/auth/auth.module";
import { UsersModule } from "./modules/users/users.module";
import { HealthModule } from "./modules/health/health.module";
import { AccountsModule } from "./modules/accounts/accounts.module";
import { EnvModule } from "./modules/shared-kernel/infrastructure/env-config/env.module";

@Module({
    imports: [EnvModule, AuthModule, UsersModule, HealthModule, AccountsModule],
    providers: [
        {
            provide: APP_PIPE,
            useClass: ZodValidationPipe,
        },
    ],
})
export class AppModule {}
