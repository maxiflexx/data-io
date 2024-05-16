import {
  BadRequestException,
  HttpStatus,
  Inject,
  Injectable,
  Logger,
  NotFoundException,
  OnModuleInit,
} from '@nestjs/common';
import { ApiResponse, Client } from '@opensearch-project/opensearch';
import { SearchQuery } from 'src/libs/query-builder';
import { coinsTemplate } from 'src/templates/coins';
import { marketsTemplate } from 'src/templates/markets';
import { OPENSEARCH_CONNECT_OPTIONS } from './opensearch.const';
import { OpensearchConnectOptions } from './opensearch.interface';

@Injectable()
export class OpensearchService implements OnModuleInit {
  public client: Client;
  private logger: Logger;

  constructor(
    @Inject(OPENSEARCH_CONNECT_OPTIONS)
    private readonly opensearchConnectOptions: OpensearchConnectOptions,
  ) {
    this.client = new Client({
      node: this.opensearchConnectOptions.node,
      auth: {
        username: this.opensearchConnectOptions.username,
        password: this.opensearchConnectOptions.password,
      },
      ssl: { rejectUnauthorized: false },
    });
    this.logger = new Logger(this.constructor.name);
  }

  async onModuleInit() {
    try {
      await this.client.ping();
      this.logger.log({ message: 'Connected to opensearch.' });

      await this.client.indices.putIndexTemplate(coinsTemplate);
      await this.client.indices.putIndexTemplate(marketsTemplate);
    } catch (error) {
      this.logger.error({
        message: 'Unable to connect to opensearch.',
        error: null,
      });
      process.exit(1);
    }
  }

  async checkIndexAndCreate(indexNames: string[]) {
    for (const indexName of indexNames) {
      const isExist = await this.client.indices.exists({
        index: indexName,
      });

      if (!isExist.body) {
        await this.client.indices.create({
          index: indexName,
        });
      }
    }
  }

  async searchByQuery(indexNames: string[], query: SearchQuery | {}) {
    try {
      return await this.client.search({
        index: indexNames,
        body: {
          ...query,
        },
        track_total_hits: true, // 전체 문서 갯수
        ignore_unavailable: true, // 해당 인덱스 없을 시 무시
      });
    } catch (err) {
      throw new BadRequestException(err.message);
    }
  }

  getDataFromSearchResult(res: ApiResponse<Record<string, any>, unknown>) {
    return res.body.hits.hits.map((d) => d._source);
  }

  async sendToBulk(data: Record<string, any>[]) {
    const { body: bulkResponse } = await this.client.bulk({
      refresh: true,
      body: data,
    });

    if (bulkResponse.errors) {
      let message = '';
      bulkResponse.items.forEach((action, i) => {
        const operation = Object.keys(action)[0];

        if (action[operation].error) {
          message += action[operation].error.reason;
        }
      });

      throw new BadRequestException(message);
    }

    return bulkResponse;
  }

  getDataFromBulkResult(res: Record<string, any>) {
    return res.items.map((d) => ({
      index: d['index']._index,
      id: d['index']._id,
      action: d['index'].result,
    }));
  }

  async updateDoc(indexName: string, id: string, params: Record<string, any>) {
    const isExist = await this.isExistDoc(indexName, id);
    if (isExist) {
      const { body: updateResponse } = await this.client.update({
        index: indexName,
        id,
        body: {
          doc: {
            ...params,
          },
        },
        refresh: true,
      });

      return updateResponse;
    }
    throw new NotFoundException('Not found doc or index.');
  }

  getDataFromUpdateResult(res: Record<string, any>) {
    return {
      index: res._index,
      id: res._id,
      action: res.result,
    };
  }

  async isExistDoc(indexName: string, docId: string) {
    try {
      const { body: findResponse } = await this.client.get({
        index: indexName,
        id: docId,
      });

      return findResponse.found;
    } catch (err) {
      if (err.meta.statusCode === HttpStatus.NOT_FOUND) {
        return false;
      }
      throw err;
    }
  }
}
