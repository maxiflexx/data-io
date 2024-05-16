export const marketsTemplate = {
  name: 'markets-template',
  body: {
    index_patterns: ['markets'],
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
          code: { type: 'keyword' },
          koreanName: { type: 'keyword' },
          englishName: { type: 'keyword' },
          isEnabled: { type: 'boolean' },
        },
      },
    },
  },
};
