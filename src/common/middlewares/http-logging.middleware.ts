import { Injectable, Logger, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';

@Injectable()
export class HttpLoggingMiddleware implements NestMiddleware {
  private logger: Logger;

  constructor() {
    this.logger = new Logger(this.constructor.name);
  }

  use(req: Request, res: Response, next: NextFunction) {
    const { path, method, query, ip, body } = req;

    res.on('close', () => {
      const { statusCode } = res;
      this.logger.log({
        level: 'http',
        message: `${statusCode} ${path} ${method} ${query} ${ip}`,
      });
    });
    next();
  }
}
