import {
    InsertableAccounts,
    SelectableAccounts,
    UpdateableAccounts,
} from "../entities/accounts.entity";

export interface IAccountsRepository {
    create(data: InsertableAccounts, userId: string): Promise<SelectableAccounts>;

    findOne(id: string, userId: string): Promise<SelectableAccounts | undefined>;

    findAll(userId: string): Promise<SelectableAccounts[]>;

    update(
        id: string,
        command: UpdateableAccounts,
        userId: string,
    ): Promise<SelectableAccounts | undefined>;

    remove(id: string, userId: string): Promise<boolean>;

    getBalance(id: string, userId: string): Promise<number>;

    getTotalBalance(userId: string): Promise<number>;
}
