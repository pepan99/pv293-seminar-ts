import { IEvent } from "@nestjs/cqrs";
export declare class UserUpdatedEvent implements IEvent {
  readonly id: string;
  readonly name?: string | undefined;
  readonly email?: string | undefined;
  constructor(
    id: string,
    name?: string | undefined,
    email?: string | undefined,
  );
}
//# sourceMappingURL=user-updated.event.d.ts.map
