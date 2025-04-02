import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { UpdateUserAdminDto } from '../api/dto/zod-dtos';
import { UserWithoutPassword } from '../core/entities/user.entity';
import { UsersRepository } from '../infrastructure/repositories/users.repository';
import { FindAllUsersUseCase } from './find-all-users.use-case';

@Injectable()
export class UpdateUserAdminUseCase {
  constructor(
    private usersRepository: UsersRepository,
    private findAllUsersUseCase: FindAllUsersUseCase,
  ) {}

  async execute(
    id: string,
    updateUserDto: UpdateUserAdminDto,
  ): Promise<UserWithoutPassword> {
    const user = await this.usersRepository.findOne(id);

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    // Check if removing admin role from the last admin
    if (
      updateUserDto.roles &&
      !updateUserDto.roles.includes('admin') &&
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

    const updatedUser = await this.usersRepository.updateWithRoles(
      id,
      updateUserDto,
    );

    if (!updatedUser) {
      throw new NotFoundException(`Failed to update user with ID ${id}`);
    }

    return updatedUser;
  }
}
