import * as faker from 'faker';
import { Market } from 'src/modules/markets/market.interface';

export function mockMarketRaw(): Market {
  return {
    code: faker.lorem.word(),
    koreanName: faker.lorem.word(),
    englishName: faker.lorem.word(),
    isEnabled: faker.datatype.boolean(),
  };
}
