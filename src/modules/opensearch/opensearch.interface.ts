import { ModuleMetadata, Type } from '@nestjs/common/interfaces';

// 1.
export interface OpensearchConnectOptions {
  node: string;
  username: string;
  password: string;
  caCertsPath?: string;
}

// 2.
// 클래스를 받고 해당 클래스에 대한 메서드를 호출 -> 일종의 팩토리 패턴
// 어딘가에서 클래스를 인스턴스화하고, 메서드를 호출하여 반환된 결과를 옵션으로 사용
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
