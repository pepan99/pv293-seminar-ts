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
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from 'shared-kernel/src';
import { firstValueFrom } from 'rxjs';

@ApiTags('accounts')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('accounts')
export class AccountsController {
  constructor(
    @Inject('ACCOUNTS_SERVICE') private readonly accountsClient: ClientProxy,
  ) { }

  @Post()
  async createAccount(@Body() createAccountDto: any, @Req() req: any) {
    return firstValueFrom(
      this.accountsClient.send('create_account', {
        dto: createAccountDto,
        user: req.user
      })
    );
  }

  @Get(':id/balance')
  async getAccountBalance(@Param('id') id: string, @Req() req: any) {
    return firstValueFrom(
      this.accountsClient.send('get_account_balance', {
        id,
        userId: req.user.userId
      })
    );
  }

  @Get('total-balance')
  async getTotalBalance(@Req() req: any) {
    return firstValueFrom(
      this.accountsClient.send('get_total_balance', {
        userId: req.user.userId
      })
    );
  }

  @Get(':id')
  async getAccountById(@Param('id') id: string, @Req() req: any) {
    return firstValueFrom(
      this.accountsClient.send('get_account_by_id', {
        id,
        userId: req.user.userId
      })
    );
  }

  @Get()
  async getAllAccounts(@Req() req: any) {
    return firstValueFrom(
      this.accountsClient.send('get_all_accounts', {
        userId: req.user.userId
      })
    );
  }

  @Patch(':id')
  async updateAccount(
    @Param('id') id: string,
    @Body() updateAccountDto: any,
    @Req() req: any,
  ) {
    return firstValueFrom(
      this.accountsClient.send('update_account', {
        id,
        dto: updateAccountDto,
        userId: req.user.userId,
      })
    );
  }

  @Patch(':id/reconcile')
  async reconcileAccount(
    @Param('id') id: string,
    @Body() reconcileAccountDto: any,
    @Req() req: any,
  ) {
    return firstValueFrom(
      this.accountsClient.send('reconcile_account', {
        id,
        dto: reconcileAccountDto,
        userId: req.user.userId,
      })
    );
  }

  @Delete(':id')
  async removeAccount(@Param('id') id: string, @Req() req: any) {
    return firstValueFrom(
      this.accountsClient.send('remove_account', {
        id,
        userId: req.user.userId,
      })
    );
  }
}
