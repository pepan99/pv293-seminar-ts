import { UserDto } from '../../src/modules/users/dto/zod-dtos';

export type AuthResponse = {
  user: UserDto;
  access_token: string;
  refresh_token: string;
};

export type ErrorResponse = {
  message: string;
  statusCode: number;
};
