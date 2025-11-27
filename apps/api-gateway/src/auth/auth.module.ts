import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { PassportModule } from "@nestjs/passport";
import { GatewayConfigModule } from "../config/config.module";
import { GatewayConfigService } from "../config/gateway.config";
import { JwtStrategy } from "./jwt.strategy";

@Module({
  imports: [
    GatewayConfigModule,
    PassportModule,
    JwtModule.registerAsync({
      imports: [GatewayConfigModule],
      inject: [GatewayConfigService],
      useFactory: (config: GatewayConfigService) => ({
        secret: config.jwtSecret,
        signOptions: { expiresIn: "1h" },
      }),
    }),
  ],
  providers: [JwtStrategy],
  exports: [JwtModule],
})
export class AuthModule {}
