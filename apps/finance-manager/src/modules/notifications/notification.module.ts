import { Module } from "@nestjs/common";
import { NotificationService } from "./notification.service";
import { NotificationController } from "./notification.controller";
import { RabbitMQModule } from "../shared-kernel/infrastructure/rabbitmq/rabbitmq.module";

@Module({
    imports: [RabbitMQModule],
    controllers: [NotificationController],
    providers: [NotificationService],
    exports: [NotificationService],
})
export class NotificationModule {}
