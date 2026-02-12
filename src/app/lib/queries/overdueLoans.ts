import pool from '../db';

export interface OverdueLoan {
  loan_id: string;
  member_name: string;
  book_title: string;
  due_at: string;
  dias_atraso: number;
  suggested_fine: string;
}

export interface OverdueLoansResult {
  loans: OverdueLoan[];
  totalItems: number;
  totalPages: number;
  estimatedFineTotal: number;
}

export async function getOverdueLoans(
  search: string,
  page: number,
  limit: number
): Promise<OverdueLoansResult> {
  const offset = (page - 1) * limit;

  const query = `
    SELECT * FROM vw_overdue_loans
    WHERE member_name ILIKE $1 OR book_title ILIKE $1
    ORDER BY dias_atraso DESC
    LIMIT $2 OFFSET $3;
  `;
  const countQuery = `
    SELECT COUNT(*) FROM vw_overdue_loans
    WHERE member_name ILIKE $1 OR book_title ILIKE $1;
  `;

  const loansResult = await pool.query(query, [`%${search}%`, limit, offset]);
  const countResult = await pool.query(countQuery, [`%${search}%`]);

  const loans = loansResult.rows;
  const totalItems = parseInt(countResult.rows[0].count, 10);
  const totalPages = Math.ceil(totalItems / limit);

  const estimatedFineTotal = loans.reduce(
    (sum, loan) => sum + parseFloat(loan.suggested_fine || '0'),
    0
  );

  return { loans, totalItems, totalPages, estimatedFineTotal };
}