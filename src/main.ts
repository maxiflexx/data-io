import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { WinstonModule } from 'nest-winston';
import * as winston from 'winston';
import { ApiDocsModule } from './api-docs/api-docs.module';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: WinstonModule.createLogger({
      transports: [
        new winston.transports.Console({
          format: winston.format.combine(
            winston.format.timestamp(),
            winston.format.ms(),
            winston.format.prettyPrint(),
          ),
          level: 'silly',
        }),
      ],
    }),
  });

  app.useGlobalFilters(new AllExceptionsFilter());

  const configService = app.get(ConfigService);

  if (configService.get('nodeEnv') !== 'prod') {
    ApiDocsModule.register(app, {
      title: 'Opensearch DataIO',
      description: 'Opensearch DataIO',
      version: '1.0.0',
    });
  }

  await app.listen(configService.get('port'));
}

bootstrap();
