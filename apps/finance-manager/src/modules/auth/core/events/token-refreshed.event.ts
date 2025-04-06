import { IEvent } from '@nestjs/cqrs';

export class TokenRefreshedEvent implements IEvent {
  constructor(public readonly userId: string) {}
}
