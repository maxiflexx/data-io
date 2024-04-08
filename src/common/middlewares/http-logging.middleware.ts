import { Injectable, Logger, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';

@Injectable()
export class HttpLoggingMiddleware implements NestMiddleware {
  private logger: Logger;

  constructor() {
    this.logger = new Logger(this.constructor.name);
  }

  use(req: Request, res: Response, next: NextFunction) {
    const start = Date.now();
    const { method, ip, url, path } = req;

    res.on('finish', () => {
      const end = Date.now();
      const { statusCode } = res;
      const message = `HTTP ${method} request to ${url} from IP ${ip}. Response status: ${statusCode}. Response time: ${
        end - start
      }ms.`;

      this.logger.log({
        level: 'http',
        message,
        path,
      });
    });
    next();
  }
}
