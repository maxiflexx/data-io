import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { WinstonModule } from 'nest-winston';
import * as winston from 'winston';
import config from './config';
import { CoinModule } from './modules/coins/coin.module';

@Module({
  imports: [
    ConfigModule.forRoot({ load: [config] }),
    CoinModule,
    WinstonModule.forRoot({
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
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
