import {
  Global,
  Logger,
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { HttpLoggingMiddleware } from './common/middlewares/http-logging.middleware';
import config from './config';
import { CoinModule } from './modules/coins/coin.module';
import { OpensearchModule } from './modules/opensearch/opensearch.module';

@Global()
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
  controllers: [],
  providers: [Logger],
  exports: [Logger],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(HttpLoggingMiddleware)
      .forRoutes({ path: '*', method: RequestMethod.ALL });
  }
}
