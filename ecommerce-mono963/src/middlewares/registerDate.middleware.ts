import { Injectable, Logger, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';

@Injectable()
export class RegisterDateMiddleware implements NestMiddleware {
  private readonly logger = new Logger('HTTP');

  use(req: Request, res: Response, next: NextFunction): void {
    const now = new Date().toISOString();
    const { method, originalUrl } = req;
    this.logger.log(`[${now}] ${method} ${originalUrl}`);
    next();
  }
}

const logger = new Logger('HTTP');

export function registerDateMiddleware() {
  return (req: Request, res: Response, next: NextFunction) => {
    const now = new Date().toISOString();
    const { method, originalUrl } = req;
    logger.log(`[${now}] ${method} ${originalUrl}`);
    next();
  };
}
