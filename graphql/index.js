require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const {
  ApolloServer,
  mergeSchemas,
  makeExecutableSchema
} = require("apollo-server-express");
const { authenticate } = require("./authentication");

const { lstatSync, readdirSync, existsSync } = require("fs");
const { join } = require("path");
const { composeTypeDefs } = require("./schema/helpers");
const { merge } = require("lodash");

const isDirectory = source => lstatSync(source).isDirectory();
const getDirectories = source =>
  readdirSync(source)
    .map(name => join(source, name))
    .filter(isDirectory);

const mergeResolvers = resolvers => {
  let resultingResolvers = {};
  resolvers.forEach(resolver => {
    resultingResolvers = merge(resultingResolvers, resolver);
  });
  return resultingResolvers;
};

// ############# Populate customTypes
let populatedCustomTypes = [];
const schemaDirs = getDirectories(__dirname + "/schema");
for (const dir of schemaDirs) {
  try {
    const { customTypes } = require(dir + "/types");
    populatedCustomTypes = [...populatedCustomTypes, ...customTypes];
  } catch (e) {
    console.log(
      `Error loading custom types from ${
        dir.split("/")[dir.split("/").length - 1]
      }/types`,
      e.message
    );
    // process.exit();
  }
}
populatedCustomTypes = populatedCustomTypes.join("\n");

// ############# Populate rootTypes and build schema, and also resolvers
const populatedSchemas = [];
let populatedResolvers = [];
for (const dir of schemaDirs) {
  const schemaName = dir.split("/")[dir.split("/").length - 1];
  try {
    if (existsSync(dir + "/types.js")) {
      const { rootTypes } = require(dir + "/types");
      if (!rootTypes) {
        continue;
      }
      const newSchema = makeExecutableSchema({
        typeDefs: composeTypeDefs([rootTypes, populatedCustomTypes].join("\n"))
      });
      populatedSchemas.push(newSchema);
    }

    try {
      if (existsSync(dir + "/resolvers.js")) {
        const { resolvers } = require(dir + "/resolvers");
        populatedResolvers.push(resolvers);
      }
    } catch (e) {
      console.log(`Error populating ${schemaName}/resolvers`, e.message);
    }
  } catch (e) {
    console.log(
      // `Error while loading schema of ${dir.split("/")[dir.split("/").length - 1]}!`,
      `Error while loading ${schemaName}/types >>`,
      e.message
    );
    // process.exit();
  }
}

const schema = mergeSchemas({
  schemas: populatedSchemas,
  resolvers: mergeResolvers(populatedResolvers)
});

const start = async () => {
  const server = new ApolloServer({
    schema,
    context: async ({ req }) => {
      const activeSession = await authenticate(req);
      return {
        activeSession
      };
    },
    cors: true,
    debug: process.env.NODE_ENV !== "production",
    playground: process.env.NODE_ENV !== "production",
    formatError: err => {
      console.log(
        "Apollo Server Error",
        err.message,
        JSON.stringify(err.extensions, null, 4)
      );
      return err;
    }
  });
  const app = express();
  app.use(bodyParser.json({ limit: "20mb" }));
  server.applyMiddleware({ app });
  const port = parseInt(process.env.GRAPHQL_API_PORT) || 8009;
  await app.listen({
    port
  });
  console.log(
    `🚀  Server ready at http://localhost:${port}${server.graphqlPath}`
  );
};

start();
