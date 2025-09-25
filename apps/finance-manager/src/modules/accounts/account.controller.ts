import { Controller, Get, Param } from '@nestjs/common';
import { AccountService } from './account.service';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';

@Controller('accounts')
export class AccountController {
  constructor(private readonly accountService: AccountService) {}
  @Get(':userId')
  @ApiOperation({ summary: 'Get all accounts for user' })
  @ApiResponse({ status: 200, description: "Return the user's accounts" })
  getAllAccounts(@Param('userId') userId: string) {
    return this.accountService.getAccounts(userId);
  }
}
