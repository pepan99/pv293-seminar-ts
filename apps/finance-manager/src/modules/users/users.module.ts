// users.module.ts
import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { AuthModule } from '../auth/auth.module';
import { InMemoryUsersRepository } from './repositories/in-memory-users.repository';

@Module({
  imports: [AuthModule],
  controllers: [UsersController],
  providers: [UsersService, InMemoryUsersRepository],
  exports: [UsersService],
})
export class UsersModule {}
