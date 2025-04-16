"use strict";
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.DATABASE_OPTIONS = exports.ConfigurableDatabaseModule = void 0;
const common_1 = require("@nestjs/common");
_a = new common_1.ConfigurableModuleBuilder().setClassMethodName("forFeature").build(), exports.ConfigurableDatabaseModule = _a.ConfigurableModuleClass, exports.DATABASE_OPTIONS = _a.MODULE_OPTIONS_TOKEN;
//# sourceMappingURL=database.module-definition.js.map