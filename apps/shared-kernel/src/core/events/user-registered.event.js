"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserRegisteredEvent = void 0;
class UserRegisteredEvent {
    constructor(id, name, email, password, createdAt, updatedAt, roles) {
        this.id = id;
        this.name = name;
        this.email = email;
        this.password = password;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.roles = roles;
    }
}
exports.UserRegisteredEvent = UserRegisteredEvent;
//# sourceMappingURL=user-registered.event.js.map