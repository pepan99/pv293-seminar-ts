import {
  Body,
  Controller,
  Get,
  Inject,
  Post,
  Request,
  UseGuards,
  HttpCode,
  HttpStatus,
} from "@nestjs/common";
import { ClientProxy } from "@nestjs/microservices";
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiBearerAuth,
} from "@nestjs/swagger";
import { firstValueFrom } from "rxjs";
import {
  LoginRequestDto,
  RegisterRequestDto,
  RefreshTokenRequestDto,
  AuthResponseDto,
  RegisterResponseDto,
} from "../models/auth.models";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { User } from "../auth/user.decorator";
import { Request as ExpressRequest } from "express";

@ApiTags("Authentication")
@Controller("auth")
export class AuthController {
  constructor(
    @Inject("AUTH_SERVICE") private readonly authClient: ClientProxy,
  ) {}

  @Post("login")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: "User login",
    description:
      "Authenticate user with email and password to receive JWT tokens",
  })
  @ApiBody({ type: LoginRequestDto })
  @ApiResponse({
    status: HttpStatus.OK,
    description: "Login successful",
    type: AuthResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: "Invalid credentials",
  })
  async login(@Body() loginDto: LoginRequestDto) {
    return firstValueFrom(this.authClient.send("auth.login_user", loginDto));
  }

  @Post("register")
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: "User registration",
    description: "Register a new user account",
  })
  @ApiBody({ type: RegisterRequestDto })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: "Registration successful",
    type: RegisterResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: "Invalid input or email already in use",
  })
  async register(@Body() registerDto: RegisterRequestDto) {
    return firstValueFrom(
      this.authClient.send("auth.register_user", registerDto),
    );
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Get("profile")
  @ApiOperation({
    summary: "Get user profile",
    description: "Get the profile of the authenticated user",
  })
  @ApiResponse({ status: 200, description: "Profile data returned" })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  getProfile(@User() user: any) {
    return firstValueFrom(this.authClient.send("auth.get_auth_profile", user));
  }

  @Post("refresh")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: "Refresh token",
    description: "Get a new access token using a refresh token",
  })
  @ApiBody({ type: RefreshTokenRequestDto })
  @ApiResponse({
    status: HttpStatus.OK,
    description: "Token refreshed successfully",
    type: AuthResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: "Invalid or expired refresh token",
  })
  async refreshToken(@Body() refreshTokenDto: RefreshTokenRequestDto) {
    return firstValueFrom(
      this.authClient.send("auth.refresh_token", refreshTokenDto),
    );
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Get("validate")
  @ApiOperation({
    summary: "Validate access token",
    description: "Check if the current token is valid",
  })
  @ApiResponse({ status: 200, description: "Token is valid" })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  validateToken(@User() user: any) {
    return firstValueFrom(this.authClient.send("auth.validate_token", user));
  }
}
