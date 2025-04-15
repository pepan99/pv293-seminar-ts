import { IEvent } from "@nestjs/cqrs";
import { UserRole } from "shared-kernel/src/core/types/db";

export class UserRolesChangedEvent implements IEvent {
  constructor(
    public readonly id: string,
    public readonly previousRoles: UserRole[],
    public readonly newRoles: UserRole[],
  ) {}
}
