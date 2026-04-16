require('dotenv').config();

const config = require('./config/config');
const connectDB = require('./config/mongoose');
const createApp = require('./app');

const startServer = async () => {
  try {
    await connectDB();

    const app = await createApp();

    const server = app.listen(config.port, () => {
      console.log(`Server is running on http://localhost:${config.port}`);
      console.log(`GraphQL endpoint available at http://localhost:${config.port}/graphql`);
    });

    return server;
  } catch (error) {
    console.error('Server startup error:', error.message);
    process.exit(1);
  }
};

if (require.main === module) {
  startServer();
}

module.exports = { startServer };