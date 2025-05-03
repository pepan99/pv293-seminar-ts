import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { UpdateUserCommand } from '../core/types/user-commands';
import { IUsersRepository } from '../core/repositories/users-repository.interface';

@Injectable()
export class UpdateUserUseCase {
  constructor(
    @Inject('IUsersRepository') private usersRepository: IUsersRepository,
  ) {}

  async execute(id: string, command: UpdateUserCommand) {
    const user = await this.usersRepository.findOne(id);

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    const updatedUser = await this.usersRepository.update(id, command);

    if (!updatedUser) {
      throw new NotFoundException(`Failed to update user with ID ${id}`);
    }

    return updatedUser;
  }
}
