import express from "express";
import path from "path";
import db from "./config/connection.js";

// boiler plate code
import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@apollo/server/express4";
import { typeDefs, resolvers } from "./schemas/index.js";
import { authenticateToken } from "./services/auth.js";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// start express app and assigns it to a variable
const app = express();
const PORT = process.env.PORT || 3000;
interface MyContext {
  user: {
    username: string;
    email: string;
    _id: string;
  } | null;
  req: Request;
}
const server = new ApolloServer<MyContext>({
  typeDefs,
  resolvers,
});

const startApolloServer = async () => {
  console.log("Starting Apollo Server...");
  await server.start();
  console.log("Finished awaiting Apollo Server...");

  app.use(express.urlencoded({ extended: true }));
  // this one parses incoming requests with JSON payloads
  app.use(express.json());

  // attempting to use /graphql as middleware and authenticate token
  app.use(
    "/graphql",
    expressMiddleware(
      server as any,

      {
        context: authenticateToken as any,
      }
    )
  );

  if (process.env.NODE_ENV === "production") {
    const clientDistPath = path.resolve(__dirname, "../../client/dist");

    app.use(express.static(clientDistPath));

    app.get("*", (_req: any, res: { sendFile: (arg0: string) => void }) => {
      res.sendFile(path.join(clientDistPath, "index.html"));
    });
  }
  console.log("Attempting to connect to the db");

  db.once("open", () => {
    console.log(`🌍 db connection made`);
  });

  db.on("error", console.error.bind(console, "MongoDB connection error:"));

  app.listen(PORT, () => {
    console.log(`API server running on port ${PORT}!`);
    console.log(`Use GraphQL at http://localhost:${PORT}/graphql`);
  });
};

// starts the apollo server and express
startApolloServer();
