import { createParamDecorator } from "@nestjs/common";
/**
 * User decorator for stripping user info from request.
 *
 * You have to use this in conjuction with a secured route.
 **/
export const User = createParamDecorator((data, ctx) => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
});
