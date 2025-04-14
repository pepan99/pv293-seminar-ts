export type UserAuthResponseType = {
  id: string;
  email: string;
  name: string;
  roles: string[];
};

export type AuthResponse = {
  access_token: string;
  refresh_token: string;
  user: UserAuthResponseType;
};
