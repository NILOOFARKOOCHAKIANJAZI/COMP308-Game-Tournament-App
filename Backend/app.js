require('dotenv').config();

const createExpressApp = require('./config/express');

const createApp = async () => {
  const app = await createExpressApp();
  return app;
};

module.exports = createApp;