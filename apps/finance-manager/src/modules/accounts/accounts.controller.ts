import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { AccountsService } from './accounts.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';
import { CreateAccountDto } from './dto/zod-dtos';
import { Roles } from '../auth/decorators/roles.decorator';
import { RequestUserEntity } from '../users/entities/user.entity';
import { User } from '../users/decorators/user.decorator';

@ApiTags('accounts')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('accounts')
export class AccountsController {
  constructor(private readonly accountsService: AccountsService) {}

  @Get('profile')
  @ApiOperation({ summary: 'Get all accounts for current user' })
  @ApiResponse({
    status: 200,
    description: 'Return all accounts for current user',
  })
  findAllByCurrentUser(@User() user: RequestUserEntity) {
    return this.accountsService.findAllByUserId(user.userId);
  }

  @Post('profile')
  @ApiOperation({ summary: 'Create a new account for the current user' })
  @ApiResponse({ status: 201, description: 'Account created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  createForCurrentUser(
    @User() user: RequestUserEntity,
    @Body() createAccountDto: CreateAccountDto,
  ) {
    const accountData = {
      ...createAccountDto,
      userId: user.userId,
    };
    return this.accountsService.create(accountData);
  }

  @Get()
  @Roles('admin')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get all accounts (admin only)' })
  @ApiResponse({ status: 200, description: 'Return all accounts' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  findAll() {
    return this.accountsService.findAll();
  }

  @Get('user/:userId')
  @Roles('admin')
  @ApiOperation({
    summary: 'Get all accounts for a specific user (admin only)',
  })
  @ApiResponse({
    status: 200,
    description: 'Return all accounts for the specified user',
  })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @UseGuards(JwtAuthGuard)
  findAllByUserId(@Param('userId') userId: string) {
    return this.accountsService.findAllByUserId(userId);
  }

  @Post()
  @Roles('admin')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Create a new account for a specific user (admin only)',
  })
  @ApiResponse({ status: 201, description: 'Account created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  create(@Body() createAccountDto: CreateAccountDto) {
    return this.accountsService.create(createAccountDto);
  }
}
