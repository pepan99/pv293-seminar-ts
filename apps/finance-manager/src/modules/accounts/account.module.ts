import { Module } from '@nestjs/common';
import { AccountController } from './account.service';
import { AccountService } from './account.controller';

@Module({
  imports: [],
  controllers: [AccountController],
  providers: [AccountService],
})
export class AccountModule {}
