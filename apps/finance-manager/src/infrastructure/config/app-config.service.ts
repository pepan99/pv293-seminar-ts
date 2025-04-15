import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { appSchema } from "../../modules/shared-kernel/infrastructure/env-config/env.schema";
import { ValidatedConfigService } from "../../modules/shared-kernel/infrastructure/env-config/validated-config.service";

@Injectable()
export class AppConfigService extends ValidatedConfigService {
    constructor(private configService: ConfigService) {
        super();
    }

    getSchema() {
        return appSchema;
    }

    getRawConfig() {
        return {
            HOST: this.host,
            PORT: this.port,
            JWT_SECRET: this.jwtSecret,
        };
    }

    get host(): string {
        return this.configService.get<string>("app.HOST")!;
    }

    get port(): number {
        return this.configService.get<number>("app.PORT")!;
    }

    get jwtSecret(): string {
        return this.configService.get<string>("app.JWT_SECRET")!;
    }
}
