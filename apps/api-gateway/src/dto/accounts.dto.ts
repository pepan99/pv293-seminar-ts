import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class CreateAccountDto {
  @ApiProperty({ example: "My Savings" })
  name!: string;

  @ApiProperty({ example: "BANK" })
  accountType!: string;

  @ApiPropertyOptional({ example: "EUR" })
  currency?: string;

  @ApiPropertyOptional({ example: "My savings account" })
  description?: string;

  @ApiPropertyOptional()
  notes?: string;

  @ApiPropertyOptional()
  icon?: string;

  @ApiPropertyOptional()
  color?: string;
}

export class UpdateAccountDto {
  @ApiPropertyOptional({ example: "Updated Name" })
  name?: string;

  @ApiPropertyOptional({ example: "Updated description" })
  description?: string;

  @ApiPropertyOptional()
  icon?: string;

  @ApiPropertyOptional()
  color?: string;
}

export class ReconcileAccountDto {
  @ApiProperty({ example: 1000.5 })
  actualBalance!: number;

  @ApiPropertyOptional()
  notes?: string;
}
