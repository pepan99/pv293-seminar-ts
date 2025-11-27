import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class AuthConfigService {
  constructor(private configService: ConfigService) {}

  get port(): number {
    return this.configService.get<number>("PORT") || 3002;
  }

  get host(): string {
    return this.configService.get<string>("HOST") || "0.0.0.0";
  }

  get postgresHost(): string {
    return this.configService.getOrThrow<string>("POSTGRES_HOST");
  }

  get postgresPort(): number {
    return this.configService.get<number>("POSTGRES_PORT") || 5432;
  }

  get postgresUser(): string {
    return this.configService.getOrThrow<string>("POSTGRES_USER");
  }

  get postgresPassword(): string {
    return this.configService.getOrThrow<string>("POSTGRES_PASSWORD");
  }

  get postgresDB(): string {
    return this.configService.getOrThrow<string>("POSTGRES_DB");
  }

  get jwtSecret(): string {
    return this.configService.getOrThrow<string>("JWT_SECRET");
  }

  get rabbitmqUri(): string {
    return this.configService.getOrThrow<string>("RABBITMQ_URI");
  }

  get serviceQueue(): string {
    return this.configService.get<string>("SERVICE_QUEUE") || "auth-service";
  }
}
