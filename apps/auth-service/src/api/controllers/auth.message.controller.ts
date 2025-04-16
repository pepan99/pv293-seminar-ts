import { Controller } from "@nestjs/common";
import { MessagePattern } from "@nestjs/microservices";
import { CommandBus } from "@nestjs/cqrs";
import { RegisterCommand } from "../../application/commands/register.handler";
import { LoginCommand } from "../../application/commands/login.handler";
import { RefreshTokenCommand } from "../../application/commands/refresh-token.handler";

@Controller()
export class AuthMessageController {
  constructor(private readonly commandBus: CommandBus) {}

  @MessagePattern("login")
  async login(data: { email: string; password: string }) {
    return this.commandBus.execute(new LoginCommand(data.email, data.password));
  }

  @MessagePattern("register")
  async register(data: { name: string; email: string; password: string }) {
    return this.commandBus.execute(
      new RegisterCommand(data.name, data.email, data.password),
    );
  }

  @MessagePattern("refresh_token")
  async refreshToken(data: { refresh_token: string }) {
    return this.commandBus.execute(new RefreshTokenCommand(data.refresh_token));
  }
}
