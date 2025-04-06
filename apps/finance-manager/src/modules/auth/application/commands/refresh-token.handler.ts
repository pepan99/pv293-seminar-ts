import {
  CommandHandler,
  EventBus,
  ICommand,
  ICommandHandler,
  QueryBus,
} from '@nestjs/cqrs';
import { JwtService } from '@nestjs/jwt';
import { MappedUser } from '../../infrastructure/anti-corruption-layer/users/mapped-user.model';
import { GetUserByIdMappedQuery } from '../../infrastructure/anti-corruption-layer/users/queries/get-user-by-id.mapped-handler';
import { UnauthorizedException } from '@nestjs/common';
import { TokenRefreshedEvent } from '../../core/events/token-refreshed.event';

export interface RefreshTokenResponse {
  access_token: string;
}

export class RefreshTokenCommand implements ICommand {
  constructor(public readonly refreshToken: string) {}
}

// Command handler
@CommandHandler(RefreshTokenCommand)
export class RefreshTokenCommandHandler
  implements ICommandHandler<RefreshTokenCommand>
{
  constructor(
    private readonly queryBus: QueryBus,
    private readonly jwtService: JwtService,
    private readonly eventBus: EventBus,
  ) {}

  async execute(command: RefreshTokenCommand): Promise<RefreshTokenResponse> {
    try {
      const decoded = this.jwtService.verify(command.refreshToken, {
        secret: process.env.REFRESH_TOKEN_SECRET,
      });

      const userId: string = decoded.sub;

      const user: MappedUser = await this.queryBus.execute(
        new GetUserByIdMappedQuery(userId),
      );

      if (!user) {
        throw new UnauthorizedException('Invalid user');
      }

      const payload = { email: user.email, sub: user.id, roles: user.roles };

      this.eventBus.publish(new TokenRefreshedEvent(user.id));

      return {
        access_token: this.jwtService.sign(payload),
      };
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }
}
