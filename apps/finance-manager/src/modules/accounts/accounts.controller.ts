import { Controller, Post, UseGuards, Body } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateAccountDto } from './dto/zod-dtos';
import { AccountsService } from './accounts.service';
import { RequestUserEntity } from '../users/entities/user.entity';
import { User } from './decorators/user.decorator';

@ApiTags('accounts')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('accounts')
export class AccountsController {
  constructor(private accountsService: AccountsService) {}
  @Post()
  @ApiOperation({ summary: 'Create account' })
  @ApiResponse({ status: 200, description: 'Return the created account' })
  create(@User() user: RequestUserEntity, @Body() dto: CreateAccountDto) {
    return this.accountsService.create(user.userId, dto);
  }
}
