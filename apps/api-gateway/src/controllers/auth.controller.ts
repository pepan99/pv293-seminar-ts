import {
  Body,
  Controller,
  Inject,
  Post,
  HttpCode,
  HttpStatus,
} from "@nestjs/common";
import { ClientProxy } from "@nestjs/microservices";
import { ApiTags } from "@nestjs/swagger";
import { firstValueFrom } from "rxjs";

@ApiTags("auth")
@Controller("auth")
export class AuthController {
  constructor(
    @Inject("AUTH_SERVICE") private readonly authClient: ClientProxy,
  ) {}

  @Post("login")
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginDto: any) {
    return firstValueFrom(this.authClient.send("login", loginDto));
  }

  @Post("register")
  @HttpCode(HttpStatus.CREATED)
  async register(@Body() registerDto: any) {
    return firstValueFrom(this.authClient.send("register", registerDto));
  }

  @Post("refresh")
  @HttpCode(HttpStatus.OK)
  async refreshToken(@Body() refreshTokenDto: any) {
    return firstValueFrom(
      this.authClient.send("refresh_token", refreshTokenDto),
    );
  }
}
