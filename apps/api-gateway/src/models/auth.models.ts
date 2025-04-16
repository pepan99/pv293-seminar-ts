import { ApiProperty } from "@nestjs/swagger";

export class LoginRequestDto {
  @ApiProperty({
    description: "User email address",
    example: "user@example.com",
  })
  email: string;

  @ApiProperty({
    description: "User password",
    example: "password123",
    minLength: 8,
  })
  password: string;
}

export class RegisterRequestDto {
  @ApiProperty({
    description: "User name",
    example: "John Doe",
    minLength: 1,
  })
  name: string;

  @ApiProperty({
    description: "User email address",
    example: "user@example.com",
  })
  email: string;

  @ApiProperty({
    description: "User password",
    example: "password123",
    minLength: 8,
  })
  password: string;
}

export class RefreshTokenRequestDto {
  @ApiProperty({
    description: "JWT refresh token",
    example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  })
  refreshToken: string;
}

export class AuthResponseDto {
  @ApiProperty({
    description: "JWT access token",
    example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  })
  accessToken: string;

  @ApiProperty({
    description: "JWT refresh token",
    example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  })
  refreshToken: string;

  @ApiProperty({
    description: "Token expiration time in seconds",
    example: 3600,
  })
  expiresIn: number;

  @ApiProperty({
    description: "User information",
    example: {
      id: "123e4567-e89b-12d3-a456-426614174000",
      name: "John Doe",
      email: "user@example.com",
      roles: ["user"],
    },
  })
  user: {
    id: string;
    name: string;
    email: string;
    roles: string[];
  };
}

export class RegisterResponseDto {
  @ApiProperty({
    description: "Registration status",
    example: true,
  })
  success: boolean;

  @ApiProperty({
    description: "User ID",
    example: "123e4567-e89b-12d3-a456-426614174000",
  })
  userId: string;
}
