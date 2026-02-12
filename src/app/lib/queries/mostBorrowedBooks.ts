import pool from '../db';

export interface MostBorrowedBook {
  book_id: string;
  title: string;
  author: string;
  category: string;
  total_loans: number;
  loan_rank: number;
}

export interface MostBorrowedBooksResult {
  books: MostBorrowedBook[];
  totalItems: number;
  totalPages: number;
}

export async function getMostBorrowedBooks(
  search: string,
  page: number,
  limit: number
): Promise<MostBorrowedBooksResult> {
  const offset = (page - 1) * limit;

  const query = `
    SELECT * FROM vw_most_borrowed_books
    WHERE title ILIKE $1 OR author ILIKE $1
    LIMIT $2 OFFSET $3;
  `;
  const countQuery = `
    SELECT COUNT(*) FROM vw_most_borrowed_books
    WHERE title ILIKE $1 OR author ILIKE $1;
  `;

  const booksResult = await pool.query(query, [`%${search}%`, limit, offset]);
  const countResult = await pool.query(countQuery, [`%${search}%`]);

  const books = booksResult.rows;
  const totalItems = parseInt(countResult.rows[0].count, 10);
  const totalPages = Math.ceil(totalItems / limit);

  return { books, totalItems, totalPages };
}