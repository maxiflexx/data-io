import { Module } from '@nestjs/common';
import { Logger } from 'winston';
import { OpensearchModule } from '../opensearch/opensearch.module';
import { CoinController } from './coin.controller';
import { CoinService } from './coin.service';

@Module({
  imports: [OpensearchModule],
  controllers: [CoinController],
  providers: [CoinService, Logger],
})
export class CoinModule {}
