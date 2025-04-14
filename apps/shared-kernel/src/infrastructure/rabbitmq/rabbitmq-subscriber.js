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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.RabbitMQSubscriber = void 0;
const common_1 = require("@nestjs/common");
const nestjs_rabbitmq_1 = require("@golevelup/nestjs-rabbitmq");
const common_2 = require("@nestjs/common");
let RabbitMQSubscriber = class RabbitMQSubscriber {
    amqpConnection;
    events;
    bridge;
    constructor(amqpConnection, events) {
        this.amqpConnection = amqpConnection;
        this.events = events;
    }
    connect() {
        this.events.forEach(async (event) => {
            await this.amqpConnection.createSubscriber((message) => {
                if (this.bridge && message) {
                    const parsedJson = JSON.parse(message);
                    const receivedEvent = new event(parsedJson);
                    this.bridge.next(receivedEvent);
                    return new nestjs_rabbitmq_1.Nack(false);
                }
            }, {
                errorHandler: (channel, msg, e) => {
                    throw e;
                },
                queue: event.name,
            }, `handler_${event.name}`);
        });
    }
    bridgeEventsTo(subject) {
        this.bridge = subject;
    }
};
exports.RabbitMQSubscriber = RabbitMQSubscriber;
exports.RabbitMQSubscriber = RabbitMQSubscriber = __decorate([
    (0, common_2.Injectable)(),
    __param(1, (0, common_1.Inject)("EVENTS")),
    __metadata("design:paramtypes", [typeof (_a = typeof nestjs_rabbitmq_1.AmqpConnection !== "undefined" && nestjs_rabbitmq_1.AmqpConnection) === "function" ? _a : Object, Array])
], RabbitMQSubscriber);
//# sourceMappingURL=rabbitmq-subscriber.js.map