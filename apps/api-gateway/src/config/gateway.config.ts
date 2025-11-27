import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class GatewayConfigService {
  constructor(private configService: ConfigService) {}

  get port(): number {
    return this.configService.get<number>("PORT") || 3000;
  }

  get host(): string {
    return this.configService.get<string>("HOST") || "0.0.0.0";
  }

  get jwtSecret(): string {
    return this.configService.getOrThrow<string>("JWT_SECRET");
  }

  get rabbitmqUri(): string {
    return this.configService.getOrThrow<string>("RABBITMQ_URI");
  }

  get usersServiceQueue(): string {
    return (
      this.configService.get<string>("USERS_SERVICE_QUEUE") || "users-service"
    );
  }

  get authServiceQueue(): string {
    return (
      this.configService.get<string>("AUTH_SERVICE_QUEUE") || "auth-service"
    );
  }

  get accountsServiceQueue(): string {
    return (
      this.configService.get<string>("ACCOUNTS_SERVICE_QUEUE") ||
      "accounts-service"
    );
  }
}
