import { Inject, Injectable } from '@nestjs/common';
import { WINSTON_MODULE_PROVIDER, WinstonLogger } from 'nest-winston';
import { OpensearchService } from '../opensearch/opensearch.service';

@Injectable()
export class CoinService {
  constructor(
    private readonly opensearchService: OpensearchService,
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: WinstonLogger,
  ) {}

  async getHello() {
    this.logger.log({ level: 'info', message: 'HELLOTEST' });
    const test = await this.opensearchService.client.cat.indices();
    return test;
  }

  async push() {
    const indexName = 'test-index';
    const properties = {
      time: { type: 'date' },
      market: { type: 'keyword' },
    };

    await this.opensearchService.checkIndexAndCreate([indexName], properties);

    const data = [
      {
        index: {
          _index: indexName,
        },
      },
      {
        time: new Date().toISOString(),
        market: 'btc',
        price: 10600000,
      },
    ];

    return await this.opensearchService.sendToBulk(data, indexName);
  }
}
