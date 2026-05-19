export default () => ({
  app: {
    name: 'store-management-api',
    port: parseInt(process.env.PORT || '3000', 10),
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
  },
});
