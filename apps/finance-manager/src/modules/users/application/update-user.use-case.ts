import { Injectable, NotFoundException } from '@nestjs/common';
import { UpdateUserDto } from '../api/dto/zod-dtos';
import { IUsersRepository } from '../core/repositories/users-repository.interface';

@Injectable()
export class UpdateUserUseCase {
  constructor(private usersRepository: IUsersRepository) {}

  async execute(id: string, updateUserDto: UpdateUserDto) {
    const user = await this.usersRepository.findOne(id);

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    const updatedUser = await this.usersRepository.update(id, updateUserDto);

    if (!updatedUser) {
      throw new NotFoundException(`Failed to update user with ID ${id}`);
    }

    return updatedUser;
  }
}
