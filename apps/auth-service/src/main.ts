import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { AuthConfigService } from "./config/auth.config";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const config = app.get(AuthConfigService);

  await app.listen(config.port, config.host);
  console.log(
    `Auth Service is running on http://${config.host}:${config.port}`,
  );
  console.log(`Listening on RabbitMQ queue: ${config.serviceQueue}`);
}

bootstrap();
