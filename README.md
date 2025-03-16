# Reading Tracker API

A simple API for tracking books you want to read and your reading progress.

## Features

- Add books to your reading list
- Track reading progress (current page)
- Update book information
- Delete books from your list
- Automatically categorize books as "not started", "in progress", or "completed"
- Persistent storage with PostgreSQL database

## API Endpoints

### Books

- `GET /api/books` - Get all books
- `GET /api/books/:id` - Get a specific book by ID
- `POST /api/books` - Add a new book
- `PUT /api/books/:id` - Update a book's information
- `DELETE /api/books/:id` - Delete a book
- `PATCH /api/books/:id/progress` - Update reading progress

## Request/Response Examples

### Add a new book

**Request:**

```http
POST /api/books
Content-Type: application/json

{
  "title": "The Hobbit",
  "author": "J.R.R. Tolkien",
  "description": "A fantasy novel about the adventures of Bilbo Baggins",
  "total_pages": 310,
  "current_page": 0
}
```

**Response:**

```json
{
  "message": "Book created successfully",
  "data": {
    "id": 1,
    "title": "The Hobbit",
    "author": "J.R.R. Tolkien",
    "description": "A fantasy novel about the adventures of Bilbo Baggins",
    "total_pages": 310,
    "current_page": 0,
    "status": "not_started",
    "created_at": "2023-08-19T12:34:56.789Z",
    "updated_at": "2023-08-19T12:34:56.789Z"
  }
}
```

### Update reading progress

**Request:**

```http
PATCH /api/books/1/progress
Content-Type: application/json

{
  "current_page": 150
}
```

**Response:**

```json
{
  "message": "Reading progress updated successfully",
  "data": {
    "id": 1,
    "title": "The Hobbit",
    "author": "J.R.R. Tolkien",
    "description": "A fantasy novel about the adventures of Bilbo Baggins",
    "total_pages": 310,
    "current_page": 150,
    "status": "in_progress",
    "created_at": "2023-08-19T12:34:56.789Z",
    "updated_at": "2023-08-19T13:45:12.345Z"
  }
}
```

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Docker and Docker Compose (for running PostgreSQL)

### Database Setup

The application uses PostgreSQL for data storage. You can run it using Docker Compose:

```bash
# Start the PostgreSQL database
docker-compose up -d
```

This will start a PostgreSQL instance with the following configuration:

- Host: localhost
- Port: 5432
- User: reading
- Password: reading
- Database: reading

The database schema will be automatically created when the container starts.

### Installation

1. Clone the repository
2. Install dependencies:
   ```
   npm install
   ```
3. Start the database:
   ```
   docker-compose up -d
   ```
4. Start the development server:
   ```
   npm run dev
   ```

The API will be available at http://localhost:3000.

## Future Improvements

- User authentication
- Book categories/tags
- Reading statistics
- Book search functionality
- Pagination for book listings

```
open http://localhost:3000
```
