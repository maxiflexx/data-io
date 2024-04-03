import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
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
