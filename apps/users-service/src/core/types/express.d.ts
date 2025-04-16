declare global {
  namespace Express {
    // Define the User interface
    interface User {
      userId: string;
      email: string;
    }

    // Add the user property to the Request interface
    interface Request {
      user?: User;
    }
  }
}

export {};
