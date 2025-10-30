import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthController } from './api/controllers/auth.controller';
import { JwtStrategy } from './infrastructure/strategies/jwt.strategy';
import { LocalStrategy } from './infrastructure/strategies/local.strategy';
import { UsersModule } from '../users/users.module';
import { UsersRepository } from '../users/infrastructure/repositories/users.repository';
import { ValidateUserUseCase } from './application/validate-user.use-case';
import { LoginUseCase } from './application/login.use-case';
import { RegisterUseCase } from './application/register.use-case';
import { RefreshTokenUseCase } from './application/refresh-token.use-case';
import { GetProfileUseCase } from './application/get-profile.use-case';
import { ValidateTokenUseCase } from './application/validate-token.use-case';

const useCases = [
  ValidateUserUseCase,
  LoginUseCase,
  RegisterUseCase,
  RefreshTokenUseCase,
  GetProfileUseCase,
  ValidateTokenUseCase,
];

const strategies = [JwtStrategy, LocalStrategy];

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
  providers: [...useCases, ...strategies, UsersRepository],
  exports: [...useCases],
})
export class AuthModule {}
