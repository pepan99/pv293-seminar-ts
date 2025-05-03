export enum AccountType {
  CASH = 'CASH',
  BANK = 'BANK',
  CREDIT = 'CREDIT',
  INVESTMENT = 'INVESTMENT',
  ASSET = 'ASSET',
  LIABILITY = 'LIABILITY',
}

export interface CreateAccountCommand {
  name: string;
  description?: string;
  accountType: AccountType;
  currency: string;
  notes?: string;
  icon?: string;
  color?: string;
}

export interface UpdateAccountCommand {
  name?: string;
  description?: string;
  icon?: string;
  color?: string;
}

export interface ReconcileAccountCommand {
  actualBalance: number;
  notes?: string;
}

export interface SystemAccountOperationsCommand {
  isActive: boolean;
  lastUpdated: Date;
  lastReconciled?: Date;
}
