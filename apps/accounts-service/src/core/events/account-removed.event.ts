import { IEvent } from "@nestjs/cqrs";

export class AccountRemovedEvent implements IEvent {
  constructor(
    public readonly accountId: string,
    public readonly userId: string,
  ) {}
}
