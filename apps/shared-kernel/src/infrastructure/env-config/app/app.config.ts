import { registerAs } from "@nestjs/config";

export default registerAs("app", () => {
  return {
    HOST: process.env.HOST,
    PORT: process.env.PORT,
    JWT_SECRET: process.env.JWT_SECRET,
  };
});
