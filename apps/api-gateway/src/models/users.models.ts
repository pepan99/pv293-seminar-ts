import { ApiProperty } from "@nestjs/swagger";

export class UserProfileDto {
  @ApiProperty({
    description: "User ID",
    example: "123e4567-e89b-12d3-a456-426614174000",
  })
  id: string;

  @ApiProperty({
    description: "User name",
    example: "John Doe",
  })
  name: string;

  @ApiProperty({
    description: "User email address",
    example: "user@example.com",
  })
  email: string;

  @ApiProperty({
    description: "User roles",
    example: ["user"],
    type: [String],
  })
  roles: string[];

  @ApiProperty({
    description: "User creation date",
    example: "2023-01-01T00:00:00.000Z",
  })
  createdAt: Date;

  @ApiProperty({
    description: "User last update date",
    example: "2023-01-01T00:00:00.000Z",
  })
  updatedAt: Date;
}

export class UpdateProfileDto {
  @ApiProperty({
    description: "User name",
    example: "John Doe",
    required: false,
  })
  name?: string;

  @ApiProperty({
    description: "User email address",
    example: "user@example.com",
    required: false,
  })
  email?: string;
}

export class ChangePasswordDto {
  @ApiProperty({
    description: "Current password",
    example: "currentPassword123",
  })
  currentPassword: string;

  @ApiProperty({
    description: "New password",
    example: "newPassword123",
    minLength: 8,
  })
  newPassword: string;

  @ApiProperty({
    description: "Confirm new password",
    example: "newPassword123",
    minLength: 8,
  })
  confirmPassword: string;
}

export class UserResponseDto {
  @ApiProperty({
    description: "Operation success status",
    example: true,
  })
  success: boolean;

  @ApiProperty({
    description: "User profile information",
    type: UserProfileDto,
  })
  user: UserProfileDto;
}
