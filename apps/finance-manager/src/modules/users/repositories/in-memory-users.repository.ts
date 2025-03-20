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
    console.log('find', this.users);
    return this.users.find((user) => user.email === email);
  }

  async create(createUserDto: CreateUserDto): Promise<UserWithoutPassword> {
    const newUser: User = {
      ...createUserDto,
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
    this.users = [];

    const demoUsers: CreateUserDto[] = [
      {
        name: 'Admin User',
        email: 'admin@example.com',
        password: 'admin123',
      },
      {
        name: 'Regular User',
        email: 'user@example.com',
        password: 'user123',
      },
    ];

    const userPromises = demoUsers.map(async (userData) => {
      const salt = await bcrypt.genSalt();
      const hashedPassword = await bcrypt.hash(userData.password, salt);

      const newUser: User = {
        name: userData.name,
        email: userData.email,
        password: hashedPassword,
        id: randomUUID(),
        roles: ['user'],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      this.users.push(newUser);

      const { password, ...result } = newUser;
      return result;
    });

    const createdUsers = await Promise.all(userPromises);

    if (createdUsers.length > 0) {
      const adminUser = createdUsers[0]!;
      const userIndex = this.users.findIndex((u) => u.id === adminUser.id);

      if (userIndex !== -1) {
        this.users[userIndex] = {
          ...this.users[userIndex]!,
          roles: ['admin', 'user'],
          updatedAt: new Date(),
        };
      }
    }

    console.log(`Seeded ${this.users.length} users with hashed passwords`);
  }
}
