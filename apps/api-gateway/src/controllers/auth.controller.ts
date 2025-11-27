import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpException,
  HttpStatus,
  Post,
  Request,
  UseGuards,
} from "@nestjs/common";
import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { Request as ExpressRequest } from "express";
import { RabbitMQRpcClient } from "shared-kernel";
import { JwtAuthGuard } from "shared-kernel";
import { GatewayConfigService } from "../config/gateway.config";
import { LoginDto, RefreshTokenDto, RegisterDto } from "../dto/auth.dto";

@ApiTags("auth")
@Controller("auth")
export class AuthController {
  constructor(
    private readonly rpcClient: RabbitMQRpcClient,
    private readonly config: GatewayConfigService,
  ) {}

  @Post("register")
  @ApiOperation({ summary: "Register a new user" })
  @ApiResponse({ status: 201, description: "User successfully registered" })
  @ApiResponse({ status: 400, description: "Bad Request" })
  async register(@Body() dto: RegisterDto) {
    const response = await this.rpcClient.send(
      this.config.authServiceQueue,
      "auth.register",
      dto,
    );

    if (!response.success) {
      throw new HttpException(
        response.error || "Registration failed",
        HttpStatus.BAD_REQUEST,
      );
    }

    return response.data;
  }

  @Post("login")
  @HttpCode(200)
  @ApiOperation({ summary: "User login" })
  @ApiResponse({ status: 200, description: "Login successful" })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  async login(@Body() dto: LoginDto) {
    const response = await this.rpcClient.send(
      this.config.authServiceQueue,
      "auth.login",
      dto,
    );

    if (!response.success) {
      throw new HttpException(
        response.error || "Login failed",
        HttpStatus.UNAUTHORIZED,
      );
    }

    return response.data;
  }

  @UseGuards(JwtAuthGuard)
  @Get("profile")
  @ApiOperation({ summary: "Get user profile from token" })
  @ApiResponse({ status: 200, description: "Profile data returned" })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  getProfile(@Request() req: ExpressRequest) {
    return req.user;
  }

  @Post("refresh")
  @HttpCode(200)
  @ApiOperation({ summary: "Refresh access token" })
  @ApiResponse({ status: 200, description: "Token refreshed" })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  async refreshToken(@Body() dto: RefreshTokenDto) {
    const response = await this.rpcClient.send(
      this.config.authServiceQueue,
      "auth.refresh",
      dto,
    );

    if (!response.success) {
      throw new HttpException(
        response.error || "Token refresh failed",
        HttpStatus.UNAUTHORIZED,
      );
    }

    return response.data;
  }

  @UseGuards(JwtAuthGuard)
  @Get("validate")
  @ApiOperation({ summary: "Validate access token" })
  @ApiResponse({ status: 200, description: "Token is valid" })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  async validateToken(@Request() req: ExpressRequest) {
    const response = await this.rpcClient.send(
      this.config.authServiceQueue,
      "auth.validate",
      { user: req.user },
    );

    if (!response.success) {
      throw new HttpException(
        response.error || "Token validation failed",
        HttpStatus.UNAUTHORIZED,
      );
    }

    return response.data;
  }
}
