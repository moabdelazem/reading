import type { Context } from "hono";
import { z } from "zod";
import type { BookUpdate } from "../models/Book.js";
import {
  getAllBooks,
  getBookById,
  createBook,
  updateBook,
  deleteBook,
  updateReadingProgress,
} from "../models/Book.js";

// Schema for validating book creation
const createBookSchema = z.object({
  title: z.string().min(1, "Title is required"),
  author: z.string().min(1, "Author is required"),
  description: z.string().optional(),
  total_pages: z
    .number()
    .int()
    .positive("Total pages must be a positive number"),
  current_page: z
    .number()
    .int()
    .min(0, "Current page cannot be negative")
    .optional()
    .default(0),
});

// Schema for validating book updates
const updateBookSchema = createBookSchema.partial();

// Schema for validating reading progress updates
const updateProgressSchema = z.object({
  current_page: z.number().int().min(0, "Current page cannot be negative"),
});

export class BookController {
  /**
   * Get all books
   */
  static async getAll(c: Context) {
    try {
      const books = await getAllBooks();
      return c.json({
        message: "Books retrieved successfully",
        data: books,
      });
    } catch (error) {
      console.error("Error retrieving books:", error);
      return c.json(
        {
          message: "Failed to retrieve books",
          error: (error as Error).message,
        },
        500
      );
    }
  }

  /**
   * Get a book by ID
   */
  static async getById(c: Context) {
    try {
      const id = parseInt(c.req.param("id"), 10);

      if (isNaN(id)) {
        return c.json(
          {
            message: "Invalid book ID",
          },
          400
        );
      }

      const book = await getBookById(id);

      if (!book) {
        return c.json(
          {
            message: "Book not found",
          },
          404
        );
      }

      return c.json({
        message: "Book retrieved successfully",
        data: book,
      });
    } catch (error) {
      console.error("Error retrieving book:", error);
      return c.json(
        {
          message: "Failed to retrieve book",
          error: (error as Error).message,
        },
        500
      );
    }
  }

  /**
   * Create a new book
   */
  static async create(c: Context) {
    try {
      // Validate the request body
      const result = createBookSchema.safeParse(await c.req.json());

      if (!result.success) {
        return c.json(
          {
            message: "Invalid book data",
            error: result.error.format(),
          },
          400
        );
      }

      const bookData = result.data;

      // Determine the status based on the current page
      let status: "not_started" | "in_progress" | "completed";
      if (bookData.current_page === 0) {
        status = "not_started";
      } else if (bookData.current_page === bookData.total_pages) {
        status = "completed";
      } else {
        status = "in_progress";
      }

      const newBook = await createBook({
        ...bookData,
        status,
      });

      return c.json(
        {
          message: "Book created successfully",
          data: newBook,
        },
        201
      );
    } catch (error) {
      console.error("Error creating book:", error);
      return c.json(
        {
          message: "Failed to create book",
          error: (error as Error).message,
        },
        500
      );
    }
  }

  /**
   * Update a book
   */
  static async update(c: Context) {
    try {
      const id = parseInt(c.req.param("id"), 10);

      if (isNaN(id)) {
        return c.json(
          {
            message: "Invalid book ID",
          },
          400
        );
      }

      // Validate the request body
      const result = updateBookSchema.safeParse(await c.req.json());

      if (!result.success) {
        return c.json(
          {
            message: "Invalid book data",
            error: result.error.format(),
          },
          400
        );
      }

      let bookData = result.data;

      // If current_page is being updated, determine the status
      if (bookData.current_page !== undefined) {
        // We need to get the book to check total_pages
        const book = await getBookById(id);

        if (book) {
          let status: "not_started" | "in_progress" | "completed";

          if (bookData.current_page === 0) {
            status = "not_started";
          } else if (
            bookData.current_page === (bookData.total_pages || book.total_pages)
          ) {
            status = "completed";
          } else {
            status = "in_progress";
          }

          // Add status to bookData with type assertion
          bookData = {
            ...bookData,
            status,
          } as BookUpdate;
        }
      }

      const updatedBook = await updateBook(id, bookData);

      if (!updatedBook) {
        return c.json(
          {
            message: "Book not found",
          },
          404
        );
      }

      return c.json({
        message: "Book updated successfully",
        data: updatedBook,
      });
    } catch (error) {
      console.error("Error updating book:", error);
      return c.json(
        {
          message: "Failed to update book",
          error: (error as Error).message,
        },
        500
      );
    }
  }

  /**
   * Delete a book
   */
  static async delete(c: Context) {
    try {
      const id = parseInt(c.req.param("id"), 10);

      if (isNaN(id)) {
        return c.json(
          {
            message: "Invalid book ID",
          },
          400
        );
      }

      const deleted = await deleteBook(id);

      if (!deleted) {
        return c.json(
          {
            message: "Book not found",
          },
          404
        );
      }

      return c.json({
        message: "Book deleted successfully",
      });
    } catch (error) {
      console.error("Error deleting book:", error);
      return c.json(
        {
          message: "Failed to delete book",
          error: (error as Error).message,
        },
        500
      );
    }
  }

  /**
   * Update reading progress
   */
  static async updateProgress(c: Context) {
    try {
      const id = parseInt(c.req.param("id"), 10);

      if (isNaN(id)) {
        return c.json(
          {
            message: "Invalid book ID",
          },
          400
        );
      }

      // Validate the request body
      const result = updateProgressSchema.safeParse(await c.req.json());

      if (!result.success) {
        return c.json(
          {
            message: "Invalid progress data",
            error: result.error.format(),
          },
          400
        );
      }

      const { current_page } = result.data;

      const updatedBook = await updateReadingProgress(id, current_page);

      if (!updatedBook) {
        return c.json(
          {
            message: "Book not found or invalid page number",
          },
          404
        );
      }

      return c.json({
        message: "Reading progress updated successfully",
        data: updatedBook,
      });
    } catch (error) {
      console.error("Error updating reading progress:", error);
      return c.json(
        {
          message: "Failed to update reading progress",
          error: (error as Error).message,
        },
        500
      );
    }
  }
}
