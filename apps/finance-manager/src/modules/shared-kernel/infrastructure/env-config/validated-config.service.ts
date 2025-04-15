import { Injectable, OnModuleInit } from "@nestjs/common";
import { z } from "zod";

@Injectable()
export abstract class ValidatedConfigService implements OnModuleInit {
    abstract getSchema(): z.ZodTypeAny;

    abstract getRawConfig(): Record<string, unknown>;

    onModuleInit() {
        const schema = this.getSchema();
        const rawConfig = this.getRawConfig();
        console.log(rawConfig);

        try {
            // Validate using Zod
            schema.parse(rawConfig);
        } catch (error) {
            if (error instanceof z.ZodError) {
                throw new Error(
                    `Configuration failed - \n${JSON.stringify(
                        error.errors.map((err) => ({
                            path: err.path.join("."),
                            message: err.message,
                        })),
                        null,
                        2,
                    )}`,
                );
            }
            throw error;
        }
    }
}
