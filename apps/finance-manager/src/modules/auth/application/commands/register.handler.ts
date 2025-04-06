import {
  CommandBus,
  CommandHandler,
  ICommand,
  ICommandHandler,
} from '@nestjs/cqrs';
import { CreateUserMappedCommand } from '../../infrastructure/anti-corruption-layer/users/commands/create-user.mapped-handler';
import { CommandSucceededWithBool } from '../../../../shared-kernel/core/types/return-types';

export class RegisterCommand implements ICommand {
  constructor(
    public readonly name: string,
    public readonly email: string,
    public readonly password: string,
  ) {}
}

@CommandHandler(RegisterCommand)
export class RegisterCommandHandler
  implements ICommandHandler<RegisterCommand>
{
  constructor(private commandBus: CommandBus) {}

  async execute(command: RegisterCommand): Promise<CommandSucceededWithBool> {
    await this.commandBus.execute(
      new CreateUserMappedCommand(
        command.name,
        command.email,
        command.password,
      ),
    );

    return {
      success: true,
    };
  }
}
