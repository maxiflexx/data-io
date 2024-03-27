import { Inject, Injectable } from '@nestjs/common';
import { Client } from '@opensearch-project/opensearch';
import { OPENSEARCH_CONNECT_OPTIONS } from './opensearch.const';
import { OpensearchConnectOptions } from './opensearch.interface';

@Injectable()
export class OpensearchService {
  client: Client;

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
  }

  async checkIndexAndCreate(
    indexNames: string[],
    properties: Record<string, Record<'type', string>>,
  ) {
    for (const indexName of indexNames) {
      const isExist = await this.client.indices.exists({
        index: indexName,
      });

      if (!isExist.body) {
        if (properties) {
          await this.client.indices.create({
            index: indexName,
            body: {
              mappings: {
                properties: {
                  ...properties,
                },
              },
            },
          });
        }
      }
    }
  }

  async sendToBulk(data: Record<string, any>[], indexName?: string) {
    const { body: bulkResponse } = await this.client.bulk({
      refresh: true,
      index: indexName,
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
      console.log(erroredDocuments);
    }
    return bulkResponse;
  }
}
