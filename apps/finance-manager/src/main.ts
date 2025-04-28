import { NestFactory } from "@nestjs/core";
import { SwaggerModule, DocumentBuilder } from "@nestjs/swagger";
import { AppModule } from "./app.module";
import { patchNestJsSwagger } from "nestjs-zod";
import { AppConfigService } from "./infrastructure/config/app-config.service";
import { Logger } from "nestjs-pino";

declare const module: __WebpackModuleApi.Module;

async function bootstrap() {
    patchNestJsSwagger();

    const app = await NestFactory.create(AppModule, { bufferLogs: true });
    app.useLogger(app.get(Logger));

    const config = new DocumentBuilder()
        .setTitle("Finance Manager")
        .setDescription(
            "Finance Manager is an app used for monitoring finances over all accounts and expenses the user has.",
        )
        .setVersion("1.0")
        .addBearerAuth()
        .build();
    const documentFactory = () => SwaggerModule.createDocument(app, config);
    SwaggerModule.setup("swagger", app, documentFactory);

    app.enableCors();

    const envService = app.get(AppConfigService);

    const port = envService.port;
    await app.listen(port);

    if (module.hot) {
        module.hot.accept();
        module.hot.dispose(() => {
            void app.close();
        });
    }
}
void bootstrap();
