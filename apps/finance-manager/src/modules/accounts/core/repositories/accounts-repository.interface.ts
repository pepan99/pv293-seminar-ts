import { Account } from '../entities/accounts.entity';
import { CreateAccountCommand } from '../../application/commands/create-account.handler';
import { UpdateAccountCommand } from '../../application/commands/update-account.handler';

export interface IAccountsRepository {
  create(command: CreateAccountCommand): Promise<Account>;

  findOne(id: string, userId: string): Promise<Account | undefined>;

  findAll(userId: string): Promise<Account[]>;

  update(
    command: UpdateAccountCommand,
  ): Promise<Account | undefined>;

  remove(id: string, userId: string): Promise<boolean>;

  getBalance(id: string, userId: string): Promise<number>;

  getTotalBalance(userId: string): Promise<number>;
}
