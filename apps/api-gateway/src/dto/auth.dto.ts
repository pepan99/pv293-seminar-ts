import { ApiProperty } from "@nestjs/swagger";

export class RegisterDto {
  @ApiProperty({ example: "user@example.com" })
  email!: string;

  @ApiProperty({ example: "password123" })
  password!: string;

  @ApiProperty({ example: "John Doe" })
  name!: string;
}

export class LoginDto {
  @ApiProperty({ example: "user@example.com" })
  email!: string;

  @ApiProperty({ example: "password123" })
  password!: string;
}

export class RefreshTokenDto {
  @ApiProperty()
  refresh_token!: string;
}
