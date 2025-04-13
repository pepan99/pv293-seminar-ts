import { IEvent } from "@nestjs/cqrs";

export class AccountReconciledEvent implements IEvent {
    constructor(private readonly accountId: string) {}
}
