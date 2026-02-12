import pool from '../db';

export interface MemberActivity {
  member_id: string;
  member_name: string;
  email: string;
  joined_at: string;
  total_loans: number;
  overdue_rate_percentage: string;
}

export interface MemberActivityResult {
  members: MemberActivity[];
  totalItems: number;
  totalPages: number;
  totalLoans: number;
  avgOverdueRate: number;
}

export async function getMemberActivity(
  search: string,
  page: number,
  limit: number
): Promise<MemberActivityResult> {
  const offset = (page - 1) * limit;

  const query = `
    SELECT * FROM vw_member_activity
    WHERE member_name ILIKE $1 OR email ILIKE $1
    ORDER BY total_loans DESC
    LIMIT $2 OFFSET $3;
  `;
  const countQuery = `
    SELECT COUNT(*) FROM vw_member_activity
    WHERE member_name ILIKE $1 OR email ILIKE $1;
  `;

  const membersResult = await pool.query(query, [`%${search}%`, limit, offset]);
  const countResult = await pool.query(countQuery, [`%${search}%`]);

  const members = membersResult.rows;
  const totalItems = parseInt(countResult.rows[0].count, 10);
  const totalPages = Math.ceil(totalItems / limit);

  const totalLoans = members.reduce(
    (sum, member) => sum + parseInt(member.total_loans || '0'),
    0
  );
  const avgOverdueRate =
    members.length > 0
      ? members.reduce(
          (sum, member) => sum + parseFloat(member.overdue_rate_percentage || '0'),
          0
        ) / members.length
      : 0;

  return { members, totalItems, totalPages, totalLoans, avgOverdueRate };
}