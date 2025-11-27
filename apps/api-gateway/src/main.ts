import { NestFactory } from "@nestjs/core";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { AppModule } from "./app.module";
import { GatewayConfigService } from "./config/gateway.config";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const config = app.get(GatewayConfigService);

  // Enable CORS
  app.enableCors();

  // Swagger setup
  const swaggerConfig = new DocumentBuilder()
    .setTitle("Finance Manager API")
    .setDescription("API Gateway for Finance Manager Microservices")
    .setVersion("1.0")
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup("api", app, document);

  await app.listen(config.port, config.host);
  console.log(`API Gateway is running on http://${config.host}:${config.port}`);
  console.log(
    `Swagger docs available at http://${config.host}:${config.port}/api`,
  );
}

bootstrap();
