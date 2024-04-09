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
import { addDays, subDays } from 'date-fns';
import { AllExceptionsFilter } from 'src/common/filters/all-exceptions.filter';
import config from 'src/config';
import { CoinModule } from 'src/modules/coins/coin.module';
import { OpensearchModule } from 'src/modules/opensearch/opensearch.module';
import * as request from 'supertest';
import { expectGetCoinsResponseSucceed } from 'test/expectation/coin';
import { expectPagingResponseSucceed, expectResponseFailed } from 'test/utils';

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

  describe('Get /coins', () => {
    const rootApiPath = '/coins';
    const coinName = 'KRW-BTC';
    const sortingTarget = 'candleDateTimeUtc';
    const order = 'desc';

    it('success - Successfully returned paginated data. (200)', async () => {
      // given
      const params = {
        market: coinName,
        startDate: subDays(new Date(), 1),
        endDate: addDays(new Date(), 1),
        limit: 10,
        offset: 0,
        sortingField: sortingTarget,
        sortingDirection: order,
      };

      // when
      const { body } = await req.get(`${rootApiPath}`).query(params);

      // then
      expectPagingResponseSucceed(body);

      for (const coin of body.data) {
        expectGetCoinsResponseSucceed(coin);
      }
    });

    it('failed - EndDate cannot be earlier than startDate. (400)', async () => {
      // given
      const params = {
        market: coinName,
        startDate: addDays(new Date(), 1),
        endDate: subDays(new Date(), 1),
        limit: 10,
        offset: 0,
        sortingField: sortingTarget,
        sortingDirection: order,
      };

      // when
      const { body } = await req.get(`${rootApiPath}`).query(params);

      // then
      expectResponseFailed(body, HttpStatus.BAD_REQUEST);
    });

    it('failed - Invalid value for limit parameter. (400)', async () => {
      // given
      const params = {
        market: coinName,
        startDate: subDays(new Date(), 1),
        endDate: addDays(new Date(), 1),
        limit: 'a',
        offset: 0,
        sortingField: sortingTarget,
        sortingDirection: order,
      };

      // when
      const { body } = await req.get(`${rootApiPath}`).query(params);

      // then
      expectResponseFailed(body, HttpStatus.BAD_REQUEST);
    });

    it('failed - Invalid value for offset parameter. (400)', async () => {
      // given
      const params = {
        market: coinName,
        startDate: subDays(new Date(), 1),
        endDate: addDays(new Date(), 1),
        limit: 10,
        offset: 'a',
        sortingField: sortingTarget,
        sortingDirection: order,
      };

      // when
      const { body } = await req.get(`${rootApiPath}`).query(params);

      // then
      expectResponseFailed(body, HttpStatus.BAD_REQUEST);
    });

    it('failed - The specified sortingField parameter does not exist in the opensearch index. (400)', async () => {
      // given
      const params = {
        market: coinName,
        startDate: subDays(new Date(), 1),
        endDate: addDays(new Date(), 1),
        limit: 10,
        offset: 0,
        sortingField: 'a',
        sortingDirection: order,
      };

      // when
      const { body } = await req.get(`${rootApiPath}`).query(params);

      // then
      expectResponseFailed(body, HttpStatus.BAD_REQUEST);
    });

    it('failed - Invalid value for offset parameter. (400)', async () => {
      // given
      const params = {
        market: coinName,
        startDate: subDays(new Date(), 1),
        endDate: addDays(new Date(), 1),
        limit: 10,
        offset: 0,
        sortingField: sortingTarget,
        sortingDirection: 'a',
      };

      // when
      const { body } = await req.get(`${rootApiPath}`).query(params);

      // then
      expectResponseFailed(body, HttpStatus.BAD_REQUEST);
    });
  });
});
