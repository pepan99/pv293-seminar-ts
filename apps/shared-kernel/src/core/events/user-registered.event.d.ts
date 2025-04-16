import { IEvent } from "@nestjs/cqrs";
import { UserRole } from "../types/db";
export declare class UserRegisteredEvent implements IEvent {
  readonly id: string;
  readonly name: string;
  readonly email: string;
  readonly password: string;
  readonly createdAt: Date;
  readonly updatedAt: Date;
  readonly roles: UserRole[];
  constructor(
    id: string,
    name: string,
    email: string,
    password: string,
    createdAt: Date,
    updatedAt: Date,
    roles: UserRole[],
  );
}
//# sourceMappingURL=user-registered.event.d.ts.map
