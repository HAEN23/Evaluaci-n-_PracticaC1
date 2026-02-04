export function MostBorrowedTable({ books }: { books: any[] }) {
  return (
    <div className="overflow-x-auto relative shadow-md sm:rounded-lg">
      <table className="w-full text-sm text-left text-gray-500">
        <thead className="text-xs text-gray-700 uppercase bg-gray-50">
          <tr>
            <th scope="col" className="py-3 px-6">Título</th>
            <th scope="col" className="py-3 px-6">Autor</th>
            <th scope="col" className="py-3 px-6">Categoría</th>
            <th scope="col" className="py-3 px-6">Total Préstamos</th>
            <th scope="col" className="py-3 px-6">Ranking</th>
          </tr>
        </thead>
        <tbody>
          {books.map((book: any, index: number) => (
            <tr key={book.book_id || index} className="bg-white border-b hover:bg-gray-50">
              <td className="py-4 px-6 font-medium text-gray-900">{book.title}</td>
              <td className="py-4 px-6">{book.author}</td>
              <td className="py-4 px-6">{book.category}</td>
              <td className="py-4 px-6">{book.total_loans}</td>
              <td className="py-4 px-6">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  #{book.loan_rank}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}