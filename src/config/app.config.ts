export default () => ({
  app: {
    name: 'store-management-api',
    port: parseInt(process.env.PORT || '3000', 10),
    environment: process.env.NODE_ENV || 'development',
  },

  database: {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    name: process.env.DB_NAME,
    username: process.env.DB_USER,
    password: process.env.DB_PASS,
    authSource: process.env.DB_AUTH_SOURCE,
  },

  auth: {
    // jwtSecret: process.env.JWT_SECRET,
    // jwtExpiresIn: process.env.JWT_EXPIRES_IN || '1d',
    cookieName: 'access_token',
  },

  roles: {
    adminRoles: ['Admin', 'Manager'],
  },

  limits: {
    // maxUploadSize: 5 * 1024 * 1024, // 5MB
    // maxFilesPerOrder: 10,
  },
});
