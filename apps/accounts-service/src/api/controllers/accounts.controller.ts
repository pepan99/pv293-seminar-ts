import { Controller } from "@nestjs/common";
import { MessagePattern, Payload } from "@nestjs/microservices";
import { CommandBus, QueryBus } from "@nestjs/cqrs";

import {
  CreateAccountDto,
  ReconcileAccountDto,
  UpdateAccountDto,
} from "../dtos/accounts-zod.dtos";
import { RequestUser } from "shared-kernel/src/core/types/user-types";
import { CreateAccountCommand } from "../../application/commands/create-account.handler";
import { GetAccountBalanceQuery } from "../../application/queries/get-account-balance.handler";
import { GetTotalBalanceQuery } from "../../application/queries/get-total-balance.handler";
import { GetAccountByIdQuery } from "../../application/queries/get-account-by-id.handler";
import { GetAllAccountsQuery } from "../../application/queries/get-all-accounts.handler";
import { UpdateAccountCommand } from "../../application/commands/update-account.handler";
import { RemoveAccountCommand } from "../../application/commands/remove-account.handler";
import { ReconcileAccountCommand } from "../../application/commands/reconcile-account.handler";
import { Account } from "../../core/entities/accounts.entity";
import { CommandSucceededWithId } from "shared-kernel/src/core/types/return-types";

@Controller()
export class AccountsController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @MessagePattern("accounts.create_account")
  async createAccount(
    @Payload() data: { dto: CreateAccountDto; user: RequestUser },
  ): Promise<CommandSucceededWithId> {
    return this.commandBus.execute(
      new CreateAccountCommand(
        data.dto.name,
        data.dto.accountType,
        data.dto.currency,
        data.user.userId,
        data.dto.description,
        data.dto.notes,
        data.dto.icon,
        data.dto.color,
      ),
    );
  }

  @MessagePattern("accounts.get_account_balance")
  async getAccountBalance(
    @Payload() data: { id: string; userId: string },
  ): Promise<{ balance: number }> {
    return this.queryBus.execute(
      new GetAccountBalanceQuery(data.id, data.userId),
    );
  }

  @MessagePattern("accounts.get_total_balance")
  async getTotalBalance(
    @Payload() data: { userId: string },
  ): Promise<{ totalBalance: number }> {
    return this.queryBus.execute(new GetTotalBalanceQuery(data.userId));
  }

  @MessagePattern("accounts.get_account_by_id")
  async getAccountById(
    @Payload() data: { id: string; userId: string },
  ): Promise<Account> {
    return this.queryBus.execute(new GetAccountByIdQuery(data.id, data.userId));
  }

  @MessagePattern("accounts.get_all_accounts")
  async getAllAccounts(
    @Payload() data: { userId: string },
  ): Promise<Account[]> {
    return this.queryBus.execute(new GetAllAccountsQuery(data.userId));
  }

  @MessagePattern("accounts.update_account")
  async updateAccount(
    @Payload() data: { id: string; dto: UpdateAccountDto; userId: string },
  ): Promise<CommandSucceededWithId> {
    return this.commandBus.execute(
      new UpdateAccountCommand(
        data.id,
        data.userId,
        data.dto.name,
        data.dto.description,
        data.dto.icon,
        data.dto.color,
      ),
    );
  }

  @MessagePattern("accounts.reconcile_account")
  async reconcileAccount(
    @Payload() data: { id: string; dto: ReconcileAccountDto; userId: string },
  ): Promise<CommandSucceededWithId> {
    return this.commandBus.execute(
      new ReconcileAccountCommand(
        data.id,
        data.userId,
        data.dto.actualBalance,
        data.dto.notes,
      ),
    );
  }

  @MessagePattern("accounts.remove_account")
  async removeAccount(
    @Payload() data: { id: string; userId: string },
  ): Promise<CommandSucceededWithId> {
    return this.commandBus.execute(
      new RemoveAccountCommand(data.id, data.userId),
    );
  }
}
