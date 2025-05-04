import { UserAggregate } from "../aggregates/users.aggregate";

export interface IUserAggregateRepository {
    findById(id: string): Promise<UserAggregate | null>;
    findByEmail(email: string): Promise<UserAggregate | null>;
    save(userAggregate: UserAggregate): void;
    saveWithTransaction(userAggregate: UserAggregate): void;
    createUser(aggregate: UserAggregate): Promise<void>;
    updateUser(aggregate: UserAggregate): Promise<void>;
    updateUserWithRoles(aggregate: UserAggregate): Promise<void>;
    updatePassword(aggregate: UserAggregate): Promise<void>;
    removeUser(aggregate: UserAggregate): Promise<void>;
}
