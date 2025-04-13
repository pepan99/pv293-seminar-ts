import http from "k6/http";
import { check } from "k6";
import { ApiBase } from "../api-base.ts";
import { CreateUserDto } from "../../../src/modules/users/dto/zod-dtos.ts";
import { uuidv4 } from "https://jslib.k6.io/k6-utils/1.4.0/index.js";
import { LoginDto } from "../../../src/modules/auth/dto/login.dto.ts";
import { AuthResponse, ErrorResponse } from "../types.ts";

const newUserName = "New Test User";
const newUserEmail = `test-user-${uuidv4().substring(0, 8)}@test123.com`;
const newUserPassword = "S3cure-Passwor34&";

const baseParams = {
    headers: {
        "Content-Type": "application/json",
    },
};

export class AuthTests extends ApiBase {
    authApiUrl: string;
    accessToken: string = "";
    refreshToken: string = "";
    userId: string = "";

    constructor() {
        super();
        this.authApiUrl = `${this.baseUrl}auth/`;
    }

    registerUserTest(): boolean {
        const registerDto: CreateUserDto = {
            name: newUserName,
            email: newUserEmail,
            password: newUserPassword,
        };

        const payload = JSON.stringify(registerDto);

        const res = http.post(`${this.authApiUrl}register`, payload, baseParams);

        const resJson = res.json();
        if (!resJson) return false;

        const typedRes = resJson as unknown as AuthResponse;
        const user = typedRes.user;
        this.userId = user?.id || "";

        check(res, {
            "Register user is status 201": (r) => r.status === 201,
        });

        check(user, {
            "Registered user has id": (user) => "id" in user,
            "Registered user has correct name": (user) => user.name === newUserName,
            "Registered user has correct email": (user) => user.email === newUserEmail,
            "Registered user has default role": (user) =>
                user.roles && user.roles?.some((role) => role === "user"),
        });

        check(typedRes, {
            "Registration response includes access token": (json) => "access_token" in json,
            "Registration response includes refresh token": (json) => "refresh_token" in json,
        });

        if (typedRes.access_token) {
            this.accessToken = typedRes.access_token;
        }

        if (typedRes.refresh_token) {
            this.refreshToken = typedRes.refresh_token;
        }

        return true;
    }

    registerDuplicateEmailTest(): boolean {
        const registerDto: CreateUserDto = {
            name: newUserName,
            email: newUserEmail,
            password: newUserPassword,
        };

        const payload = JSON.stringify(registerDto);

        const res = http.post(`${this.authApiUrl}register`, payload, baseParams);

        check(res, {
            "Register with duplicate email is status 400": (r) => r.status === 400,
        });

        const resJson = res.json();
        if (resJson) {
            const errorRes = resJson as unknown as ErrorResponse;
            check(errorRes, {
                "Duplicate email error has correct message": (json) =>
                    json.message.includes("already exists"),
            });
        }

        return true;
    }

    registerInvalidDataTest(): boolean {
        const invalidRegisterDto = {
            name: newUserName,
            email: `invalid-${uuidv4().substring(0, 8)}@example.com`,
            password: "short",
        };

        const payload = JSON.stringify(invalidRegisterDto);

        const res = http.post(`${this.authApiUrl}register`, payload, baseParams);

        check(res, {
            "Register with invalid data is status 400": (r) => r.status === 400,
        });

        return true;
    }

    loginTest(): boolean {
        const loginDto: LoginDto = {
            email: newUserEmail,
            password: newUserPassword,
        };

        const payload = JSON.stringify(loginDto);

        const res = http.post(`${this.authApiUrl}login`, payload, baseParams);

        const resJson = res.json();
        if (!resJson) return false;

        const typedRes = resJson as unknown as AuthResponse;

        check(res, {
            "Login is status 200": (r) => r.status === 200,
        });

        check(typedRes, {
            "Login response includes access token": (json) => "access_token" in json,
            "Login response includes refresh token": (json) => "refresh_token" in json,
        });

        if (typedRes.access_token) {
            this.accessToken = typedRes.access_token;
        }

        if (typedRes.refresh_token) {
            this.refreshToken = typedRes.refresh_token;
        }

        return true;
    }

    loginInvalidCredentialsTest(): boolean {
        const loginDto = {
            email: newUserEmail,
            password: "WrongPassword123!",
        };

        const payload = JSON.stringify(loginDto);

        const res = http.post(`${this.authApiUrl}login`, payload, baseParams);

        check(res, {
            "Login with invalid credentials is status 401": (r) => r.status === 401,
        });

        return true;
    }

    loginNonExistentUserTest(): boolean {
        const loginDto = {
            email: `non-existent-${uuidv4().substring(0, 8)}@example.com`,
            password: "Password123!",
        };

        const payload = JSON.stringify(loginDto);

        const res = http.post(`${this.authApiUrl}login`, payload, baseParams);

        check(res, {
            "Login with non-existent user is status 401": (r) => r.status === 401,
        });

        return true;
    }

    refreshTokenTest(): boolean {
        if (!this.refreshToken) {
            console.log("No refresh token available, skipping refresh token test");
            return false;
        }

        const refreshDto = {
            refresh_token: this.refreshToken,
        };
        const payload = JSON.stringify(refreshDto);

        const res = http.post(`${this.authApiUrl}refresh`, payload, baseParams);
        console.log("Refresh token response:", res.body);

        const resJson = res.json();
        if (!resJson) return false;

        const typedRes = resJson as unknown as { access_token: string };
        console.log("Refresh token response JSON:", resJson);

        check(res, {
            "Refresh token is status 200": (r) => r.status === 200,
        });

        check(typedRes, {
            "Refresh response includes new access token": (json) => "access_token" in json,
        });

        if (typedRes.access_token) {
            this.accessToken = typedRes.access_token;
        }

        return true;
    }

    refreshTokenInvalidTest(): boolean {
        const refreshDto = {
            refresh_token: "invalid-refresh-token",
        };

        const payload = JSON.stringify(refreshDto);

        const res = http.post(`${this.authApiUrl}refresh`, payload, baseParams);

        check(res, {
            "Refresh with invalid token is status 401": (r) => r.status === 401,
        });

        return true;
    }

    validateTokenTest(): boolean {
        if (!this.accessToken) {
            console.log("No access token available, skipping validate token test");
            return false;
        }

        const params = {
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${this.accessToken}`,
            },
        };

        const res = http.get(`${this.authApiUrl}validate`, params);

        check(res, {
            "Validate token is status 200": (r) => r.status === 200,
        });

        return true;
    }

    validateTokenInvalidTest(): boolean {
        const params = {
            headers: {
                "Content-Type": "application/json",
                Authorization: "Bearer invalid-access-token",
            },
        };

        const res = http.get(`${this.authApiUrl}validate`, params);

        check(res, {
            "Validate with invalid token is status 401": (r) => r.status === 401,
        });

        return true;
    }
}
