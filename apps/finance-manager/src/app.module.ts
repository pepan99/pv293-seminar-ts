import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_PIPE } from '@nestjs/core';
import { ZodValidationPipe } from 'nestjs-zod';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { HealthModule } from './modules/health/health.module';
import { AccountsModule } from './modules/accounts/accounts.module';
import { appSchema } from './modules/shared-kernel/infrastructure/env-config/env.schema';
import { EnvModule } from './modules/shared-kernel/infrastructure/env-config/env.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      validate: (config) => {
        const result = appSchema.safeParse(config);
        if (!result.success) {
          throw new Error(`Config validation error}`);
        }
        return result.data;
      },
    }),
    EnvModule,
    AuthModule,
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
