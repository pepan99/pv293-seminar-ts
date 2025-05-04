import { AccountAggregate } from "../aggregates/account.aggregate";

export interface IAccountsAggregateRepository {
    findById(id: string, userId: string): Promise<AccountAggregate | null>;
    findByName(name: string, userId: string): Promise<AccountAggregate | null>;
    save(accountAggregate: AccountAggregate): void;
    createAccount(aggregate: AccountAggregate): Promise<void>;
    updateAccount(aggregate: AccountAggregate): Promise<void>;
    updateAccountBalance(aggregate: AccountAggregate): Promise<void>;
    updateAccountStatus(aggregate: AccountAggregate): Promise<void>;
    removeAccount(aggregate: AccountAggregate): Promise<void>;
    getAllUserAccounts(userId: string): Promise<AccountAggregate[]>;
}
