import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Put,
  UseGuards,
} from '@nestjs/common';
import {
  ChangePasswordDto,
  UpdateUserAdminDto,
  UpdateUserDto,
} from '../dto/zod-dtos';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../../shared-kernel/api/guards/jwt.guard';
import { Roles } from '../../../../shared-kernel/api/decorators/roles.decorator';
import { User } from '../../../../shared-kernel/api/decorators/user.decorator';
import { RequestUser } from '../../../../shared-kernel/core/types/user-types';
import { RolesGuard } from '../../../../shared-kernel/api/guards/roles.guard';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { GetUserByIdQuery } from '../../application/queries/get-user-by-id.handler';
import { UpdateUserCommand } from '../../application/commands/update-user.handler';
import { ChangePasswordCommand } from '../../application/commands/change-password.handler';
import { GetAllUsersQuery } from '../../application/queries/get-all-users.handler';
import { UpdateUserAdminCommand } from '../../application/commands/update-user-admin.handler';
import { RemoveUserCommand } from '../../application/commands/remove-user.handler';

@ApiTags('users')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('users')
export class UsersController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Get('profile')
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiResponse({ status: 200, description: 'Return the user profile' })
  async getProfile(@User() user: RequestUser) {
    return this.queryBus.execute(new GetUserByIdQuery(user.userId));
  }

  @Put('profile')
  @ApiOperation({ summary: 'Update current user profile' })
  @ApiResponse({ status: 200, description: 'Profile updated successfully' })
  async updateProfile(
    @User() user: RequestUser,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return this.commandBus.execute(
      new UpdateUserCommand(user.userId, updateUserDto),
    );
  }

  @Put('change-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Change user password' })
  @ApiResponse({ status: 200, description: 'Password changed successfully' })
  @ApiResponse({ status: 400, description: 'Invalid current password' })
  async changePassword(
    @User() user: RequestUser,
    @Body() changePasswordDto: ChangePasswordDto,
  ) {
    return this.commandBus.execute(
      new ChangePasswordCommand(user.userId, changePasswordDto),
    );
  }

  @Get()
  @Roles('admin')
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'Get all users (admin only)' })
  @ApiResponse({ status: 200, description: 'Return all users' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async findAll() {
    return this.queryBus.execute(new GetAllUsersQuery());
  }

  @Get(':id')
  @Roles('admin')
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'Get user by ID (admin only)' })
  @ApiResponse({ status: 200, description: 'Return the user' })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async findOne(@Param('id') id: string) {
    return this.queryBus.execute(new GetUserByIdQuery(id));
  }

  @Put(':id')
  @Roles('admin')
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'Update user by ID (admin only)' })
  @ApiResponse({ status: 200, description: 'User updated successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async update(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserAdminDto,
  ) {
    return this.commandBus.execute(
      new UpdateUserAdminCommand(id, updateUserDto),
    );
  }

  @Delete(':id')
  @Roles('admin')
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'Delete user by ID (admin only)' })
  @ApiResponse({ status: 200, description: 'User deleted successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async remove(@Param('id') id: string) {
    return this.commandBus.execute(new RemoveUserCommand(id));
  }
}
