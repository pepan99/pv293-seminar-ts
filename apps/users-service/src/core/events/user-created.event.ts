import { IEvent } from "@nestjs/cqrs";

export type UserRole = "admin" | "user";

export class UserCreatedEvent implements IEvent {
  constructor(
    public readonly userId: string,
    public readonly email: string,
    public readonly name: string,
    public readonly roles: UserRole[],
  ) {}
}
