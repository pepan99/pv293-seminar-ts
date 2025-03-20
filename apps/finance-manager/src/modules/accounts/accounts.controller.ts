import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AccountsService } from './accounts.service';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { CreateAccountDto, UpdateAccountDto } from './dtos/accounts-zod.dtos';
import { User } from '../users/decorators/user.decorator';
import { RequestUserEntity } from '../users/entities/user.entity';

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
    @User() user: RequestUserEntity,
  ) {
    return this.accountsService.create(createAccountDto, user.userId);
  }

  @Get()
  @ApiOperation({ summary: 'Get all accounts for the current user' })
  @ApiResponse({ status: 200, description: 'Return all accounts' })
  findAll(@User() user: RequestUserEntity) {
    return this.accountsService.findAll(user.userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a specific account by ID' })
  @ApiResponse({ status: 200, description: 'Return the account' })
  @ApiResponse({ status: 404, description: 'Account not found' })
  findOne(@Param('id') id: string, @User() user: RequestUserEntity) {
    return this.accountsService.findOne(id, user.userId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update an account' })
  @ApiResponse({ status: 200, description: 'Account updated successfully' })
  @ApiResponse({ status: 404, description: 'Account not found' })
  update(
    @Param('id') id: string,
    @Body() updateAccountDto: UpdateAccountDto,
    @User() user: RequestUserEntity,
  ) {
    return this.accountsService.update(id, updateAccountDto, user.userId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete an account' })
  @ApiResponse({ status: 200, description: 'Account deleted successfully' })
  @ApiResponse({
    status: 403,
    description: 'Cannot delete account with transactions',
  })
  @ApiResponse({ status: 404, description: 'Account not found' })
  remove(@Param('id') id: string, @User() user: RequestUserEntity) {
    return this.accountsService.remove(id, user.userId);
  }

  @Get(':id/balance')
  @ApiOperation({ summary: 'Get the current balance for an account' })
  @ApiResponse({ status: 200, description: 'Return the account balance' })
  @ApiResponse({ status: 404, description: 'Account not found' })
  getBalance(@Param('id') id: string, @User() user: RequestUserEntity) {
    return this.accountsService.getAccountBalance(id, user.userId);
  }
}
