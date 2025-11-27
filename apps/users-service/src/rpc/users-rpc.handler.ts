import { Injectable, Logger } from "@nestjs/common";
import { RabbitSubscribe } from "@golevelup/nestjs-rabbitmq";
import { CommandBus, QueryBus } from "@nestjs/cqrs";
import { RpcRequest, RpcResponse } from "shared-kernel";
import { GetUserByIdQuery } from "../application/queries/get-user-by-id.handler";
import { GetAllUsersQuery } from "../application/queries/get-all-users.handler";
import { UpdateUserCommand } from "../application/commands/update-user.handler";
import { UpdateUserAdminCommand } from "../application/commands/update-user-admin.handler";
import { ChangePasswordCommand } from "../application/commands/change-password.handler";
import { RemoveUserCommand } from "../application/commands/remove-user.handler";
import { CreateUserCommand } from "../application/commands/create-user.handler";

@Injectable()
export class UsersRpcHandler {
  private readonly logger = new Logger(UsersRpcHandler.name);

  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @RabbitSubscribe({
    queue: "users-service",
    queueOptions: {
      durable: true,
    },
  })
  async handleRpc(message: RpcRequest): Promise<RpcResponse> {
    const { pattern, data } = message;
    this.logger.log(`Received RPC request: ${pattern}`);

    try {
      switch (pattern) {
        case "users.getById":
          return await this.handleGetById(data as { userId: string });

        case "users.getAll":
          return await this.handleGetAll();

        case "users.update":
          return await this.handleUpdate(
            data as { userId: string; email?: string; name?: string },
          );

        case "users.updateAdmin":
          return await this.handleUpdateAdmin(
            data as {
              userId: string;
              roles?: string[];
              name?: string;
              email?: string;
            },
          );

        case "users.changePassword":
          return await this.handleChangePassword(
            data as {
              userId: string;
              currentPassword: string;
              newPassword: string;
              confirmPassword: string;
            },
          );

        case "users.remove":
          return await this.handleRemove(data as { userId: string });

        case "users.create":
          return await this.handleCreate(
            data as {
              name: string;
              email: string;
              password: string;
              roles?: string[];
            },
          );

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

  private async handleGetById(data: { userId: string }): Promise<RpcResponse> {
    const user = await this.queryBus.execute(new GetUserByIdQuery(data.userId));
    if (!user) {
      return { success: false, error: "User not found" };
    }
    return { success: true, data: user };
  }

  private async handleGetAll(): Promise<RpcResponse> {
    const users = await this.queryBus.execute(new GetAllUsersQuery());
    return { success: true, data: users };
  }

  private async handleUpdate(data: {
    userId: string;
    email?: string;
    name?: string;
  }): Promise<RpcResponse> {
    const result = await this.commandBus.execute(
      new UpdateUserCommand(data.userId, data.email, data.name),
    );
    return { success: true, data: result };
  }

  private async handleUpdateAdmin(data: {
    userId: string;
    roles?: string[];
    name?: string;
    email?: string;
  }): Promise<RpcResponse> {
    const result = await this.commandBus.execute(
      new UpdateUserAdminCommand(
        data.userId,
        data.roles as ("admin" | "user")[],
        data.name,
        data.email,
      ),
    );
    return { success: true, data: result };
  }

  private async handleChangePassword(data: {
    userId: string;
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
  }): Promise<RpcResponse> {
    const result = await this.commandBus.execute(
      new ChangePasswordCommand(
        data.userId,
        data.currentPassword,
        data.newPassword,
        data.confirmPassword,
      ),
    );
    return { success: true, data: result };
  }

  private async handleRemove(data: { userId: string }): Promise<RpcResponse> {
    const result = await this.commandBus.execute(
      new RemoveUserCommand(data.userId),
    );
    return { success: true, data: result };
  }

  private async handleCreate(data: {
    name: string;
    email: string;
    password: string;
    roles?: string[];
  }): Promise<RpcResponse> {
    const result = await this.commandBus.execute(
      new CreateUserCommand(
        data.name,
        data.email,
        data.password,
        data.roles as ("admin" | "user")[],
      ),
    );
    return { success: true, data: result };
  }
}
