import { SearchBar } from '@/components/SearchBar';
import { Pagination } from '@/components/Pagination';
import { MostBorrowedTable } from '@/components/MostBorrowedTable';
import KpiCard  from '@/components/KpiCard';

interface Book {
  book_id: string;
  title: string;
  author: string;
  category: string;
  total_loans: number;
  loan_rank: number;
}

interface Props {
  books: Book[];
  totalItems: number;
  totalPages: number;
}

export function MostBorrowedBooksReport({ books, totalItems, totalPages }: Props) {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold">Libros Más Prestados</h2>
      
      {/* KPIs */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <KpiCard title="Total de Préstamos" value={totalItems.toString()} />
      </div>

      {/* Búsqueda */}
      <SearchBar placeholder="Buscar por título o autor..." />

      {/* Tabla */}
      <MostBorrowedTable books={books} />

      {/* Paginación */}
      <Pagination totalPages={totalPages} />
    </div>
  );
}