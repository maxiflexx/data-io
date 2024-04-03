import { Inject, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { Client } from '@opensearch-project/opensearch';
import { SearchQuery } from 'src/libs/query-builder';
import { coinsTemplate } from 'src/templates/coins';
import { OPENSEARCH_CONNECT_OPTIONS } from './opensearch.const';
import { OpensearchConnectOptions } from './opensearch.interface';

@Injectable()
export class OpensearchService implements OnModuleInit {
  client: Client;
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

  async searchByQuery(indexNames: string[], query: SearchQuery) {
    return await this.client.search({
      index: indexNames,
      body: {
        ...query,
      },
      track_total_hits: true, // 전체 문서 갯수
      ignore_unavailable: true, // 해당 인덱스 없을 시 무시
    });
  }

  async sendToBulk(data: Record<string, any>[], indexName?: string) {
    const { body: bulkResponse } = await this.client.bulk({
      refresh: true,
      // index: indexName,
      body: data,
    });

    if (bulkResponse.errors) {
      const erroredDocuments = [];
      bulkResponse.items.forEach((action, i) => {
        const operation = Object.keys(action)[0];
        if (action[operation].error) {
          erroredDocuments.push({
            status: action[operation].status,
            error: action[operation].error,
            operation: data[i * 2],
            document: data[i * 2 + 1],
          });
        }
      });
      this.logger.error({
        message: 'Bulk request failed.',
        error: erroredDocuments,
      });
    }

    this.client.indices.putIndexTemplate;
    return bulkResponse;
  }

  async test() {
    this.client.search();
  }
}
