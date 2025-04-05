import {
  CommandHandler,
  ICommand,
  ICommandHandler,
  QueryBus,
} from '@nestjs/cqrs';
import { UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AuthResponse } from '../../../../../test/k6-tests/types';
import * as bcrypt from 'bcrypt';
import { GetUserByEmailWithPasswordMappedQuery } from '../../infrastructure/anti-corruption-layer/users/get-user-by-email-with-password.mapped-handler';
import { MappedUserWithPassword } from '../../infrastructure/anti-corruption-layer/users/mapped-user.model';

export class LoginCommand implements ICommand {
  constructor(
    public readonly email: string,
    public readonly password: string,
  ) {}
}

@CommandHandler(LoginCommand)
export class LoginCommandHandler implements ICommandHandler<LoginCommand> {
  constructor(
    private queryBus: QueryBus,
    private jwtService: JwtService,
  ) {}

  async execute(command: LoginCommand): Promise<AuthResponse> {
    const user: MappedUserWithPassword = await this.queryBus.execute(
      new GetUserByEmailWithPasswordMappedQuery(command.email),
    );

    if (!user || !(await bcrypt.compare(command.password, user.password))) {
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
