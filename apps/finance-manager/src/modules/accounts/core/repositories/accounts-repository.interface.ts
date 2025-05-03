import { Account } from '../entities/accounts.entity';
import {
  CreateAccountCommand,
  UpdateAccountCommand,
} from '../commands/account-commands';

export interface IAccountsRepository {
  create(command: CreateAccountCommand, userId: string): Promise<Account>;

  findOne(id: string, userId: string): Promise<Account | undefined>;

  findAll(userId: string): Promise<Account[]>;

  update(
    id: string,
    command: UpdateAccountCommand,
    userId: string,
  ): Promise<Account | undefined>;

  remove(id: string, userId: string): Promise<boolean>;

  getBalance(id: string, userId: string): Promise<number>;

  getTotalBalance(userId: string): Promise<number>;
}
