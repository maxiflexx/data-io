import { Global, INestApplication, Module } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ApiDocsOptions } from './api-docs.interface';

@Global()
@Module({})
export class ApiDocsModule {
  static register(app: INestApplication, options: ApiDocsOptions) {
    const config = this.getSwaggerConfig(options);
    const document = SwaggerModule.createDocument(app, config);
    const path = 'api-docs';

    SwaggerModule.setup(path, app, document);
  }

  private static getSwaggerConfig(options: ApiDocsOptions) {
    const tokenName = 'accessToken';

    return new DocumentBuilder()
      .setTitle(options.title)
      .setDescription(options.description)
      .setVersion(options.version)
      .addBearerAuth(
        {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'Token',
          in: 'header',
        },
        tokenName,
      )
      .build();
  }
}
