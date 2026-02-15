export default () => ({
  database: {
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || '27017', 10),
    name: process.env.DB_NAME,
    user: process.env.DB_USER,
    pass: process.env.DB_PASS,
    authSource: process.env.DB_AUTH_SOURCE || 'admin',

    uri: buildMongoUri(),
  },
});

function buildMongoUri(): string {
  const host = process.env.DB_HOST || 'localhost';
  const port = process.env.DB_PORT || '27017';
  const name = process.env.DB_NAME || 'store-management-api';
  const user = process.env.DB_USER;
  const pass = process.env.DB_PASS;
  const authSource = process.env.DB_AUTH_SOURCE || 'admin';

  if (user && pass) {
    return `mongodb://${user}:${pass}@${host}:${port}/${name}?authSource=${authSource}`;
  }

  return `mongodb://${host}:${port}/${name}`;
}
