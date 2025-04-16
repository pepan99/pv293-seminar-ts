import { OnModuleInit } from "@nestjs/common";
import { z } from "zod";
export declare abstract class ValidatedConfigService implements OnModuleInit {
  abstract getSchema(): z.ZodTypeAny;
  abstract getRawConfig(): Record<string, unknown>;
  onModuleInit(): void;
}
//# sourceMappingURL=validated-config.service.d.ts.map
