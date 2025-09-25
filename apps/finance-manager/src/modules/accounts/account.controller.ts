import { Injectable } from "@nestjs/common";

@Injectable({})
export class AccountService {
  getAllAccounts() {
    return 'This action returns all accounts';
  }
}