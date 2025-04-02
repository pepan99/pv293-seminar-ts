import { Injectable } from '@nestjs/common';

@Injectable()
export class GetProfileUseCase {
  execute(req: Express.Request) {
    return req.user;
  }
}
