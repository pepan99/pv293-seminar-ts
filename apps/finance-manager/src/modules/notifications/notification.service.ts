import { Injectable, Logger, OnModuleInit } from "@nestjs/common";
import { RabbitMQService } from "../shared-kernel/infrastructure/rabbitmq/rabbitmq.service";

export interface NotificationPayload {
    userId: string;
    message: string;
    type: "success" | "warning" | "error" | "info";
    timestamp: Date;
}

@Injectable()
export class NotificationService implements OnModuleInit {
    private readonly logger = new Logger(NotificationService.name);
    private readonly NOTIFICATIONS_QUEUE = "notifications_queue";
    private readonly NOTIFICATIONS_ROUTING_KEY = "notifications";

    constructor(private readonly rabbitMQService: RabbitMQService) {}

    async onModuleInit() {
        // Set up a specific queue for notifications
        await this.rabbitMQService.createQueue(
            this.NOTIFICATIONS_QUEUE,
            undefined, // use default exchange
            this.NOTIFICATIONS_ROUTING_KEY,
        );

        // Set up consumer to process notifications
        await this.consumeNotifications();
    }

    /**
     * Send a notification message to the RabbitMQ queue
     */
    async sendNotification(payload: Omit<NotificationPayload, "timestamp">) {
        const fullPayload: NotificationPayload = {
            ...payload,
            timestamp: new Date(),
        };

        await this.rabbitMQService.publish(
            fullPayload,
            undefined, // use default exchange
            this.NOTIFICATIONS_ROUTING_KEY,
        );

        this.logger.log(`Notification sent to user ${payload.userId}: ${payload.message}`);
    }

    /**
     * Consume notifications from the queue and process them
     */
    private async consumeNotifications() {
        await this.rabbitMQService.consume<NotificationPayload>(
            this.NOTIFICATIONS_QUEUE,
            async (message) => {
                // Here you would integrate with an actual notification service
                // like email, SMS, or push notifications
                this.logger.log(
                    `Processing notification for user ${message.userId}: ${message.message} (${message.type})`,
                );

                // Simulate sending the actual notification
                // In a real app, this would call an external service or API
                this.processNotification(message);
            },
        );
    }

    /**
     * Process a notification (in a real app, this would send emails, SMS, etc.)
     */
    private processNotification(notification: NotificationPayload): void {
        const { userId, message, type, timestamp } = notification;

        this.logger.log(
            `[${type.toUpperCase()}][${timestamp.toISOString()}] User ${userId}: ${message}`,
        );

        // Add your notification logic here:
        // - Send emails
        // - Send push notifications
        // - Store notifications in database
        // - Etc.
    }
}
