import { IEvent } from '@nestjs/cqrs';

export class AccountCreatedEvent implements IEvent {
  constructor(
    public readonly accountId: string,
    public readonly userId: string,
    public readonly name: string,
    public readonly accountType: string,
    public readonly currency: string,
    public readonly description?: string,
  ) {}
}
