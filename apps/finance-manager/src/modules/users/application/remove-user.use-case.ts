import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { IUsersRepository } from '../core/repositories/users-repository.interface';

@Injectable()
export class RemoveUserUseCase {
  constructor(
    @Inject('IUsersRepository') private usersRepository: IUsersRepository,
  ) {}

  async execute(id: string): Promise<void> {
    const user = await this.usersRepository.findOne(id);

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    await this.usersRepository.remove(user.id);
  }
}
