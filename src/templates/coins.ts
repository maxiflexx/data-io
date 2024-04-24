export const coinsTemplate = {
  name: 'coins-template',
  body: {
    index_patterns: ['coins-*', 'test-coins-*', 'dev-coins-*'],
    template: {
      settings: {
        index: {
          number_of_shards: 1,
          number_of_replicas: 1,
          codec: 'best_compression',
        },
      },
      mappings: {
        properties: {
          market: { type: 'keyword' },
          candleDateTimeUtc: { type: 'date' },
          candleDateTimeKst: { type: 'date' },
          openingPrice: { type: 'double' },
          highPrice: { type: 'double' },
          lowPrice: { type: 'double' },
          tradePrice: { type: 'double' },
          timestamp: { type: 'long' },
          candleAccTradePrice: { type: 'double' },
          candleAccTradeVolume: { type: 'double' },
          unit: { type: 'integer' },
        },
      },
    },
  },
};
