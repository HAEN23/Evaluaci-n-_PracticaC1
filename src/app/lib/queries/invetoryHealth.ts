import pool from '../db';

export interface InventoryItem {
  category: string;
  total_copies: number;
  available_copies: number;
  loaned_copies: number;
  lost_copies: number;
  availability_percentage: string;
}

export interface InventoryHealthResult {
  inventory: InventoryItem[];
  totalItems: number;
  totalPages: number;
  totalCopies: number;
  totalAvailable: number;
  totalLoaned: number;
  totalLost: number;
}

export async function getInventoryHealth(
  search: string,
  page: number,
  limit: number
): Promise<InventoryHealthResult> {
  const offset = (page - 1) * limit;

  const query = `
    SELECT * FROM vw_inventory_health
    WHERE category ILIKE $1
    ORDER BY total_copies DESC
    LIMIT $2 OFFSET $3;
  `;
  const countQuery = `
    SELECT COUNT(*) FROM vw_inventory_health
    WHERE category ILIKE $1;
  `;

  const inventoryResult = await pool.query(query, [`%${search}%`, limit, offset]);
  const countResult = await pool.query(countQuery, [`%${search}%`]);

  const inventory = inventoryResult.rows;
  const totalItems = parseInt(countResult.rows[0].count, 10);
  const totalPages = Math.ceil(totalItems / limit);

  const totalCopies = inventory.reduce(
    (sum, item) => sum + parseInt(item.total_copies || '0'),
    0
  );
  const totalAvailable = inventory.reduce(
    (sum, item) => sum + parseInt(item.available_copies || '0'),
    0
  );
  const totalLoaned = inventory.reduce(
    (sum, item) => sum + parseInt(item.loaned_copies || '0'),
    0
  );
  const totalLost = inventory.reduce(
    (sum, item) => sum + parseInt(item.lost_copies || '0'),
    0
  );

  return {
    inventory,
    totalItems,
    totalPages,
    totalCopies,
    totalAvailable,
    totalLoaned,
    totalLost,
  };
}