import express from "express";
import path from "path";
import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@apollo/server/express4";
import { typeDefs, resolvers } from "./schemas/index.js";
import db from "./config/connection.js";
import { authMiddleware } from "./services/auth.js";

const PORT = process.env.PORT || 3001;
const app = express();
const server = new ApolloServer({
  typeDefs,
  resolvers,
});

const startApolloServer = async () => {
  await server.start();

  app.use(express.urlencoded({ extended: false }));
  app.use(express.json());

  app.use(
    "/graphql",
    expressMiddleware(server, {
      context: async ({ req }) => {
        // Call authMiddleware and return its result
        return authMiddleware({ req });
      },
    })
  );

  if (process.env.NODE_ENV === "production") {
    app.use(express.static(path.join(process.cwd(), "../client/dist")));

    app.get("*", (req, res) => {
      res.sendFile(path.join(process.cwd(), "../client/dist/index.html"));
    });
  }

  db.once("open", () => {
    app.listen(PORT, () => {
      console.log(`API server running on port ${PORT}!`);
      console.log(`Use GraphQL at http://localhost:${PORT}/graphql`);
    });
  });
};

startApolloServer();
