import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { CreateUserDto } from '../users/dto/zod-dtos';
import { LoginDto } from './dto/login.dto';
import { InMemoryUsersRepository } from '../users/repositories/in-memory-users.repository';
import { UserWithoutPassword } from '../users/entities/user.entity';

@Injectable()
export class AuthService {
  constructor(
    private usersRepository: InMemoryUsersRepository,
    private jwtService: JwtService,
  ) {}

  async validateUser(
    email: string,
    password: string,
  ): Promise<UserWithoutPassword | null> {
    const user = await this.usersRepository.findByEmailWithPassword(email);

    if (user && (await bcrypt.compare(password, user.password))) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  async login(loginDto: LoginDto) {
    const user = await this.validateUser(loginDto.email, loginDto.password);

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = { email: user.email, sub: user.id, roles: user.roles };

    return {
      access_token: this.jwtService.sign(payload),
      refresh_token: this.jwtService.sign(
        { email: user.email, sub: user.id },
        { expiresIn: '7d' },
      ),
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        roles: user.roles,
      },
    };
  }

  async register(createUserDto: CreateUserDto) {
    // Check if user exists
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

  async refreshToken(userId: string) {
    const user = await this.usersRepository.findOne(userId);
    if (!user) {
      throw new UnauthorizedException('Invalid user');
    }
    const payload = { email: user.email, sub: user.id, roles: user.roles };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}
