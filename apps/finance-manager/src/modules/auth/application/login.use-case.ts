import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { LoginDto } from '../api/dto/login.dto';
import { ValidateUserUseCase } from './validate-user.use-case';

@Injectable()
export class LoginUseCase {
  constructor(
    private validateUserUseCase: ValidateUserUseCase,
    private jwtService: JwtService,
  ) {}

  async execute(loginDto: LoginDto) {
    const user = await this.validateUserUseCase.execute(
      loginDto.email,
      loginDto.password,
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
