import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import {
  dbSchema,
  rabbitmqSchema,
  ValidatedConfigService,
} from "shared-kernel";

@Injectable()
export class AuthConfigService extends ValidatedConfigService {
  constructor(private configService: ConfigService) {
    super();
  }

  getSchema() {
    return dbSchema.merge(rabbitmqSchema);
  }

  getRawConfig() {
    return {
      POSTGRES_HOST: this.postgresHost,
      POSTGRES_PORT: this.postgresPort,
      POSTGRES_USER: this.postgresUser,
      POSTGRES_PASSWORD: this.postgresPassword,
      POSTGRES_DB: this.postgresDB,
      RABBITMQ_HOST: this.rabbitmqHost,
      RABBITMQ_PORT: this.rabbitmqPort,
      RABBITMQ_USER: this.rabbitmqUser,
      RABBITMQ_PASSWORD: this.rabbitmqPassword,
      RABBITMQ_URI: this.rabbitmqUri,
    };
  }

  // Database Configuration
  get postgresHost(): string {
    return this.configService.get<string>("auth.POSTGRES_HOST")!;
  }

  get postgresPort(): number {
    return this.configService.get<number>("auth.POSTGRES_PORT")!;
  }

  get postgresUser(): string {
    return this.configService.get<string>("auth.POSTGRES_USER")!;
  }

  get postgresPassword(): string {
    return this.configService.get<string>("auth.POSTGRES_PASSWORD")!;
  }

  get postgresDB(): string {
    return this.configService.get<string>("auth.POSTGRES_DB")!;
  }

  // JWT Configuration
  get jwtSecret(): string {
    return this.configService.get<string>("auth.JWT_SECRET")!;
  }

  // RabbitMQ Configuration
  get rabbitmqHost(): string {
    return this.configService.get<string>("auth.RABBITMQ_HOST")!;
  }

  get rabbitmqPort(): number {
    return this.configService.get<number>("auth.RABBITMQ_PORT")!;
  }

  get rabbitmqUser(): string {
    return this.configService.get<string>("auth.RABBITMQ_USER")!;
  }

  get rabbitmqPassword(): string {
    return this.configService.get<string>("auth.RABBITMQ_PASSWORD")!;
  }

  get rabbitmqUri(): string {
    return this.configService.get<string>("auth.RABBITMQ_URI")!;
  }
}
