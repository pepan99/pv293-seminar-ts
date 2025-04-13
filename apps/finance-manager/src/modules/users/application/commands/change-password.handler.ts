import { NotFoundException } from "@nestjs/common";
import { ChangePasswordDto } from "../../api/dto/zod-dtos";
import { CommandHandler, EventPublisher, ICommand, ICommandHandler } from "@nestjs/cqrs";
import { UserAggregateRepository } from "../../infrastructure/database/repositories/users-aggregate.repository";

export class ChangePasswordCommand implements ICommand {
    constructor(
        public readonly userId: string,
        public readonly changePasswordDto: ChangePasswordDto,
    ) {}
}

@CommandHandler(ChangePasswordCommand)
export class ChangePasswordCommandHandler implements ICommandHandler<ChangePasswordCommand> {
    constructor(
        private readonly userAggregateRepository: UserAggregateRepository,
        private readonly publisher: EventPublisher,
    ) {}

    async execute(command: ChangePasswordCommand) {
        const userAggregate = await this.userAggregateRepository.findById(command.userId);

        if (!userAggregate) {
            throw new NotFoundException(`User with ID ${command.userId} not found`);
        }

        const mergedUserAggregate = this.publisher.mergeObjectContext(userAggregate);

        await mergedUserAggregate.changePassword(
            command.changePasswordDto.currentPassword,
            command.changePasswordDto.newPassword,
        );

        await this.userAggregateRepository.updatePassword(mergedUserAggregate);

        return { success: true };
    }
}
