export type User = {
  id: string;
  name: string;
  email: string;
  password: string;
  roles: string[];
  createdAt: Date;
  updatedAt: Date;
};

export type UserWithoutPassword = Omit<User, 'password'>;

export type RequestUserEntity = {
  userId: string;
  email: string;
};
