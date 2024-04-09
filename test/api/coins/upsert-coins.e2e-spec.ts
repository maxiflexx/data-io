import {
  BadRequestException,
  INestApplication,
  Module,
  ValidationPipe,
} from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { ValidationError } from 'class-validator';
import { AllExceptionsFilter } from 'src/common/filters/all-exceptions.filter';
import config from 'src/config';
import { CoinModule } from 'src/modules/coins/coin.module';
import { OpensearchModule } from 'src/modules/opensearch/opensearch.module';
import * as request from 'supertest';
import { expectUpsertCoinsResponseSucceed } from 'test/expectation/coin';
import { mockCoinRaw } from 'test/mockup/coin';
import { generateObjects } from 'test/utils';

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
    CoinModule,
  ],
})
class TestModule {}

describe('Coin API Test', () => {
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

  describe('POST /coins', () => {
    const rootApiPath = '/coins';
    const coinName = 'KRW-BTC';

    it('success - upsert coins (200)', async () => {
      const coinRaws = generateObjects(5, mockCoinRaw, coinName);

      const { body } = await req.post(`${rootApiPath}`).send(coinRaws);

      for (const upsertRes of body) {
        expectUpsertCoinsResponseSucceed(upsertRes);
      }
    });
  });
});
