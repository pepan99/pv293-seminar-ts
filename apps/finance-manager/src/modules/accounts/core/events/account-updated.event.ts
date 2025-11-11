import { IEvent } from '@nestjs/cqrs';
export class AccountUpdatedEvent implements IEvent {
  constructor(
    public readonly accountId: string,
    public readonly userId: string,
    public readonly name?: string,
    public readonly icon?: string,
    public readonly color?: string,
  ) {}
}
