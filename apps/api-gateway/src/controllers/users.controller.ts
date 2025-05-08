import {
  Body,
  Controller,
  Delete,
  Get,
  Inject,
  Param,
  Put,
  UseGuards,
} from "@nestjs/common";
import { ClientProxy } from "@nestjs/microservices";
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiBody,
} from "@nestjs/swagger";
import { firstValueFrom } from "rxjs";
import {
  UserProfileDto,
  UpdateProfileDto,
  UserResponseDto,
  ChangePasswordDto,
} from "../models/users.models";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { User } from "../auth/user.decorator";
import { Roles } from "../auth/roles.decorator";
import { RolesGuard } from "../auth/roles.guard";

@ApiTags("Users")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller("users")
export class UsersController {
  constructor(
    @Inject("USERS_SERVICE") private readonly usersClient: ClientProxy,
  ) {}

  @Get("profile")
  @ApiOperation({
    summary: "Get current user profile",
    description: "Retrieves the profile of the currently authenticated user",
  })
  @ApiResponse({
    status: 200,
    description: "User profile retrieved successfully",
    type: UserProfileDto,
  })
  @ApiResponse({
    status: 401,
    description: "Unauthorized - Invalid or missing token",
  })
  async getProfile(@User() user: any) {
    return firstValueFrom(
      this.usersClient.send("users.get_user_profile", {
        userId: user.userId,
      }),
    );
  }

  @Put("profile")
  @ApiOperation({
    summary: "Update user profile",
    description:
      "Updates the profile information of the currently authenticated user",
  })
  @ApiBody({ type: UpdateProfileDto })
  @ApiResponse({
    status: 200,
    description: "User profile updated successfully",
    type: UserResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: "Bad request - Invalid input data",
  })
  @ApiResponse({
    status: 401,
    description: "Unauthorized - Invalid or missing token",
  })
  async updateProfile(
    @Body() updateProfileDto: UpdateProfileDto,
    @User() user: any,
  ) {
    return firstValueFrom(
      this.usersClient.send("users.update_user_profile", {
        userId: user.userId,
        dto: updateProfileDto,
      }),
    );
  }

  @Put("change-password")
  @ApiOperation({
    summary: "Change password",
    description: "Changes the password for the currently authenticated user",
  })
  @ApiBody({ type: ChangePasswordDto })
  @ApiResponse({
    status: 200,
    description: "Password changed successfully",
    schema: {
      properties: {
        success: { type: "boolean", example: true },
        message: { type: "string", example: "Password changed successfully" },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: "Bad request - Invalid input or passwords do not match",
  })
  @ApiResponse({
    status: 401,
    description: "Unauthorized - Current password is incorrect",
  })
  async changePassword(
    @Body() changePasswordDto: ChangePasswordDto,
    @User() user: any,
  ) {
    return firstValueFrom(
      this.usersClient.send("users.change_user_password", {
        userId: user.userId,
        dto: changePasswordDto,
      }),
    );
  }

  // Admin routes
  @Get()
  @Roles("admin")
  @UseGuards(RolesGuard)
  @ApiOperation({
    summary: "Get all users (admin only)",
    description: "Retrieves all users in the system (requires admin role)",
  })
  @ApiResponse({
    status: 200,
    description: "Users retrieved successfully",
    isArray: true,
    type: UserProfileDto,
  })
  @ApiResponse({
    status: 403,
    description: "Forbidden - Requires admin role",
  })
  async findAll() {
    return firstValueFrom(this.usersClient.send("users.get_all_users", {}));
  }

  @Get(":id")
  @Roles("admin")
  @UseGuards(RolesGuard)
  @ApiOperation({
    summary: "Get user by ID (admin only)",
    description: "Retrieves a specific user by ID (requires admin role)",
  })
  @ApiResponse({
    status: 200,
    description: "User retrieved successfully",
    type: UserProfileDto,
  })
  @ApiResponse({
    status: 404,
    description: "User not found",
  })
  @ApiResponse({
    status: 403,
    description: "Forbidden - Requires admin role",
  })
  async findOne(@Param("id") id: string) {
    return firstValueFrom(
      this.usersClient.send("users.get_user_by_id", { id }),
    );
  }

  @Put(":id")
  @Roles("admin")
  @UseGuards(RolesGuard)
  @ApiOperation({
    summary: "Update user by ID (admin only)",
    description: "Updates a specific user by ID (requires admin role)",
  })
  @ApiResponse({
    status: 200,
    description: "User updated successfully",
    type: UserResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: "User not found",
  })
  @ApiResponse({
    status: 403,
    description: "Forbidden - Requires admin role",
  })
  async update(
    @Param("id") id: string,
    @Body() updateUserDto: UpdateProfileDto,
  ) {
    return firstValueFrom(
      this.usersClient.send("users.update_user_by_id", {
        id,
        dto: updateUserDto,
      }),
    );
  }

  @Delete(":id")
  @Roles("admin")
  @UseGuards(RolesGuard)
  @ApiOperation({
    summary: "Delete user by ID (admin only)",
    description: "Deletes a specific user by ID (requires admin role)",
  })
  @ApiResponse({
    status: 200,
    description: "User deleted successfully",
  })
  @ApiResponse({
    status: 404,
    description: "User not found",
  })
  @ApiResponse({
    status: 403,
    description: "Forbidden - Requires admin role",
  })
  async remove(@Param("id") id: string) {
    return firstValueFrom(this.usersClient.send("users.remove_user", { id }));
  }
}
