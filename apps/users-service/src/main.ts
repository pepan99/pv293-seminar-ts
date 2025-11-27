import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { UsersConfigService } from "./config/users.config";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const config = app.get(UsersConfigService);

  await app.listen(config.port, config.host);
  console.log(
    `Users Service is running on http://${config.host}:${config.port}`,
  );
  console.log(`Listening on RabbitMQ queue: ${config.serviceQueue}`);
}

bootstrap();
