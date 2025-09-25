import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import {
  Controller,
  Get,
  Put,
  Body,
  UseGuards,
  Param,
  Post,
  Delete,
} from '@nestjs/common';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { AccountsService } from './accounts.service';
import { AccountDto, CreateAccountDto } from './dto/zod-dtos';

@ApiTags('accounts')
@Controller('accounts')
export class AccountsController {
  constructor(private readonly accountsService: AccountsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all accounts' })
  @ApiResponse({ status: 200, description: 'Return all accounts' })
  findAll(): Promise<AccountDto[]> {
    return this.accountsService.findAll();
  }

  @Post()
  @ApiOperation({ summary: 'Create a new account' })
  @ApiResponse({ status: 200, description: 'Account created successfully' })
  createAccount(@Body() createAccountDto: CreateAccountDto) {
    return this.accountsService.create(createAccountDto);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('users/:userId')
  @ApiOperation({ summary: 'Get all not deleted accounts for a specific user' })
  @ApiResponse({ status: 200, description: 'Return all accounts for the user' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  findByUserId(@Param('userId') userId: string): AccountDto[] {
    return this.accountsService.findByUserId(userId);
  }
}
