import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { UpdateUserAdminCommand } from '../core/types/user-commands';
import { FindAllUsersUseCase } from './find-all-users.use-case';
import { IUsersRepository } from '../core/repositories/users-repository.interface';

@Injectable()
export class UpdateUserAdminUseCase {
  constructor(
    private usersRepository: IUsersRepository,
    private findAllUsersUseCase: FindAllUsersUseCase,
  ) {}

  async execute(id: string, command: UpdateUserAdminCommand) {
    const user = await this.usersRepository.findOne(id);

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    // Check if removing admin role from the last admin
    if (
      command.roles &&
      !command.roles.includes('admin') &&
      user.roles.includes('admin')
    ) {
      const users = await this.findAllUsersUseCase.execute();
      const admins = users.filter(
        (u) => u.roles.includes('admin') && u.id !== id,
      );

      if (admins.length === 0) {
        throw new BadRequestException('Cannot remove the last admin user');
      }
    }

    const updatedUser = await this.usersRepository.updateWithRoles(id, command);

    if (!updatedUser) {
      throw new NotFoundException(`Failed to update user with ID ${id}`);
    }

    return updatedUser;
  }
}
