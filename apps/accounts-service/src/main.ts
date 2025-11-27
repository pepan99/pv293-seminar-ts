import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { AccountsConfigService } from "./config/accounts.config";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const config = app.get(AccountsConfigService);

  await app.listen(config.port, config.host);
  console.log(
    `Accounts Service is running on http://${config.host}:${config.port}`,
  );
  console.log(`Listening on RabbitMQ queue: ${config.serviceQueue}`);
}

bootstrap();
