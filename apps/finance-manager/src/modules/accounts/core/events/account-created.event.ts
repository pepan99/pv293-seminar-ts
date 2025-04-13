import { IEvent } from "@nestjs/cqrs";

export class AccountCreatedEvent implements IEvent {
    constructor(
        public readonly accountId: string,
        public readonly userId: string,
    ) {}
}
