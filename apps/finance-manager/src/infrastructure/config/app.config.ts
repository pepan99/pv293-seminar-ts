import { registerAs } from "@nestjs/config";
import path from "path";
import dotenv from "dotenv";

const appEnvPath = path.resolve(__dirname, "../../../../.env");
dotenv.config({ path: appEnvPath });
console.log(appEnvPath);

export default registerAs("app", () => {
    return {
        HOST: process.env.HOST,
        PORT: process.env.PORT,
        JWT_SECRET: process.env.JWT_SECRET,
    };
});
