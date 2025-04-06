import { UserRole } from '../../../../../shared-kernel/core/types/db';

export class MappedUserWithPassword {
  constructor(
    public readonly email: string,
    public readonly id: string,
    public readonly name: string,
    public readonly roles: UserRole[],
    public readonly password: string,
  ) {}
}

export class MappedUser {
  constructor(
    public readonly email: string,
    public readonly id: string,
    public readonly name: string,
    public readonly roles: UserRole[],
  ) {}
}
