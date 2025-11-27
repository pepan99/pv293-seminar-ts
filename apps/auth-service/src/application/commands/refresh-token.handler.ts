import {
  CommandHandler,
  EventBus,
  ICommand,
  ICommandHandler,
} from "@nestjs/cqrs";
import { JwtService } from "@nestjs/jwt";
import { Inject, UnauthorizedException } from "@nestjs/common";
import { TokenRefreshedEvent } from "../../core/events/token-refreshed.event";
import { IUsersRepository } from "../../core/repositories/users-repository.interface";

export interface RefreshTokenResponse {
  access_token: string;
}

export class RefreshTokenCommand implements ICommand {
  constructor(public readonly refreshToken: string) {}
}

@CommandHandler(RefreshTokenCommand)
export class RefreshTokenCommandHandler
  implements ICommandHandler<RefreshTokenCommand>
{
  constructor(
    @Inject("IUsersRepository")
    private readonly userRepository: IUsersRepository,
    private readonly jwtService: JwtService,
    private readonly eventBus: EventBus,
  ) {}

  async execute(command: RefreshTokenCommand): Promise<RefreshTokenResponse> {
    try {
      const decoded = this.jwtService.verify(command.refreshToken);

      const userId: string = decoded.sub;

      const user = await this.userRepository.findOne(userId);

      if (!user) {
        throw new UnauthorizedException("Invalid user");
      }

      const payload = { email: user.email, sub: user.id, roles: user.roles };

      this.eventBus.publish(new TokenRefreshedEvent(user.id));

      return {
        access_token: this.jwtService.sign(payload),
      };
    } catch {
      throw new UnauthorizedException("Invalid refresh token");
    }
  }
}
