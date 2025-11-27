import { Injectable, Logger } from "@nestjs/common";
import { RabbitSubscribe } from "@golevelup/nestjs-rabbitmq";
import { CommandBus } from "@nestjs/cqrs";
import { RpcRequest, RpcResponse } from "shared-kernel";
import { RegisterCommand } from "../application/commands/register.handler";
import { LoginCommand } from "../application/commands/login.handler";
import { RefreshTokenCommand } from "../application/commands/refresh-token.handler";
import { ValidateTokenCommand } from "../application/commands/validate-token.handler";

@Injectable()
export class AuthRpcHandler {
  private readonly logger = new Logger(AuthRpcHandler.name);

  constructor(private readonly commandBus: CommandBus) {}

  @RabbitSubscribe({
    queue: "auth-service",
    queueOptions: {
      durable: true,
    },
  })
  async handleRpc(message: RpcRequest): Promise<RpcResponse> {
    const { pattern, data } = message;
    this.logger.log(`Received RPC request: ${pattern}`);

    try {
      switch (pattern) {
        case "auth.register":
          return await this.handleRegister(
            data as { email: string; password: string; name: string },
          );

        case "auth.login":
          return await this.handleLogin(
            data as { email: string; password: string },
          );

        case "auth.refresh":
          return await this.handleRefresh(data as { refresh_token: string });

        case "auth.validate":
          return await this.handleValidate(data as { user: unknown });

        default:
          return {
            success: false,
            error: `Unknown pattern: ${pattern}`,
          };
      }
    } catch (error) {
      this.logger.error(`Error handling ${pattern}: ${error}`);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  private async handleRegister(data: {
    email: string;
    password: string;
    name: string;
  }): Promise<RpcResponse> {
    const result = await this.commandBus.execute(
      new RegisterCommand(data.name, data.email, data.password),
    );
    return { success: true, data: result };
  }

  private async handleLogin(data: {
    email: string;
    password: string;
  }): Promise<RpcResponse> {
    const result = await this.commandBus.execute(
      new LoginCommand(data.email, data.password),
    );
    return { success: true, data: result };
  }

  private async handleRefresh(data: {
    refresh_token: string;
  }): Promise<RpcResponse> {
    const result = await this.commandBus.execute(
      new RefreshTokenCommand(data.refresh_token),
    );
    return { success: true, data: result };
  }

  private async handleValidate(data: { user: unknown }): Promise<RpcResponse> {
    const result = await this.commandBus.execute(
      new ValidateTokenCommand(data.user),
    );
    return { success: true, data: result };
  }
}
