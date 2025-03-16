import pool from "../db/index.js";

export interface Book {
  id: number;
  title: string;
  author: string;
  description?: string;
  total_pages: number;
  current_page: number;
  status: "not_started" | "in_progress" | "completed";
  created_at: Date;
  updated_at: Date;
}

export type BookInput = Omit<Book, "id" | "created_at" | "updated_at">;
export type BookUpdate = Partial<
  Omit<Book, "id" | "created_at" | "updated_at">
>;

// Get all books from the database
export const getAllBooks = async (): Promise<Book[]> => {
  const query = "SELECT * FROM books ORDER BY created_at DESC";
  const result = await pool.query(query);
  return result.rows;
};

// Get a book by ID from the database
export const getBookById = async (id: number): Promise<Book | null> => {
  const query = "SELECT * FROM books WHERE id = $1";
  const result = await pool.query(query, [id]);

  if (result.rows.length === 0) {
    return null;
  }

  return result.rows[0];
};

// Create a new book in the database
export const createBook = async (bookData: BookInput): Promise<Book> => {
  const { title, author, description, total_pages, current_page, status } =
    bookData;

  const query = `
    INSERT INTO books (title, author, description, total_pages, current_page, status)
    VALUES ($1, $2, $3, $4, $5, $6)
    RETURNING *
  `;

  const values = [
    title,
    author,
    description,
    total_pages,
    current_page,
    status,
  ];
  const result = await pool.query(query, values);

  return result.rows[0];
};

// Update a book in the database
export const updateBook = async (
  id: number,
  bookData: BookUpdate
): Promise<Book | null> => {
  // First check if the book exists
  const book = await getBookById(id);

  if (!book) {
    return null;
  }

  // Build the SET part of the query dynamically based on the provided fields
  const updates: string[] = [];
  const values: any[] = [];
  let paramIndex = 1;

  // Add each field that needs to be updated
  if (bookData.title !== undefined) {
    updates.push(`title = $${paramIndex++}`);
    values.push(bookData.title);
  }

  if (bookData.author !== undefined) {
    updates.push(`author = $${paramIndex++}`);
    values.push(bookData.author);
  }

  if (bookData.description !== undefined) {
    updates.push(`description = $${paramIndex++}`);
    values.push(bookData.description);
  }

  if (bookData.total_pages !== undefined) {
    updates.push(`total_pages = $${paramIndex++}`);
    values.push(bookData.total_pages);
  }

  if (bookData.current_page !== undefined) {
    updates.push(`current_page = $${paramIndex++}`);
    values.push(bookData.current_page);
  }

  if (bookData.status !== undefined) {
    updates.push(`status = $${paramIndex++}`);
    values.push(bookData.status);
  }

  // If no fields to update, return the existing book
  if (updates.length === 0) {
    return book;
  }

  // Add the ID as the last parameter
  values.push(id);

  const query = `
    UPDATE books
    SET ${updates.join(", ")}
    WHERE id = $${paramIndex}
    RETURNING *
  `;

  const result = await pool.query(query, values);

  return result.rows[0];
};

// Delete a book from the database
export const deleteBook = async (id: number): Promise<boolean> => {
  const query = "DELETE FROM books WHERE id = $1 RETURNING id";
  const result = await pool.query(query, [id]);

  return result.rowCount ? result.rowCount > 0 : false;
};

// Update reading progress and status
export const updateReadingProgress = async (
  id: number,
  currentPage: number
): Promise<Book | null> => {
  // First get the book to check if it exists and to get the total pages
  const book = await getBookById(id);

  if (!book) {
    return null;
  }

  // Validate the current page
  if (currentPage < 0 || currentPage > book.total_pages) {
    return null;
  }

  // Determine the status based on the current page
  let status: "not_started" | "in_progress" | "completed";

  if (currentPage === 0) {
    status = "not_started";
  } else if (currentPage === book.total_pages) {
    status = "completed";
  } else {
    status = "in_progress";
  }

  // Update the book
  return updateBook(id, { current_page: currentPage, status });
};
