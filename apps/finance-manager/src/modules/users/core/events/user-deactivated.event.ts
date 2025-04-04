import { IEvent } from '@nestjs/cqrs';

export class UserDeactivatedEvent implements IEvent {
  constructor(public readonly userId: string) {}
}
