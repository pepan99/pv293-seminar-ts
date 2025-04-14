import { ConfigService } from "@nestjs/config";
export declare class EnvService<
  TEnv extends Record<string, string | number> = Record<
    string,
    string | number
  >,
> {
  private configService;
  constructor(configService: ConfigService<TEnv, true>);
  get<K extends keyof TEnv>(key: K): TEnv[K];
}
