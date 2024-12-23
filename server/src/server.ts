import express from "express";
import { fileURLToPath } from "url"; // Add this import
import { dirname } from "path"; // Add this import
import path from "path"; // Add this import
import type { Request, Response } from "express";
import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@apollo/server/express4";
import { authenticateToken } from "./services/auth.js";
import { typeDefs, resolvers } from "./schemas/index.js";
import db from "./config/connection.js";

const PORT = process.env.PORT || 3001;
const server = new ApolloServer({
  typeDefs,
  resolvers,
});

const app = express();

// Get the directory name of the current module (ESM)
const __dirname = dirname(fileURLToPath(import.meta.url));

const startApolloServer = async () => {
  await server.start();
  await db;

  app.use(express.urlencoded({ extended: false }));
  app.use(express.json());

  app.use(
    "/graphql",
    expressMiddleware(server as any, {
      context: authenticateToken as any,
    })
  );

  if (process.env.NODE_ENV === "production") {
    app.use(express.static(path.join(__dirname, "../client/dist")));

    app.get("*", (_req: Request, res: Response) => {
      res.sendFile(path.join(__dirname, "../client/dist/index.html"));
    });
  }

  app.listen(PORT, () => {
    console.log(`API server running on port ${PORT}!`);
    console.log(`Use GraphQL at http://localhost:${PORT}/graphql`);
  });
};

startApolloServer();
