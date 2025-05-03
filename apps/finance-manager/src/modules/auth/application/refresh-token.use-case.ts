import { Injectable, Inject, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { IUsersRepository } from '../../users/core/repositories/users-repository.interface';

@Injectable()
export class RefreshTokenUseCase {
  constructor(
    @Inject('IUsersRepository') private usersRepository: IUsersRepository,
    private jwtService: JwtService,
  ) {}

  async execute(userId: string) {
    const user = await this.usersRepository.findOne(userId);

    if (!user) {
      throw new UnauthorizedException('Invalid user');
    }

    const payload = { email: user.email, sub: user.id, roles: user.roles };

    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}
