import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { Logger } from 'winston';
import { OpensearchModule } from '../opensearch/opensearch.module';
import { MarketController } from './market.controller';
import { MarketService } from './market.service';

@Module({
  imports: [OpensearchModule, ConfigModule],
  controllers: [MarketController],
  providers: [MarketService, Logger],
})
export class MarketModule {}
