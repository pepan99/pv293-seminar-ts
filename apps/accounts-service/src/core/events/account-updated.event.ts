import { IEvent } from "@nestjs/cqrs";

export class AccountUpdatedEvent implements IEvent {
  constructor(
    public readonly id: string,
    public readonly userId: string,
    public readonly changes: Record<string, unknown>,
  ) {}
}
