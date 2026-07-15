export default () => ({
  app: {
    name: 'email-service',
    port: parseInt(process.env.PORT || '3002', 10),
    environment: process.env.NODE_ENV || 'development',
  },

  rabbitmq: {
    urls: [process.env.RABBITMQ_URL || 'amqp://localhost:5672'],
    queue: process.env.RABBITMQ_QUEUE || 'email_queue',
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
