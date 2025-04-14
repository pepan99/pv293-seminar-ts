import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { RabbitMQService } from "./rabbitmq.service";
import { EnvModule } from "../env-config/env.module";

@Module({
    imports: [ConfigModule, EnvModule],
    providers: [RabbitMQService],
    exports: [RabbitMQService],
})
export class RabbitMQModule {}
