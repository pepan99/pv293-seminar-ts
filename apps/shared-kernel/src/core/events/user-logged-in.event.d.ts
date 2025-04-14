import { IEvent } from "@nestjs/cqrs";
export declare class UserLoggedInEvent implements IEvent {
  readonly userId: string;
  readonly email: string;
  constructor(userId: string, email: string);
}
