import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { CreateUserCommand } from '../core/types/user-commands';
import { IUsersRepository } from '../core/repositories/users-repository.interface';

@Injectable()
export class CreateUserUseCase {
  constructor(private usersRepository: IUsersRepository) {}

  async execute(command: CreateUserCommand) {
    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(command.password, salt);

    const newUser = this.usersRepository.create({
      ...command,
      password: hashedPassword,
    });

    return newUser;
  }
}
