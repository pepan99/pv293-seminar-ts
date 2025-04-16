"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const config_1 = require("@nestjs/config");
exports.default = (0, config_1.registerAs)("app", () => {
    return {
        HOST: process.env.HOST,
        PORT: process.env.PORT,
        JWT_SECRET: process.env.JWT_SECRET,
    };
});
//# sourceMappingURL=app.config.js.map