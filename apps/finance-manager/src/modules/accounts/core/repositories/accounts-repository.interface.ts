import { CreateAccountCommand } from '../../application/commands/create-account-command.handler';
import { UpdateAccountCommand } from '../../application/commands/update-account-command.handler';
import { Account } from '../types/types';

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
