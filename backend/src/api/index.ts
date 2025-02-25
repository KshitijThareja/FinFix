import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { calculateLoanSchedule } from './utils/loanCalculator';
import { validateLoanInput } from './utils/validators';
import config from './config_prod';
import { authenticateToken } from './middleware/auth';

// Load environment variables
dotenv.config();

const app = express();
const PORT = config.PORT || 8000;

// Middleware
app.use(cors({ origin: config.FRONTEND_URL || 'http://localhost:3000' }));
app.use(express.json());

// Supabase client (for routes; auth middleware has its own instance)
const supabase = createClient(config.SUPABASE_URL!, config.SUPABASE_SERVICE_ROLE_KEY!);

// Extend Request type for routes
interface AuthRequest extends Request {
  user?: any; // Refine this if you import Supabase's User type globally
}

// GET all loans for a user
app.get('/api/loans', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { data, error } = await supabase
      .from('loans')
      .select('*')
      .eq('user_id', req.user!.id) // Non-null assertion since authenticateToken ensures user exists
      .order('created_at', { ascending: false });

    if (error) throw error;

    res.status(200).json(data);
  } catch (error: any) {
    console.error('Error fetching loans:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET a specific loan with its repayment schedule
app.get('/api/loans/:id', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    // Get loan details
    const { data: loan, error: loanError } = await supabase
      .from('loans')
      .select('*')
      .eq('id', req.params.id)
      .eq('user_id', req.user!.id)
      .single();

    if (loanError) throw loanError;

    if (!loan) {
      res.status(404).json({ error: 'Loan not found' });
    }

    // Get repayment schedule
    const { data: schedule, error: scheduleError } = await supabase
      .from('repayment_schedules')
      .select('*')
      .eq('loan_id', req.params.id)
      .order('payment_number', { ascending: true });

    if (scheduleError) throw scheduleError;

    res.status(200).json({ loan, schedule });
  } catch (error: any) {
    console.error('Error fetching loan details:', error);
    res.status(500).json({ error: error.message });
  }
});

// POST create a new loan and generate repayment schedule
app.post('/api/loans', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const {
      disbursement_date,
      principal_amount,
      tenure,
      emi_frequency,
      interest_rate,
      moratorium_period,
    } = req.body;

    // Validate input
    const validationError = validateLoanInput(req.body);
    if (validationError) {
      res.status(400).json({ error: validationError });
    }

    // Create loan record
    const { data: loan, error: loanError } = await supabase
      .from('loans')
      .insert([
        {
          user_id: req.user!.id,
          disbursement_date,
          principal_amount,
          tenure,
          emi_frequency,
          interest_rate,
          moratorium_period: moratorium_period || 0,
        },
      ])
      .select()
      .single();

    if (loanError) throw loanError;

    // Calculate repayment schedule
    const schedule = calculateLoanSchedule({
      disbursement_date,
      principal_amount,
      tenure,
      emi_frequency,
      interest_rate,
      moratorium_period: moratorium_period || 0,
    });

    // Insert repayment schedule entries
    const scheduleRecords = schedule.map((entry) => ({
      loan_id: loan.id,
      payment_number: entry.payment_number,
      payment_date: entry.payment_date,
      opening_balance: entry.opening_balance,
      principal_payment: entry.principal_payment,
      interest_payment: entry.interest_payment,
      total_payment: entry.total_payment,
      closing_balance: entry.closing_balance,
    }));

    const { error: scheduleError } = await supabase
      .from('repayment_schedules')
      .insert(scheduleRecords);

    if (scheduleError) throw scheduleError;

    res.status(201).json({
      loan,
      schedule,
    });
  } catch (error: any) {
    console.error('Error creating loan:', error);
    res.status(500).json({ error: error.message });
  }
});

// DELETE a loan
app.delete('/api/loans/:id', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    // Check if loan exists and belongs to user
    const { data: loan, error: loanError } = await supabase
      .from('loans')
      .select('id')
      .eq('id', req.params.id)
      .eq('user_id', req.user!.id)
      .single();

    if (loanError) throw loanError;

    if (!loan) {
      res.status(404).json({ error: 'Loan not found' });
    }

    // Delete loan (and cascade to repayment_schedules)
    const { error: deleteError } = await supabase
      .from('loans')
      .delete()
      .eq('id', req.params.id);

    if (deleteError) throw deleteError;

    res.status(200).json({ message: 'Loan deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting loan:', error);
    res.status(500).json({ error: error.message });
  }
});

// Global error handler
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error('Unhandled error:', err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});