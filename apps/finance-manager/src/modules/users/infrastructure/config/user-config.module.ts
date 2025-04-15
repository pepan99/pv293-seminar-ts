import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { UserConfigService } from "./user-config.service";
import userConfig from "../../user.config";

@Module({
    imports: [ConfigModule.forFeature(userConfig)],
    providers: [UserConfigService],
    exports: [UserConfigService],
})
export class UserConfigModule {}
