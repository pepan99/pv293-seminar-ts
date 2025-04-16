"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppConfigService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const validated_config_service_1 = require("../validated-config.service");
const env_schema_1 = require("../env.schema");
let AppConfigService = class AppConfigService extends validated_config_service_1.ValidatedConfigService {
    constructor(configService) {
        super();
        this.configService = configService;
    }
    getSchema() {
        return env_schema_1.appSchema;
    }
    getRawConfig() {
        return {
            HOST: this.host,
            PORT: this.port,
            JWT_SECRET: this.jwtSecret,
        };
    }
    get host() {
        return this.configService.get("app.HOST");
    }
    get port() {
        return this.configService.get("app.PORT");
    }
    get jwtSecret() {
        return this.configService.get("app.JWT_SECRET");
    }
};
exports.AppConfigService = AppConfigService;
exports.AppConfigService = AppConfigService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], AppConfigService);
//# sourceMappingURL=app-config.service.js.map