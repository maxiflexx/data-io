export function expectUpsertCoinsResponseSucceed(result) {
  expect(result).toHaveProperty('index');
  expect(result).toHaveProperty('id');
  expect(result).toHaveProperty('action');
}

export function expectGetCoinsResponseSucceed(result) {
  expect(result).toHaveProperty('market');
  expect(result).toHaveProperty('candleDateTimeUtc');
  expect(result).toHaveProperty('candleDateTimeKst');
  expect(result).toHaveProperty('candleDateTimeKst');
  expect(result).toHaveProperty('openingPrice');
  expect(result).toHaveProperty('highPrice');
  expect(result).toHaveProperty('lowPrice');
  expect(result).toHaveProperty('timestamp');
  expect(result).toHaveProperty('candleAccTradePrice');
  expect(result).toHaveProperty('candleAccTradeVolume');
  expect(result).toHaveProperty('tradePrice');
  expect(result).toHaveProperty('unit');
}
