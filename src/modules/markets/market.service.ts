import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { OpensearchQueryBuilder } from 'src/libs/query-builder';
import { MAX_RESULT_WINDOW } from '../opensearch/opensearch.const';
import { OpensearchService } from '../opensearch/opensearch.service';
import { DEFAULT_INDEX_NAME } from './market.const';
import { Market } from './market.interface';

@Injectable()
export class MarketService {
  private readonly logger = new Logger();

  constructor(
    private readonly opensearchService: OpensearchService,
    private readonly configService: ConfigService,
  ) {}

  async onModuleInit() {
    try {
      await this.opensearchService.checkIndexAndCreate([this.generateIndex()]);
    } catch (error) {
      this.logger.error({
        message: 'Unable to connect to opensearch.',
        error: null,
      });
      process.exit(1);
    }
  }

  async getMarkets() {
    const query = new OpensearchQueryBuilder()
      .setLimit(MAX_RESULT_WINDOW)
      .build();

    const res = await this.opensearchService.searchByQuery(
      [this.generateIndex()],
      query,
    );

    return this.opensearchService.getDataFromSearchResult(res);
  }

  async upsertMarkets(markets: Market[]) {
    const data = markets.flatMap((doc) => [
      {
        index: {
          _index: this.generateIndex(),
          _id: doc.code,
        },
      },
      {
        ...doc,
      },
    ]);

    const res = await this.opensearchService.sendToBulk(data);
    return this.opensearchService.getDataFromBulkResult(res);
  }

  async updateMarket(marketCode: string, params: Partial<Market>) {
    const res = await this.opensearchService.updateDoc(
      this.generateIndex(),
      marketCode,
      params,
    );
    return this.opensearchService.getDataFromUpdateResult(res);
  }

  private generateIndex() {
    const nodeEnv = this.configService.get('nodeEnv');
    return nodeEnv === 'prod'
      ? DEFAULT_INDEX_NAME
      : `${nodeEnv}-${DEFAULT_INDEX_NAME}`;
  }
}
