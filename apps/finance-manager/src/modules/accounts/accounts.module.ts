import { Module } from '@nestjs/common';
import { AccountsService } from './accounts.service';
import { AccountsController } from './accounts.controller';
import { InMemoryAccountsRepository } from './repositories/in-memory-accounts.repository';

@Module({
  controllers: [AccountsController],
  providers: [AccountsService, InMemoryAccountsRepository],
  exports: [AccountsService],
})
export class AccountsModule {}
