"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ValidatedConfigService = void 0;
const common_1 = require("@nestjs/common");
const zod_1 = require("zod");
let ValidatedConfigService = class ValidatedConfigService {
    onModuleInit() {
        const schema = this.getSchema();
        const rawConfig = this.getRawConfig();
        try {
            schema.parse(rawConfig);
        }
        catch (error) {
            if (error instanceof zod_1.z.ZodError) {
                throw new Error(`Configuration failed - \n${JSON.stringify(error.errors.map((err) => ({
                    path: err.path.join("."),
                    message: err.message,
                })), null, 2)}`);
            }
            throw error;
        }
    }
};
exports.ValidatedConfigService = ValidatedConfigService;
exports.ValidatedConfigService = ValidatedConfigService = __decorate([
    (0, common_1.Injectable)()
], ValidatedConfigService);
//# sourceMappingURL=validated-config.service.js.map