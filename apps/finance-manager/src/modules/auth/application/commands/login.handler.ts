import {
  CommandHandler,
  EventBus,
  ICommand,
  ICommandHandler,
  QueryBus,
} from '@nestjs/cqrs';
import { UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as crypto from 'crypto';
import { GetUserByEmailWithPasswordMappedQuery } from '../../infrastructure/anti-corruption-layer/users/queries/get-user-by-email-with-password.mapped-handler';
import { MappedUserWithPassword } from '../../infrastructure/anti-corruption-layer/users/mapped-user.model';
import { UserLoggedInEvent } from '../../../shared-kernel/core/events/user-logged-in.event';

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

    if (
      !user ||
      !(await this.validatePassword(command.password, user.password))
    ) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = { email: user.email, sub: user.id };

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
      },
    };
  }

  private async validatePassword(
    password: string,
    hashedPassword: string,
  ): Promise<boolean> {
    return new Promise<boolean>((resolve, reject) => {
      // const [salt, key] = hashedPassword.split(':');
      // const keylen = 64;
      // const iterations = 16000;
      // const storedKey = Buffer.from(key, 'hex');
      //
      // crypto.scrypt(
      //   password,
      //   salt,
      //   keylen,
      //   { N: iterations },
      //   (err, derivedKey) => {
      //     if (err) reject(err);
      //     // Use timingSafeEqual for constant-time comparison to prevent timing attacks
      //     try {
      //       resolve(crypto.timingSafeEqual(storedKey, derivedKey));
      //     } catch (e) {
      //       resolve(false);
      //     }
      //   },
      // );
      resolve(false);
    });
  }
}
