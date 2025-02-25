"use client"
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/utils/authContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { PlusIcon, TrashIcon, FileTextIcon, Loader2Icon } from 'lucide-react';
import { formatCurrency, formatDate } from '@/app/utils/formatters';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Skeleton } from '@/components/ui/skeleton';

interface Loan {
  id: string;
  disbursement_date: string;
  principal_amount: number;
  tenure: number;
  emi_frequency: string;
  interest_rate: number;
  moratorium_period: number;
  created_at: string;
}

export default function LoansPage() {
  const { user, session_token } = useAuth();
  const [loans, setLoans] = useState<Loan[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (user && session_token) {
      fetchLoans();
    }
  }, [user, session_token]);

  const fetchLoans = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/loans/`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session_token.access_token}`,
          ...(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY && { 'apikey': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY })
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch loans');
      }

      const data = await response.json();
      setLoans(data);
    } catch (error) {
      console.error('Error fetching loans:', error);
    } finally {
      setLoading(false);
    }
  };

  const deleteLoan = async (id: string) => {
    try {
      setDeletingId(id);
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/loans/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${session_token?.access_token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to delete loan');
      }

      setLoans(loans.filter(loan => loan.id !== id));
    } catch (error) {
      console.error('Error deleting loan:', error);
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-4 bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Your Loans</h1>
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-64 w-full" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Your Loans</h1>
        <Button onClick={() => router.push('/loans/create')} className=" bg-blue-600 text-white dark:bg-blue-500 dark:hover:bg-blue-600">
          <PlusIcon className="h-4 w-4 mr-2" />
          Create New Loan
        </Button>
      </div>

      {loans.length === 0 ? (
        <Card className="text-center py-12 bg-white dark:bg-gray-800 shadow-md dark:shadow-gray-700">
          <CardContent>
            <p className="text-lg mb-4 text-gray-900 dark:text-gray-100">You don't have any loans yet.</p>
            <Button onClick={() => router.push('/loans/create')} className=" bg-blue-600 text-white dark:bg-blue-500 dark:hover:bg-blue-600">
              <PlusIcon className="h-4 w-4 mr-2" />
              Create Your First Loan
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {loans.map((loan) => (
            <Card key={loan.id} className="relative bg-white dark:bg-gray-800 shadow-md dark:shadow-gray-700">
              <CardHeader>
                <CardTitle className="text-lg text-gray-900 dark:text-white">
                  {formatCurrency(loan.principal_amount)}
                </CardTitle>
                <CardDescription className="text-gray-600 dark:text-gray-300">
                  Disbursed on {formatDate(loan.disbursement_date)}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-300">Tenure:</span>
                    <span className="text-gray-900 dark:text-white">{loan.tenure} months</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-300">Interest Rate:</span>
                    <span className="text-gray-900 dark:text-white">{loan.interest_rate}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-300">Payment Frequency:</span>
                    <span className="text-gray-900 dark:text-white capitalize">{loan.emi_frequency}</span>
                  </div>
                  {loan.moratorium_period > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-300">Moratorium:</span>
                      <span className="text-gray-900 dark:text-white">{loan.moratorium_period} months</span>
                    </div>
                  )}
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline" onClick={() => router.push(`/loans/${loan.id}`)} className="text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700">
                  <FileTextIcon className="h-4 w-4 mr-2" />
                  View Details
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" size="icon" className="bg-red-600 text-white dark:bg-red-500 dark:hover:bg-red-600">
                      {deletingId === loan.id ? (
                        <Loader2Icon className="h-4 w-4 animate-spin" />
                      ) : (
                        <TrashIcon className="h-4 w-4" />
                      )}
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent className="bg-white dark:bg-gray-800">
                    <AlertDialogHeader>
                      <AlertDialogTitle className="text-gray-900 dark:text-white">Delete Loan</AlertDialogTitle>
                      <AlertDialogDescription className="text-gray-600 dark:text-gray-300">
                        Are you sure you want to delete this loan? This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel className="text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600">Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={() => deleteLoan(loan.id)} className="bg-red-600 text-white dark:bg-red-500 dark:hover:bg-red-600">
                        {deletingId === loan.id ? (
                          <Loader2Icon className="h-4 w-4 animate-spin mr-2" />
                        ) : null}
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}