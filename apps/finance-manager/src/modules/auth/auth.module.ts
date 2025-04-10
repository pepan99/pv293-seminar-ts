import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthController } from './api/controllers/auth.controller';
import { JwtStrategy } from './infrastructure/strategies/jwt.strategy';
import { UsersModule } from '../users/users.module';
import { UsersRepository } from '../users/infrastructure/repositories/users.repository';
import { LoginCommandHandler } from './application/commands/login.handler';
import { RefreshTokenCommandHandler } from './application/commands/refresh-token.handler';
import { RegisterCommandHandler } from './application/commands/register.handler';
import { ValidateTokenCommandHandler } from './application/commands/validate-token.handler';
import { DbEnv, dbSchema } from '@repo/env-config/env.schema';
import { EnvModule } from '@repo/env-config/env.module';
import { DatabaseModule } from '../../infrastructure/database/database.module';
import { EnvService } from '@repo/env-config/env.service';

const commandHandlers = [
  LoginCommandHandler,
  RefreshTokenCommandHandler,
  RegisterCommandHandler,
  ValidateTokenCommandHandler,
];

const strategies = [JwtStrategy];

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: ['./.env'],
      validate: (config) => {
        const result = dbSchema.safeParse(config);
        if (!result.success) {
          throw new Error(`Config validation error}`);
        }
        return result.data;
      },
    }),
    EnvModule,
    DatabaseModule.forRootAsync({
      imports: [EnvModule],
      inject: [EnvService],
      useFactory: (envService: EnvService<DbEnv>) => ({
        host: envService.get('POSTGRES_HOST'),
        port: envService.get('POSTGRES_PORT'),
        user: envService.get('POSTGRES_USER'),
        password: envService.get('POSTGRES_PASSWORD'),
        database: envService.get('POSTGRES_DB'),
      }),
    }),
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: {
          expiresIn: '1h',
        },
      }),
      inject: [ConfigService],
    }),
    UsersModule,
  ],
  controllers: [AuthController],
  providers: [...commandHandlers, ...strategies, UsersRepository],
  exports: [...commandHandlers],
})
export class AuthModule {}
