import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { z } from 'zod';
import pool from '../../lib/db';
import { SearchBar } from '../../components/SearchBar';
import { Pagination } from '../../components/Pagination';
import { MostBorrowedTable } from '../../components/MostBorrowedTable';
import KpiCard from '../../components/KpiCard';

// Validation schema for search params - This is now used in the main page component
const searchParamsSchema = z.object({
  search: z.string().optional().default(''),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(5).max(50).default(10),
});

// --- Report 1: Most Borrowed Books ---
// This component now receives clean, validated props
async function MostBorrowedBooksPage({ search, page, limit }: z.infer<typeof searchParamsSchema>) {
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

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold">Libros Más Prestados</h2>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <KpiCard title="Total de Préstamos" value={totalItems.toString()} />
        {/* Add other relevant KPIs */}
      </div>
      <SearchBar placeholder="Buscar por título o autor..." />
      <MostBorrowedTable books={books} />
      <Pagination totalPages={totalPages} />
    </div>
  );
}

// --- Placeholder for other reports ---
// Updated props for consistency
async function OverdueLoansPage({ search, page, limit }: z.infer<typeof searchParamsSchema>) {
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

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold">Préstamos Vencidos</h2>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <KpiCard title="Total Vencidos" value={totalItems.toString()} color="red" />
        <KpiCard 
          title="Multa Estimada Total" 
          value={`$${loans.reduce((sum, loan) => sum + parseFloat(loan.suggested_fine || 0), 0).toFixed(2)}`} 
          color="orange" 
        />
      </div>
      <SearchBar placeholder="Buscar por miembro o libro..." />
      <div className="overflow-x-auto relative shadow-md sm:rounded-lg">
        <table className="w-full text-sm text-left text-gray-500">
          <thead className="text-xs text-gray-700 uppercase bg-gray-50">
            <tr>
              <th scope="col" className="py-3 px-6">Miembro</th>
              <th scope="col" className="py-3 px-6">Libro</th>
              <th scope="col" className="py-3 px-6">Fecha Vencimiento</th>
              <th scope="col" className="py-3 px-6">Días Atraso</th>
              <th scope="col" className="py-3 px-6">Multa Sugerida</th>
            </tr>
          </thead>
          <tbody>
            {loans.map((loan: any) => (
              <tr key={loan.loan_id} className="bg-white border-b hover:bg-gray-50">
                <td className="py-4 px-6">{loan.member_name}</td>
                <td className="py-4 px-6">{loan.book_title}</td>
                <td className="py-4 px-6">{new Date(loan.due_at).toLocaleDateString()}</td>
                <td className="py-4 px-6">
                  <span className="bg-red-100 text-red-800 text-xs font-medium px-2.5 py-0.5 rounded">
                    {loan.dias_atraso} días
                  </span>
                </td>
                <td className="py-4 px-6 font-semibold">${parseFloat(loan.suggested_fine).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Pagination totalPages={totalPages} />
    </div>
  );
}
async function FinesSummaryPage({ search, page, limit }: z.infer<typeof searchParamsSchema>) {
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

  const totalFinesAmount = fines.reduce((sum, fine) => sum + parseFloat(fine.total_fines_amount || 0), 0);
  const totalPaidAmount = fines.reduce((sum, fine) => sum + parseFloat(fine.paid_fines_amount || 0), 0);
  const totalPendingAmount = fines.reduce((sum, fine) => sum + parseFloat(fine.pending_fines_amount || 0), 0);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold">Resumen de Multas por Mes</h2>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <KpiCard title="Total Multas" value={`$${totalFinesAmount.toFixed(2)}`} color="blue" />
        <KpiCard title="Multas Pagadas" value={`$${totalPaidAmount.toFixed(2)}`} color="green" />
        <KpiCard title="Multas Pendientes" value={`$${totalPendingAmount.toFixed(2)}`} color="orange" />
        <KpiCard title="Meses Registrados" value={totalItems.toString()} color="purple" />
      </div>
      <SearchBar placeholder="Buscar por mes (ej: 2026-01)..." />
      <div className="overflow-x-auto relative shadow-md sm:rounded-lg">
        <table className="w-full text-sm text-left text-gray-500">
          <thead className="text-xs text-gray-700 uppercase bg-gray-50">
            <tr>
              <th scope="col" className="py-3 px-6">Mes</th>
              <th scope="col" className="py-3 px-6">Total Multas</th>
              <th scope="col" className="py-3 px-6">Multas Pagadas</th>
              <th scope="col" className="py-3 px-6">Multas Pendientes</th>
              <th scope="col" className="py-3 px-6">Cantidad de Multas</th>
            </tr>
          </thead>
          <tbody>
            {fines.map((fine: any, index: number) => (
              <tr key={index} className="bg-white border-b hover:bg-gray-50">
                <td className="py-4 px-6 font-medium">{fine.summary_month}</td>
                <td className="py-4 px-6 font-semibold">${parseFloat(fine.total_fines_amount).toFixed(2)}</td>
                <td className="py-4 px-6 text-green-600">${parseFloat(fine.paid_fines_amount).toFixed(2)}</td>
                <td className="py-4 px-6 text-orange-600">${parseFloat(fine.pending_fines_amount).toFixed(2)}</td>
                <td className="py-4 px-6">{fine.number_of_fines}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Pagination totalPages={totalPages} />
    </div>
  );
}
async function MemberActivityPage({ search, page, limit }: z.infer<typeof searchParamsSchema>) {
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

  const totalLoans = members.reduce((sum, member) => sum + parseInt(member.total_loans || 0), 0);
  const avgOverdueRate = members.length > 0 
    ? members.reduce((sum, member) => sum + parseFloat(member.overdue_rate_percentage || 0), 0) / members.length 
    : 0;

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold">Actividad de Miembros</h2>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <KpiCard title="Miembros Activos" value={totalItems.toString()} color="blue" />
        <KpiCard title="Total Préstamos" value={totalLoans.toString()} color="green" />
        <KpiCard title="Tasa Atraso Promedio" value={`${avgOverdueRate.toFixed(1)}%`} color="orange" />
      </div>
      <SearchBar placeholder="Buscar por nombre o email..." />
      <div className="overflow-x-auto relative shadow-md sm:rounded-lg">
        <table className="w-full text-sm text-left text-gray-500">
          <thead className="text-xs text-gray-700 uppercase bg-gray-50">
            <tr>
              <th scope="col" className="py-3 px-6">Nombre</th>
              <th scope="col" className="py-3 px-6">Email</th>
              <th scope="col" className="py-3 px-6">Fecha Registro</th>
              <th scope="col" className="py-3 px-6">Total Préstamos</th>
              <th scope="col" className="py-3 px-6">Tasa de Atraso</th>
            </tr>
          </thead>
          <tbody>
            {members.map((member: any) => (
              <tr key={member.member_id} className="bg-white border-b hover:bg-gray-50">
                <td className="py-4 px-6 font-medium">{member.member_name}</td>
                <td className="py-4 px-6">{member.email}</td>
                <td className="py-4 px-6">{new Date(member.joined_at).toLocaleDateString()}</td>
                <td className="py-4 px-6">
                  <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded">
                    {member.total_loans}
                  </span>
                </td>
                <td className="py-4 px-6">
                  <span className={`text-xs font-medium px-2.5 py-0.5 rounded ${
                    parseFloat(member.overdue_rate_percentage) > 20 
                      ? 'bg-red-100 text-red-800' 
                      : parseFloat(member.overdue_rate_percentage) > 10 
                      ? 'bg-orange-100 text-orange-800' 
                      : 'bg-green-100 text-green-800'
                  }`}>
                    {parseFloat(member.overdue_rate_percentage).toFixed(1)}%
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Pagination totalPages={totalPages} />
    </div>
  );
}
async function InventoryHealthPage({ search, page, limit }: z.infer<typeof searchParamsSchema>) {
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

  const totalCopies = inventory.reduce((sum, item) => sum + parseInt(item.total_copies || 0), 0);
  const totalAvailable = inventory.reduce((sum, item) => sum + parseInt(item.available_copies || 0), 0);
  const totalLoaned = inventory.reduce((sum, item) => sum + parseInt(item.loaned_copies || 0), 0);
  const totalLost = inventory.reduce((sum, item) => sum + parseInt(item.lost_copies || 0), 0);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold">Salud del Inventario por Categoría</h2>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <KpiCard title="Total Copias" value={totalCopies.toString()} color="blue" />
        <KpiCard title="Disponibles" value={totalAvailable.toString()} color="green" />
        <KpiCard title="Prestadas" value={totalLoaned.toString()} color="orange" />
        <KpiCard title="Perdidas" value={totalLost.toString()} color="red" />
      </div>
      <SearchBar placeholder="Buscar por categoría..." />
      <div className="overflow-x-auto relative shadow-md sm:rounded-lg">
        <table className="w-full text-sm text-left text-gray-500">
          <thead className="text-xs text-gray-700 uppercase bg-gray-50">
            <tr>
              <th scope="col" className="py-3 px-6">Categoría</th>
              <th scope="col" className="py-3 px-6">Total Copias</th>
              <th scope="col" className="py-3 px-6">Disponibles</th>
              <th scope="col" className="py-3 px-6">Prestadas</th>
              <th scope="col" className="py-3 px-6">Perdidas</th>
              <th scope="col" className="py-3 px-6">% Disponibilidad</th>
            </tr>
          </thead>
          <tbody>
            {inventory.map((item: any, index: number) => (
              <tr key={index} className="bg-white border-b hover:bg-gray-50">
                <td className="py-4 px-6 font-medium">{item.category}</td>
                <td className="py-4 px-6">{item.total_copies}</td>
                <td className="py-4 px-6 text-green-600 font-semibold">{item.available_copies}</td>
                <td className="py-4 px-6 text-orange-600">{item.loaned_copies}</td>
                <td className="py-4 px-6 text-red-600">{item.lost_copies}</td>
                <td className="py-4 px-6">
                  <span className={`text-xs font-medium px-2.5 py-0.5 rounded ${
                    parseFloat(item.availability_percentage) > 50 
                      ? 'bg-green-100 text-green-800' 
                      : parseFloat(item.availability_percentage) > 25 
                      ? 'bg-orange-100 text-orange-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {parseFloat(item.availability_percentage).toFixed(1)}%
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Pagination totalPages={totalPages} />
    </div>
  );
}


// --- Dynamic Page Component ---

const reportComponents: { [key: string]: React.ComponentType<any> } = {
  'most-borrowed-books': MostBorrowedBooksPage,
  'overdue-loans': OverdueLoansPage,
  'fines-summary': FinesSummaryPage,
  'member-activity': MemberActivityPage,
  'inventory-health': InventoryHealthPage,
};

interface PageProps {
  params: Promise<{ reportId: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function DynamicReportPage({ params, searchParams }: PageProps) {
  const { reportId } = await params;
  const ReportComponent = reportComponents[reportId];

  if (!ReportComponent) {
    notFound();
  }

  // **AQUÍ ESTÁ EL CAMBIO CLAVE**
  // En Next.js 15+, searchParams puede ser una promesa, así que hacemos await
  const resolvedSearchParams = await searchParams;
  const validatedParams = searchParamsSchema.parse(resolvedSearchParams || {});

  return (
    <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6 capitalize">{reportId.replace(/-/g, ' ')}</h1>
        <Suspense fallback={<div>Cargando reporte...</div>}>
            {/* Pasamos los parámetros validados como props individuales */}
            <ReportComponent {...validatedParams} />
        </Suspense>
    </div>
  );
}