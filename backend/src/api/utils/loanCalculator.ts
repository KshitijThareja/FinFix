import { addMonths, addDays, format, parseISO } from 'date-fns';

interface LoanInput {
  disbursement_date: string;
  principal_amount: number;
  tenure: number;  // in months
  emi_frequency: 'monthly' | 'quarterly' | 'semi-annually' | 'annually';
  interest_rate: number;  // annual rate in percentage
  moratorium_period: number;  // in months
}

interface ScheduleEntry {
  payment_number: number;
  payment_date: string;
  opening_balance: number;
  principal_payment: number;
  interest_payment: number;
  total_payment: number;
  closing_balance: number;
}

export function calculateLoanSchedule(loan: LoanInput): ScheduleEntry[] {
  const {
    disbursement_date,
    principal_amount,
    tenure,
    emi_frequency,
    interest_rate,
    moratorium_period
  } = loan;
  
  // Convert interest rate from annual percentage to monthly decimal
  const monthlyInterestRate = interest_rate / 100 / 12;
  
  // Determine payment frequency in months
  let paymentFrequencyMonths = 1; // default monthly
  switch (emi_frequency) {
    case 'quarterly':
      paymentFrequencyMonths = 3;
      break;
    case 'semi-annually':
      paymentFrequencyMonths = 6;
      break;
    case 'annually':
      paymentFrequencyMonths = 12;
      break;
  }
  
  // Calculate number of payments
  const totalPayments = Math.ceil(tenure / paymentFrequencyMonths);
  
  // Calculate EMI using the formula: P * r * (1+r)^n / ((1+r)^n - 1)
  // where P = principal, r = periodic interest rate, n = total number of payments
  const periodicInterestRate = monthlyInterestRate * paymentFrequencyMonths;
  const emi = principal_amount * periodicInterestRate * Math.pow(1 + periodicInterestRate, totalPayments) 
            / (Math.pow(1 + periodicInterestRate, totalPayments) - 1);
  
  const schedule: ScheduleEntry[] = [];
  let balance = principal_amount;
  let startDate = new Date(disbursement_date);
  
  // Handle moratorium period (if any)
  if (moratorium_period > 0) {
    // During moratorium, only interest is paid, no principal reduction
    for (let i = 0; i < Math.ceil(moratorium_period / paymentFrequencyMonths); i++) {
      // Calculate interest for this period
      const interestForPeriod = balance * periodicInterestRate;
      
      // Calculate payment date
      const paymentDate = addMonths(startDate, paymentFrequencyMonths * (i + 1));
      
      schedule.push({
        payment_number: i + 1,
        payment_date: format(paymentDate, 'yyyy-MM-dd'),
        opening_balance: roundToTwo(balance),
        principal_payment: 0,
        interest_payment: roundToTwo(interestForPeriod),
        total_payment: roundToTwo(interestForPeriod),
        closing_balance: roundToTwo(balance)
      });
    }
    
    // Adjust start date for regular payments
    startDate = addMonths(startDate, moratorium_period);
  }
  
  // Calculate regular payments after moratorium
  const remainingPayments = totalPayments - schedule.length;
  
  for (let i = 0; i < remainingPayments; i++) {
    const paymentNumber = schedule.length + 1;
    const interestForPeriod = balance * periodicInterestRate;
    let principalForPeriod = emi - interestForPeriod;
    
    // For the last payment, adjust to clear the remaining balance
    if (i === remainingPayments - 1 || principalForPeriod > balance) {
      principalForPeriod = balance;
    }
    
    const paymentDate = addMonths(startDate, paymentFrequencyMonths * i);
    const totalPayment = principalForPeriod + interestForPeriod;
    
    schedule.push({
      payment_number: paymentNumber,
      payment_date: format(paymentDate, 'yyyy-MM-dd'),
      opening_balance: roundToTwo(balance),
      principal_payment: roundToTwo(principalForPeriod),
      interest_payment: roundToTwo(interestForPeriod),
      total_payment: roundToTwo(totalPayment),
      closing_balance: roundToTwo(balance - principalForPeriod)
    });
    
    balance -= principalForPeriod;
    
    // Break if balance is cleared
    if (balance <= 0) {
      break;
    }
  }
  
  return schedule;
}

// Helper function to round to 2 decimal places
function roundToTwo(num: number): number {
  return Math.round((num + Number.EPSILON) * 100) / 100;
}