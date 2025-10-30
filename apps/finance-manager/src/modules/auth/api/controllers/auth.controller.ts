import {
  Controller,
  Post,
  Body,
  UseGuards,
  Get,
  Request,
  HttpCode,
} from '@nestjs/common';
import { CreateUserDto } from '../../../users/api/dto/zod-dtos';
import { LoginDto } from '../dto/login.dto';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Request as ExpressRequest } from 'express';
import { RegisterUseCase } from '../../application/register.use-case';
import { RefreshTokenUseCase } from '../../application/refresh-token.use-case';
import { LoginUseCase } from '../../application/login.use-case';
import { ValidateTokenUseCase } from '../../application/validate-token.use-case';
import { GetProfileUseCase } from '../../application/get-profile.use-case';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private loginUseCase: LoginUseCase,
    private registerUseCase: RegisterUseCase,
    private refreshTokenUseCase: RefreshTokenUseCase,
    private validateTokenUseCase: ValidateTokenUseCase,
    private getProfileUseCase: GetProfileUseCase,
  ) {}

  @Post('register')
  @ApiOperation({ summary: 'Register a new user' })
  @ApiResponse({ status: 201, description: 'User successfully registered' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  async register(@Body() createUserDto: CreateUserDto) {
    return this.registerUseCase.execute(createUserDto);
  }

  @Post('login')
  @HttpCode(200)
  @ApiOperation({ summary: 'User login' })
  @ApiResponse({ status: 200, description: 'Login successful' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async login(@Body() loginDto: LoginDto) {
    return this.loginUseCase.execute(loginDto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  @ApiOperation({ summary: 'Get user profile' })
  @ApiResponse({ status: 200, description: 'Profile data returned' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  getProfile(@Request() req: ExpressRequest) {
    return this.getProfileUseCase.execute(req);
  }

  @Post('refresh')
  @HttpCode(200)
  @ApiOperation({ summary: 'Refresh access token' })
  @ApiResponse({ status: 200, description: 'Token refreshed' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async refreshToken(@Body() refreshTokenDto: { refresh_token: string }) {
    return this.refreshTokenUseCase.execute(refreshTokenDto.refresh_token);
  }

  @UseGuards(JwtAuthGuard)
  @Get('validate')
  @ApiOperation({ summary: 'Validate access token' })
  @ApiResponse({ status: 200, description: 'Token is valid' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  validateToken(@Request() req: ExpressRequest) {
    return this.validateTokenUseCase.execute(req);
  }
}
