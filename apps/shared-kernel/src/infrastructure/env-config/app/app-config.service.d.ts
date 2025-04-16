import { ConfigService } from "@nestjs/config";
import { ValidatedConfigService } from "../validated-config.service";
export declare class AppConfigService extends ValidatedConfigService {
  private configService;
  constructor(configService: ConfigService);
  getSchema(): import("zod").ZodObject<
    {
      HOST: import("zod").ZodDefault<
        import("zod").ZodOptional<import("zod").ZodString>
      >;
      PORT: import("zod").ZodDefault<
        import("zod").ZodOptional<import("zod").ZodNumber>
      >;
      JWT_SECRET: import("zod").ZodString;
    },
    "strip",
    import("zod").ZodTypeAny,
    {
      JWT_SECRET: string;
      HOST: string;
      PORT: number;
    },
    {
      JWT_SECRET: string;
      HOST?: string | undefined;
      PORT?: number | undefined;
    }
  >;
  getRawConfig(): {
    HOST: string;
    PORT: number;
    JWT_SECRET: string;
  };
  get host(): string;
  get port(): number;
  get jwtSecret(): string;
}
//# sourceMappingURL=app-config.service.d.ts.map
