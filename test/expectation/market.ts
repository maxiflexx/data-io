export function expectUpsertMarketsResponseSucceed(result) {
  expect(result).toHaveProperty('index');
  expect(result).toHaveProperty('id');
  expect(result).toHaveProperty('action');
}

export function expectUpdateMarketResponseSucceed(result) {
  expect(result).toHaveProperty('index');
  expect(result).toHaveProperty('id');
  expect(result).toHaveProperty('action');
}

export function expectGetMarketsResponseSucceed(result) {
  expect(result).toHaveProperty('code');
  expect(result).toHaveProperty('koreanName');
  expect(result).toHaveProperty('englishName');
  expect(result).toHaveProperty('isEnabled');
}
