import {
  CommandBus,
  CommandHandler,
  ICommand,
  ICommandHandler,
} from '@nestjs/cqrs';
import { CreateUserCommand } from '../../../../users/application/commands/create-user.handler';
import { CommandSucceededWithId } from '../../../../../shared/types/return-types';

export class CreateUserMappedCommand implements ICommand {
  constructor(
    public readonly name: string,
    public readonly email: string,
    public readonly password: string,
  ) {}
}

@CommandHandler(CreateUserMappedCommand)
export class CreateUserCommandHandler
  implements ICommandHandler<CreateUserMappedCommand>
{
  constructor(private readonly commandBus: CommandBus) {}

  async execute(command: CreateUserMappedCommand) {
    const result: CommandSucceededWithId = await this.commandBus.execute(
      new CreateUserCommand(command.name, command.name, command.password),
    );

    return result;
  }
}
