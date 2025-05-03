import { BadRequestException, Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { RegisterCommand } from '../core/commands/auth-commands';
import { IUsersRepository } from '../../users/core/repositories/users-repository.interface';

@Injectable()
export class RegisterUseCase {
  constructor(private usersRepository: IUsersRepository) {}

  async execute(command: RegisterCommand) {
    const existingUser = await this.usersRepository.findByEmail(command.email);

    if (existingUser) {
      throw new BadRequestException('User already exists');
    }

    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(command.password, salt);

    const newUser = await this.usersRepository.create({
      ...command,
      password: hashedPassword,
    });

    return { id: newUser.id };
  }
}
