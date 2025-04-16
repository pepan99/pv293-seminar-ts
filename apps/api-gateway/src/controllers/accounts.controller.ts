import {
  Body,
  Controller,
  Delete,
  Get,
  Inject,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from "@nestjs/common";
import { ClientProxy } from "@nestjs/microservices";
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiParam,
} from "@nestjs/swagger";
import { JwtAuthGuard } from "shared-kernel/src";
import { firstValueFrom } from "rxjs";
import {
  CreateAccountDto,
  UpdateAccountDto,
  ReconcileAccountDto,
  AccountDto,
  BalanceResponseDto,
  TotalBalanceResponseDto,
  AccountsResponseDto,
} from "../models/accounts.models";

@ApiTags("Accounts")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller("accounts")
export class AccountsController {
  constructor(
    @Inject("ACCOUNTS_SERVICE") private readonly accountsClient: ClientProxy,
  ) {}

  @Post()
  @ApiOperation({
    summary: "Create a new account",
    description: "Creates a new financial account for the authenticated user",
  })
  @ApiBody({ type: CreateAccountDto })
  @ApiResponse({
    status: 201,
    description: "Account created successfully",
    type: AccountDto,
  })
  @ApiResponse({
    status: 400,
    description: "Bad request - Invalid input data",
  })
  async createAccount(
    @Body() createAccountDto: CreateAccountDto,
    @Req() req: any,
  ) {
    return firstValueFrom(
      this.accountsClient.send("create_account", {
        dto: createAccountDto,
        user: req.user,
      }),
    );
  }

  @Get(":id/balance")
  @ApiOperation({
    summary: "Get account balance",
    description: "Retrieves the current balance of a specific account",
  })
  @ApiParam({
    name: "id",
    description: "Account ID",
    example: "123e4567-e89b-12d3-a456-426614174000",
  })
  @ApiResponse({
    status: 200,
    description: "Account balance retrieved successfully",
    type: BalanceResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: "Account not found",
  })
  async getAccountBalance(@Param("id") id: string, @Req() req: any) {
    return firstValueFrom(
      this.accountsClient.send("get_account_balance", {
        id,
        userId: req.user.userId,
      }),
    );
  }

  @Get("total-balance")
  @ApiOperation({
    summary: "Get total balance",
    description: "Retrieves the total balance across all accounts",
  })
  @ApiResponse({
    status: 200,
    description: "Total balance retrieved successfully",
    type: TotalBalanceResponseDto,
  })
  async getTotalBalance(@Req() req: any) {
    return firstValueFrom(
      this.accountsClient.send("get_total_balance", {
        userId: req.user.userId,
      }),
    );
  }

  @Get(":id")
  @ApiOperation({
    summary: "Get account by ID",
    description: "Retrieves detailed information about a specific account",
  })
  @ApiParam({
    name: "id",
    description: "Account ID",
    example: "123e4567-e89b-12d3-a456-426614174000",
  })
  @ApiResponse({
    status: 200,
    description: "Account retrieved successfully",
    type: AccountDto,
  })
  @ApiResponse({
    status: 404,
    description: "Account not found",
  })
  async getAccountById(@Param("id") id: string, @Req() req: any) {
    return firstValueFrom(
      this.accountsClient.send("get_account_by_id", {
        id,
        userId: req.user.userId,
      }),
    );
  }

  @Get()
  @ApiOperation({
    summary: "Get all accounts",
    description: "Retrieves all accounts belonging to the authenticated user",
  })
  @ApiResponse({
    status: 200,
    description: "Accounts retrieved successfully",
    type: AccountsResponseDto,
  })
  async getAllAccounts(@Req() req: any) {
    return firstValueFrom(
      this.accountsClient.send("get_all_accounts", {
        userId: req.user.userId,
      }),
    );
  }

  @Patch(":id")
  @ApiOperation({
    summary: "Update account",
    description: "Updates an existing account's information",
  })
  @ApiParam({
    name: "id",
    description: "Account ID",
    example: "123e4567-e89b-12d3-a456-426614174000",
  })
  @ApiBody({ type: UpdateAccountDto })
  @ApiResponse({
    status: 200,
    description: "Account updated successfully",
    type: AccountDto,
  })
  @ApiResponse({
    status: 400,
    description: "Bad request - Invalid input data",
  })
  @ApiResponse({
    status: 404,
    description: "Account not found",
  })
  async updateAccount(
    @Param("id") id: string,
    @Body() updateAccountDto: UpdateAccountDto,
    @Req() req: any,
  ) {
    return firstValueFrom(
      this.accountsClient.send("update_account", {
        id,
        dto: updateAccountDto,
        userId: req.user.userId,
      }),
    );
  }

  @Patch(":id/reconcile")
  @ApiOperation({
    summary: "Reconcile account",
    description: "Reconciles the account balance with an actual balance",
  })
  @ApiParam({
    name: "id",
    description: "Account ID",
    example: "123e4567-e89b-12d3-a456-426614174000",
  })
  @ApiBody({ type: ReconcileAccountDto })
  @ApiResponse({
    status: 200,
    description: "Account reconciled successfully",
    type: AccountDto,
  })
  @ApiResponse({
    status: 400,
    description: "Bad request - Invalid input data",
  })
  @ApiResponse({
    status: 404,
    description: "Account not found",
  })
  async reconcileAccount(
    @Param("id") id: string,
    @Body() reconcileAccountDto: ReconcileAccountDto,
    @Req() req: any,
  ) {
    return firstValueFrom(
      this.accountsClient.send("reconcile_account", {
        id,
        dto: reconcileAccountDto,
        userId: req.user.userId,
      }),
    );
  }

  @Delete(":id")
  @ApiOperation({
    summary: "Remove account",
    description: "Deletes an account (soft delete)",
  })
  @ApiParam({
    name: "id",
    description: "Account ID",
    example: "123e4567-e89b-12d3-a456-426614174000",
  })
  @ApiResponse({
    status: 200,
    description: "Account removed successfully",
    schema: {
      properties: {
        success: { type: "boolean", example: true },
        message: { type: "string", example: "Account successfully removed" },
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: "Account not found",
  })
  async removeAccount(@Param("id") id: string, @Req() req: any) {
    return firstValueFrom(
      this.accountsClient.send("remove_account", {
        id,
        userId: req.user.userId,
      }),
    );
  }
}
