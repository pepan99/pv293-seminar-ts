import { NestFactory } from "@nestjs/core";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { MicroserviceOptions, Transport } from "@nestjs/microservices";
import { UsersModule } from "./users.module";

async function bootstrap() {
  // Create the main HTTP API application
  const app = await NestFactory.create(UsersModule);

  // Setup Swagger documentation
  const config = new DocumentBuilder()
    .setTitle("Users Service API")
    .setDescription("API for managing users")
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
      queue: "users_queue",
      queueOptions: {
        durable: true,
      },
    },
  });

  // Start both HTTP and microservice interfaces
  await app.startAllMicroservices();
  await app.listen(3002);
  console.log(`Users service is running on ${await app.getUrl()}`);
}

bootstrap();
