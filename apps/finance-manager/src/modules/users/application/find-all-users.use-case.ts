import { Injectable, Inject } from '@nestjs/common';
import { IUsersRepository } from '../core/repositories/users-repository.interface';

@Injectable()
export class FindAllUsersUseCase {
  constructor(
    @Inject('IUsersRepository') private usersRepository: IUsersRepository,
  ) {}

  async execute() {
    return this.usersRepository.findAll();
  }
}
