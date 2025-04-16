import { ApiProperty } from "@nestjs/swagger";

export enum AccountType {
  ASSET = "ASSET",
  BANK = "BANK",
  CASH = "CASH",
  CREDIT = "CREDIT",
  INVESTMENT = "INVESTMENT",
  LIABILITY = "LIABILITY",
}

export class CreateAccountDto {
  @ApiProperty({
    description: "Account name",
    example: "Main Checking Account",
  })
  name: string;

  @ApiProperty({
    description: "Account description",
    example: "Primary checking account for daily expenses",
    required: false,
  })
  description?: string;

  @ApiProperty({
    description: "Account type",
    enum: AccountType,
    example: AccountType.BANK,
  })
  accountType: AccountType;

  @ApiProperty({
    description: "Account currency",
    example: "EUR",
    default: "EUR",
  })
  currency: string;

  @ApiProperty({
    description: "Additional notes about the account",
    example: "Joint account with spouse",
    required: false,
  })
  notes?: string;

  @ApiProperty({
    description: "Account icon identifier",
    example: "bank",
    required: false,
  })
  icon?: string;

  @ApiProperty({
    description: "Account color (hex code)",
    example: "#4285F4",
    required: false,
  })
  color?: string;
}

export class UpdateAccountDto {
  @ApiProperty({
    description: "Account name",
    example: "Updated Checking Account",
    required: false,
  })
  name?: string;

  @ApiProperty({
    description: "Account description",
    example: "Updated description",
    required: false,
  })
  description?: string;

  @ApiProperty({
    description: "Account icon identifier",
    example: "savings",
    required: false,
  })
  icon?: string;

  @ApiProperty({
    description: "Account color (hex code)",
    example: "#34A853",
    required: false,
  })
  color?: string;
}

export class ReconcileAccountDto {
  @ApiProperty({
    description: "Actual balance to reconcile with",
    example: 1250.75,
  })
  actualBalance: number;

  @ApiProperty({
    description: "Notes about the reconciliation",
    example: "Reconciled after checking bank statement",
    required: false,
  })
  notes?: string;
}

export class AccountDto {
  @ApiProperty({
    description: "Account ID",
    example: "123e4567-e89b-12d3-a456-426614174000",
  })
  id: string;

  @ApiProperty({
    description: "Account name",
    example: "Main Checking Account",
  })
  name: string;

  @ApiProperty({
    description: "Account description",
    example: "Primary checking account for daily expenses",
    required: false,
  })
  description?: string;

  @ApiProperty({
    description: "Account type",
    enum: AccountType,
    example: AccountType.BANK,
  })
  accountType: AccountType;

  @ApiProperty({
    description: "Account currency",
    example: "EUR",
  })
  currency: string;

  @ApiProperty({
    description: "Current account balance",
    example: 1250.75,
  })
  balance: number;

  @ApiProperty({
    description: "Last reconciled balance",
    example: 1200.5,
    required: false,
  })
  reconciledBalance?: number;

  @ApiProperty({
    description: "Notes about the account",
    example: "Joint account with spouse",
    required: false,
  })
  notes?: string;

  @ApiProperty({
    description: "Account icon identifier",
    example: "bank",
    required: false,
  })
  icon?: string;

  @ApiProperty({
    description: "Account color (hex code)",
    example: "#4285F4",
    required: false,
  })
  color?: string;

  @ApiProperty({
    description: "Is the account active",
    example: true,
  })
  isActive: boolean;

  @ApiProperty({
    description: "Account creation date",
    example: "2023-01-01T00:00:00.000Z",
  })
  createdAt: Date;

  @ApiProperty({
    description: "Account last update date",
    example: "2023-01-01T00:00:00.000Z",
  })
  updatedAt: Date;

  @ApiProperty({
    description: "Account last reconciliation date",
    example: "2023-01-15T00:00:00.000Z",
    required: false,
  })
  lastReconciled?: Date;
}

export class BalanceResponseDto {
  @ApiProperty({
    description: "Account balance",
    example: 1250.75,
  })
  balance: number;

  @ApiProperty({
    description: "Account currency",
    example: "EUR",
  })
  currency: string;
}

export class TotalBalanceResponseDto {
  @ApiProperty({
    description: "Total balance across all accounts",
    example: 5750.25,
  })
  totalBalance: number;

  @ApiProperty({
    description: "Base currency for the total",
    example: "EUR",
  })
  currency: string;

  @ApiProperty({
    description: "Breakdown by account type",
    example: {
      ASSET: 1000,
      BANK: 3500.25,
      CASH: 250,
      CREDIT: -500,
      INVESTMENT: 1500,
      LIABILITY: 0,
    },
  })
  breakdown: Record<AccountType, number>;
}

export class AccountsResponseDto {
  @ApiProperty({
    description: "List of accounts",
    type: [AccountDto],
  })
  accounts: AccountDto[];

  @ApiProperty({
    description: "Total count of accounts",
    example: 5,
  })
  total: number;
}
