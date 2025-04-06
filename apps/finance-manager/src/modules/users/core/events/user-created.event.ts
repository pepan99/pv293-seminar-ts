import { IEvent } from '@nestjs/cqrs';
import { UserRole } from '../../../../shared-kernel/core/types/db';

export class UserCreatedEvent implements IEvent {
  constructor(
    public readonly userId: string,
    public readonly email: string,
    public readonly name: string,
    public readonly roles: UserRole[],
  ) {}
}
