export type RequestUser = {
  userId: string;
  email: string;
  roles?: UserRole[];
};

export type UserRole = "admin" | "user";

export type UserWithRoles = {
  id: string;
  email: string;
  roles: UserRole[];
};
