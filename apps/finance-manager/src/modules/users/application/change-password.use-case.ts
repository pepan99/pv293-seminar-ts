import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { ChangePasswordCommand } from '../core/types/user-commands';
import { IUsersRepository } from '../core/repositories/users-repository.interface';

@Injectable()
export class ChangePasswordUseCase {
  constructor(private usersRepository: IUsersRepository) {}

  async execute(
    userId: string,
    command: ChangePasswordCommand,
  ): Promise<{ success: boolean }> {
    const user = await this.usersRepository.findOneWithPassword(userId);

    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    const isPasswordValid = await bcrypt.compare(
      command.currentPassword,
      user.password,
    );

    if (!isPasswordValid) {
      throw new BadRequestException('Current password is incorrect');
    }

    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(command.newPassword, salt);

    await this.usersRepository.changePassword(user.id, hashedPassword);

    return { success: true };
  }
}
