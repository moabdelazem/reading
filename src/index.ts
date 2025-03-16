import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { logger } from "hono/logger";
import envConfig from "./config/env.js";
import booksRouter from "./routes/books.js";

const app = new Hono();

// Start Using Some Middlewares
app.use("*", logger());

// Create base router for the /api endpoint
const apiRouter = new Hono().basePath("/api");

// Register the books router
apiRouter.route("/books", booksRouter);

// Add the apiRouter to the app
app.route("/", apiRouter);

// Handling Errors
app.onError((err, c) => {
  console.error(err);
  return c.json(
    {
      message: "Internal Server Error",
    },
    500
  );
});

app.notFound((c) => {
  return c.json(
    {
      message: "The Resource You Are Looking For Is Not Found",
    },
    404
  );
});

serve(
  {
    fetch: app.fetch,
    port: envConfig.port,
  },
  (info) => {
    console.log(`Server is running on http://localhost:${info.port}`);
  }
);
