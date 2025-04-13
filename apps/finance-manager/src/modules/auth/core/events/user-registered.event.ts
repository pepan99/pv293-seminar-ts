import { IEvent } from "@nestjs/cqrs";
import { UserRole } from "../types/db";

export class UserRegisteredEvent implements IEvent {
    constructor(
        public readonly id: string,
        public readonly name: string,
        public readonly email: string,
        public readonly password: string,
        public readonly createdAt: Date,
        public readonly updatedAt: Date,
        public readonly roles: UserRole[],
    ) {}
}
