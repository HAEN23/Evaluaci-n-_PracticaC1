"use client";

import { usePathname, useSearchParams } from 'next/navigation';
import Link from 'next/link';

export function Pagination({ totalPages }: { totalPages: number }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentPage = Number(searchParams.get('page')) || 1;

  const createPageURL = (pageNumber: number | string) => {
    const params = new URLSearchParams(searchParams);
    params.set('page', pageNumber.toString());
    return `${pathname}?${params.toString()}`;
  };

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <nav className="flex justify-center">
      <ul className="inline-flex -space-x-px">
        {currentPage > 1 && (
          <li>
            <Link
              href={createPageURL(currentPage - 1)}
              className="px-3 py-2 ml-0 leading-tight text-gray-500 bg-white border border-gray-300 rounded-l-lg hover:bg-gray-100 hover:text-gray-700"
            >
              Anterior
            </Link>
          </li>
        )}
        {pages.map((page) => (
          <li key={page}>
            <Link
              href={createPageURL(page)}
              className={`px-3 py-2 leading-tight ${
                currentPage === page
                  ? 'text-blue-600 bg-blue-50 border border-blue-300'
                  : 'text-gray-500 bg-white border border-gray-300 hover:bg-gray-100 hover:text-gray-700'
              }`}
            >
              {page}
            </Link>
          </li>
        ))}
        {currentPage < totalPages && (
          <li>
            <Link
              href={createPageURL(currentPage + 1)}
              className="px-3 py-2 leading-tight text-gray-500 bg-white border border-gray-300 rounded-r-lg hover:bg-gray-100 hover:text-gray-700"
            >
              Siguiente
            </Link>
          </li>
        )}
      </ul>
    </nav>
  );
}