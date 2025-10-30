import { BadRequestException, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersRepository } from '../../users/infrastructure/repositories/users.repository';
import { CreateUserDto } from '../../users/api/dto/zod-dtos';

@Injectable()
export class RegisterUseCase {
  constructor(
    private usersRepository: UsersRepository,
    private jwtService: JwtService,
  ) {}

  async execute(createUserDto: CreateUserDto) {
    const existingUser = await this.usersRepository.findByEmail(
      createUserDto.email,
    );

    if (existingUser) {
      throw new BadRequestException('User already exists');
    }

    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(createUserDto.password, salt);

    const newUser = await this.usersRepository.create({
      ...createUserDto,
      password: hashedPassword,
    });

    const payload = {
      email: newUser.email,
      sub: newUser.id,
      roles: newUser.roles,
    };

    return {
      access_token: this.jwtService.sign(payload),
      refresh_token: this.jwtService.sign(
        { email: newUser.email, sub: newUser.id },
        { expiresIn: '7d' },
      ),
      user: newUser,
    };
  }
}
