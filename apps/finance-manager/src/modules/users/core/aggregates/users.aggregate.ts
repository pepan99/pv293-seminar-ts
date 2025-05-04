import { AggregateRoot } from "@nestjs/cqrs";
import { BadRequestException } from "@nestjs/common";
import * as crypto from "crypto";
import { UserCreatedEvent } from "../events/user-created.event";
import { UserUpdatedEvent } from "../events/user-updated.event";
import { UserRolesChangedEvent } from "../events/user-roles-changed.event";
import { UserPasswordChangedEvent } from "../events/user-password-changed.event";
import { UserRemovedEvent } from "../events/user-removed.event";
import { UserRole } from "../../../shared-kernel/core/types/user-types";

export class UserAggregate extends AggregateRoot {
    private _id: string;
    private _email: string;
    private _name: string;
    private _password: string;
    private _roles: UserRole[];
    private _createdAt: Date;
    private _updatedAt: Date;

    constructor(id?: string) {
        super();
        if (id) {
            this._id = id;
        }
    }

    get id(): string {
        return this._id;
    }

    get email(): string {
        return this._email;
    }

    get name(): string {
        return this._name;
    }

    get roles(): UserRole[] {
        return [...this._roles];
    }

    get createdAt(): Date {
        return this._createdAt;
    }

    get updatedAt(): Date {
        return this._updatedAt;
    }

    set password(password: string) {
        this._password = password;
    }

    async create(
        email: string,
        name: string,
        password: string,
        roles: UserRole[] = ["user"],
    ): Promise<void> {
        if (!email || !name || !password) {
            throw new BadRequestException("Email, name, and password are required");
        }

        this._id = crypto.randomUUID();
        this._email = email;
        this._name = name;
        this._roles = roles;
        this._createdAt = new Date();
        this._updatedAt = new Date();

        const salt = crypto.randomBytes(16).toString("hex");
        this._password = await this.hashPassword(password, salt);

        this.apply(new UserCreatedEvent(this._id, this.email, this.name, this.roles));
    }

    update(data: { email?: string; name?: string }): void {
        let hasChanges = false;
        let updatedEmail: string | undefined;
        let updatedName: string | undefined;

        if (data.email && data.email !== this._email) {
            this._email = data.email;
            updatedEmail = data.email;
            hasChanges = true;
        }

        if (data.name && data.name !== this._name) {
            this._name = data.name;
            updatedName = data.name;
            hasChanges = true;
        }

        if (hasChanges) {
            this._updatedAt = new Date();
            this.apply(new UserUpdatedEvent(this.id, updatedName, updatedEmail));
        }
    }

    updateRoles(newRoles: UserRole[], isLastAdmin: boolean = false): void {
        if (this._roles.includes("admin") && !newRoles.includes("admin") && isLastAdmin) {
            throw new BadRequestException("Cannot remove the last admin user");
        }

        const previousRoles = [...this._roles];
        this._roles = [...newRoles];
        this._updatedAt = new Date();

        this.apply(new UserRolesChangedEvent(this.id, previousRoles, this.roles));
    }

    async changePassword(currentPassword: string, newPassword: string): Promise<void> {
        const isPasswordValid = await this.validatePassword(currentPassword);
        if (!isPasswordValid) {
            throw new BadRequestException("Current password is incorrect");
        }

        const salt = crypto.randomBytes(16).toString("hex");
        this._password = await this.hashPassword(newPassword, salt);
        this._updatedAt = new Date();

        this.apply(new UserPasswordChangedEvent(this.id));
    }

    remove(): void {
        this.apply(new UserRemovedEvent(this.id));
    }

    loadState(history: {
        id: string;
        email: string;
        name: string;
        password: string;
        roles: UserRole[];
        createdAt: Date;
        updatedAt: Date;
    }): void {
        this._id = history.id;
        this._email = history.email;
        this._name = history.name;
        this._password = history.password;
        this._roles = history.roles;
        this._createdAt = history.createdAt;
        this._updatedAt = history.updatedAt;
    }

    private async hashPassword(password: string, salt: string): Promise<string> {
        return new Promise<string>((resolve, reject) => {
            const keylen = 64;
            const iterations = 16000;

            crypto.scrypt(password, salt, keylen, { N: iterations }, (err, derivedKey) => {
                if (err) reject(err);
                resolve(salt + ":" + derivedKey.toString("hex"));
            });
        });
    }

    async validatePassword(_password: string): Promise<boolean> {
        return new Promise<boolean>((resolve, _reject) => {
            // const [salt, key] = this._password.split(':');
            //   const keylen = 64;
            //   const iterations = 16000;
            //
            //   crypto.scrypt(
            //     password,
            //     salt,
            //     keylen,
            //     { N: iterations },
            //     (err, derivedKey) => {
            //       if (err) reject(err);
            //       resolve(key === derivedKey.toString('hex'));
            //     },
            //   );
            // });
            resolve(false);
        });
    }
}
