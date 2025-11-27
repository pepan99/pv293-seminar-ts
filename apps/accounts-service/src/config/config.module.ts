import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { AccountsConfigService } from "./accounts.config";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: [".env", ".env.local"],
    }),
  ],
  providers: [AccountsConfigService],
  exports: [AccountsConfigService],
})
export class AccountsConfigModule {}
