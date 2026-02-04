import Link from 'next/link';

const reports = [
  { 
    id: 'most-borrowed-books', 
    title: 'Libros Más Prestados', 
    description: 'Ranking de los libros más populares',
    color: 'from-orange-400 to-orange-600'
  },
  { 
    id: 'overdue-loans', 
    title: 'Préstamos Vencidos', 
    description: 'Préstamos que superaron la fecha de devolución',
    color: 'from-red-400 to-red-600'
  },
  { 
    id: 'fines-summary', 
    title: 'Resumen de Multas', 
    description: 'Análisis mensual de multas',
    color: 'from-blue-400 to-blue-600'
  },
  { 
    id: 'member-activity', 
    title: 'Actividad de Miembros', 
    description: 'Estadísticas de préstamos por miembro',
    color: 'from-green-400 to-green-600'
  },
  { 
    id: 'inventory-health', 
    title: 'Salud del Inventario', 
    description: 'Estado del inventario por categoría',
    color: 'from-purple-400 to-purple-600'
  },
];

export default function HomePage() {
  return (
    <main className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-4xl font-bold text-gray-900 text-center">
            Dashboard de Reportes de Biblioteca
          </h1>
          <p className="mt-2 text-center text-gray-600 max-w-2xl mx-auto">
            Explora reportes detallados, análisis de préstamos y estadísticas de la biblioteca.
          </p>
        </div>
      </header>

      {/* Reports Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 pt-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {reports.map((report) => (
            <Link 
              key={report.id} 
              href={`/reports/${report.id}`}
              className="group"
            >
              <div className="card-modern overflow-hidden h-full flex flex-col">
                {/* Image Placeholder with Gradient */}
                <div className={`relative h-64 bg-gradient-to-br ${report.color} flex items-center justify-center`}>
                  {report.badge && (
                    <span className="absolute top-4 left-4 badge-new">
                      {report.badge}
                    </span>
                  )}
                  <span className="absolute top-4 right-4 text-white opacity-0 group-hover:opacity-100 transition-opacity">
                    ↗
                  </span>
                  <div className="text-white text-6xl opacity-30">
                    {report.id === 'most-borrowed-books' && '📖'}
                    {report.id === 'overdue-loans' && '⏰'}
                    {report.id === 'fines-summary' && '💵'}
                    {report.id === 'member-activity' && '👤'}
                    {report.id === 'inventory-health' && '📊'}
                  </div>
                </div>

                {/* Content */}
                <div className="p-6 flex-1 flex flex-col">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                    {report.title}
                  </h3>
                  <p className="text-sm text-gray-600 flex-1">
                    {report.description}
                  </p>
                  <div className="mt-4 flex items-center justify-between text-sm">
                    <span className="text-gray-500">Ver reporte</span>
                    <span className="font-semibold text-gray-900">→</span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}