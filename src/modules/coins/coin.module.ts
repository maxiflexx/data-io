import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { OpensearchModule } from '../opensearch/opensearch.module';
import { CoinController } from './coin.controller';
import { CoinService } from './coin.service';

@Module({
  imports: [
    OpensearchModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        node: configService.get('opensearchNode'),
        username: configService.get('opensearchUsername'),
        password: configService.get('opensearchPassword'),
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [CoinController],
  providers: [CoinService],
})
export class CoinModule {}
