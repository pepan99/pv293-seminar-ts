import {
  Body,
  Controller,
  Delete,
  Get,
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
import { JwtAuthGuard } from '../../../auth/api/guards/jwt-auth.guard';
import { CreateUserAccountUseCase } from '../../application/create-user-account.use-case';
import { RemoveUserAccountUseCase } from '../../application/remove-user-account.use-case';
import { UpdateUserAccountUseCase } from '../../application/update-user-account.use-case';
import { FindAllUserAccountsUseCase } from '../../application/find-all-user-accounts.use-case';
import { FindUserAccountByIdUseCase } from '../../application/find-user-account-by-id.use-case';
import { GetUserAccountBalanceUseCase } from '../../application/get-user-account-ballance.use-case';
import { GetAllUserAccountsBalancesUseCase } from '../../application/get-all-user-accounts-ballances.use-case';
import { CreateAccountDto, UpdateAccountDto } from '../dtos/zod-dtos';
import { RequestUser } from '../../../users/api/dto/request-user';
import { User } from '../../../users/api/decorators/user.decorator';

@ApiTags('accounts')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('accounts')
export class AccountsController {
  constructor(
    private readonly createAccountUseCase: CreateUserAccountUseCase,
    private readonly getAccountBalanceUseCase: GetUserAccountBalanceUseCase,
    private readonly getAllAccountsBalancesUseCase: GetAllUserAccountsBalancesUseCase,
    private readonly findAccountByIdUseCase: FindUserAccountByIdUseCase,
    private readonly findAllAccountsUseCase: FindAllUserAccountsUseCase,
    private readonly updateAccountUseCase: UpdateUserAccountUseCase,
    private readonly removeAccountUseCase: RemoveUserAccountUseCase,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create a new financial account' })
  @ApiResponse({ status: 201, description: 'Account created successfully' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  create(
    @Body() createAccountDto: CreateAccountDto,
    @User() user: RequestUser,
  ) {
    return this.createAccountUseCase.execute(createAccountDto, user.userId);
  }

  @Get(':id/balance')
  @ApiOperation({ summary: 'Get the current balance for an account' })
  @ApiResponse({ status: 200, description: 'Return the account balance' })
  @ApiResponse({ status: 404, description: 'Account not found' })
  getBalance(@Param('id') id: string, @User() user: RequestUser) {
    return this.getAccountBalanceUseCase.execute(id, user.userId);
  }

  @Get('total-balance')
  @ApiOperation({ summary: 'Get the total balance for an user' })
  @ApiResponse({
    status: 200,
    description: 'Return the total balance for user',
  })
  @ApiResponse({ status: 404, description: 'Accounts not found' })
  @ApiResponse({ status: 404, description: 'User not found' })
  getBalanceForAllUserAccounts(@User() user: RequestUser) {
    return this.getAllAccountsBalancesUseCase.execute(user.userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a specific account by ID' })
  @ApiResponse({ status: 200, description: 'Return the account' })
  @ApiResponse({ status: 404, description: 'Account not found' })
  findOne(@Param('id') id: string, @User() user: RequestUser) {
    return this.findAccountByIdUseCase.execute(id, user.userId);
  }

  @Get()
  @ApiOperation({ summary: 'Get all accounts for the current user' })
  @ApiResponse({ status: 200, description: 'Return all accounts' })
  findAll(@User() user: RequestUser) {
    return this.findAllAccountsUseCase.execute(user.userId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update an account' })
  @ApiResponse({ status: 200, description: 'Account updated successfully' })
  @ApiResponse({ status: 404, description: 'Account not found' })
  update(
    @Param('id') id: string,
    @Body() updateAccountDto: UpdateAccountDto,
    @User() user: RequestUser,
  ) {
    return this.updateAccountUseCase.execute(id, updateAccountDto, user.userId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete an account' })
  @ApiResponse({ status: 200, description: 'Account deleted successfully' })
  @ApiResponse({ status: 404, description: 'Account not found' })
  remove(@Param('id') id: string, @User() user: RequestUser) {
    return this.removeAccountUseCase.execute(id, user.userId);
  }
}
