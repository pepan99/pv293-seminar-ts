import { TestAdmin_1 } from './all-test-users.ts';

const apiBaseUrl = __ENV.URL || 'http://localhost:8000/';

export class ApiBase {
  baseUrl: string;
  header: Record<string, string>;
  params: { headers: Record<string, string> };
  constructor() {
    this.baseUrl = apiBaseUrl;
    this.header = {
      Authorization: TestAdmin_1.auth,
      'Content-Type': 'application/json',
    };
    this.params = {
      headers: this.header,
    };
  }
}
