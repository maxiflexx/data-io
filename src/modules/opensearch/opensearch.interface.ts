import { ModuleMetadata, Type } from '@nestjs/common/interfaces';

export interface OpensearchConnectOptions {
  node: string;
  username: string;
  password: string;
  caCertsPath?: string;
}

export interface OpensearchOptionsFactory {
  createOpensearchConnectOptions():
    | Promise<OpensearchConnectOptions>
    | OpensearchConnectOptions;
}

export interface OpensearchConnectAsyncOptions
  extends Pick<ModuleMetadata, 'imports'> {
  inject?: any[];
  useExisting?: Type<OpensearchOptionsFactory>;
  useClass?: Type<OpensearchOptionsFactory>;
  useFactory?: (
    ...args: any[]
  ) => Promise<OpensearchConnectOptions> | OpensearchConnectOptions;
}
