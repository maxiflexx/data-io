import { DynamicModule, Global, Module, Provider } from '@nestjs/common';
import { OPENSEARCH_CONNECT_OPTIONS } from './opensearch.const';
import {
  OpensearchConnectAsyncOptions,
  OpensearchConnectOptions,
  OpensearchOptionsFactory,
} from './opensearch.interface';
import { OpensearchService } from './opensearch.service';

@Global()
@Module({})
export class OpensearchModule {
  static register(connectOptions: OpensearchConnectOptions): DynamicModule {
    return {
      module: OpensearchModule,
      imports: [],
      providers: [
        {
          provide: OPENSEARCH_CONNECT_OPTIONS,
          useValue: connectOptions,
        },
        OpensearchService,
      ],
      exports: [OpensearchService],
    };
  }

  static registerAsync(
    connectOptions: OpensearchConnectAsyncOptions,
  ): DynamicModule {
    return {
      module: OpensearchModule,
      imports: connectOptions.imports || [],
      providers: [
        this.createConnectProviders(connectOptions),
        OpensearchService,
      ],
      exports: [OpensearchService],
    };
  }

  private static createConnectProviders(
    options: OpensearchConnectAsyncOptions,
  ): Provider {
    if (options.useFactory) {
      return {
        provide: OPENSEARCH_CONNECT_OPTIONS,
        useFactory: options.useFactory,
        inject: options.inject || [],
      };
    }

    return {
      provide: OPENSEARCH_CONNECT_OPTIONS,
      useFactory: async (optionsFactory: OpensearchOptionsFactory) =>
        await optionsFactory.createOpensearchConnectOptions(),
      inject: [options.useExisting || options.useClass],
    };
  }
}
