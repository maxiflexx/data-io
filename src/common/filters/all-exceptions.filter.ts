import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private logger: Logger;

  constructor() {
    this.logger = new Logger(this.constructor.name);
  }

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();

    const request = ctx.getRequest<Request>();
    const response = ctx.getResponse<Response>();

    const httpStatus =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const { message, name, stack } =
      exception instanceof HttpException
        ? exception
        : new InternalServerErrorException('Unhandled error occurred');

    this.logger.error({
      message,
      error: {
        status: httpStatus,
        name,
        message,
      },
      stack,
    });

    response.status(httpStatus).json({
      statusCode: httpStatus,
      name,
      message,
      stack,
      path: request.url,
      timestamp: new Date().toISOString(),
    });
  }
}
