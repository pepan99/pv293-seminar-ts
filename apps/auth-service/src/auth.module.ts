import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { CqrsModule } from "@nestjs/cqrs";
import { JwtModule } from "@nestjs/jwt";
import { RabbitMQModule } from "@golevelup/nestjs-rabbitmq";
import {
  DatabaseModule,
  EnvModule,
  EnvService,
  DbEnv,
  dbSchema,
  RabbitmqEnv,
} from "shared-kernel";

@Module({
  imports: [
    CqrsModule,
    ConfigModule.forRoot({
      envFilePath: [".env"],
      validate: (config) => {
        const result = dbSchema.safeParse(config);
        if (!result.success) {
          throw new Error(`Config validation error}`);
        }
        return result.data;
      },
    }),
    JwtModule.registerAsync({
      imports: [EnvModule],
      inject: [EnvService],
      useFactory: (envService: EnvService) => ({
        secret: envService.get("JWT_SECRET"),
        signOptions: { expiresIn: "8h" },
      }),
    }),
    EnvModule,
    RabbitMQModule.forRootAsync({
      imports: [EnvModule],
      inject: [EnvService],
      useFactory: (envService: EnvService<RabbitmqEnv>) => {
        return {
          uri: envService.get("RABBITMQ_URI"),
          connectionInitOptions: { wait: false },
        };
      },
    }),
    DatabaseModule.forRootAsync({
      imports: [EnvModule],
      inject: [EnvService],
      useFactory: (envService: EnvService<DbEnv>) => ({
        host: envService.get("POSTGRES_HOST"),
        port: envService.get("POSTGRES_PORT"),
        user: envService.get("POSTGRES_USER"),
        password: envService.get("POSTGRES_PASSWORD"),
        database: envService.get("POSTGRES_DB"),
      }),
    }),
  ],
  controllers: [],
  providers: [],
  exports: [],
})
export class AuthModule {}
