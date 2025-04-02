import { Injectable } from '@nestjs/common';
import { UserWithoutPassword } from '../core/entities/user.entity';
import { UsersRepository } from '../infrastructure/repositories/users.repository';

@Injectable()
export class FindAllUsersUseCase {
  constructor(private usersRepository: UsersRepository) {}

  async execute(): Promise<UserWithoutPassword[]> {
    return this.usersRepository.findAll();
  }
}
