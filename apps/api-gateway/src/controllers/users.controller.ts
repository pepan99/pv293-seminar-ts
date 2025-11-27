import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpException,
  HttpStatus,
  Param,
  Put,
  UseGuards,
} from "@nestjs/common";
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from "@nestjs/swagger";
import {
  JwtAuthGuard,
  RabbitMQRpcClient,
  RequestUser,
  RolesGuard,
  Roles,
  User,
} from "shared-kernel";
import { GatewayConfigService } from "../config/gateway.config";
import {
  ChangePasswordDto,
  UpdateUserAdminDto,
  UpdateUserDto,
} from "../dto/users.dto";

@ApiTags("users")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller("users")
export class UsersController {
  constructor(
    private readonly rpcClient: RabbitMQRpcClient,
    private readonly config: GatewayConfigService,
  ) {}

  @Get("profile")
  @ApiOperation({ summary: "Get current user profile" })
  @ApiResponse({ status: 200, description: "Return the user profile" })
  async getProfile(@User() user: RequestUser) {
    const response = await this.rpcClient.send(
      this.config.usersServiceQueue,
      "users.getById",
      { userId: user.userId },
    );

    if (!response.success) {
      throw new HttpException(
        response.error || "Failed to get profile",
        HttpStatus.NOT_FOUND,
      );
    }

    return response.data;
  }

  @Put("profile")
  @ApiOperation({ summary: "Update current user profile" })
  @ApiResponse({ status: 200, description: "Profile updated successfully" })
  async updateProfile(@User() user: RequestUser, @Body() dto: UpdateUserDto) {
    const response = await this.rpcClient.send(
      this.config.usersServiceQueue,
      "users.update",
      { userId: user.userId, ...dto },
    );

    if (!response.success) {
      throw new HttpException(
        response.error || "Failed to update profile",
        HttpStatus.BAD_REQUEST,
      );
    }

    return response.data;
  }

  @Put("change-password")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Change user password" })
  @ApiResponse({ status: 200, description: "Password changed successfully" })
  @ApiResponse({ status: 400, description: "Invalid current password" })
  async changePassword(
    @User() user: RequestUser,
    @Body() dto: ChangePasswordDto,
  ) {
    const response = await this.rpcClient.send(
      this.config.usersServiceQueue,
      "users.changePassword",
      { userId: user.userId, ...dto },
    );

    if (!response.success) {
      throw new HttpException(
        response.error || "Failed to change password",
        HttpStatus.BAD_REQUEST,
      );
    }

    return response.data;
  }

  @Get()
  @Roles("admin")
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: "Get all users (admin only)" })
  @ApiResponse({ status: 200, description: "Return all users" })
  @ApiResponse({ status: 403, description: "Forbidden" })
  async findAll() {
    const response = await this.rpcClient.send(
      this.config.usersServiceQueue,
      "users.getAll",
      {},
    );

    if (!response.success) {
      throw new HttpException(
        response.error || "Failed to get users",
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    return response.data;
  }

  @Get(":id")
  @Roles("admin")
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: "Get user by ID (admin only)" })
  @ApiResponse({ status: 200, description: "Return the user" })
  @ApiResponse({ status: 404, description: "User not found" })
  @ApiResponse({ status: 403, description: "Forbidden" })
  async findOne(@Param("id") id: string) {
    const response = await this.rpcClient.send(
      this.config.usersServiceQueue,
      "users.getById",
      { userId: id },
    );

    if (!response.success) {
      throw new HttpException(
        response.error || "User not found",
        HttpStatus.NOT_FOUND,
      );
    }

    return response.data;
  }

  @Put(":id")
  @Roles("admin")
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: "Update user by ID (admin only)" })
  @ApiResponse({ status: 200, description: "User updated successfully" })
  @ApiResponse({ status: 404, description: "User not found" })
  @ApiResponse({ status: 403, description: "Forbidden" })
  async update(@Param("id") id: string, @Body() dto: UpdateUserAdminDto) {
    const response = await this.rpcClient.send(
      this.config.usersServiceQueue,
      "users.updateAdmin",
      { userId: id, ...dto },
    );

    if (!response.success) {
      throw new HttpException(
        response.error || "Failed to update user",
        HttpStatus.BAD_REQUEST,
      );
    }

    return response.data;
  }

  @Delete(":id")
  @Roles("admin")
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: "Delete user by ID (admin only)" })
  @ApiResponse({ status: 200, description: "User deleted successfully" })
  @ApiResponse({ status: 404, description: "User not found" })
  @ApiResponse({ status: 403, description: "Forbidden" })
  async remove(@Param("id") id: string) {
    const response = await this.rpcClient.send(
      this.config.usersServiceQueue,
      "users.remove",
      { userId: id },
    );

    if (!response.success) {
      throw new HttpException(
        response.error || "Failed to delete user",
        HttpStatus.BAD_REQUEST,
      );
    }

    return response.data;
  }
}
