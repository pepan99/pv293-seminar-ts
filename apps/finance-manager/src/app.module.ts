import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_PIPE } from '@nestjs/core';
import { ZodValidationPipe } from 'nestjs-zod';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { HealthModule } from './modules/health/health.module';
import { AccountsModule } from './modules/accounts/accounts.module';
import { DatabaseModule } from './shared-kernel/infrastructure/database/database.module';
import { EnvModule } from './shared-kernel/infrastructure/config/env.module';
import { EnvService } from './shared-kernel/infrastructure/config/env.service';
import { envSchema } from './shared-kernel/infrastructure/config/env';

@Module({
  imports: [
    DatabaseModule.forRootAsync({
      imports: [EnvModule],
      inject: [EnvService],
      useFactory: (envService: EnvService) => ({
        host: envService.get('POSTGRES_HOST'),
        port: envService.get('POSTGRES_PORT'),
        user: envService.get('POSTGRES_USER'),
        password: envService.get('POSTGRES_PASSWORD'),
        database: envService.get('POSTGRES_DB'),
      }),
    }),
    ConfigModule.forRoot({
      validate: (config) => {
        const result = envSchema.safeParse(config);
        if (!result.success) {
          throw new Error(`Config validation error}`);
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
