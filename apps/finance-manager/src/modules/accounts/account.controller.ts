import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { AccountService } from './account.service';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { AccountBodyDto, AccountDto } from './dto/zod-dtos';
import { Account, AccountType } from './entities/user.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('users')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('accounts')
export class AccountController {
  constructor(private readonly accountService: AccountService) {}
  @Get(':userId')
  @ApiOperation({ summary: 'Get all accounts for user' })
  @ApiResponse({ status: 200, description: "Return the user's accounts" })
  getAllAccounts(@Param('userId') userId?: string): AccountDto[] {
    return this.accountService.getAccounts(userId);
  }

  @Post('')
  @ApiOperation({ summary: 'Create a new account for user' })
  @ApiResponse({
    status: 201,
    description: 'The account has been successfully created.',
  })
  createAccount(@Body() data: AccountBodyDto): AccountDto {
    const accountData: Account = {
      ...data,
      type: AccountType[data.type as keyof typeof AccountType], // Map string to enum
    };
    return this.accountService.createAccount(accountData);
  }
}
