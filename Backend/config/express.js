const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const { expressMiddleware } = require('@apollo/server/express4');

const config = require('./config');
const typeDefs = require('../app/graphql/typeDefs');
const resolvers = require('../app/graphql/resolvers');
const { ApolloServer } = require('@apollo/server');
const { getUserFromToken } = require('../app/helpers/auth.server.helper');

const createExpressApp = async () => {
  const app = express();

  // -----------------------------
  // Basic Express middleware
  // -----------------------------
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(cookieParser());

  // -----------------------------
  // CORS configuration
  // -----------------------------
app.use(
    cors({
      origin: config.clientURL,
      credentials: true
    })
  );

  // -----------------------------
  // Simple test route
  // -----------------------------
  app.get('/', (req, res) => {
    res.send('Gaming Tournaments GraphQL Backend is running');
  });

  // -----------------------------
  // Apollo GraphQL server
  // -----------------------------
  const apolloServer = new ApolloServer({
    typeDefs,
    resolvers
  });

  await apolloServer.start();

  app.use(
    '/graphql',
    expressMiddleware(apolloServer, {
      context: async ({ req, res }) => {
        const currentUser = await getUserFromToken(req);

        return {
          req,
          res,
          currentUser
        };
      }
    })
  );

  return app;
};

module.exports = createExpressApp;
