import { Controller, Get } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiResponse } from "@nestjs/swagger";

@ApiTags("health")
@Controller()
export class HealthController {
    constructor() {}

    @Get("health")
    @ApiOperation({ summary: "Check if the service is running" })
    @ApiResponse({
        status: 200,
        description: "Return true if the service is running",
    })
    getHealth() {
        return true;
    }
}
