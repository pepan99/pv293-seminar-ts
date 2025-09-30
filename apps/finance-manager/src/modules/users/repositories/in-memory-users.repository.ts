import { Injectable } from '@nestjs/common';
import { User, UserWithoutPassword } from '../entities/user.entity';
import {
  CreateUserDto,
  UpdateUserAdminDto,
  UpdateUserDto,
} from '../dto/zod-dtos';
import { randomUUID } from 'node:crypto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class InMemoryUsersRepository {
  private users: User[] = [];

  constructor() {
    this.seedDemoUsers();
  }

  async findAll(): Promise<UserWithoutPassword[]> {
    return this.users.map((user) => {
      const { password, ...result } = user;
      return result;
    });
  }

  async findOne(id: string): Promise<UserWithoutPassword | undefined> {
    const user = this.users.find((user) => user.id === id);
    if (!user) {
      return undefined;
    }

    const { password, ...result } = user;
    return result;
  }

  async findOneWithPassword(id: string): Promise<User | undefined> {
    return this.users.find((user) => user.id === id);
  }

  async findByEmail(email: string): Promise<UserWithoutPassword | undefined> {
    return this.users.find((user) => user.email === email);
  }

  async findByEmailWithPassword(email: string): Promise<User | undefined> {
    return this.users.find((user) => user.email === email);
  }

  async create(createUserDto: CreateUserDto): Promise<UserWithoutPassword> {
    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(createUserDto.password, salt);
    const newUser: User = {
      ...createUserDto,
      password: hashedPassword,
      id: randomUUID(),
      roles: ['user'],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.users.push(newUser);

    const { password, ...result } = newUser;
    return result;
  }

  async update(
    id: string,
    updateUserDto: UpdateUserDto | UpdateUserAdminDto,
  ): Promise<UserWithoutPassword | undefined> {
    const userIndex = this.users.findIndex((user) => user.id === id);
    if (userIndex === -1) {
      return undefined;
    }

    const user = this.users[userIndex]!;
    const updatedUser = {
      ...user,
      name: updateUserDto.name || user.name,
      email: updateUserDto.email || user.email,
      roles:
        'roles' in updateUserDto && updateUserDto.roles
          ? updateUserDto.roles
          : user.roles,
      updatedAt: new Date(),
    };

    this.users[userIndex] = updatedUser;

    const { password, ...result } = updatedUser;
    return result as User;
  }

  async remove(id: string): Promise<void> {
    const userIndex = this.users.findIndex((user) => user.id === id);
    if (userIndex !== -1) {
      this.users.splice(userIndex, 1);
    }
  }

  async updatePassword(id: string, hashedPassword: string): Promise<void> {
    const userIndex = this.users.findIndex((user) => user.id === id);
    if (userIndex !== -1) {
      this.users[userIndex] = {
        ...this.users[userIndex]!,
        password: hashedPassword,
        updatedAt: new Date(),
      };
    }
  }

  async seedDemoUsers(): Promise<void> {
    if (this.users.length > 0) {
      return;
    }

    const demoUsers: CreateUserDto[] = [
      {
        name: 'Admin User',
        email: 'admin@example.com',
        password: 'admin1234',
      },
      {
        name: 'Regular User',
        email: 'user@example.com',
        password: 'user1234',
      },
    ];

    const users = demoUsers.map(async (user) => await this.create(user));

    const firstUser = await users[0]!;

    await this.update(firstUser.id, { roles: ['admin', 'user'] });
  }
}
