export const RABBITMQ_SERVICE = 'RABBITMQ_SERVICE';

// Queue names
export const QUEUES = {
  USER_QUEUE: 'user_queue',
  ORDER_QUEUE: 'order_queue',
  NOTIFICATION_QUEUE: 'notification_queue',
  EMAIL_QUEUE: 'email_queue', // Add email queue
} as const;

// Event types
export const EVENTS = {
  // User events
  USER_ADMIN_CREATED: 'user.admin.created',
  USER_ADMIN_UPDATED: 'user.admin.updated',
  USER_CUSTOMER_CREATED: 'user.customer.created',
  USER_CUSTOMER_UPDATED: 'user.customer.updated',

  // Email events
  EMAIL_WELCOME_CUSTOMER: 'email.welcome.customer',
  EMAIL_WELCOME_ADMIN: 'email.welcome.admin',
  EMAIL_VERIFY_ACCOUNT: 'email.verify.account',
  EMAIL_RESET_PASSWORD: 'email.reset.password',

  // Order events
  ORDER_CREATED: 'order.created',
  ORDER_PAID: 'order.paid',
} as const;

export type QueueName = (typeof QUEUES)[keyof typeof QUEUES];
export type EventType = (typeof EVENTS)[keyof typeof EVENTS];
