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
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../shared-kernel/src';
import { firstValueFrom } from 'rxjs';

@ApiTags('users')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('users')
export class UsersController {
  constructor(
    @Inject('USERS_SERVICE') private readonly usersClient: ClientProxy,
  ) {}

  @Get('me')
  async getProfile(@Req() req: any) {
    return firstValueFrom(
      this.usersClient.send('get_user_profile', { 
        userId: req.user.userId 
      })
    );
  }

  @Patch('me')
  async updateProfile(
    @Body() updateProfileDto: any,
    @Req() req: any,
  ) {
    return firstValueFrom(
      this.usersClient.send('update_user_profile', {
        userId: req.user.userId,
        dto: updateProfileDto,
      })
    );
  }

  // Admin routes would go here if needed
}
