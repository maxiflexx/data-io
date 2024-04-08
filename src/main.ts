import { BadRequestException, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { ValidationError } from 'class-validator';
import { ApiDocsModule } from './api-docs/api-docs.module';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { getWinstonLogger } from './logger';

async function bootstrap() {
  const logger = getWinstonLogger();

  const app = await NestFactory.create(AppModule, {
    logger,
  });

  app.useGlobalFilters(new AllExceptionsFilter());
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      transformOptions: { enableImplicitConversion: true },
      exceptionFactory: (validationErrors: ValidationError[] = []) => {
        const message = validationErrors
          .map((error) => Object.values(error.constraints).join(', '))
          .join(', ');
        return new BadRequestException(message);
      },
    }),
  );

  const configService = app.get(ConfigService);

  if (configService.get('nodeEnv') !== 'prod') {
    ApiDocsModule.register(app, {
      title: 'Opensearch DataIO',
      description: 'Opensearch DataIO',
      version: '1.0.0',
    });
  }

  await app.listen(configService.get('port'), () => {
    logger.log({
      context: 'NestApplication',
      message: `${configService.get(
        'nodeEnv',
      )} server listening to port ${configService.get('port')}`,
    });
  });
}

bootstrap();
