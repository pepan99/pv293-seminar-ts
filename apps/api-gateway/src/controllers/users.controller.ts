import {
  Body,
  Controller,
  Delete,
  Get,
  Inject,
  Param,
  Patch,
  Post,
  Req,
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
import { JwtAuthGuard } from "../../../shared-kernel/src";
import { firstValueFrom } from "rxjs";
import {
  UserProfileDto,
  UpdateProfileDto,
  UserResponseDto,
  ChangePasswordDto,
} from "../models/users.models";

@ApiTags("Users")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller("users")
export class UsersController {
  constructor(
    @Inject("USERS_SERVICE") private readonly usersClient: ClientProxy,
  ) {}

  @Get("me")
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
  async getProfile(@Req() req: any) {
    return firstValueFrom(
      this.usersClient.send("get_user_profile", {
        userId: req.user.userId,
      }),
    );
  }

  @Patch("me")
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
    @Req() req: any,
  ) {
    return firstValueFrom(
      this.usersClient.send("update_user_profile", {
        userId: req.user.userId,
        dto: updateProfileDto,
      }),
    );
  }

  @Post("me/change-password")
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
    @Req() req: any,
  ) {
    return firstValueFrom(
      this.usersClient.send("change_password", {
        userId: req.user.userId,
        dto: changePasswordDto,
      }),
    );
  }

  // Admin routes would go here if needed
}
