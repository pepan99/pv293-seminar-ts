import { UserRole } from "../../shared-kernel/core/types/user-types";

export type AccessTokenPayload = {
    sub: string;
    email: string;
    roles: UserRole[];
};
