import { isValid, parseISO } from 'date-fns';

interface LoanInput {
  disbursement_date: string;
  principal_amount: number;
  tenure: number;
  emi_frequency: string;
  interest_rate: number;
  moratorium_period?: number;
}

export function validateLoanInput(input: LoanInput): string | null {
  const { 
    disbursement_date, 
    principal_amount, 
    tenure, 
    emi_frequency, 
    interest_rate, 
    moratorium_period 
  } = input;
  
  // Check for missing required fields
  if (!disbursement_date) return 'Disbursement date is required';
  if (!principal_amount) return 'Principal amount is required';
  if (!tenure) return 'Tenure is required';
  if (!emi_frequency) return 'EMI frequency is required';
  if (!interest_rate && interest_rate !== 0) return 'Interest rate is required';
  
  // Validate disbursement date format
  const parsedDate = parseISO(disbursement_date);
  if (!isValid(parsedDate)) return 'Invalid disbursement date format. Please use YYYY-MM-DD';
  
  // Validate principal amount
  if (isNaN(principal_amount) || principal_amount <= 0) {
    return 'Principal amount must be a positive number';
  }
  
  // Validate tenure
  if (!Number.isInteger(tenure) || tenure <= 0) {
    return 'Tenure must be a positive integer';
  }
  
  // Validate EMI frequency
  const validFrequencies = ['monthly', 'quarterly', 'semi-annually', 'annually'];
  if (!validFrequencies.includes(emi_frequency)) {
    return `EMI frequency must be one of: ${validFrequencies.join(', ')}`;
  }
  
  // Validate interest rate
  if (isNaN(interest_rate) || interest_rate < 0) {
    return 'Interest rate must be a non-negative number';
  }
  
  // Validate moratorium period if provided
  if (moratorium_period !== undefined) {
    if (!Number.isInteger(moratorium_period) || moratorium_period < 0) {
      return 'Moratorium period must be a non-negative integer';
    }
    
    if (moratorium_period >= tenure) {
      return 'Moratorium period must be less than the loan tenure';
    }
  }
  
  return null; // No validation errors
}