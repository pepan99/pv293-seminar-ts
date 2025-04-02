import { Module } from '@nestjs/common';

import { UsersController } from './api/controllers/users.controller';
import { UsersRepository } from './infrastructure/repositories/users.repository';
import { CreateUserUseCase } from './application/create-user.use-case';
import { FindAllUsersUseCase } from './application/find-all-users.use-case';
import { FindUserByIdUseCase } from './application/find-user-by-id.use-case';
import { FindUserByEmailUseCase } from './application/find-user-by-email.use-case';
import { UpdateUserUseCase } from './application/update-user.use-case';
import { UpdateUserAdminUseCase } from './application/update-user-admin.use-case';
import { RemoveUserUseCase } from './application/remove-user.use-case';
import { ChangePasswordUseCase } from './application/change-password.use-case';

const useCases = [
  CreateUserUseCase,
  FindAllUsersUseCase,
  FindUserByIdUseCase,
  FindUserByEmailUseCase,
  UpdateUserUseCase,
  UpdateUserAdminUseCase,
  RemoveUserUseCase,
  ChangePasswordUseCase,
];

@Module({
  controllers: [UsersController],
  providers: [UsersRepository, ...useCases],
  exports: [
    UsersRepository,
    CreateUserUseCase,
    FindUserByIdUseCase,
    FindUserByEmailUseCase,
  ],
})
export class UsersModule {}
