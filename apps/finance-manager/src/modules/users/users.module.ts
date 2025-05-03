import { Module } from '@nestjs/common';

import { CqrsModule } from '@nestjs/cqrs';
import { UsersController } from './api/controllers/users.controller';
import { UsersRepository } from './infrastructure/repositories/users.repository';
import { CreateUserCommandHandler } from './application/commands/create-user.handler';
import { UpdateUserCommandHandler } from './application/commands/update-user.handler';
import { UpdateUserAdminCommandHandler } from './application/commands/update-user-admin.handler';
import { RemoveUserCommandHandler } from './application/commands/remove-user.handler';
import { ChangePasswordCommandHandler } from './application/commands/change-password.handler';
import { GetAllUsersQueryHandler } from './application/queries/get-all-users.handler';
import { GetUserByIdQueryHandler } from './application/queries/get-user-by-id.handler';
import { GetUserByEmailQueryHandler } from './application/queries/get-user-by-email.handler';
import { UserAggregateRepository } from './infrastructure/repositories/users-aggregate.repository';

const commandHandlers = [
  CreateUserCommandHandler,
  UpdateUserCommandHandler,
  UpdateUserAdminCommandHandler,
  RemoveUserCommandHandler,
  ChangePasswordCommandHandler,
];

const queryHandlers = [
  GetUserByIdQueryHandler,
  GetUserByEmailQueryHandler,
  GetAllUsersQueryHandler,
];

@Module({
  imports: [CqrsModule],
  controllers: [UsersController],
  providers: [
    {
      provide: 'IUsersRepository',
      useClass: UsersRepository,
    },
    {
      provide: 'IUsersAggregateRepository',
      useClass: UserAggregateRepository,
    },
    ...commandHandlers,
    ...queryHandlers,
  ],
  exports: [
    'IUsersRepository',
    'IUsersAggregateRepository',
    CqrsModule,
    ...commandHandlers,
    ...queryHandlers,
  ],
})
export class UsersModule {}
