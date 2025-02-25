// app/loans/create/page.tsx - Create loan form page
"use client"
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/utils/authContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeftIcon, Loader2Icon } from 'lucide-react';
import { DatePicker } from '@/components/ui/date-picker';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function CreateLoanPage() {
  const { user, session_token } = useAuth();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    disbursement_date: '',
    principal_amount: '',
    tenure: '',
    emi_frequency: 'monthly',
    interest_rate: '',
    moratorium_period: '0'
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData({ ...formData, [name]: value });
  };

  const handleDateChange = (date: Date | undefined) => {
    if (date) {
      setFormData({ ...formData, disbursement_date: date.toISOString().split('T')[0] });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const payload = {
        ...formData,
        user_id: session_token.user.id,
        principal_amount: parseFloat(formData.principal_amount),
        tenure: parseInt(formData.tenure, 10),
        interest_rate: parseFloat(formData.interest_rate),
        moratorium_period: parseInt(formData.moratorium_period, 10)
      };

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/loans`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session_token.access_token}`,
          ...(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY && { 'apikey': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY })
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create loan');
      }

      router.push(`/loans/${data.loan.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto p-4 bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      <Button variant="ghost" onClick={() => router.push('/loans')} className="mb-4 text-gray-600 dark:text-gray-300">
        <ArrowLeftIcon className="h-4 w-4 mr-2" />
        Back to Loans
      </Button>

      <Card className="max-w-2xl mx-auto bg-white dark:bg-gray-800 shadow-md dark:shadow-gray-700">
        <CardHeader>
          <CardTitle className="text-lg font-bold text-gray-900 dark:text-white">Create New Loan</CardTitle>
          <CardDescription className="text-gray-600 dark:text-gray-300">
            Enter the loan details to generate a repayment schedule.
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {error && (
              <Alert variant="destructive" className="bg-red-100 dark:bg-red-900">
                <AlertDescription className="text-red-700 dark:text-red-300">{error}</AlertDescription>
              </Alert>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="disbursement_date" className="text-gray-700 dark:text-gray-200">Disbursement Date</Label>
                <DatePicker
                  selected={formData.disbursement_date ? new Date(formData.disbursement_date) : undefined}
                  onSelect={handleDateChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="principal_amount" className="text-gray-700 dark:text-gray-200">Principal Amount</Label>
                <Input
                  id="principal_amount"
                  name="principal_amount"
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={formData.principal_amount}
                  onChange={handleChange}
                  placeholder="e.g. 10000"
                  required
                  className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="tenure" className="text-gray-700 dark:text-gray-200">Tenure (months)</Label>
                <Input
                  id="tenure"
                  name="tenure"
                  type="number"
                  min="1"
                  step="1"
                  value={formData.tenure}
                  onChange={handleChange}
                  placeholder="e.g. 24"
                  required
                  className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="emi_frequency" className="text-gray-700 dark:text-gray-200">EMI Frequency</Label>
                <Select
                  value={formData.emi_frequency}
                  onValueChange={(value) => handleSelectChange('emi_frequency', value)}
                >
                  <SelectTrigger className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100">
                    <SelectValue placeholder="Select frequency" className="text-gray-600 dark:text-gray-300" />
                  </SelectTrigger>
                  <SelectContent className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600">
                    <SelectItem value="monthly" className="text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700">Monthly</SelectItem>
                    <SelectItem value="quarterly" className="text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700">Quarterly</SelectItem>
                    <SelectItem value="semi-annually" className="text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700">Semi-annually</SelectItem>
                    <SelectItem value="annually" className="text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700">Annually</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="interest_rate" className="text-gray-700 dark:text-gray-200">Interest Rate (% per annum)</Label>
                <Input
                  id="interest_rate"
                  name="interest_rate"
                  type="number"
                  step="0.001"
                  min="0"
                  value={formData.interest_rate}
                  onChange={handleChange}
                  placeholder="e.g. 7.5"
                  required
                  className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="moratorium_period" className="text-gray-700 dark:text-gray-200">Moratorium Period (months)</Label>
                <Input
                  id="moratorium_period"
                  name="moratorium_period"
                  type="number"
                  min="0"
                  step="1"
                  value={formData.moratorium_period}
                  onChange={handleChange}
                  placeholder="e.g. 3"
                  className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100"
                />
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button type="button" variant="outline" onClick={() => router.push('/loans')} className="text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700">
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting} className="bg-blue-600 text-white dark:bg-blue-500 dark:hover:bg-blue-600">
              {isSubmitting && <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />}
              Generate Repayment Schedule
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}