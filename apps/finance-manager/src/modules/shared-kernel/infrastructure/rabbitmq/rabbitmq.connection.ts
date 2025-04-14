import { Injectable, Inject, Logger, OnModuleInit } from "@nestjs/common";
import * as amqp from "amqplib";
import asyncRetry from "async-retry";

export class RabbitmqOptions {
    host: string;
    port: number;
    password: string;
    username: string;
    constructor(partial?: Partial<RabbitmqOptions>) {
        Object.assign(this, partial);
    }
}

let connection: amqp.Connection | null = null;
let channel: amqp.Channel | null = null;

export interface IRabbitmqConnection {
    createConnection(options?: RabbitmqOptions): Promise<amqp.Connection>;

    getChannel(): Promise<amqp.Channel>;

    closeChannel(): Promise<void>;

    closeConnection(): Promise<void>;
}

@Injectable()
export class RabbitmqConnection implements OnModuleInit, IRabbitmqConnection {
    constructor(@Inject(RabbitmqOptions) private readonly options?: RabbitmqOptions) {}

    async onModuleInit(): Promise<void> {
        await this.createConnection(this.options);
    }

    async createConnection(options?: RabbitmqOptions): Promise<amqp.Connection> {
        if (!connection || connection !== undefined) {
            try {
                const host = options?.host;
                const port = options?.port;

                await asyncRetry(
                    async () => {
                        connection = await amqp.connect(`amqp://${host}:${port}`, {
                            username: options?.username,
                            password: options?.password,
                        });
                    },
                    {
                        retries: 3,
                        factor: 2,
                        minTimeout: 1000,
                        maxTimeout: 60000,
                    },
                );

                connection.on("error", async (error): Promise<void> => {
                    Logger.error(`Error occurred on connection: ${error}`);
                    await this.closeConnection();
                    await this.createConnection();
                });
            } catch (error) {
                throw new Error("Rabbitmq connection failed!");
            }
        }
        return connection;
    }
    async getChannel(): Promise<amqp.Channel | undefined> {
        try {
            if (!connection) {
                throw new Error("Rabbitmq connection failed!");
            }

            if ((connection && !channel) || !channel) {
                await asyncRetry(
                    async () => {
                        channel = await connection.createChannel();
                        Logger.log("Channel Created successfully");
                    },
                    {
                        retries: 3,
                        factor: 2,
                        minTimeout: 1000,
                        maxTimeout: 60000,
                    },
                );
            }

            channel.on("error", async (error): Promise<void> => {
                Logger.error(`Error occurred on channel: ${error}`);
                await this.closeChannel();
                await this.getChannel();
            });

            return channel;
        } catch (error) {
            Logger.error("Failed to get channel!");
        }
    }

    async closeChannel(): Promise<void> {
        try {
            if (channel) {
                await channel.close();
                Logger.log("Channel closed successfully");
            }
        } catch (error) {
            Logger.error("Channel close failed!");
        }
    }

    async closeConnection(): Promise<void> {
        try {
            if (connection) {
                await connection.close();
                Logger.log("Connection Rabbitmq closed gracefully");
            }
        } catch (error) {
            Logger.error("Connection Rabbitmq close failed!");
        }
    }
}
