import { Module } from "@nestjs/common";
import { RabbitMQModule } from "@golevelup/nestjs-rabbitmq";
import { GatewayConfigModule } from "./config/config.module";
import { GatewayConfigService } from "./config/gateway.config";
import { AuthModule } from "./auth/auth.module";
import { AuthController } from "./controllers/auth.controller";
import { UsersController } from "./controllers/users.controller";
import { AccountsController } from "./controllers/accounts.controller";
import { RabbitMQRpcClient } from "shared-kernel";

@Module({
  imports: [
    GatewayConfigModule,
    AuthModule,
    RabbitMQModule.forRootAsync({
      imports: [GatewayConfigModule],
      inject: [GatewayConfigService],
      useFactory: (config: GatewayConfigService) => ({
        uri: config.rabbitmqUri,
        connectionInitOptions: { wait: true, timeout: 30000 },
        enableControllerDiscovery: true,
      }),
    }),
  ],
  controllers: [AuthController, UsersController, AccountsController],
  providers: [RabbitMQRpcClient],
})
export class AppModule {}
