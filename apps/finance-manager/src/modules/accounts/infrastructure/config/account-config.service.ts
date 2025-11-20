import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import {
    dbSchema,
    rabbitmqSchema,
} from "../../../shared-kernel/infrastructure/env-config/env.schema";
import { ValidatedConfigService } from "../../../shared-kernel/infrastructure/env-config/validated-config.service";

@Injectable()
export class AccountConfigService extends ValidatedConfigService {
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

    get postgresHost(): string {
        return this.configService.get<string>("account.POSTGRES_HOST")!;
    }

    get postgresPort(): string {
        return this.configService.get<string>("account.POSTGRES_PORT")!;
    }

    get postgresUser(): string {
        return this.configService.get<string>("account.POSTGRES_USER")!;
    }
    get postgresPassword(): string {
        return this.configService.get<string>("account.POSTGRES_PASSWORD")!;
    }
    get postgresDB(): string {
        return this.configService.get<string>("account.POSTGRES_DB")!;
    }

    // RabbitMQ Configuration
    get rabbitmqHost(): string {
        return this.configService.get<string>("account.RABBITMQ_HOST")!;
    }

    get rabbitmqPort(): string {
        return this.configService.get<string>("account.RABBITMQ_PORT")!;
    }

    get rabbitmqUser(): string {
        return this.configService.get<string>("account.RABBITMQ_USER")!;
    }

    get rabbitmqPassword(): string {
        return this.configService.get<string>("account.RABBITMQ_PASSWORD")!;
    }

    get rabbitmqUri(): string {
        return this.configService.get<string>("account.RABBITMQ_URI")!;
    }
}
