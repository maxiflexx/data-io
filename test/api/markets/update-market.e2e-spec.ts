import {
  BadRequestException,
  HttpStatus,
  INestApplication,
  Module,
  ValidationPipe,
} from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { ValidationError } from 'class-validator';
import { AllExceptionsFilter } from 'src/common/filters/all-exceptions.filter';
import config from 'src/config';
import { MarketModule } from 'src/modules/markets/market.module';
import { OpensearchModule } from 'src/modules/opensearch/opensearch.module';
import * as request from 'supertest';
import { expectUpdateMarketResponseSucceed } from 'test/expectation/market';
import { mockMarketRaw } from 'test/mockup/market';
import { expectResponseFailed } from 'test/utils';

@Module({
  imports: [
    ConfigModule.forRoot({ load: [config] }),
    OpensearchModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        node: configService.get('opensearchNode'),
        username: configService.get('opensearchUsername'),
        password: configService.get('opensearchPassword'),
      }),
      inject: [ConfigService],
    }),
    MarketModule,
  ],
})
class TestModule {}

describe('Market API Test', () => {
  let app: INestApplication;
  let req: request.SuperTest<request.Test>;

  let testingModule: TestingModule;

  beforeAll(async () => {
    testingModule = await Test.createTestingModule({
      imports: [TestModule],
    }).compile();

    app = testingModule.createNestApplication();

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

    await app.init();

    req = request(app.getHttpServer());
  });

  afterAll(async () => {
    await app.close();
  });

  describe('PUT /markets', () => {
    const rootApiPath = '/markets';

    it('success - Update market. (200)', async () => {
      // given
      const marketRaw = mockMarketRaw();
      await req.post(`${rootApiPath}`).send([marketRaw]);

      // when
      const { body } = await req
        .put(`${rootApiPath}/${marketRaw.code}`)
        .send({ isEnabled: true });

      // then
      expectUpdateMarketResponseSucceed(body);
    });

    it('failed - Not found doc. (404)', async () => {
      // given
      const marketRaw = mockMarketRaw();
      await req.post(`${rootApiPath}`).send([marketRaw]);

      // when
      const { body } = await req
        .put(`${rootApiPath}/notFound`)
        .send({ isEnabled: true });

      // then
      expectResponseFailed(body, HttpStatus.NOT_FOUND);
    });
  });
});
