export interface Loan {
  id: number;
  customerId: number;
  loanType: string;
  amount: number;
  status: string;
  appliedAt?: string;
}

export interface LoanApplicationPayload {
  customerId: number;
  loanType: string;
  amount: number;
}
