import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { ClientsModule, Transport } from "@nestjs/microservices";
import { APP_PIPE } from "@nestjs/core";
import { ZodValidationPipe } from "nestjs-zod";
import { AccountsController } from "./controllers/accounts.controller";
import { UsersController } from "./controllers/users.controller";
import { AuthController } from "./controllers/auth.controller";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    // Register microservice clients
    ClientsModule.register([
      {
        name: "ACCOUNTS_SERVICE",
        transport: Transport.RMQ,
        options: {
          urls: [process.env.RABBITMQ_URI || "amqp://localhost:5672"],
          queue: "accounts_queue",
          queueOptions: {
            durable: true,
          },
        },
      },
      {
        name: "USERS_SERVICE",
        transport: Transport.RMQ,
        options: {
          urls: [process.env.RABBITMQ_URI || "amqp://localhost:5672"],
          queue: "users_queue",
          queueOptions: {
            durable: true,
          },
        },
      },
      {
        name: "AUTH_SERVICE",
        transport: Transport.RMQ,
        options: {
          urls: [process.env.RABBITMQ_URI || "amqp://localhost:5672"],
          queue: "auth_queue",
          queueOptions: {
            durable: true,
          },
        },
      },
    ]),
  ],
  controllers: [AccountsController, UsersController, AuthController],
  providers: [
    {
      provide: APP_PIPE,
      useClass: ZodValidationPipe,
    },
  ],
})
export class AppModule {}
