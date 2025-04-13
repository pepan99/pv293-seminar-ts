import { CommandHandler, EventBus, ICommand, ICommandHandler } from "@nestjs/cqrs";
import { UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { UserLoggedInEvent } from "../../../shared-kernel/core/events/user-logged-in.event";
import { UsersRepository } from "../../infrastructure/database/repositories/users.repository";
import * as bcrypt from "bcryptjs";

export class LoginCommand implements ICommand {
    constructor(
        public readonly email: string,
        public readonly password: string,
    ) {}
}

@CommandHandler(LoginCommand)
export class LoginCommandHandler implements ICommandHandler<LoginCommand> {
    constructor(
        private readonly userRepository: UsersRepository,
        private readonly jwtService: JwtService,
        private readonly eventBus: EventBus,
    ) {}

    async execute(command: LoginCommand) {
        const user = await this.userRepository.findByEmailWithPassword(command.email);

        if (!user || !(await this.validatePassword(command.password, user.password))) {
            throw new UnauthorizedException("Invalid credentials");
        }

        const payload = { email: user.email, sub: user.id };

        this.eventBus.publish(new UserLoggedInEvent(user.id, user.email));

        return {
            access_token: this.jwtService.sign(payload),
            refresh_token: this.jwtService.sign(
                { email: user.email, sub: user.id },
                { expiresIn: "7d" },
            ),
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
            },
        };
    }

    private async validatePassword(password: string, hashedPassword: string): Promise<boolean> {
        const comparison = await bcrypt.compare(password, hashedPassword);

        return comparison;
    }
}
