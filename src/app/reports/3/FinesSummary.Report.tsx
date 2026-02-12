import { SearchBar } from '@/components/SearchBar';
import { Pagination } from '@/components/Pagination';
import KpiCard  from '@/components/KpiCard';

interface Fine {
  summary_month: string;
  total_fines_amount: string;
  paid_fines_amount: string;
  pending_fines_amount: string;
  number_of_fines: number;
}

interface Props {
  fines: Fine[];
  totalItems: number;
  totalPages: number;
  totalFinesAmount: number;
  totalPaidAmount: number;
  totalPendingAmount: number;
}

export function FinesSummaryReport({
  fines,
  totalItems,
  totalPages,
  totalFinesAmount,
  totalPaidAmount,
  totalPendingAmount,
}: Props) {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold">Resumen de Multas por Mes</h2>

      {/* KPIs */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          title="Total Multas"
          value={`$${totalFinesAmount.toFixed(2)}`}
          color="blue"
        />
        <KpiCard
          title="Multas Pagadas"
          value={`$${totalPaidAmount.toFixed(2)}`}
          color="green"
        />
        <KpiCard
          title="Multas Pendientes"
          value={`$${totalPendingAmount.toFixed(2)}`}
          color="orange"
        />
        <KpiCard
          title="Meses Registrados"
          value={totalItems.toString()}
          color="purple"
        />
      </div>

      {/* Búsqueda */}
      <SearchBar placeholder="Buscar por mes (ej: 2026-01)..." />

      {/* Tablas */}
      <div className="overflow-x-auto relative shadow-md sm:rounded-lg">
        <table className="w-full text-sm text-left text-gray-500">
          <thead className="text-xs text-gray-700 uppercase bg-gray-50">
            <tr>
              <th scope="col" className="py-3 px-6">
                Mes
              </th>
              <th scope="col" className="py-3 px-6">
                Total Multas
              </th>
              <th scope="col" className="py-3 px-6">
                Multas Pagadas
              </th>
              <th scope="col" className="py-3 px-6">
                Multas Pendientes
              </th>
              <th scope="col" className="py-3 px-6">
                Cantidad de Multas
              </th>
            </tr>
          </thead>
          <tbody>
            {fines.map((fine, index) => (
              <tr key={index} className="bg-white border-b hover:bg-gray-50">
                <td className="py-4 px-6 font-medium">{fine.summary_month}</td>
                <td className="py-4 px-6 font-semibold">
                  ${parseFloat(fine.total_fines_amount).toFixed(2)}
                </td>
                <td className="py-4 px-6 text-green-600">
                  ${parseFloat(fine.paid_fines_amount).toFixed(2)}
                </td>
                <td className="py-4 px-6 text-orange-600">
                  ${parseFloat(fine.pending_fines_amount).toFixed(2)}
                </td>
                <td className="py-4 px-6">{fine.number_of_fines}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Paginación */}
      <Pagination totalPages={totalPages} />
    </div>
  );
}