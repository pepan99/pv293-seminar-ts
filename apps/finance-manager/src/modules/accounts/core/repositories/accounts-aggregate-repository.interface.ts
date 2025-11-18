import { AccountAggregate } from '../aggregates/accounts.aggregate';

export interface IAccountsAggregateRepository {
  findById(id: string): Promise<AccountAggregate | null>;
  findByUserId(userId: string): Promise<AccountAggregate[]>;
  findByName(name: string, userId: string): Promise<AccountAggregate | null>;
  save(accountAggregate: AccountAggregate): void;
  saveWithTransaction(accountAggregate: AccountAggregate): void;
  createAccount(aggregate: AccountAggregate): Promise<void>;
  updateAccount(aggregate: AccountAggregate): Promise<void>;
  removeAccount(aggregate: AccountAggregate): Promise<void>;
}
