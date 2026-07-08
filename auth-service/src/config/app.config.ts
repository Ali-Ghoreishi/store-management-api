export default () => ({
  app: {
    name: 'auth-service',
    port: parseInt(process.env.PORT || '3001', 10),
    environment: process.env.NODE_ENV || 'development',
  },

  auth: {
    sessionSecret: process.env.SESSION_SECRET,
    accessSecret: process.env.JWT_ACCESS_SECRET,
    refreshSecret: process.env.JWT_REFRESH_SECRET,
    accessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '15m',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
    cookieName: 'access_token',
  },

  limits: {
    // maxUploadSize: 5 * 1024 * 1024, // 5MB
    // maxFilesPerOrder: 10,
  },

  bcrypt: {
    saltRounds: parseInt(process.env.BCRYPT_SALT_ROUNDS || '10', 10),
    defaultPassword: process.env.DEFAULT_PASSWORD,
  },

  rabbitmq: {
    urls: [process.env.RABBITMQ_URL || 'amqp://localhost:5672'],
    queue: process.env.RABBITMQ_QUEUE || 'auth_queue',
    queueOptions: {
      durable: false,
    },
    prefetchCount: 10,
    reconnectTimeInSeconds: 5,
  },

  email: {
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.EMAIL_PORT || '587', 10),
    secure: process.env.EMAIL_SECURE === 'true',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
    from: process.env.EMAIL_FROM || 'noreply@yourapp.com',
  },
});
