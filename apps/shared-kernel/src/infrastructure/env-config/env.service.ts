import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class EnvService<
  TEnv extends Record<string, string | number> = Record<
    string,
    string | number
  >,
> {
  constructor(private configService: ConfigService<TEnv, true>) {}

  get<K extends keyof TEnv>(key: K): TEnv[K] {
    return this.configService.get(key as never, { infer: true });
  }
}
