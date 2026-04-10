require('dotenv').config();

const config = require('./config/config');
const connectDB = require('./config/mongoose');
const createExpressApp = require('./config/express');

const startServer = async () => {
  try {
    await connectDB();

    const app = await createExpressApp();

    app.listen(config.port, () => {
      console.log(`Server is running on http://localhost:${config.port}`);
      console.log(`GraphQL endpoint available at http://localhost:${config.port}/graphql`);
    });
  } catch (error) {
    console.error('Server startup error:', error.message);
    process.exit(1);
  }
};

startServer();