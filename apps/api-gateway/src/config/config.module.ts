import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { GatewayConfigService } from "./gateway.config";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: [".env", ".env.local"],
    }),
  ],
  providers: [GatewayConfigService],
  exports: [GatewayConfigService],
})
export class GatewayConfigModule {}
