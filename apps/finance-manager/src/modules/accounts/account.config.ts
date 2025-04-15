import { registerAs } from "@nestjs/config";
import path from "path";
import dotenv from "dotenv";

const accountEnvPath = path.resolve(__dirname, "../../../../src/modules/accounts/.env");
console.log("Loading account config from:", accountEnvPath);
dotenv.config({ path: accountEnvPath });

export default registerAs("account", () => {
    return {
        POSTGRES_HOST: process.env.POSTGRES_HOST,
        POSTGRES_PORT: process.env.POSTGRES_PORT ? parseInt(process.env.POSTGRES_PORT, 10) : 5432,
        POSTGRES_USER: process.env.POSTGRES_USER,
        POSTGRES_PASSWORD: process.env.POSTGRES_PASSWORD,
        POSTGRES_DB: process.env.POSTGRES_DB,
    };
});
