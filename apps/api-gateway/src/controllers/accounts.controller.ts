import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpException,
  HttpStatus,
  Param,
  Patch,
  Post,
  UseGuards,
} from "@nestjs/common";
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from "@nestjs/swagger";
import {
  JwtAuthGuard,
  RabbitMQRpcClient,
  RequestUser,
  User,
} from "shared-kernel";
import { GatewayConfigService } from "../config/gateway.config";
import {
  CreateAccountDto,
  ReconcileAccountDto,
  UpdateAccountDto,
} from "../dto/accounts.dto";

@ApiTags("accounts")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller("accounts")
export class AccountsController {
  constructor(
    private readonly rpcClient: RabbitMQRpcClient,
    private readonly config: GatewayConfigService,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: "Create a new financial account" })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: "Account created successfully",
  })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: "Bad Request" })
  async create(@Body() dto: CreateAccountDto, @User() user: RequestUser) {
    const response = await this.rpcClient.send(
      this.config.accountsServiceQueue,
      "accounts.create",
      { ...dto, userId: user.userId },
    );

    if (!response.success) {
      throw new HttpException(
        response.error || "Failed to create account",
        HttpStatus.BAD_REQUEST,
      );
    }

    return response.data;
  }

  @Get(":id/balance")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Get the current balance for an account" })
  @ApiResponse({
    status: HttpStatus.OK,
    description: "Return the account balance",
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: "Account not found",
  })
  async getBalance(@Param("id") id: string, @User() user: RequestUser) {
    const response = await this.rpcClient.send(
      this.config.accountsServiceQueue,
      "accounts.getBalance",
      { accountId: id, userId: user.userId },
    );

    if (!response.success) {
      throw new HttpException(
        response.error || "Account not found",
        HttpStatus.NOT_FOUND,
      );
    }

    return response.data;
  }

  @Get("total-balance")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Get the total balance for a user" })
  @ApiResponse({
    status: HttpStatus.OK,
    description: "Return the total balance for user",
  })
  async getBalanceForAllUserAccounts(@User() user: RequestUser) {
    const response = await this.rpcClient.send(
      this.config.accountsServiceQueue,
      "accounts.getTotalBalance",
      { userId: user.userId },
    );

    if (!response.success) {
      throw new HttpException(
        response.error || "Failed to get total balance",
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    return response.data;
  }

  @Get(":id")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Get a specific account by ID" })
  @ApiResponse({ status: HttpStatus.OK, description: "Return the account" })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: "Account not found",
  })
  async findOne(@Param("id") id: string, @User() user: RequestUser) {
    const response = await this.rpcClient.send(
      this.config.accountsServiceQueue,
      "accounts.getById",
      { accountId: id, userId: user.userId },
    );

    if (!response.success) {
      throw new HttpException(
        response.error || "Account not found",
        HttpStatus.NOT_FOUND,
      );
    }

    return response.data;
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Get all accounts for the current user" })
  @ApiResponse({ status: HttpStatus.OK, description: "Return all accounts" })
  async findAll(@User() user: RequestUser) {
    const response = await this.rpcClient.send(
      this.config.accountsServiceQueue,
      "accounts.getAll",
      { userId: user.userId },
    );

    if (!response.success) {
      throw new HttpException(
        response.error || "Failed to get accounts",
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    return response.data;
  }

  @Patch(":id")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Update an account" })
  @ApiResponse({
    status: HttpStatus.OK,
    description: "Account updated successfully",
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: "Account not found",
  })
  async update(
    @Param("id") id: string,
    @Body() dto: UpdateAccountDto,
    @User() user: RequestUser,
  ) {
    const response = await this.rpcClient.send(
      this.config.accountsServiceQueue,
      "accounts.update",
      { accountId: id, userId: user.userId, ...dto },
    );

    if (!response.success) {
      throw new HttpException(
        response.error || "Failed to update account",
        HttpStatus.BAD_REQUEST,
      );
    }

    return response.data;
  }

  @Patch(":id/reconcile")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Reconcile account balance" })
  @ApiResponse({
    status: HttpStatus.OK,
    description: "Account reconciled successfully",
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: "Account not found",
  })
  async reconcile(
    @Param("id") id: string,
    @Body() dto: ReconcileAccountDto,
    @User() user: RequestUser,
  ) {
    const response = await this.rpcClient.send(
      this.config.accountsServiceQueue,
      "accounts.reconcile",
      { accountId: id, userId: user.userId, ...dto },
    );

    if (!response.success) {
      throw new HttpException(
        response.error || "Failed to reconcile account",
        HttpStatus.BAD_REQUEST,
      );
    }

    return response.data;
  }

  @Delete(":id")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Delete an account" })
  @ApiResponse({
    status: HttpStatus.OK,
    description: "Account deleted successfully",
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: "Account not found",
  })
  async remove(@Param("id") id: string, @User() user: RequestUser) {
    const response = await this.rpcClient.send(
      this.config.accountsServiceQueue,
      "accounts.remove",
      { accountId: id, userId: user.userId },
    );

    if (!response.success) {
      throw new HttpException(
        response.error || "Failed to delete account",
        HttpStatus.BAD_REQUEST,
      );
    }

    return response.data;
  }
}
