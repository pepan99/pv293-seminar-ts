"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.rabbitmqSchema = exports.dbSchema = exports.appSchema = exports.defaultEnvSchema = void 0;
const zod_1 = require("zod");
exports.defaultEnvSchema = zod_1.z.object({
    POSTGRES_HOST: zod_1.z.string(),
    POSTGRES_PORT: zod_1.z.coerce.number(),
    POSTGRES_USER: zod_1.z.string(),
    POSTGRES_PASSWORD: zod_1.z.string(),
    POSTGRES_DB: zod_1.z.string(),
    JWT_SECRET: zod_1.z.string(),
    RABBITMQ_HOST: zod_1.z.string(),
    RABBITMQ_PORT: zod_1.z.coerce.number(),
    RABBITMQ_USER: zod_1.z.string(),
    RABBITMQ_PASSWORD: zod_1.z.string(),
    RABBITMQ_URI: zod_1.z.string(),
});
exports.appSchema = zod_1.z.object({
    HOST: zod_1.z.string().optional().default("0.0.0.0"),
    PORT: zod_1.z.coerce.number().optional().default(8000),
    JWT_SECRET: zod_1.z.string(),
});
exports.dbSchema = zod_1.z.object({
    POSTGRES_HOST: zod_1.z.string(),
    POSTGRES_PORT: zod_1.z.coerce.number(),
    POSTGRES_USER: zod_1.z.string(),
    POSTGRES_PASSWORD: zod_1.z.string(),
    POSTGRES_DB: zod_1.z.string(),
});
exports.rabbitmqSchema = zod_1.z.object({
    RABBITMQ_HOST: zod_1.z.string(),
    RABBITMQ_PORT: zod_1.z.coerce.number(),
    RABBITMQ_USER: zod_1.z.string(),
    RABBITMQ_PASSWORD: zod_1.z.string(),
    RABBITMQ_URI: zod_1.z.string(),
});
//# sourceMappingURL=env.schema.js.map