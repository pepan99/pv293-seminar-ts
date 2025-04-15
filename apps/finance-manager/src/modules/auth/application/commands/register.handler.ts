import { CommandHandler, EventBus, ICommand, ICommandHandler } from "@nestjs/cqrs";
import { CommandSucceededWithId } from "../../../shared-kernel/core/types/return-types";
import { UsersRepository } from "../../infrastructure/database/repositories/users.repository";
import { UserRegisteredEvent } from "../../core/events/user-registered.event";
import * as bcrypt from "bcryptjs";

export class RegisterCommand implements ICommand {
    constructor(
        public readonly name: string,
        public readonly email: string,
        public readonly password: string,
    ) {}
}

@CommandHandler(RegisterCommand)
export class RegisterCommandHandler implements ICommandHandler<RegisterCommand> {
    constructor(
        private readonly userRepository: UsersRepository,
        private readonly eventBus: EventBus,
    ) {}

    async execute(command: RegisterCommand): Promise<CommandSucceededWithId> {
        const hashedPassword = await bcrypt.hash(command.password, 10);

        const res = await this.userRepository.create({ ...command, password: hashedPassword });

        console.log("publishing user", res);
        this.eventBus.publish(
            new UserRegisteredEvent(
                res.id,
                res.name,
                res.email,
                res.password,
                res.createdAt,
                res.updatedAt,
                res.roles,
            ),
        );
        return { id: res.id };
    }
}
