
export class HttpError extends Error {
    status: number;
    
    constructor(message: string, status: number) {
      super(message);
      this.status = status;
    }
  }

  declare global {
    namespace Express {
      interface Request {
        userId?: string;
      }
    }
  }
  