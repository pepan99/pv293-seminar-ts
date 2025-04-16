import { Controller } from "@nestjs/common";
import { MessagePattern } from "@nestjs/microservices";
import { CommandBus, QueryBus } from "@nestjs/cqrs";
import { CreateAccountCommand } from "../../application/commands/create-account.handler";
import { GetAccountBalanceQuery } from "../../application/queries/get-account-balance.handler";
import { GetTotalBalanceQuery } from "../../application/queries/get-total-balance.handler";
import { GetAccountByIdQuery } from "../../application/queries/get-account-by-id.handler";
import { GetAllAccountsQuery } from "../../application/queries/get-all-accounts.handler";
import { UpdateAccountCommand } from "../../application/commands/update-account.handler";
import { RemoveAccountCommand } from "../../application/commands/remove-account.handler";
import { ReconcileAccountCommand } from "../../application/commands/reconcile-account.handler";

@Controller()
export class AccountsMessageController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @MessagePattern("create_account")
  async createAccount(data: { dto: any; user: any }) {
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

  @MessagePattern("get_account_balance")
  async getAccountBalance(data: { id: string; userId: string }) {
    return this.queryBus.execute(
      new GetAccountBalanceQuery(data.id, data.userId),
    );
  }

  @MessagePattern("get_total_balance")
  async getTotalBalance(data: { userId: string }) {
    return this.queryBus.execute(new GetTotalBalanceQuery(data.userId));
  }

  @MessagePattern("get_account_by_id")
  async getAccountById(data: { id: string; userId: string }) {
    return this.queryBus.execute(new GetAccountByIdQuery(data.id, data.userId));
  }

  @MessagePattern("get_all_accounts")
  async getAllAccounts(data: { userId: string }) {
    return this.queryBus.execute(new GetAllAccountsQuery(data.userId));
  }

  @MessagePattern("update_account")
  async updateAccount(data: { id: string; dto: any; userId: string }) {
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

  @MessagePattern("reconcile_account")
  async reconcileAccount(data: { id: string; dto: any; userId: string }) {
    return this.commandBus.execute(
      new ReconcileAccountCommand(
        data.id,
        data.userId,
        data.dto.actualBalance,
        data.dto.notes,
      ),
    );
  }

  @MessagePattern("remove_account")
  async removeAccount(data: { id: string; userId: string }) {
    return this.commandBus.execute(
      new RemoveAccountCommand(data.id, data.userId),
    );
  }
}
