import { AmqpConnection } from "@golevelup/nestjs-rabbitmq";
import { Injectable, Logger } from "@nestjs/common";

export interface RpcRequest<T = unknown> {
  pattern: string;
  data: T;
}

export interface RpcResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

@Injectable()
export class RabbitMQRpcClient {
  private readonly logger = new Logger(RabbitMQRpcClient.name);

  constructor(private readonly amqpConnection: AmqpConnection) {}

  async send<TRequest, TResponse>(
    queue: string,
    pattern: string,
    data: TRequest,
    timeout = 30000,
  ): Promise<RpcResponse<TResponse>> {
    try {
      const request: RpcRequest<TRequest> = { pattern, data };

      const response = await this.amqpConnection.request<
        RpcResponse<TResponse>
      >({
        exchange: "",
        routingKey: queue,
        payload: request,
        timeout,
      });

      return response;
    } catch (error) {
      this.logger.error(`RPC request failed: ${error}`);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }
}
