export type RequestUser = {
  userId: string;
  email: string;
};
export type UserRole = "admin" | "user";
export type UserWithRoles = {
  id: string;
  email: string;
  roles: UserRole[];
};
//# sourceMappingURL=user-types.d.ts.map
