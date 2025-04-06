import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserWithRoles } from '../../../users/core/entities/user.entity';
import { UserRole } from '../../../../shared-kernel/core/types/db';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>('roles', [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles) {
      return true;
    }

    const { user }: { user: UserWithRoles } = context
      .switchToHttp()
      .getRequest();
    return requiredRoles.some((role) => user.roles.includes(role as UserRole));
  }
}
