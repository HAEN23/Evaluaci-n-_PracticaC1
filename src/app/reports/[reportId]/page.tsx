import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { z } from 'zod';


import { getMostBorrowedBooks } from '../../lib/queries/mostBorrowedBooks';
import { getOverdueLoans } from '../../lib/queries/overdueLoans';
import { getFinesSummary } from '../../lib/queries/finesSummary';
import { getMemberActivity } from '../../lib/queries/memberActivity';
import { getInventoryHealth } from '../../lib/queries/invetoryHealth';


import { MostBorrowedBooksReport } from '../1/MostBorrowedBooksReport';
import { OverdueLoansReport } from '../2/OverdueLoansReport';
import { FinesSummaryReport } from '../3/FinesSummary.Report';
import { MemberActivityReport } from '../4/MemberActivityReport';
import { InventoryHealthReport } from '../5/InventoryHealthReport';

const searchParamsSchema = z.object({
  search: z.string().optional().default(''),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(5).max(50).default(10),
});



async function MostBorrowedBooksPage({ search, page, limit }: z.infer<typeof searchParamsSchema>) {
  const data = await getMostBorrowedBooks(search, page, limit);
  return <MostBorrowedBooksReport {...data} />;
}

async function OverdueLoansPage({ search, page, limit }: z.infer<typeof searchParamsSchema>) {
  const data = await getOverdueLoans(search, page, limit);
  return <OverdueLoansReport {...data} />;
}

async function FinesSummaryPage({ search, page, limit }: z.infer<typeof searchParamsSchema>) {
  const data = await getFinesSummary(search, page, limit);
  return <FinesSummaryReport {...data} />;
}

async function MemberActivityPage({ search, page, limit }: z.infer<typeof searchParamsSchema>) {
  const data = await getMemberActivity(search, page, limit);
  return <MemberActivityReport {...data} />;
}

async function InventoryHealthPage({ search, page, limit }: z.infer<typeof searchParamsSchema>) {
  const data = await getInventoryHealth(search, page, limit);
  return <InventoryHealthReport {...data} />;
}



const reportComponents: { [key: string]: React.ComponentType<any> } = {
  '1': MostBorrowedBooksPage,
  '2': OverdueLoansPage,
  '3': FinesSummaryPage,
  '4': MemberActivityPage,
  '5': InventoryHealthPage,
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

  const searchParamsResolved = await searchParams;
  const validatedParams = searchParamsSchema.parse(searchParamsResolved || {});

  return (
    <div className="container mx-auto px-4 py-8">
      <Suspense fallback={<div className="text-center text-lg">Cargando reporte...</div>}>
        <ReportComponent {...validatedParams} />
      </Suspense>
    </div>
  );
}