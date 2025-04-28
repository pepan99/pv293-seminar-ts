import { Module } from "@nestjs/common";
import { APP_PIPE } from "@nestjs/core";
import { ZodValidationPipe } from "nestjs-zod";
import { AuthModule } from "./modules/auth/auth.module";
import { CqrsModule } from "@nestjs/cqrs";
import { AppConfigModule } from "./infrastructure/config/app-config.module";
import { UsersModule } from "./modules/users/users.module";
import { HealthModule } from "./modules/health/health.module";
import { AccountsModule } from "./modules/accounts/accounts.module";
import { LoggerModule } from "nestjs-pino";
import { PrometheusModule } from "@willsoto/nestjs-prometheus";

@Module({
    imports: [
        AuthModule,
        CqrsModule.forRoot(),
        LoggerModule.forRoot(),
        PrometheusModule.register(),
        AppConfigModule,
        UsersModule,
        HealthModule,
        AccountsModule,
    ],
    providers: [
        {
            provide: APP_PIPE,
            useClass: ZodValidationPipe,
        },
    ],
})
export class AppModule {}
