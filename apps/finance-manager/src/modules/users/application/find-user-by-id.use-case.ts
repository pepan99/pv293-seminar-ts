import { Injectable, NotFoundException } from '@nestjs/common';
import { IUsersRepository } from '../core/repositories/users-repository.interface';

@Injectable()
export class FindUserByIdUseCase {
  constructor(private usersRepository: IUsersRepository) {}

  async execute(id: string) {
    const user = await this.usersRepository.findOne(id);

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return user;
  }
}
