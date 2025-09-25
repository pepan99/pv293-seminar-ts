import { Module } from '@nestjs/common';
import { AccountsController } from './accounts.controller';
import { AccountsService } from './accounts.service';
import { InMemoryAccountsRepository } from './repositories/accounts.repository';

@Module({
  imports: [],
  controllers: [AccountsController],
  providers: [AccountsService, InMemoryAccountsRepository],
  exports: [AccountsService],
})
export class AccountsModule {}
