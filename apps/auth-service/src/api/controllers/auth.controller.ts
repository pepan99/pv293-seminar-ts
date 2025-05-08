import { Controller } from "@nestjs/common";
import { MessagePattern, Payload } from "@nestjs/microservices";
import { LoginDto } from "../dto/login.dto";
import { CommandBus } from "@nestjs/cqrs";
import { RegisterCommand } from "../../application/commands/register.handler";
import { LoginCommand } from "../../application/commands/login.handler";
import { RefreshTokenCommand } from "../../application/commands/refresh-token.handler";
import { ValidateTokenCommand } from "../../application/commands/validate-token.handler";
import { RegisterUserDto } from "../dto/register.dto";

@Controller()
export class AuthController {
  constructor(private readonly commandBus: CommandBus) {}

  @MessagePattern("auth.register_user")
  async registerUser(@Payload() createUserDto: RegisterUserDto) {
    return this.commandBus.execute(
      new RegisterCommand(
        createUserDto.name,
        createUserDto.email,
        createUserDto.password,
      ),
    );
  }

  @MessagePattern("auth.login_user")
  async loginUser(@Payload() loginDto: LoginDto) {
    return this.commandBus.execute(
      new LoginCommand(loginDto.email, loginDto.password),
    );
  }

  @MessagePattern("auth.get_auth_profile")
  getAuthProfile(@Payload() user: any) {
    return user;
  }

  @MessagePattern("auth.refresh_token")
  async refreshAuthToken(
    @Payload() refreshTokenDto: { refresh_token: string },
  ) {
    return this.commandBus.execute(
      new RefreshTokenCommand(refreshTokenDto.refresh_token),
    );
  }

  @MessagePattern("auth.validate_token")
  validateAuthToken(@Payload() user: any) {
    return this.commandBus.execute(new ValidateTokenCommand(user));
  }
}
