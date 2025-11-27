import { CommandHandler, ICommand, ICommandHandler } from "@nestjs/cqrs";

export class ValidateTokenCommand implements ICommand {
  constructor(public readonly user: unknown) {}
}

@CommandHandler(ValidateTokenCommand)
export class ValidateTokenCommandHandler
  implements ICommandHandler<ValidateTokenCommand>
{
  async execute(command: ValidateTokenCommand) {
    return {
      valid: true,
      user: command.user,
    };
  }
}
