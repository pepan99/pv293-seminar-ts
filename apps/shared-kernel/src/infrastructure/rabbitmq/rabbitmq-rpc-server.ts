import { AmqpConnection } from "@golevelup/nestjs-rabbitmq";
import { Injectable, Logger, OnModuleInit } from "@nestjs/common";
import { RpcRequest, RpcResponse } from "./rabbitmq-rpc-client";

export type RpcHandler<TRequest = unknown, TResponse = unknown> = (
  data: TRequest,
) => Promise<TResponse>;

@Injectable()
export class RabbitMQRpcServer implements OnModuleInit {
  private readonly logger = new Logger(RabbitMQRpcServer.name);
  private handlers: Map<string, RpcHandler> = new Map();
  private queueName: string = "";

  constructor(private readonly amqpConnection: AmqpConnection) {}

  setQueueName(queueName: string) {
    this.queueName = queueName;
  }

  registerHandler<TRequest, TResponse>(
    pattern: string,
    handler: RpcHandler<TRequest, TResponse>,
  ) {
    this.handlers.set(pattern, handler as RpcHandler);
    this.logger.log(`Registered RPC handler for pattern: ${pattern}`);
  }

  async onModuleInit() {
    if (!this.queueName) {
      this.logger.warn("No queue name set, RPC server not initialized");
      return;
    }

    await this.setupRpcServer();
  }

  private async setupRpcServer() {
    const handler = async (message: RpcRequest): Promise<RpcResponse> => {
      const { pattern, data } = message;

      const registeredHandler = this.handlers.get(pattern);
      if (!registeredHandler) {
        this.logger.warn(`No handler found for pattern: ${pattern}`);
        return {
          success: false,
          error: `No handler for pattern: ${pattern}`,
        };
      }

      try {
        const result = await registeredHandler(data);
        return {
          success: true,
          data: result,
        };
      } catch (error) {
        this.logger.error(`Handler error for ${pattern}: ${error}`);
        return {
          success: false,
          error: error instanceof Error ? error.message : "Unknown error",
        };
      }
    };

    await this.amqpConnection.createSubscriber(
      handler as never,
      {
        queue: this.queueName,
        queueOptions: {
          durable: true,
        },
      },
      `rpc_handler_${this.queueName}`,
    );

    this.logger.log(`RPC server listening on queue: ${this.queueName}`);
  }
}
