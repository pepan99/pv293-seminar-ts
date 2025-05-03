// Define domain-specific commands for Auth use cases
export interface LoginCommand {
  email: string;
  password: string;
}

export interface RegisterCommand {
  email: string;
  password: string;
  name: string;
}

export interface RefreshTokenCommand {
  refreshToken: string;
}

export interface ValidateTokenCommand {
  token: string;
}
