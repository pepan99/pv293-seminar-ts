import { NestFactory } from "@nestjs/core";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { MicroserviceOptions, Transport } from "@nestjs/microservices";
import { AuthModule } from "./auth.module";
import { AppConfigService } from "shared-kernel/src";
import { AuthConfigService } from "./infrastructure/config/auth-config.service";

async function bootstrap() {
  const app = await NestFactory.create(AuthModule);

  // Setup Swagger documentation
  const config = new DocumentBuilder()
    .setTitle("Auth Service API")
    .setDescription("API for authentication and authorization")
    .setVersion("1.0")
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup("api", app, document);

  const authConfig = app.get(AuthConfigService);
  // Create microservice instance using RabbitMQ
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.RMQ,
    options: {
      urls: [authConfig.rabbitmqUri || "amqp://localhost:5672"],
      queue: "auth_queue",
      queueOptions: {
        durable: true,
      },
    },
  });

  const appConfig = app.get(AppConfigService);
  // Start both HTTP and microservice interfaces
  await app.startAllMicroservices();
  await app.listen(appConfig.port);
  console.log(`Auth service is running on ${await app.getUrl()}`);
}

bootstrap();
