import * as faker from 'faker';
import { Coin } from 'src/modules/coins/coin.interface';

export function mockCoinRaw(
  market = faker.lorem.word(),
  time = new Date(),
): Coin {
  return {
    market,
    candleDateTimeUtc: time,
    candleDateTimeKst: time,
    openingPrice: faker.datatype.number(),
    highPrice: faker.datatype.number(),
    lowPrice: faker.datatype.number(),
    timestamp: faker.datatype.number(),
    candleAccTradePrice: faker.datatype.number(),
    candleAccTradeVolume: faker.datatype.number(),
    prevClosingPrice: faker.datatype.number(),
    changePrice: faker.datatype.number(),
    changeRate: faker.datatype.number(),
  };
}
