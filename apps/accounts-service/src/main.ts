import { NestFactory } from "@nestjs/core";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { MicroserviceOptions, Transport } from "@nestjs/microservices";
import { AccountsModule } from "./accounts.module";
import { AccountConfigService } from "./infrastructure/config/account-config.service";
import { AppConfigService } from "shared-kernel/src";

async function bootstrap() {
  // Create the main HTTP API application
  const app = await NestFactory.create(AccountsModule);

  // Setup Swagger documentation
  const config = new DocumentBuilder()
    .setTitle("Accounts Service API")
    .setDescription("API for managing financial accounts")
    .setVersion("1.0")
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup("api", app, document);

  const accountsConfig = app.get(AccountConfigService);
  // Create microservice instance using RabbitMQ
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.RMQ,
    options: {
      urls: [accountsConfig.rabbitmqUri || "amqp://localhost:5672"],
      queue: "accounts_queue",
      queueOptions: {
        durable: true,
      },
    },
  });

  const appConfig = app.get(AppConfigService);
  // Start both HTTP and microservice interfaces
  await app.startAllMicroservices();
  await app.listen(appConfig.port);
  console.log(`Accounts service is running on ${await app.getUrl()}`);
}

bootstrap();
