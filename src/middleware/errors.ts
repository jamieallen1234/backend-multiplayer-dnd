import { NextFunction, Request, Response } from "express";

/**
 * Custom error handling for express routes.
 * 
 * Reference: https://medium.com/@xiaominghu19922/proper-error-handling-in-express-server-with-typescript-8cd4ffb67188
 */
export type CustomErrorContent = {
    message: string,
    context?: { [key: string]: any }
};
  
export abstract class CustomError extends Error {
    abstract readonly statusCode: number;
    abstract readonly errors: CustomErrorContent[];
    abstract readonly logging: boolean;

    constructor(message: string) {
        super(message);

        // Only because we are extending a built in class
        Object.setPrototypeOf(this, CustomError.prototype);
    }
}

export class BadRequestError extends CustomError {
    private static readonly _statusCode = 400;
    private readonly _logging: boolean;
    private readonly _context: { [key: string]: any };
  
    constructor(params?: {code?: number, message?: string, logging?: boolean, context?: { [key: string]: any }}) {
      const { code, message, logging } = params || {};
      
      super(message || "Bad request");
      this._logging = logging || false;
      this._context = params?.context || {};
  
      // Only because we are extending a built in class
      Object.setPrototypeOf(this, BadRequestError.prototype);
    }
  
    get errors() {
      return [{ message: this.message, context: this._context }];
    }
  
    get statusCode() {
      return BadRequestError._statusCode;
    }
  
    get logging() {
      return this._logging;
    }
}

export class UnauthorizedRequestError extends CustomError {
    private static readonly _statusCode = 401;
    private readonly _logging: boolean;
    private readonly _context: { [key: string]: any };
  
    constructor(params?: {code?: number, message?: string, logging?: boolean, context?: { [key: string]: any }}) {
      const { code, message, logging } = params || {};
      
      super(message || "Unauthorized request");
      this._logging = logging || false;
      this._context = params?.context || {};
  
      // Only because we are extending a built in class
      Object.setPrototypeOf(this, UnauthorizedRequestError.prototype);
    }
  
    get errors() {
      return [{ message: this.message, context: this._context }];
    }
  
    get statusCode() {
      return UnauthorizedRequestError._statusCode;
    }
  
    get logging() {
      return this._logging;
    }
}

export function errorHandler (err: Error, req: Request, res: Response, next: NextFunction) {
    // Handled errors
    if(err instanceof CustomError) {
        const { statusCode, errors, logging } = err;
        if(logging) {
                console.error(JSON.stringify({
                code: err.statusCode,
                errors: err.errors,
                stack: err.stack,
            }, null, 2));
        }
    
        res.status(statusCode).send({ errors });
        
        next(err);
        return;
      }
    
      // Unhandled errors
      console.error(JSON.stringify(err, null, 2));
      res.status(500).send({ errors: [{ message: "Something went wrong" }] });

      next(err);
};
