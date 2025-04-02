import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { ValidateUserUseCase } from '../../application/validate-user.use-case';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private validateUserUseCase: ValidateUserUseCase) {
    super({ usernameField: 'email' });
  }

  async validate(email: string, password: string) {
    const user = await this.validateUserUseCase.execute(email, password);
    if (!user) {
      throw new UnauthorizedException();
    }
    return user;
  }
}
