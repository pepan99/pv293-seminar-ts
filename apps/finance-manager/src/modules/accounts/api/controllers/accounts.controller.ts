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
import { JwtAuthGuard } from '../../../auth/api/guards/jwt-auth.guard';
import { AccountsService } from '../../application/accounts.service';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CreateAccountDto, UpdateAccountDto } from '../dto/accounts-zod.dtos';
import { User } from '../../../users/api/decorators/user.decorator';
import { RequestUser } from '../../../../shared/types/request-user';

@ApiTags('accounts')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('accounts')
export class AccountsController {
  constructor(private readonly accountsService: AccountsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new financial account' })
  @ApiResponse({ status: 201, description: 'Account created successfully' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  create(
    @Body() createAccountDto: CreateAccountDto,
    @User() user: RequestUser,
  ) {
    return this.accountsService.create(createAccountDto, user.userId);
  }

  @Get(':id/balance')
  @ApiOperation({ summary: 'Get the current balance for an account' })
  @ApiResponse({ status: 200, description: 'Return the account balance' })
  @ApiResponse({ status: 404, description: 'Account not found' })
  getBalance(@Param('id') id: string, @User() user: RequestUser) {
    return this.accountsService.getAccountBalance(id, user.userId);
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
    return this.accountsService.getBalanceForAllUserAccounts(user.userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a specific account by ID' })
  @ApiResponse({ status: 200, description: 'Return the account' })
  @ApiResponse({ status: 404, description: 'Account not found' })
  findOne(@Param('id') id: string, @User() user: RequestUser) {
    return this.accountsService.findOne(id, user.userId);
  }

  @Get()
  @ApiOperation({ summary: 'Get all accounts for the current user' })
  @ApiResponse({ status: 200, description: 'Return all accounts' })
  findAll(@User() user: RequestUser) {
    return this.accountsService.findAll(user.userId);
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
    return this.accountsService.update(id, updateAccountDto, user.userId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete an account' })
  @ApiResponse({ status: 200, description: 'Account deleted successfully' })
  @ApiResponse({ status: 404, description: 'Account not found' })
  remove(@Param('id') id: string, @User() user: RequestUser) {
    return this.accountsService.remove(id, user.userId);
  }
}
