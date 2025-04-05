import {
  CommandHandler,
  ICommand,
  ICommandHandler,
  QueryBus,
} from '@nestjs/cqrs';
import { JwtService } from '@nestjs/jwt';
import { MappedUser } from '../../infrastructure/anti-corruption-layer/users/mapped-user.model';
import { GetUserByIdMappedQuery } from '../../infrastructure/anti-corruption-layer/users/get-user-by-id.mapped-handler';
import { UnauthorizedException } from '@nestjs/common';

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
    private queryBus: QueryBus,
    private jwtService: JwtService,
  ) {}

  async execute(command: RefreshTokenCommand): Promise<RefreshTokenResponse> {
    try {
      // Verify the refresh token
      const decoded = this.jwtService.verify(command.refreshToken, {
        // Use appropriate secret/options for refresh tokens
        secret: process.env.REFRESH_TOKEN_SECRET,
      });

      // Get userId from the decoded token
      const userId: string = decoded.sub;

      // Fetch the user by ID
      const user: MappedUser = await this.queryBus.execute(
        new GetUserByIdMappedQuery(userId),
      );

      if (!user) {
        throw new UnauthorizedException('Invalid user');
      }

      // Create a new access token
      const payload = { email: user.email, sub: user.id, roles: user.roles };
      return {
        access_token: this.jwtService.sign(payload),
      };
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }
}
