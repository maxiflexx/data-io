import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ApiResponse } from '@opensearch-project/opensearch/.';
import { paginateResponse } from 'src/libs/paginate';
import { OpensearchQueryBuilder } from 'src/libs/query-builder';
import { generateDateRange } from '../../libs/date';
import { OpensearchService } from '../opensearch/opensearch.service';
import {
  DEFAULT_INDEX_NAME,
  RANGE_TARGET_FIELD,
  TERM_TARGET_FIELD,
} from './coin.const';
import { Coin } from './coin.interface';
import { GetCoinsByQueryDto } from './dtos/get.dto';

@Injectable()
export class CoinService {
  private readonly logger = new Logger();

  constructor(
    private readonly opensearchService: OpensearchService,
    private readonly configService: ConfigService,
  ) {}

  async getCoinsByQuery({
    market,
    startDate,
    endDate,
    sortingField,
    sortingDirection,
    offset,
    limit,
  }: GetCoinsByQueryDto) {
    const indexNames = generateDateRange(startDate, endDate).map((dateString) =>
      this.generateIndex(new Date(dateString)),
    );

    await this.opensearchService.checkIndexAndCreate(indexNames);

    const query = new OpensearchQueryBuilder()
      .setTerms(TERM_TARGET_FIELD, market)
      .setRange(RANGE_TARGET_FIELD, startDate, endDate)
      .setSort(sortingField, sortingDirection)
      .setOffset(offset)
      .setLimit(limit)
      .build();

    const res = await this.opensearchService.searchByQuery(indexNames, query);

    const total = res.body.hits.total.value;
    const data = this.getDataFromSearchResult(res);

    return paginateResponse({
      total,
      limit,
      offset,
      data,
    });
  }

  async upsertCoins(coins: Coin[]) {
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

    const res = await this.opensearchService.sendToBulk(data);
    return this.getDataFromBulkResult(res);
  }

  private getDataFromSearchResult(
    res: ApiResponse<Record<string, any>, unknown>,
  ) {
    return res.body.hits.hits.map((d) => d._source);
  }

  private getDataFromBulkResult(res: Record<string, any>) {
    return res.items.map((d) => ({
      index: d['index']._index,
      id: d['index']._id,
      action: d['index'].result,
    }));
  }

  private generateIndex(currentDate: Date) {
    const nodeEnv = this.configService.get('nodeEnv');
    const name =
      nodeEnv === 'prod'
        ? DEFAULT_INDEX_NAME
        : `${nodeEnv}-${DEFAULT_INDEX_NAME}`;

    const yearMonth = currentDate.toISOString().slice(0, 7).replace('-', '');
    return `${name}-${yearMonth}`;
  }
}
