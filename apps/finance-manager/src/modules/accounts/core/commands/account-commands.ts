export enum AccountType {
  CASH = 'CASH',
  BANK = 'BANK',
  CREDIT = 'CREDIT',
  INVESTMENT = 'INVESTMENT',
  ASSET = 'ASSET',
  LIABILITY = 'LIABILITY',
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
