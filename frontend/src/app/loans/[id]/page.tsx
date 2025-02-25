"use client"; // Mark as a Client Component

import React, { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/utils/authContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeftIcon, DownloadIcon, Loader2Icon, PrinterIcon } from 'lucide-react';
import { formatCurrency, formatDate } from '@/app/utils/formatters';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import LoanRepaymentChart from '@/components/LoanRepaymentChart';

interface Profile {
  id: string;
  user_id: string;
  full_name: string;
  username: string;
  avatar_url: string;
  created_at: string;
  updated_at: string;
}

interface Loan {
  id: string;
  disbursement_date: string;
  principal_amount: number;
  tenure: number;
  emi_frequency: string;
  interest_rate: number;
  moratorium_period: number;
  created_at: string;
  profile?: Profile;
}

interface ScheduleEntry {
  id: string;
  loan_id: string;
  payment_number: number;
  payment_date: string;
  opening_balance: number;
  principal_payment: number;
  interest_payment: number;
  total_payment: number;
  closing_balance: number;
}

type Params = {
  id: Promise<string>;
};

export default function LoanDetailsPage({ params }: { params: Params }) {
  const { id } = use(params); // Unwrap params.id using React.use()
  const { user, session_token } = useAuth();
  const router = useRouter();
  const [loan, setLoan] = useState<Loan | null>(null);
  const [schedule, setSchedule] = useState<ScheduleEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      setError('Loan ID is missing');
      setLoading(false);
      return;
    }

    if (user && session_token) {
      fetchLoanDetails();
    }
  }, [user, session_token, id]);

  const fetchLoanDetails = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/loans/${id}`, {
        headers: {
          Authorization: `Bearer ${session_token?.access_token}`,
        },
      });

      if (!response.ok) {
        if (response.status === 404) {
          router.push('/loans');
          return;
        }
        throw new Error('Failed to fetch loan details');
      }

      const data = await response.json();
      setLoan(data.loan);
      setSchedule(data.schedule);
    } catch (error) {
      console.error('Error fetching loan details:', error);
      setError(error.message || 'Failed to load loan details. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleExportCSV = () => {
    if (!loan || !schedule.length) return;

    const headers = [
      'Payment Number',
      'Payment Date',
      'Opening Balance',
      'Principal Payment',
      'Interest Payment',
      'Total Payment',
      'Closing Balance'
    ];

    const rows = schedule.map(entry => [
      entry.payment_number,
      formatDate(entry.payment_date),
      entry.opening_balance.toFixed(2),
      entry.principal_payment.toFixed(2),
      entry.interest_payment.toFixed(2),
      entry.total_payment.toFixed(2),
      entry.closing_balance.toFixed(2)
    ]);

    const loanInfo = [
      ['Loan Details:'],
      ['Borrower Name', loan.profile?.full_name || 'Unknown'],
      ['Principal Amount', formatCurrency(loan.principal_amount)],
      ['Interest Rate', `${loan.interest_rate}%`],
      ['Tenure', `${loan.tenure} months`],
      ['EMI Frequency', loan.emi_frequency.charAt(0).toUpperCase() + loan.emi_frequency.slice(1)],
      ['Disbursement Date', formatDate(loan.disbursement_date)],
      ['Moratorium Period', `${loan.moratorium_period} months`],
      ['']
    ];

    const csvContent = [
      ...loanInfo,
      headers,
      ...rows
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const filename = `loan_schedule_${loan.id}_${new Date().toISOString().split('T')[0]}.csv`;
    
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const calculateTotals = () => {
    if (!schedule.length) return { totalPrincipal: 0, totalInterest: 0, totalPayment: 0 };

    return schedule.reduce(
      (acc, entry) => {
        return {
          totalPrincipal: acc.totalPrincipal + entry.principal_payment,
          totalInterest: acc.totalInterest + entry.interest_payment,
          totalPayment: acc.totalPayment + entry.total_payment,
        };
      },
      { totalPrincipal: 0, totalInterest: 0, totalPayment: 0 }
    );
  };

  const totals = calculateTotals();

  if (loading) {
    return (
      <div className="container mx-auto p-4 bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
        <Button variant="ghost" onClick={() => router.push('/loans')} className="mb-4">
          <ArrowLeftIcon className="h-4 w-4 mr-2" />
          Back to Loans
        </Button>

        <div className="space-y-4">
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }

  if (!id || error || !loan) {
    return (
      <div className="container mx-auto p-4 bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
        <Button variant="ghost" onClick={() => router.push('/loans')} className="mb-4">
          <ArrowLeftIcon className="h-4 w-4 mr-2" />
          Back to Loans
        </Button>

        <Card className="bg-white dark:bg-gray-800 shadow-md dark:shadow-gray-700">
          <CardContent className="py-12 text-center text-gray-900 dark:text-gray-100">
            <p className="text-lg">{error || 'Loan not found or ID missing'}</p>
            <Button onClick={() => router.push('/loans')} className="mt-4">
              Return to Loans
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      <div className="print:hidden">
        <Button variant="ghost" onClick={() => router.push('/loans')} className="mb-4">
          <ArrowLeftIcon className="h-4 w-4 mr-2" />
          Back to Loans
        </Button>
      </div>

      <Card className="mb-6 bg-white dark:bg-gray-800 shadow-md dark:shadow-gray-700">
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-lg font-bold text-gray-900 dark:text-white">Loan Details</CardTitle>
              <CardDescription className="text-gray-600 dark:text-gray-300">
                {loan.profile?.full_name ? `For ${loan.profile.full_name}` : 'Created on'} {formatDate(loan.created_at)}
              </CardDescription>
            </div>
            <div className="print:hidden flex space-x-2">
              <Button variant="outline" size="sm" onClick={handlePrint}>
                <PrinterIcon className="h-4 w-4 mr-2" />
                Print
              </Button>
              <Button variant="outline" size="sm" onClick={handleExportCSV}>
                <DownloadIcon className="h-4 w-4 mr-2" />
                Export CSV
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div>
              <h3 className="text-sm font-medium text-gray-600 dark:text-gray-300">Borrower Name</h3>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">{loan.profile?.full_name || 'Unknown'}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-600 dark:text-gray-300">Principal Amount</h3>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">{formatCurrency(loan.principal_amount)}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-600 dark:text-gray-300">Interest Rate</h3>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">{loan.interest_rate}% p.a.</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-600 dark:text-gray-300">Tenure</h3>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">{loan.tenure} months</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-600 dark:text-gray-300">EMI Frequency</h3>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white capitalize">{loan.emi_frequency}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-600 dark:text-gray-300">Disbursement Date</h3>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">{formatDate(loan.disbursement_date)}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-600 dark:text-gray-300">Moratorium Period</h3>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">{loan.moratorium_period} months</p>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Loan Summary</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-primary/10 rounded-lg p-4 bg-gray-100 dark:bg-gray-800">
                <h4 className="text-sm font-medium text-gray-600 dark:text-gray-300">Total Principal</h4>
                <p className="text-2xl font-semibold text-gray-900 dark:text-white">{formatCurrency(totals.totalPrincipal)}</p>
              </div>
              <div className="bg-primary/10 rounded-lg p-4 bg-gray-100 dark:bg-gray-800">
                <h4 className="text-sm font-medium text-gray-600 dark:text-gray-300">Total Interest</h4>
                <p className="text-2xl font-semibold text-gray-900 dark:text-white">{formatCurrency(totals.totalInterest)}</p>
              </div>
              <div className="bg-primary/10 rounded-lg p-4 bg-gray-100 dark:bg-gray-800">
                <h4 className="text-sm font-medium text-gray-600 dark:text-gray-300">Total Payment</h4>
                <p className="text-2xl font-semibold text-gray-900 dark:text-white">{formatCurrency(totals.totalPayment)}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-white dark:bg-gray-800 shadow-md dark:shadow-gray-700">
        <CardHeader>
          <CardTitle className="text-lg font-bold text-gray-900 dark:text-white">Repayment Schedule</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="schedule">
            <TabsList className="print:hidden">
              <TabsTrigger value="schedule" className="text-gray-600 dark:text-gray-300 data-[state=active]:text-gray-900 data-[state=active]:dark:text-white">Schedule</TabsTrigger>
              <TabsTrigger value="chart" className="text-gray-600 dark:text-gray-300 data-[state=active]:text-gray-900 data-[state=active]:dark:text-white">Chart</TabsTrigger>
            </TabsList>
            <TabsContent value="schedule">
              <div className="overflow-x-auto">
                <Table>
                  <TableCaption className="text-gray-600 dark:text-gray-300">Loan repayment schedule for {formatCurrency(loan.principal_amount)} at {loan.interest_rate}% interest rate.</TableCaption>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-16 text-gray-600 dark:text-gray-300">No.</TableHead>
                      <TableHead className="text-gray-600 dark:text-gray-300">Payment Date</TableHead>
                      <TableHead className="text-right text-gray-600 dark:text-gray-300">Opening Balance</TableHead>
                      <TableHead className="text-right text-gray-600 dark:text-gray-300">Principal</TableHead>
                      <TableHead className="text-right text-gray-600 dark:text-gray-300">Interest</TableHead>
                      <TableHead className="text-right text-gray-600 dark:text-gray-300">Total Payment</TableHead>
                      <TableHead className="text-right text-gray-600 dark:text-gray-300">Closing Balance</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {schedule.map((entry) => (
                      <TableRow key={entry.payment_number}>
                        <TableCell className="text-gray-900 dark:text-gray-100">{entry.payment_number}</TableCell>
                        <TableCell className="text-gray-900 dark:text-gray-100">{formatDate(entry.payment_date)}</TableCell>
                        <TableCell className="text-right text-gray-900 dark:text-gray-100">{formatCurrency(entry.opening_balance)}</TableCell>
                        <TableCell className="text-right text-gray-900 dark:text-gray-100">{formatCurrency(entry.principal_payment)}</TableCell>
                        <TableCell className="text-right text-gray-900 dark:text-gray-100">{formatCurrency(entry.interest_payment)}</TableCell>
                        <TableCell className="text-right text-gray-900 dark:text-gray-100">{formatCurrency(entry.total_payment)}</TableCell>
                        <TableCell className="text-right text-gray-900 dark:text-gray-100">{formatCurrency(entry.closing_balance)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>
            <TabsContent value="chart" className="h-96">
              <LoanRepaymentChart scheduleData={schedule} />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}