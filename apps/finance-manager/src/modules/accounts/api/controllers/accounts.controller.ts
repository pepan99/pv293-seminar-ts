import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CreateAccountDto, UpdateAccountDto } from '../dtos/accounts-zod.dtos';
import { CreateAccountCommand } from '../../application/commands/create-account.handler';
import { RemoveAccountUseCase } from '../../application/remove-account.use-case';
import { UpdateAccountUseCase } from '../../application/update-account-use-case';
import { FindOneAccountQuery } from '../../application/queries/find-one-account.handler';
import { GetTotalBalanceUseCase } from '../../application/get-total-balance.use-case';
import { FindAllAccountsQuery } from '../../application/queries/find-all-accounts.handler';
import { JwtAuthGuard } from '../../../../shared-kernel/api/guards/jwt.guard';
import { User } from '../../../../shared-kernel/api/decorators/user.decorator';
import { RequestUser } from '../../../../shared-kernel/core/types/user-types';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { GetAccountBalanceQuery } from '../../application/queries/get-account-balance.use-case';

@ApiTags('accounts')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('accounts')
export class AccountsController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
    private readonly removeAccountUseCase: RemoveAccountUseCase,
    private readonly updateAccountUseCase: UpdateAccountUseCase,
    private readonly getTotalBalanceUseCase: GetTotalBalanceUseCase,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new financial account' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Account created successfully',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Bad Request',
  })
  async create(
    @Body() createAccountDto: CreateAccountDto,
    @User() user: RequestUser,
  ) {
    return this.commandBus.execute(
      new CreateAccountCommand(createAccountDto, user.userId),
    );
  }

  @Get(':id/balance')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get the current balance for an account' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Return the account balance',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Account not found',
  })
  async getBalance(@Param('id') id: string, @User() user: RequestUser) {
    return this.queryBus.execute(new GetAccountBalanceQuery(id, user.userId));
  }

  @Get('total-balance')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get the total balance for an user' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Return the total balance for user',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Accounts or user not found',
  })
  async getBalanceForAllUserAccounts(@User() user: RequestUser) {
    return this.getTotalBalanceUseCase.execute(user.userId);
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get a specific account by ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Return the account',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Account not found',
  })
  async findOne(@Param('id') id: string, @User() user: RequestUser) {
    return this.queryBus.execute(new FindOneAccountQuery(id, user.userId));
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get all accounts for the current user' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Return all accounts',
  })
  async findAll(@User() user: RequestUser) {
    return this.queryBus.execute(new FindAllAccountsQuery(user.userId));
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update an account' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Account updated successfully',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Account not found',
  })
  async update(
    @Param('id') id: string,
    @Body() updateAccountDto: UpdateAccountDto,
    @User() user: RequestUser,
  ) {
    return this.updateAccountUseCase.execute(id, updateAccountDto, user.userId);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete an account' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Account deleted successfully',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Account not found',
  })
  async remove(@Param('id') id: string, @User() user: RequestUser) {
    return this.removeAccountUseCase.execute(id, user.userId);
  }
}
