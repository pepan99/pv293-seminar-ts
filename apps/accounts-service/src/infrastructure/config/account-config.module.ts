import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { AccountConfigService } from "./account-config.service";
import accountConfig from "../../account.config";

@Module({
  imports: [ConfigModule.forFeature(accountConfig)],
  providers: [AccountConfigService],
  exports: [AccountConfigService],
})
export class AccountConfigModule {}
