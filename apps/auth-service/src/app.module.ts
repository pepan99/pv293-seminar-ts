import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { APP_PIPE } from "@nestjs/core";
import { ZodValidationPipe } from "nestjs-zod";
import { CqrsModule } from "@nestjs/cqrs";
import { AuthModule } from "./auth.module";
import { dbSchema } from "shared-kernel";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate: (config) => {
        const result = dbSchema.safeParse(config);
        if (!result.success) {
          throw new Error(`Config validation error}`);
        }
        return result.data;
      },
    }),
    CqrsModule,
    AuthModule,
  ],
  providers: [
    {
      provide: APP_PIPE,
      useClass: ZodValidationPipe,
    },
  ],
})
export class AppModule {}
