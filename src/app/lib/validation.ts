import { NextRequest, NextResponse } from 'next/server';
import pool from './db';
import { z } from 'zod';

// Esquema de validación para paginación
const PagingSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
});

// Whitelist de vistas permitidas para evitar accesos no deseados
const ALLOWED_VIEWS: { [key: string]: { searchFields?: string[] } } = {
  'most-borrowed-books': { searchFields: ['title', 'author'] },
  'overdue-loans': {},
  'fines-summary': {},
  'member-activity': {},
  'inventory-health': {},
};

export async function GET(
  request: NextRequest,
  { params }: { params: { reportName: string } }
) {
  const { reportName } = params;
  const searchParams = request.nextUrl.searchParams;

  // 1. Validar que la vista solicitada está en la whitelist
  if (!ALLOWED_VIEWS[reportName]) {
    return NextResponse.json({ error: 'Report not found' }, { status: 404 });
  }

  try {
    // 2. Validar parámetros de paginación con Zod
    const { page, limit } = PagingSchema.parse({
      page: searchParams.get('page'),
      limit: searchParams.get('limit'),
    });
    const offset = (page - 1) * limit;

    // Construcción de la consulta base
    let query = `SELECT * FROM vw_${reportName}`;
    const queryParams: any[] = [];
    let whereClauses: string[] = [];

    // 3. Lógica de filtros y búsqueda (Requisito F)
    // Ejemplo para 'most-borrowed-books' (búsqueda)
    if (reportName === 'most-borrowed-books' && searchParams.has('search')) {
      const searchTerm = searchParams.get('search')!;
      const searchFields = ALLOWED_VIEWS[reportName].searchFields!;
      
      queryParams.push(`%${searchTerm}%`);
      whereClauses.push(`(${searchFields.map((field, i) => `${field} ILIKE $${queryParams.length}`).join(' OR ')})`);
    }

    // Ejemplo para 'overdue-loans' (filtro)
    if (reportName === 'overdue-loans' && searchParams.has('min_days_atraso')) {
        const minDays = parseInt(searchParams.get('min_days_atraso') || '0', 10);
        if (!isNaN(minDays) && minDays > 0) {
            queryParams.push(minDays);
            whereClauses.push(`dias_atraso >= $${queryParams.length}`);
        }
    }

    if (whereClauses.length > 0) {
      query += ` WHERE ${whereClauses.join(' AND ')}`;
    }

    // 4. Obtener el total de registros para la paginación
    const totalQuery = `SELECT COUNT(*) FROM (${query}) as subquery`;
    const totalResult = await pool.query(totalQuery, queryParams);
    const totalRecords = parseInt(totalResult.rows[0].count, 10);
    const totalPages = Math.ceil(totalRecords / limit);

    // 5. Aplicar paginación a la consulta principal
    query += ` LIMIT $${queryParams.length + 1} OFFSET $${queryParams.length + 2}`;
    queryParams.push(limit, offset);

    // Ejecutar la consulta final
    const result = await pool.query(query, queryParams);

    return NextResponse.json({
      data: result.rows,
      pagination: {
        page,
        limit,
        totalRecords,
        totalPages,
      },
    });
  } catch (error) {
    console.error(error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid query parameters', details: error.issues }, { status: 400 });
    }
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}