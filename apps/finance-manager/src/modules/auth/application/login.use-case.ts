import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { LoginCommand } from '../core/commands/auth-commands';
import { ValidateUserUseCase } from './validate-user.use-case';

@Injectable()
export class LoginUseCase {
  constructor(
    private validateUserUseCase: ValidateUserUseCase,
    private jwtService: JwtService,
  ) {}

  async execute(command: LoginCommand) {
    const user = await this.validateUserUseCase.execute(
      command.email,
      command.password,
    );

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = { email: user.email, sub: user.id, roles: user.roles };

    return {
      access_token: this.jwtService.sign(payload),
      refresh_token: this.jwtService.sign(
        { email: user.email, sub: user.id },
        { expiresIn: '7d' },
      ),
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        roles: user.roles,
      },
    };
  }
}
