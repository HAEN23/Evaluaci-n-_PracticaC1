import { SearchBar } from '@/components/SearchBar';
import { Pagination } from '@/components/Pagination';
import KpiCard  from '@/components/KpiCard';

interface InventoryItem {
  category: string;
  total_copies: number;
  available_copies: number;
  loaned_copies: number;
  lost_copies: number;
  availability_percentage: string;
}

interface Props {
  inventory: InventoryItem[];
  totalItems: number;
  totalPages: number;
  totalCopies: number;
  totalAvailable: number;
  totalLoaned: number;
  totalLost: number;
}

export function InventoryHealthReport({
  inventory,
  totalItems,
  totalPages,
  totalCopies,
  totalAvailable,
  totalLoaned,
  totalLost,
}: Props) {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold">Salud del Inventario por Categoría</h2>

      {/* KPIs */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <KpiCard title="Total Copias" value={totalCopies.toString()} color="blue" />
        <KpiCard title="Disponibles" value={totalAvailable.toString()} color="green" />
        <KpiCard title="Prestadas" value={totalLoaned.toString()} color="orange" />
        <KpiCard title="Perdidas" value={totalLost.toString()} color="red" />
      </div>

      {/* Búsqueda */}
      <SearchBar placeholder="Buscar por categoría..." />

      {/* Tablas */}
      <div className="overflow-x-auto relative shadow-md sm:rounded-lg">
        <table className="w-full text-sm text-left text-gray-500">
          <thead className="text-xs text-gray-700 uppercase bg-gray-50">
            <tr>
              <th scope="col" className="py-3 px-6">
                Categoría
              </th>
              <th scope="col" className="py-3 px-6">
                Total Copias
              </th>
              <th scope="col" className="py-3 px-6">
                Disponibles
              </th>
              <th scope="col" className="py-3 px-6">
                Prestadas
              </th>
              <th scope="col" className="py-3 px-6">
                Perdidas
              </th>
              <th scope="col" className="py-3 px-6">
                % Disponibilidad
              </th>
            </tr>
          </thead>
          <tbody>
            {inventory.map((item, index) => (
              <tr key={index} className="bg-white border-b hover:bg-gray-50">
                <td className="py-4 px-6 font-medium">{item.category}</td>
                <td className="py-4 px-6">{item.total_copies}</td>
                <td className="py-4 px-6 text-green-600 font-semibold">
                  {item.available_copies}
                </td>
                <td className="py-4 px-6 text-orange-600">{item.loaned_copies}</td>
                <td className="py-4 px-6 text-red-600">{item.lost_copies}</td>
                <td className="py-4 px-6">
                  <span
                    className={`text-xs font-medium px-2.5 py-0.5 rounded ${
                      parseFloat(item.availability_percentage) > 50
                        ? 'bg-green-100 text-green-800'
                        : parseFloat(item.availability_percentage) > 25
                        ? 'bg-orange-100 text-orange-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {parseFloat(item.availability_percentage).toFixed(1)}%
                  </span>
                </td>
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