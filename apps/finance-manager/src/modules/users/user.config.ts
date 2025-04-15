import { registerAs } from "@nestjs/config";
import path from "path";
import dotenv from "dotenv";

const userEnvPath = path.resolve(__dirname, "../../../../src/modules/users/.env");
dotenv.config({ path: userEnvPath });

export default registerAs("user", () => {
    return {
        POSTGRES_HOST: process.env.POSTGRES_HOST,
        POSTGRES_PORT: process.env.POSTGRES_PORT ? parseInt(process.env.POSTGRES_PORT, 10) : 5432,
        POSTGRES_USER: process.env.POSTGRES_USER,
        POSTGRES_PASSWORD: process.env.POSTGRES_PASSWORD,
        POSTGRES_DB: process.env.POSTGRES_DB,
    };
});
