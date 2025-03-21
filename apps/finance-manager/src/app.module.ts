import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_PIPE } from '@nestjs/core';
import { ZodValidationPipe } from 'nestjs-zod';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { HealthModule } from './modules/health/health.module';
import { AccountsModule } from './modules/accounts/accounts.module';
import { envSchema } from './modules/config/env';
import { EnvModule } from './modules/config/env.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      validate: (config) => {
        const result = envSchema.safeParse(config);
        if (!result.success) {
          throw new Error(`Config validation error: ${result.error.format()}`);
        }
        return result.data;
      },
      isGlobal: true,
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
