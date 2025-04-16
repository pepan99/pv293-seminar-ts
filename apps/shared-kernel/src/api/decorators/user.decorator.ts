import { createParamDecorator, ExecutionContext } from "@nestjs/common";
import { Request } from "express";
import { RequestUser } from "../../core/types/user-types";

/**
 * User decorator for stripping user info from request.
 *
 * You have to use this in conjuction with a secured route.
 **/
export const User = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<Request>();
    // Use type assertion to tell TypeScript that request has user property
    return (request as any).user as RequestUser;
  },
);
