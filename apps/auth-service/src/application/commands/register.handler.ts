import {
  CommandHandler,
  EventBus,
  ICommand,
  ICommandHandler,
} from "@nestjs/cqrs";
import { UserRegisteredEvent } from "../../core/events/user-registered.event";
import * as bcrypt from "bcryptjs";
import { Inject } from "@nestjs/common";
import { IUsersRepository } from "../../core/repositories/users-repository.interface";

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
  constructor(
    @Inject("IUsersRepository")
    private readonly userRepository: IUsersRepository,
    private readonly eventBus: EventBus,
  ) {}

  async execute(command: RegisterCommand) {
    const hashedPassword = await bcrypt.hash(command.password, 10);

    const res = await this.userRepository.create({
      ...command,
      password: hashedPassword,
    });

    this.eventBus.publish(
      new UserRegisteredEvent(
        res.id,
        res.name,
        res.email,
        hashedPassword,
        res.createdAt,
        res.updatedAt,
        ["user"],
      ),
    );
    return { id: res.id };
  }
}
