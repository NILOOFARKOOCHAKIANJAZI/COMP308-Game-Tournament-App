module.exports = {
  port: 4001,
  mongoUri: 'mongodb://127.0.0.1:27017/comp308-assignment2-gaming-db-test',
  jwtSecret: 'test_jwt_secret',
  jwtExpiresIn: '1d',
  adminSecretKey: 'test_admin_secret',
  clientUrl: 'http://localhost:5173',
  cookieName: 'token',
  nodeEnv: 'test'
};