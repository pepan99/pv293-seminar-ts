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
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { CreateAccountDto, UpdateAccountDto } from '../dtos/accounts-zod.dtos';
import { CreateAccountCommand } from '../../application/commands/create-account.handler';
import { UpdateAccountCommand } from '../../application/commands/update-account.handler';
import { RemoveAccountCommand } from '../../application/commands/remove-account.handler';
import { GetAccountBalanceQuery } from '../../application/queries/get-account-balance.handler';
import { GetTotalBalanceQuery } from '../../application/queries/get-total-balance.handler';
import { FindOneAccountQuery } from '../../application/queries/find-one-account.handler';
import { FindAllAccountsQuery } from '../../application/queries/find-all-accounts.handler';
import { JwtAuthGuard } from '../../../../shared-kernel/api/guards/jwt.guard';
import { User } from '../../../../shared-kernel/api/decorators/user.decorator';
import { RequestUser } from '../../../../shared-kernel/core/types/user-types';

@ApiTags('accounts')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('accounts')
export class AccountsController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) { }

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
      new CreateAccountCommand(
        user.userId,
        createAccountDto.name,
        createAccountDto.description,
        createAccountDto.currency,
        createAccountDto.notes,
        createAccountDto.icon,
        createAccountDto.color,
        createAccountDto.accountType,
      ),
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
    return this.queryBus.execute(
      new GetAccountBalanceQuery(id, user.userId),
    );
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
    return this.queryBus.execute(new GetTotalBalanceQuery(user.userId));
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
    return this.commandBus.execute(
      new UpdateAccountCommand(
        id,
        user.userId,
        updateAccountDto.name,
        updateAccountDto.description,
        updateAccountDto.icon,
        updateAccountDto.color,
      ),
    );
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
    return this.commandBus.execute(new RemoveAccountCommand(id, user.userId));
  }
}
