import { Hono } from "hono";
import { BookController } from "../controllers/BookController.js";

const booksRouter = new Hono();

// Get all books
booksRouter.get("/", BookController.getAll);

// Get a book by ID
booksRouter.get("/:id", BookController.getById);

// Create a new book
booksRouter.post("/", BookController.create);

// Update a book
booksRouter.put("/:id", BookController.update);

// Delete a book
booksRouter.delete("/:id", BookController.delete);

// Update reading progress
booksRouter.patch("/:id/progress", BookController.updateProgress);

export default booksRouter;
