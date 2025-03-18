declare global {
  namespace Express {
    interface User {
      userId: string;
      email: string;
    }
  }
}

export {};
