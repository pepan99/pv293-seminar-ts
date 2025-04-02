import { Injectable } from '@nestjs/common';

@Injectable()
export class ValidateTokenUseCase {
  execute(req: Express.Request) {
    return {
      valid: true,
      user: req.user,
    };
  }
}
