import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { dbSchema } from "../../../shared-kernel/infrastructure/env-config/env.schema";
import { ValidatedConfigService } from "../../../shared-kernel/infrastructure/env-config/validated-config.service";

@Injectable()
export class AccountConfigService extends ValidatedConfigService {
    constructor(private configService: ConfigService) {
        super();
    }

    getSchema() {
        return dbSchema;
    }

    getRawConfig() {
        return {
            POSTGRES_HOST: this.postgresHost,
            POSTGRES_PORT: this.postgresPort,
            POSTGRES_USER: this.postgresUser,
            POSTGRES_PASSWORD: this.postgresPassword,
            POSTGRES_DB: this.postgresDB,
        };
    }

    get postgresHost(): string {
        return this.configService.get<string>("account.POSTGRES_HOST")!;
    }

    get postgresPort(): number {
        return this.configService.get<number>("account.POSTGRES_PORT")!;
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
}
