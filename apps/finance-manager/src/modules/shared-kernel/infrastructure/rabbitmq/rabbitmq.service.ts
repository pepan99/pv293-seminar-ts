import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from "@nestjs/common";
import { EnvService } from "../env-config/env.service";
import * as amqp from "amqplib";

@Injectable()
export class RabbitMQService implements OnModuleInit, OnModuleDestroy {
    private connection: amqp.Connection;
    private channel: amqp.Channel;
    private readonly logger = new Logger(RabbitMQService.name);

    constructor(private readonly envService: EnvService) {}

    async onModuleInit() {
        await this.connect();
    }

    async onModuleDestroy() {
        await this.disconnect();
    }

    /**
     * Connect to RabbitMQ server
     */
    private async connect() {
        try {
            const host = this.envService.get("RABBITMQ_HOST");
            const port = this.envService.get("RABBITMQ_PORT");
            const user = this.envService.get("RABBITMQ_USER");
            const password = this.envService.get("RABBITMQ_PASSWORD");

            const connectionString = `amqp://${user}:${password}@${host}:${port}`;
            this.connection = await amqp.connect(connectionString);
            this.channel = await this.connection.createChannel();

            this.logger.log("Successfully connected to RabbitMQ");

            // Setup default exchange and queue
            const exchange = this.envService.get("RABBITMQ_EXCHANGE");
            const queue = this.envService.get("RABBITMQ_QUEUE");
            const routingKey = this.envService.get("RABBITMQ_ROUTING_KEY");

            await this.channel.assertExchange(exchange, "direct", { durable: true });
            await this.channel.assertQueue(queue, { durable: true });
            await this.channel.bindQueue(queue, exchange, routingKey);

            this.logger.log(`Exchange "${exchange}" and queue "${queue}" setup completed`);
        } catch (error) {
            this.logger.error(`Failed to connect to RabbitMQ: ${error.message}`);
            // In production, you might want to implement a retry mechanism
            throw error;
        }
    }

    /**
     * Disconnect from RabbitMQ server
     */
    private async disconnect() {
        try {
            if (this.channel) {
                await this.channel.close();
            }
            if (this.connection) {
                await this.connection.close();
            }
            this.logger.log("Disconnected from RabbitMQ");
        } catch (error) {
            this.logger.error(`Error while disconnecting from RabbitMQ: ${error.message}`);
        }
    }

    /**
     * Publish a message to RabbitMQ
     */
    async publish<T>(
        message: T,
        exchange = this.envService.get("RABBITMQ_EXCHANGE"),
        routingKey = this.envService.get("RABBITMQ_ROUTING_KEY"),
    ): Promise<void> {
        try {
            // If channel is not available, try to reconnect
            if (!this.channel) {
                await this.connect();
            }

            const content = Buffer.from(JSON.stringify(message));
            const published = this.channel.publish(exchange, routingKey, content, {
                persistent: true,
                contentType: "application/json",
            });

            if (published) {
                this.logger.log(
                    `Message published to exchange "${exchange}" with routing key "${routingKey}"`,
                );
            } else {
                this.logger.warn("Channel write buffer is full! Waiting for drain event.");
                await new Promise((resolve) => this.channel.once("drain", resolve));
                this.logger.log("Channel drained, continuing...");
            }
        } catch (error) {
            this.logger.error(`Error publishing message: ${error.message}`);
            throw error;
        }
    }

    /**
     * Consume messages from a queue
     */
    async consume<T = any>(
        queue = this.envService.get("RABBITMQ_QUEUE"),
        callback: (message: T) => Promise<void>,
    ): Promise<void> {
        try {
            // If channel is not available, try to reconnect
            if (!this.channel) {
                await this.connect();
            }

            await this.channel.consume(
                queue,
                async (msg) => {
                    if (msg) {
                        try {
                            const content = msg.content.toString();
                            const parsedMessage = JSON.parse(content) as T;
                            await callback(parsedMessage);
                            this.channel.ack(msg);
                        } catch (error) {
                            this.logger.error(`Error processing message: ${error.message}`);
                            // Negative acknowledge the message so it goes back to the queue
                            this.channel.nack(msg, false, true);
                        }
                    }
                },
                { noAck: false },
            );

            this.logger.log(`Consumer registered for queue "${queue}"`);
        } catch (error) {
            this.logger.error(`Error setting up consumer: ${error.message}`);
            throw error;
        }
    }

    /**
     * Create a new queue and bind it to an exchange
     */
    async createQueue(
        queueName: string,
        exchange = this.envService.get("RABBITMQ_EXCHANGE"),
        routingKey: string = queueName,
    ): Promise<amqp.Replies.AssertQueue> {
        try {
            // If channel is not available, try to reconnect
            if (!this.channel) {
                await this.connect();
            }

            const queueResult = await this.channel.assertQueue(queueName, { durable: true });
            await this.channel.bindQueue(queueName, exchange, routingKey);

            this.logger.log(
                `Queue "${queueName}" created and bound to exchange "${exchange}" with routing key "${routingKey}"`,
            );

            return queueResult;
        } catch (error) {
            this.logger.error(`Error creating queue: ${error.message}`);
            throw error;
        }
    }

    /**
     * Create a new exchange
     */
    async createExchange(
        exchangeName: string,
        type: string = "direct",
    ): Promise<amqp.Replies.AssertExchange> {
        try {
            // If channel is not available, try to reconnect
            if (!this.channel) {
                await this.connect();
            }

            const exchangeResult = await this.channel.assertExchange(exchangeName, type, {
                durable: true,
            });

            this.logger.log(`Exchange "${exchangeName}" of type "${type}" created`);

            return exchangeResult;
        } catch (error) {
            this.logger.error(`Error creating exchange: ${error.message}`);
            throw error;
        }
    }
}
