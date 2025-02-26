import { addMonths, format } from 'date-fns';

interface LoanInput {
  disbursement_date: string;
  principal_amount: number;
  tenure: number;
  emi_frequency: 'monthly' | 'quarterly' | 'semi-annually' | 'annually';
  interest_rate: number;
  moratorium_period: number;
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
  
  const monthlyInterestRate = interest_rate / 100 / 12;
  
  let paymentFrequencyMonths = 1;
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
  
  const totalPayments = Math.ceil(tenure / paymentFrequencyMonths);
  const periodicInterestRate = monthlyInterestRate * paymentFrequencyMonths;
  const emi = principal_amount * periodicInterestRate * Math.pow(1 + periodicInterestRate, totalPayments) 
            / (Math.pow(1 + periodicInterestRate, totalPayments) - 1);
  
  const schedule: ScheduleEntry[] = [];
  let balance = principal_amount;
  let startDate = new Date(disbursement_date);
  
  if (moratorium_period > 0) {
    for (let i = 0; i < Math.ceil(moratorium_period / paymentFrequencyMonths); i++) {
      const interestForPeriod = balance * periodicInterestRate;      
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
    
    startDate = addMonths(startDate, moratorium_period);
  }
    const remainingPayments = totalPayments - schedule.length;
  
  for (let i = 0; i < remainingPayments; i++) {
    const paymentNumber = schedule.length + 1;
    const interestForPeriod = balance * periodicInterestRate;
    let principalForPeriod = emi - interestForPeriod;
    
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
    
    if (balance <= 0) {
      break;
    }
  }
  
  return schedule;
}

function roundToTwo(num: number): number {
  return Math.round((num + Number.EPSILON) * 100) / 100;
}