import { SearchBar } from '@/components/SearchBar';
import { Pagination } from '@/components/Pagination';
import KpiCard  from '@/components/KpiCard';

interface OverdueLoan {
  loan_id: string;
  member_name: string;
  book_title: string;
  due_at: string;
  dias_atraso: number;
  suggested_fine: string;
}

interface Props {
  loans: OverdueLoan[];
  totalItems: number;
  totalPages: number;
  estimatedFineTotal: number;
}

export function OverdueLoansReport({ loans, totalItems, totalPages, estimatedFineTotal }: Props) {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold">Préstamos Vencidos</h2>

      {/* KPIs */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <KpiCard title="Total Vencidos" value={totalItems.toString()} color="red" />
        <KpiCard
          title="Multa Estimada Total"
          value={`$${estimatedFineTotal.toFixed(2)}`}
          color="orange"
        />
      </div>

      {/* Para la Búsqueda */}
      <SearchBar placeholder="Buscar por miembro o libro..." />

      {/* Las Tablas */}
      <div className="overflow-x-auto relative shadow-md sm:rounded-lg">
        <table className="w-full text-sm text-left text-gray-500">
          <thead className="text-xs text-gray-700 uppercase bg-gray-50">
            <tr>
              <th scope="col" className="py-3 px-6">
                Miembro
              </th>
              <th scope="col" className="py-3 px-6">
                Libro
              </th>
              <th scope="col" className="py-3 px-6">
                Fecha Vencimiento
              </th>
              <th scope="col" className="py-3 px-6">
                Días Atraso
              </th>
              <th scope="col" className="py-3 px-6">
                Multa Sugerida
              </th>
            </tr>
          </thead>
          <tbody>
            {loans.map((loan) => (
              <tr key={loan.loan_id} className="bg-white border-b hover:bg-gray-50">
                <td className="py-4 px-6">{loan.member_name}</td>
                <td className="py-4 px-6">{loan.book_title}</td>
                <td className="py-4 px-6">
                  {new Date(loan.due_at).toLocaleDateString()}
                </td>
                <td className="py-4 px-6">
                  <span className="bg-red-100 text-red-800 text-xs font-medium px-2.5 py-0.5 rounded">
                    {loan.dias_atraso} días
                  </span>
                </td>
                <td className="py-4 px-6 font-semibold">
                  ${parseFloat(loan.suggested_fine).toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* La Paginación */}
      <Pagination totalPages={totalPages} />
    </div>
  );
}