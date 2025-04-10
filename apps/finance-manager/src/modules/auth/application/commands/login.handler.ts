import {
  CommandHandler,
  EventBus,
  ICommand,
  ICommandHandler,
  QueryBus,
} from '@nestjs/cqrs';
import { UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { GetUserByEmailWithPasswordMappedQuery } from '../../infrastructure/anti-corruption-layer/users/queries/get-user-by-email-with-password.mapped-handler';
import { MappedUserWithPassword } from '../../infrastructure/anti-corruption-layer/users/mapped-user.model';
import { UserLoggedInEvent } from '../../../../shared-kernel/core/events/user-logged-in.event';
import { AuthResponse } from '../../core/response-types';

export class LoginCommand implements ICommand {
  constructor(
    public readonly email: string,
    public readonly password: string,
  ) {}
}

@CommandHandler(LoginCommand)
export class LoginCommandHandler implements ICommandHandler<LoginCommand> {
  constructor(
    private readonly queryBus: QueryBus,
    private readonly jwtService: JwtService,
    private readonly eventBus: EventBus,
  ) {}

  async execute(command: LoginCommand) {
    const user: MappedUserWithPassword = await this.queryBus.execute(
      new GetUserByEmailWithPasswordMappedQuery(command.email),
    );

    if (!user || !(await bcrypt.compare(command.password, user.password))) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = { email: user.email, sub: user.id, roles: user.roles };

    this.eventBus.publish(new UserLoggedInEvent(user.id, user.email));

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
