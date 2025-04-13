import { UserWithRoles } from "../../src/modules/users/entities/user.entity";

export type AuthResponse = {
    user: UserWithRoles;
    access_token: string;
    refresh_token: string;
};

export type ErrorResponse = {
    message: string;
    statusCode: number;
};
