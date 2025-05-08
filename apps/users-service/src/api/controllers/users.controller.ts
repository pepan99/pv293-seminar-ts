import { Controller } from "@nestjs/common";
import { MessagePattern, Payload } from "@nestjs/microservices";
import {
  ChangePasswordDto,
  UpdateUserAdminDto,
  UpdateUserDto,
} from "../dto/zod-dtos";
import { CommandBus, QueryBus } from "@nestjs/cqrs";
import { GetUserByIdQuery } from "../../application/queries/get-user-by-id.handler";
import { UpdateUserCommand } from "../../application/commands/update-user.handler";
import { ChangePasswordCommand } from "../../application/commands/change-password.handler";
import { GetAllUsersQuery } from "../../application/queries/get-all-users.handler";
import { UpdateUserAdminCommand } from "../../application/commands/update-user-admin.handler";
import { RemoveUserCommand } from "../../application/commands/remove-user.handler";
import { UserWithoutPassword } from "../../core/entities/user.entity";
import {
  CommandSucceededWithBool,
  CommandSucceededWithId,
} from "shared-kernel/src/core/types/return-types";

@Controller()
export class UsersController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @MessagePattern("users.get_user_profile")
  async getUserProfile(
    @Payload() data: { userId: string },
  ): Promise<UserWithoutPassword> {
    return this.queryBus.execute(new GetUserByIdQuery(data.userId));
  }

  @MessagePattern("users.update_user_profile")
  async updateUserProfile(
    @Payload() data: { userId: string; dto: UpdateUserDto },
  ): Promise<CommandSucceededWithId> {
    return this.commandBus.execute(
      new UpdateUserCommand(data.userId, data.dto),
    );
  }

  @MessagePattern("users.change_user_password")
  async changeUserPassword(
    @Payload() data: { userId: string; dto: ChangePasswordDto },
  ): Promise<CommandSucceededWithBool> {
    return this.commandBus.execute(
      new ChangePasswordCommand(data.userId, data.dto),
    );
  }

  @MessagePattern("users.get_all_users")
  async getAllUsers(): Promise<UserWithoutPassword[]> {
    return this.queryBus.execute(new GetAllUsersQuery());
  }

  @MessagePattern("users.get_user_by_id")
  async getUserById(
    @Payload() data: { id: string },
  ): Promise<UserWithoutPassword> {
    return this.queryBus.execute(new GetUserByIdQuery(data.id));
  }

  @MessagePattern("users.update_user_by_id")
  async updateUserById(
    @Payload() data: { id: string; dto: UpdateUserAdminDto },
  ): Promise<CommandSucceededWithId> {
    return this.commandBus.execute(
      new UpdateUserAdminCommand(data.id, data.dto),
    );
  }

  @MessagePattern("users.remove_user")
  async removeUser(
    @Payload() data: { id: string },
  ): Promise<CommandSucceededWithId> {
    return this.commandBus.execute(new RemoveUserCommand(data.id));
  }
}
