import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class UpdateUserDto {
  @ApiPropertyOptional({ example: "user@example.com" })
  email?: string;

  @ApiPropertyOptional({ example: "John Doe" })
  name?: string;
}

export class ChangePasswordDto {
  @ApiProperty()
  currentPassword!: string;

  @ApiProperty()
  newPassword!: string;

  @ApiProperty()
  confirmPassword!: string;
}

export class UpdateUserAdminDto {
  @ApiPropertyOptional({ example: "user@example.com" })
  email?: string;

  @ApiPropertyOptional({ example: "John Doe" })
  name?: string;

  @ApiPropertyOptional({ example: ["user", "admin"] })
  roles?: string[];
}
