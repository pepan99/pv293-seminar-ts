import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { UserWithoutPassword } from './entities/user.entity';
import {
  CreateUserDto,
  UpdateUserDto,
  ChangePasswordDto,
  UpdateUserAdminDto,
} from './dto/zod-dtos';
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

  async findOne(id: string): Promise<UserWithoutPassword> {
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
    id: string,
    updateUserDto: UpdateUserAdminDto,
  ): Promise<UserWithoutPassword> {
    const user = await this.usersRepository.findOne(id);

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    const newUser = {
      user,
      ...updateUserDto,
    };

    if (updateUserDto.roles && user.roles.includes('admin')) {
      newUser.roles = updateUserDto.roles;
    }
    const updatedUser = await this.usersRepository.update(id, newUser);

    if (!updatedUser) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return updatedUser;
  }

  async updateAdmin(
    id: string,
    updateUserDto: UpdateUserAdminDto | UpdateUserDto,
  ): Promise<UserWithoutPassword> {
    const user = await this.usersRepository.findOne(id);

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    const updatedUser = await this.usersRepository.update(id, user);

    if (!updatedUser) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    if (
      'roles' in updateUserDto &&
      updateUserDto.roles &&
      user.roles.includes('admin')
    ) {
      updatedUser.roles = updateUserDto.roles;
    }

    return updatedUser;
  }

  async remove(id: string): Promise<void> {
    const user = await this.usersRepository.findOne(id);

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    await this.usersRepository.remove(user.id);
  }

  async changePassword(
    userId: string,
    changePasswordDto: ChangePasswordDto,
  ): Promise<{ success: boolean }> {
    const user = await this.usersRepository.findOneWithPassword(userId);

    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    const isPasswordValid = await bcrypt.compare(
      changePasswordDto.currentPassword,
      user.password,
    );

    if (!isPasswordValid) {
      throw new BadRequestException('Current password is incorrect');
    }

    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(
      changePasswordDto.newPassword,
      salt,
    );

    await this.usersRepository.updatePassword(user.id, hashedPassword);
    return { success: true };
  }
}
