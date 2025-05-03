import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { CreateUserDto } from '../api/dto/zod-dtos';
import { IUsersRepository } from '../core/repositories/users-repository.interface';

@Injectable()
export class CreateUserUseCase {
  constructor(private usersRepository: IUsersRepository) {}

  async execute(createUserDto: CreateUserDto) {
    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(createUserDto.password, salt);

    const newUser = this.usersRepository.create({
      ...createUserDto,
      password: hashedPassword,
    });

    return newUser;
  }
}
