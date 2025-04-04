import { IEvent } from '@nestjs/cqrs';

export class UserPasswordChangedEvent implements IEvent {
  constructor(public readonly userId: string) {}
}
