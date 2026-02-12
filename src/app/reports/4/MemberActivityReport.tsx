import { SearchBar } from '@/components/SearchBar';
import { Pagination } from '@/components/Pagination';
import KpiCard  from '@/components/KpiCard';

interface Member {
  member_id: string;
  member_name: string;
  email: string;
  joined_at: string;
  total_loans: number;
  overdue_rate_percentage: string;
}

interface Props {
  members: Member[];
  totalItems: number;
  totalPages: number;
  totalLoans: number;
  avgOverdueRate: number;
}

export function MemberActivityReport({
  members,
  totalItems,
  totalPages,
  totalLoans,
  avgOverdueRate,
}: Props) {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold">Actividad de Miembros</h2>

      {/* KPIs */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          title="Miembros Activos"
          value={totalItems.toString()}
          color="blue"
        />
        <KpiCard
          title="Total Préstamos"
          value={totalLoans.toString()}
          color="green"
        />
        <KpiCard
          title="Tasa Atraso Promedio"
          value={`${avgOverdueRate.toFixed(1)}%`}
          color="orange"
        />
      </div>

      {/* Búsqueda */}
      <SearchBar placeholder="Buscar por nombre o email..." />

      {/* Tablas */}
      <div className="overflow-x-auto relative shadow-md sm:rounded-lg">
        <table className="w-full text-sm text-left text-gray-500">
          <thead className="text-xs text-gray-700 uppercase bg-gray-50">
            <tr>
              <th scope="col" className="py-3 px-6">
                Nombre
              </th>
              <th scope="col" className="py-3 px-6">
                Email
              </th>
              <th scope="col" className="py-3 px-6">
                Fecha Registro
              </th>
              <th scope="col" className="py-3 px-6">
                Total Préstamos
              </th>
              <th scope="col" className="py-3 px-6">
                Tasa de Atraso
              </th>
            </tr>
          </thead>
          <tbody>
            {members.map((member) => (
              <tr key={member.member_id} className="bg-white border-b hover:bg-gray-50">
                <td className="py-4 px-6 font-medium">{member.member_name}</td>
                <td className="py-4 px-6">{member.email}</td>
                <td className="py-4 px-6">
                  {new Date(member.joined_at).toLocaleDateString()}
                </td>
                <td className="py-4 px-6">
                  <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded">
                    {member.total_loans}
                  </span>
                </td>
                <td className="py-4 px-6">
                  <span
                    className={`text-xs font-medium px-2.5 py-0.5 rounded ${
                      parseFloat(member.overdue_rate_percentage) > 20
                        ? 'bg-red-100 text-red-800'
                        : parseFloat(member.overdue_rate_percentage) > 10
                        ? 'bg-orange-100 text-orange-800'
                        : 'bg-green-100 text-green-800'
                    }`}
                  >
                    {parseFloat(member.overdue_rate_percentage).toFixed(1)}%
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