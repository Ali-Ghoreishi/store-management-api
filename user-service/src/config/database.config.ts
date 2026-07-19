export default () => ({
  database: {
    mongo: {
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT || '27017', 10),
      name: process.env.DB_NAME,
      user: process.env.DB_USER,
      pass: process.env.DB_PASS,
      authSource: process.env.DB_AUTH_SOURCE || 'admin',
      uri: buildMongoUri(),
    },
    redis: {
      host: process.env.REDIS_HOST || 'localhost',
      port: process.env.REDIS_PORT || 6379,
      password: process.env.REDIS_PASSWORD,
      db: process.env.REDIS_DB || 0,
      url: process.env.REDIS_URL, // Optional: use full URL instead of individual params
      ttl: process.env.REDIS_TTL || 3600, // Default TTL in seconds
      retryAttempts: parseInt(process.env.REDIS_RETRY_ATTEMPTS || '10'),
      retryDelay: parseInt(process.env.REDIS_RETRY_DELAY || '3000'),
      uri: buildRedisUri(),
    },
  },
});

function buildMongoUri(): string {
  const host = process.env.DB_HOST || 'localhost';
  const port = process.env.DB_PORT || '27017';
  const name = process.env.DB_NAME || 'user_db';
  const user = process.env.DB_USER;
  const pass = process.env.DB_PASS;
  const authSource = process.env.DB_AUTH_SOURCE || 'admin';

  if (user && pass) {
    return `mongodb://${user}:${pass}@${host}:${port}/${name}?authSource=${authSource}`;
  }

  return `mongodb://${host}:${port}/${name}`;
}

function buildRedisUri(): string {
  // If URL is provided directly, use it
  if (process.env.REDIS_URL) {
    return process.env.REDIS_URL;
  }

  const host = process.env.REDIS_HOST || 'localhost';
  const port = process.env.REDIS_PORT || '6379';
  const password = process.env.REDIS_PASSWORD;
  const db = process.env.REDIS_DB || '0';

  // Build URL with password if provided
  if (password) {
    return `redis://:${encodeURIComponent(password)}@${host}:${port}/${db}`;
  }

  // Build URL without password
  return `redis://${host}:${port}/${db}`;
}
