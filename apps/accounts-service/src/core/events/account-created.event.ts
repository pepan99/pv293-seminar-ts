import { IEvent } from "@nestjs/cqrs";

export class AccountCreatedEvent implements IEvent {
  constructor(
    public readonly id: string,
    public readonly userId: string,
    public readonly name: string,
    public readonly accountType: string,
    public readonly initialBalance: number,
  ) {}
}
