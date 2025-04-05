import { CommandBus, ICommand } from '@nestjs/cqrs';
import { CreateUserDto } from '../../../users/api/dto/zod-dtos';

import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserWithoutPassword } from '../../../users/core/entities/user.entity';
import { CreateUserCommand } from '../../../users/application/commands/create-user.handler';

export class RegisterCommand implements ICommand {
  constructor(public readonly userData: CreateUserDto) {}
}

@Injectable()
@CommandHandler(RegisterCommand)
export class RegisterCommandHandler
  implements ICommandHandler<RegisterCommand>
{
  constructor(
    private commandBus: CommandBus,
    private jwtService: JwtService,
  ) {}

  async execute(command: RegisterCommand) {
    const user: UserWithoutPassword = await this.commandBus.execute(
      new CreateUserCommand(command.userData),
    );

    const payload = {
      email: user.email,
      sub: user.id,
      roles: user.roles,
    };

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
}
