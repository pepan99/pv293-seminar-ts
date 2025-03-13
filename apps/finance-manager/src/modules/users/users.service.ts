import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { UserWithoutPassword } from './entities/user.entity';
import { CreateUserDto, UpdateUserDto } from './dto/zod-dtos';
import { ChangePasswordDto } from './dto/change-password.dto';
import { InMemoryUsersRepository } from './repositories/in-memory-users.repository';

@Injectable()
export class UsersService {
  constructor(private usersRepository: InMemoryUsersRepository) {}

  async create(createUserDto: CreateUserDto): Promise<UserWithoutPassword> {
    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(createUserDto.password, salt);

    const newUser = this.usersRepository.create({
      ...createUserDto,
      password: hashedPassword,
    });

    return newUser;
  }

  async findAll(): Promise<UserWithoutPassword[]> {
    const users = await this.usersRepository.findAll();

    return users;
  }

  async findOne(id: number): Promise<UserWithoutPassword> {
    const user = await this.usersRepository.findOne(id);

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return user;
  }

  async findByEmail(email: string): Promise<UserWithoutPassword> {
    const user = await this.usersRepository.findByEmail(email);

    if (!user) {
      throw new NotFoundException(`User with email ${email} not found`);
    }

    return user;
  }

  async update(
    id: number,
    updateUserDto: UpdateUserDto,
  ): Promise<UserWithoutPassword> {
    const user = await this.usersRepository.findOne(id);

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    // Update user
    const updatedUser = await this.usersRepository.update(id, user);

    if (!updatedUser) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    // Don't allow role change except by admin
    if (updateUserDto.roles && user.roles.includes('admin')) {
      updatedUser.roles = updateUserDto.roles;
    }

    return updatedUser;
  }

  async remove(id: number): Promise<void> {
    const user = await this.usersRepository.findOne(id);

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    // Delete user
    await this.usersRepository.remove(user.id);
  }

  async changePassword(
    userId: number,
    changePasswordDto: ChangePasswordDto,
  ): Promise<{ success: boolean }> {
    const user = await this.usersRepository.findOneWithPassword(userId);

    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    // Verify current password
    const isPasswordValid = await bcrypt.compare(
      changePasswordDto.currentPassword,
      user.password,
    );

    if (!isPasswordValid) {
      throw new BadRequestException('Current password is incorrect');
    }

    // Hash new password
    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(
      changePasswordDto.newPassword,
      salt,
    );

    await this.usersRepository.updatePassword(user.id, hashedPassword);
    return { success: true };
  }
}
