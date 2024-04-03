import { Injectable, Logger } from '@nestjs/common';
import { ApiResponse } from '@opensearch-project/opensearch/.';
import { OpensearchQueryBuilder } from 'src/libs/query-builder';
import { generateDateRange } from '../../libs/date';
import { OpensearchService } from '../opensearch/opensearch.service';
import { Coin } from './coin.interface';
import { GetCoinsByQueryDto } from './dtos/get.dto';

@Injectable()
export class CoinService {
  private readonly logger = new Logger();
  constructor(
    private readonly opensearchService: OpensearchService, // @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: WinstonLogger,
  ) {}

  async search(options: GetCoinsByQueryDto) {
    const indexNames = generateDateRange(
      options.startDate,
      options.endDate,
    ).map((date) => `coins-${date}`);

    await this.opensearchService.checkIndexAndCreate(indexNames);

    const query = new OpensearchQueryBuilder()
      .setTerms('market', options.market)
      .setRange('candleDateTimeUtc', options.startDate, options.endDate)
      .setSort(options.sortingField, options.sortingDirection)
      .setOffset(options.offset)
      .setLimit(options.limit)
      .build();

    const res = await this.opensearchService.searchByQuery(indexNames, query);
    return this.getDataFromResult(res);
  }

  async push(coins: Coin[]) {
    const indexNames = [
      ...new Set(
        coins.map((coin) => this.generateIndex(coin.candleDateTimeUtc)),
      ),
    ];
    await this.opensearchService.checkIndexAndCreate(indexNames);

    const data = coins.flatMap((doc) => [
      {
        index: {
          _index: this.generateIndex(doc.candleDateTimeUtc),
          _id: `${doc.market}_${doc.candleDateTimeUtc.toISOString()}`,
        },
      },
      {
        ...doc,
      },
    ]);

    return await this.opensearchService.sendToBulk(data);
  }

  private getDataFromResult(res: ApiResponse<Record<string, any>, unknown>) {
    return res.body.hits.hits.map((d) => d._source);
  }

  private generateIndex(currentDate: Date) {
    const yearMonth = currentDate.toISOString().slice(0, 7).replace('-', '');
    return `coins-${yearMonth}`;
  }
}
