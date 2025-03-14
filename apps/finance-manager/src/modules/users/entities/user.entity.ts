export type User = {
  id: number;
  name: string;
  email: string;
  password: string;
  roles: string[];
  createdAt: Date;
  updatedAt: Date;
};

export type UserWithoutPassword = Omit<User, 'password'>;
