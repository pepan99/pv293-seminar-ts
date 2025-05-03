import { UserRole } from '../../../../shared-kernel/core/types/db';

export interface CreateUserCommand {
  name: string;
  email: string;
  password: string;
}

export interface UpdateUserCommand {
  name?: string;
  email?: string;
}

export interface ChangePasswordCommand {
  currentPassword: string;
  newPassword: string;
}

export interface UpdateUserAdminCommand {
  name?: string;
  email?: string;
  roles?: UserRole[];
}
