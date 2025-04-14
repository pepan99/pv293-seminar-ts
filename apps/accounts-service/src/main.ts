import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { ValidationPipe } from "@nestjs/common";
import { MicroserviceOptions, Transport } from "@nestjs/microservices";

async function bootstrap() {
  // Create the main HTTP API application
  const app = await NestFactory.create(AppModule);

  // Setup validation
  app.useGlobalPipes(new ValidationPipe());

  // Setup Swagger documentation
  const config = new DocumentBuilder()
    .setTitle("Accounts Service API")
    .setDescription("API for managing financial accounts")
    .setVersion("1.0")
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup("api", app, document);

  // Create microservice instance using RabbitMQ
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.RMQ,
    options: {
      urls: [process.env.RABBITMQ_URI || "amqp://localhost:5672"],
      queue: "accounts_queue",
      queueOptions: {
        durable: true,
      },
    },
  });

  // Start both HTTP and microservice interfaces
  await app.startAllMicroservices();
  await app.listen(3001);
  console.log(`Accounts service is running on ${await app.getUrl()}`);
}

bootstrap();
