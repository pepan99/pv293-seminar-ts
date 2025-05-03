import {
  Body,
  Controller,
  Delete,
  Get,
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
import { FindUserByIdUseCase } from '../../application/find-user-by-id.use-case';
import { UpdateUserUseCase } from '../../application/update-user.use-case';
import { ChangePasswordUseCase } from '../../application/change-password.use-case';
import { FindAllUsersUseCase } from '../../application/find-all-users.use-case';
import { UpdateUserAdminUseCase } from '../../application/update-user-admin.use-case';
import { RemoveUserUseCase } from '../../application/remove-user.use-case';
import { JwtAuthGuard } from '../../../../shared-kernel/api/guards/jwt.guard';
import { Roles } from '../../../../shared-kernel/api/decorators/roles.decorator';
import { User } from '../../../../shared-kernel/api/decorators/user.decorator';
import { RequestUser } from '../../../../shared-kernel/core/types/user-types';
import { UpdateUserAdminCommand } from '../../core/types/user-commands';
import { RolesGuard } from '../../../../shared-kernel/api/guards/roles.guard';

@ApiTags('users')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('users')
export class UsersController {
  constructor(
    private readonly findUserByIdUseCase: FindUserByIdUseCase,
    private readonly updateUserUseCase: UpdateUserUseCase,
    private readonly changePasswordUseCase: ChangePasswordUseCase,
    private readonly findAllUsersUseCase: FindAllUsersUseCase,
    private readonly updateUserAdminUseCase: UpdateUserAdminUseCase,
    private readonly removeUserUseCase: RemoveUserUseCase,
  ) {}

  @Get('profile')
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiResponse({ status: 200, description: 'Return the user profile' })
  getProfile(@User() user: RequestUser) {
    return this.findUserByIdUseCase.execute(user.userId);
  }

  @Put('profile')
  @ApiOperation({ summary: 'Update current user profile' })
  @ApiResponse({ status: 200, description: 'Profile updated successfully' })
  updateProfile(
    @User() user: RequestUser,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return this.updateUserUseCase.execute(user.userId, updateUserDto);
  }

  @Put('change-password')
  @ApiOperation({ summary: 'Change user password' })
  @ApiResponse({ status: 200, description: 'Password changed successfully' })
  @ApiResponse({ status: 400, description: 'Invalid current password' })
  changePassword(
    @User() user: RequestUser,
    @Body() changePasswordDto: ChangePasswordDto,
  ) {
    return this.changePasswordUseCase.execute(user.userId, changePasswordDto);
  }

  @Get()
  @Roles('admin')
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'Get all users (admin only)' })
  @ApiResponse({ status: 200, description: 'Return all users' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  findAll() {
    return this.findAllUsersUseCase.execute();
  }

  @Get(':id')
  @Roles('admin')
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'Get user by ID (admin only)' })
  @ApiResponse({ status: 200, description: 'Return the user' })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  findOne(@Param('id') id: string) {
    return this.findUserByIdUseCase.execute(id);
  }

  @Put(':id')
  @Roles('admin')
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'Update user by ID (admin only)' })
  @ApiResponse({ status: 200, description: 'User updated successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserAdminDto) {
    return this.updateUserAdminUseCase.execute(
      id,
      updateUserDto as UpdateUserAdminCommand,
    );
  }

  @Delete(':id')
  @Roles('admin')
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'Delete user by ID (admin only)' })
  @ApiResponse({ status: 200, description: 'User deleted successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  remove(@Param('id') id: string) {
    return this.removeUserUseCase.execute(id);
  }
}
