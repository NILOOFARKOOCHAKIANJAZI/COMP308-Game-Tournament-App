if (!process.env.JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is required');
}

module.exports = {
  port: process.env.PORT || 4000,
  db:
    process.env.MONGO_URI ||
    'mongodb://127.0.0.1:27017/comp308-assignment2-gaming-db',
  jwtSecret: process.env.JWT_SECRET,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '1d',
  clientURL: process.env.CLIENT_URL || 'http://localhost:5173',
  cookieName: process.env.COOKIE_NAME || 'token'
};