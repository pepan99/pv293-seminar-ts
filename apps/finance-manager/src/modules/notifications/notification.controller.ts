import { Body, Controller, Post, UseGuards } from "@nestjs/common";
import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { NotificationService } from "./notification.service";
import { createZodDto } from "nestjs-zod";
import { z } from "zod";
import { JwtAuthGuard } from "../auth/jwt/jwt-auth.guard";

// DTO for sending notifications
const sendNotificationSchema = z.object({
    userId: z.string().uuid(),
    message: z.string().min(1).max(255),
    type: z.enum(["success", "warning", "error", "info"]),
});

export class SendNotificationDto extends createZodDto(sendNotificationSchema) {}

@ApiTags("notifications")
@Controller("notifications")
export class NotificationController {
    constructor(private readonly notificationService: NotificationService) {}

    @Post()
    @UseGuards(JwtAuthGuard)
    @ApiOperation({ summary: "Send a notification to a user" })
    @ApiResponse({ status: 201, description: "The notification has been sent." })
    async sendNotification(@Body() dto: SendNotificationDto) {
        await this.notificationService.sendNotification(dto);
        return { success: true, message: "Notification sent" };
    }
}
