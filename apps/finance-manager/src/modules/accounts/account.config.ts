import { registerAs } from "@nestjs/config";
import path from "path";
import dotenv from "dotenv";

const accountEnvPath = path.resolve(__dirname, "../../../../src/modules/accounts/.env");
dotenv.config({ path: accountEnvPath });

export default registerAs("account", () => {
    return {
        POSTGRES_HOST: process.env.POSTGRES_HOST,
        POSTGRES_PORT: process.env.POSTGRES_PORT ? parseInt(process.env.POSTGRES_PORT, 10) : 5432,
        POSTGRES_USER: process.env.POSTGRES_USER,
        POSTGRES_PASSWORD: process.env.POSTGRES_PASSWORD,
        POSTGRES_DB: process.env.POSTGRES_ACCOUNTS_DB,
        JWT_SECRET: process.env.JWT_SECRET,
        RABBITMQ_URI: process.env.RABBITMQ_URI,
        RABBITMQ_HOST: process.env.RABBITMQ_HOST,
        RABBITMQ_PORT: process.env.RABBITMQ_PORT ? parseInt(process.env.RABBITMQ_PORT, 10) : 5672,
        RABBITMQ_USER: process.env.RABBITMQ_USER,
        RABBITMQ_PASSWORD: process.env.RABBITMQ_PASSWORD,
    };
});
