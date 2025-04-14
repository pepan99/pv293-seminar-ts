import {
  Body,
  Controller,
  Get,
  HttpCode,
  Post,
  Request,
  UseGuards,
} from "@nestjs/common";
import { LoginDto } from "../dto/login.dto";
import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { Request as ExpressRequest } from "express";
import { CommandBus } from "@nestjs/cqrs";
import { RegisterCommand } from "../../application/commands/register.handler";
import { LoginCommand } from "../../application/commands/login.handler";
import { RefreshTokenCommand } from "../../application/commands/refresh-token.handler";
import { ValidateTokenCommand } from "../../application/commands/validate-token.handler";
import { JwtAuthGuard } from "../../../shared-kernel/api/guards/jwt.guard";
import { RegisterUserDto } from "../dto/register.dto";

@ApiTags("auth")
@Controller("auth")
export class AuthController {
  constructor(private readonly commandBus: CommandBus) {}

  @Post("register")
  @ApiOperation({ summary: "Register a new user" })
  @ApiResponse({ status: 201, description: "User successfully registered" })
  @ApiResponse({ status: 400, description: "Bad Request" })
  async register(@Body() createUserDto: RegisterUserDto) {
    return this.commandBus.execute(
      new RegisterCommand(
        createUserDto.name,
        createUserDto.email,
        createUserDto.password,
      ),
    );
  }

  @Post("login")
  @HttpCode(200)
  @ApiOperation({ summary: "User login" })
  @ApiResponse({ status: 200, description: "Login successful" })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  async login(@Body() loginDto: LoginDto) {
    return this.commandBus.execute(
      new LoginCommand(loginDto.email, loginDto.password),
    );
  }

  @UseGuards(JwtAuthGuard)
  @Get("profile")
  @ApiOperation({ summary: "Get user profile" })
  @ApiResponse({ status: 200, description: "Profile data returned" })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  getProfile(@Request() req: ExpressRequest) {
    return req?.user;
  }

  @Post("refresh")
  @HttpCode(200)
  @ApiOperation({ summary: "Refresh access token" })
  @ApiResponse({ status: 200, description: "Token refreshed" })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  async refreshToken(@Body() refreshTokenDto: { refresh_token: string }) {
    return this.commandBus.execute(
      new RefreshTokenCommand(refreshTokenDto.refresh_token),
    );
  }

  @UseGuards(JwtAuthGuard)
  @Get("validate")
  @ApiOperation({ summary: "Validate access token" })
  @ApiResponse({ status: 200, description: "Token is valid" })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  validateToken(@Request() req: ExpressRequest) {
    return this.commandBus.execute(new ValidateTokenCommand(req.user!));
  }
}
