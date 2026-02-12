import pool from '../db';

export interface FineSummary {
  summary_month: string;
  total_fines_amount: string;
  paid_fines_amount: string;
  pending_fines_amount: string;
  number_of_fines: number;
}

export interface FinesSummaryResult {
  fines: FineSummary[];
  totalItems: number;
  totalPages: number;
  totalFinesAmount: number;
  totalPaidAmount: number;
  totalPendingAmount: number;
}

export async function getFinesSummary(
  search: string,
  page: number,
  limit: number
): Promise<FinesSummaryResult> {
  const offset = (page - 1) * limit;

  const query = `
    SELECT * FROM vw_fines_summary
    WHERE summary_month ILIKE $1
    ORDER BY summary_month DESC
    LIMIT $2 OFFSET $3;
  `;
  const countQuery = `
    SELECT COUNT(*) FROM vw_fines_summary
    WHERE summary_month ILIKE $1;
  `;

  const finesResult = await pool.query(query, [`%${search}%`, limit, offset]);
  const countResult = await pool.query(countQuery, [`%${search}%`]);

  const fines = finesResult.rows;
  const totalItems = parseInt(countResult.rows[0].count, 10);
  const totalPages = Math.ceil(totalItems / limit);

  const totalFinesAmount = fines.reduce(
    (sum, fine) => sum + parseFloat(fine.total_fines_amount || '0'),
    0
  );
  const totalPaidAmount = fines.reduce(
    (sum, fine) => sum + parseFloat(fine.paid_fines_amount || '0'),
    0
  );
  const totalPendingAmount = fines.reduce(
    (sum, fine) => sum + parseFloat(fine.pending_fines_amount || '0'),
    0
  );

  return {
    fines,
    totalItems,
    totalPages,
    totalFinesAmount,
    totalPaidAmount,
    totalPendingAmount,
  };
}