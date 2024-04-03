export default () => ({
  nodeEnv: process.env.NODE_ENV || 'dev',
  port: Number(process.env.PORT) || 3333,
  opensearchNode: process.env.OPENSEARCH_NODE || 'https://localhost:9200',
  opensearchUsername: process.env.OPENSEARCH_USERNAME || 'admin',
  opensearchPassword: process.env.OPENSEARCH_PASSWORD || 'password',
});
