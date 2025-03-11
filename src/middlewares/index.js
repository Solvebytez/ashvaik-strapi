const { ApolloServer } = require("apollo-server-koa");
const { makeExecutableSchema } = require("@graphql-tools/schema");
const { mergeTypeDefs, mergeResolvers } = require("@graphql-tools/merge");
const { gql } = require("apollo-server-core");
module.exports = (config, { strapi }) => {
  return async (ctx, next) => {
    // Define your custom type definitions
    const typeDefs = gql`
      type Query {
        hello: String
      }
    `;

    // Define custom resolvers
    const resolvers = {
      Query: {
        hello: () => "Hello from Apollo Server!",
      },
    };

    // Combine Strapi's GraphQL schema with custom schema
    const strapiSchema = strapi.plugins["graphql"]
      .service("schema")
      .generateSchema();
    const schema = makeExecutableSchema({
      typeDefs: mergeTypeDefs([strapiSchema.typeDefs, typeDefs]),
      resolvers: mergeResolvers([strapiSchema.resolvers, resolvers]),
    });

    // Initialize Apollo Server
    const server = new ApolloServer({ schema });

    // Apply Apollo middleware
    await server.start();
    server.applyMiddleware({ app: strapi.server.app });

    await next();
  };
};
