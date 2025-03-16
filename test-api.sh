#!/bin/bash

# Set the API base URL
API_URL="http://localhost:3000/api/books"

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}=== Reading Tracker API Test Script ===${NC}"
echo -e "${BLUE}This script will test all endpoints of the Reading Tracker API${NC}"
echo ""

# Function to make API requests
make_request() {
  local method=$1
  local url=$2
  local data=$3
  local description=$4

  echo -e "${BLUE}Testing: ${description}${NC}"
  
  if [ -z "$data" ]; then
    response=$(curl -s -X "$method" "$url" -H "Content-Type: application/json")
  else
    response=$(curl -s -X "$method" "$url" -H "Content-Type: application/json" -d "$data")
  fi
  
  echo "$response" | jq .
  echo ""
  
  # Extract the ID if it's a creation response
  if [ "$method" == "POST" ]; then
    book_id=$(echo "$response" | jq -r '.data.id')
    echo -e "${GREEN}Created book with ID: $book_id${NC}"
    echo ""
    return 0
  fi
  
  return 0
}

# 1. Create a book
echo -e "${BLUE}=== Creating Books ===${NC}"
book1_data='{"title":"The Hobbit","author":"J.R.R. Tolkien","description":"A fantasy novel about the adventures of Bilbo Baggins","total_pages":310,"current_page":0}'
make_request "POST" "$API_URL" "$book1_data" "Create a new book (The Hobbit)"
book1_id=$book_id

book2_data='{"title":"Atomic Habits","author":"James Clear","description":"An easy and proven way to build good habits and break bad ones","total_pages":320,"current_page":45}'
make_request "POST" "$API_URL" "$book2_data" "Create a new book (Atomic Habits)"
book2_id=$book_id

book3_data='{"title":"Dune","author":"Frank Herbert","description":"A science fiction novel set in the distant future amidst a feudal interstellar society","total_pages":412,"current_page":412}'
make_request "POST" "$API_URL" "$book3_data" "Create a new book (Dune)"
book3_id=$book_id

# 2. Get all books
echo -e "${BLUE}=== Getting All Books ===${NC}"
make_request "GET" "$API_URL" "" "Get all books"

# 3. Get a specific book
echo -e "${BLUE}=== Getting a Specific Book ===${NC}"
make_request "GET" "$API_URL/$book1_id" "" "Get book with ID $book1_id"

# 4. Update a book
echo -e "${BLUE}=== Updating a Book ===${NC}"
update_data='{"title":"The Hobbit: 25th Anniversary Edition","description":"A special edition of the philosophical novel about following your dreams"}'
make_request "PUT" "$API_URL/$book1_id" "$update_data" "Update book with ID $book1_id"

# 5. Update reading progress
echo -e "${BLUE}=== Updating Reading Progress ===${NC}"
progress_data='{"current_page":100}'
make_request "PATCH" "$API_URL/$book1_id/progress" "$progress_data" "Update reading progress for book with ID $book1_id to 100 pages"

progress_data='{"current_page":310}'
make_request "PATCH" "$API_URL/$book1_id/progress" "$progress_data" "Update reading progress for book with ID $book1_id to completed (310 pages)"

# 6. Delete a book
echo -e "${BLUE}=== Deleting a Book ===${NC}"
make_request "DELETE" "$API_URL/$book3_id" "" "Delete book with ID $book3_id"

# 7. Verify deletion
echo -e "${BLUE}=== Verifying Deletion ===${NC}"
make_request "GET" "$API_URL/$book3_id" "" "Try to get deleted book with ID $book3_id"

# 8. Get all books again to see the final state
echo -e "${BLUE}=== Final State of Books ===${NC}"
make_request "GET" "$API_URL" "" "Get all books after operations"

echo -e "${GREEN}API testing completed!${NC}" 