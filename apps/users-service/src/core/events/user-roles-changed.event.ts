import { IEvent } from "@nestjs/cqrs";

export type UserRole = "admin" | "user";

export class UserRolesChangedEvent implements IEvent {
  constructor(
    public readonly userId: string,
    public readonly previousRoles: UserRole[],
    public readonly newRoles: UserRole[],
  ) {}
}
