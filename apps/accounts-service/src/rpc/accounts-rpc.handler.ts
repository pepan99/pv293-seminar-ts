import { Injectable, Logger } from "@nestjs/common";
import { RabbitSubscribe } from "@golevelup/nestjs-rabbitmq";
import { CommandBus, QueryBus } from "@nestjs/cqrs";
import { RpcRequest, RpcResponse } from "shared-kernel";
import { GetAccountByIdQuery } from "../application/queries/get-account-by-id.handler";
import { GetAllAccountsQuery } from "../application/queries/get-all-accounts.handler";
import { GetAccountBalanceQuery } from "../application/queries/get-account-balance.handler";
import { GetTotalBalanceQuery } from "../application/queries/get-total-balance.handler";
import { CreateAccountCommand } from "../application/commands/create-account.handler";
import { UpdateAccountCommand } from "../application/commands/update-account.handler";
import { RemoveAccountCommand } from "../application/commands/remove-account.handler";
import {
  InsertableAccounts,
  UpdateableAccounts,
} from "../core/entities/accounts.entity";

@Injectable()
export class AccountsRpcHandler {
  private readonly logger = new Logger(AccountsRpcHandler.name);

  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @RabbitSubscribe({
    queue: "accounts-service",
    queueOptions: {
      durable: true,
    },
  })
  async handleRpc(message: RpcRequest): Promise<RpcResponse> {
    const { pattern, data } = message;
    this.logger.log(`Received RPC request: ${pattern}`);

    try {
      switch (pattern) {
        case "accounts.getById":
          return await this.handleGetById(
            data as { id: string; userId: string },
          );

        case "accounts.getAll":
          return await this.handleGetAll(data as { userId: string });

        case "accounts.getBalance":
          return await this.handleGetBalance(
            data as { id: string; userId: string },
          );

        case "accounts.getTotalBalance":
          return await this.handleGetTotalBalance(data as { userId: string });

        case "accounts.create":
          return await this.handleCreate(
            data as { userId: string; data: InsertableAccounts },
          );

        case "accounts.update":
          return await this.handleUpdate(
            data as { id: string; userId: string; data: UpdateableAccounts },
          );

        case "accounts.remove":
          return await this.handleRemove(
            data as { id: string; userId: string },
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

  private async handleGetById(data: {
    id: string;
    userId: string;
  }): Promise<RpcResponse> {
    const account = await this.queryBus.execute(
      new GetAccountByIdQuery(data.id, data.userId),
    );
    if (!account) {
      return { success: false, error: "Account not found" };
    }
    return { success: true, data: account };
  }

  private async handleGetAll(data: { userId: string }): Promise<RpcResponse> {
    const accounts = await this.queryBus.execute(
      new GetAllAccountsQuery(data.userId),
    );
    return { success: true, data: accounts };
  }

  private async handleGetBalance(data: {
    id: string;
    userId: string;
  }): Promise<RpcResponse> {
    const result = await this.queryBus.execute(
      new GetAccountBalanceQuery(data.id, data.userId),
    );
    return { success: true, data: result };
  }

  private async handleGetTotalBalance(data: {
    userId: string;
  }): Promise<RpcResponse> {
    const result = await this.queryBus.execute(
      new GetTotalBalanceQuery(data.userId),
    );
    return { success: true, data: result };
  }

  private async handleCreate(data: {
    userId: string;
    data: InsertableAccounts;
  }): Promise<RpcResponse> {
    const result = await this.commandBus.execute(
      new CreateAccountCommand(data.userId, data.data),
    );
    return { success: true, data: result };
  }

  private async handleUpdate(data: {
    id: string;
    userId: string;
    data: UpdateableAccounts;
  }): Promise<RpcResponse> {
    const result = await this.commandBus.execute(
      new UpdateAccountCommand(data.id, data.userId, data.data),
    );
    return { success: true, data: result };
  }

  private async handleRemove(data: {
    id: string;
    userId: string;
  }): Promise<RpcResponse> {
    const result = await this.commandBus.execute(
      new RemoveAccountCommand(data.id, data.userId),
    );
    return { success: true, data: result };
  }
}
