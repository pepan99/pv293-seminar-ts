import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { UsersConfigService } from "./users.config";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: [".env", ".env.local"],
    }),
  ],
  providers: [UsersConfigService],
  exports: [UsersConfigService],
})
export class UsersConfigModule {}
