import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthController } from './api/controllers/auth.controller';
import { JwtStrategy } from './infrastructure/strategies/jwt.strategy';
import { UsersModule } from '../users/users.module';
import { UsersRepository } from '../users/infrastructure/repositories/users.repository';
import { LoginCommandHandler } from './application/commands/login.handler';
import { RegisterCommandHandler } from './application/commands/register.handler';
import { RefreshTokenCommandHandler } from './application/commands/refresh-token.handler';
import { ValidateTokenCommandHandler } from './application/commands/validate-token.handler';
import { CreateUserCommandHandler } from './infrastructure/anti-corruption-layer/users/commands/create-user.mapped-handler';

const strategies = [JwtStrategy];

const commandHandlers = [
  LoginCommandHandler,
  RegisterCommandHandler,
  RefreshTokenCommandHandler,
  ValidateTokenCommandHandler,
  CreateUserCommandHandler,
];

@Module({
  imports: [
    ConfigModule,
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
})
export class AuthModule {}
