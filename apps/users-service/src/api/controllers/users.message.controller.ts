import { Controller } from "@nestjs/common";
import { MessagePattern } from "@nestjs/microservices";
import { QueryBus, CommandBus } from "@nestjs/cqrs";
import { GetUserByIdQuery } from "../../application/queries/get-user-by-id.handler";
import { UpdateUserCommand } from "../../application/commands/update-user.handler";
import { ChangePasswordCommand } from "../../application/commands/change-password.handler";

@Controller()
export class UsersMessageController {
  constructor(
    private readonly queryBus: QueryBus,
    private readonly commandBus: CommandBus,
  ) {}

  @MessagePattern("get_user_profile")
  async getUserProfile(data: { userId: string }) {
    return this.queryBus.execute(new GetUserByIdQuery(data.userId));
  }

  @MessagePattern("update_user_profile")
  async updateUserProfile(data: { userId: string; dto: any }) {
    return this.commandBus.execute(
      new UpdateUserCommand(data.userId, data.dto),
    );
  }

  @MessagePattern("change_password")
  async changePassword(data: { userId: string; dto: any }) {
    return this.commandBus.execute(
      new ChangePasswordCommand(data.userId, data.dto),
    );
  }
}
