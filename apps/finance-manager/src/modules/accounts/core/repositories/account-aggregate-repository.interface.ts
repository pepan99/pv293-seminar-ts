import { AccountAggregate } from '../aggregates/account.aggregate';

export interface IAccountAggregateRepository {
  /**
   * Nájde účet podľa ID a userId
   */
  findById(id: string, userId: string): Promise<AccountAggregate | null>;

  /**
   * Načíta všetky účty používateľa
   */
  findAll(userId: string): Promise<AccountAggregate[]>;

  /**
   * Vytvorí nový účet (persistuje agregát)
   */
  createAccount(aggregate: AccountAggregate): Promise<void>;

  /**
   * Aktualizuje existujúci účet
   */
  updateAccount(aggregate: AccountAggregate): Promise<void>;

  /**
   * Odstráni účet (soft alebo hard delete)
   */
  removeAccount(aggregate: AccountAggregate): Promise<void>;

  /**
   * Uloží stav agregátu (commit eventov)
   */
  save(aggregate: AccountAggregate): void;
}
