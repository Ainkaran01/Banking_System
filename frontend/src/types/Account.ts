export interface Account {
  id: number;
  accountNumber: string;
  customerId: number;
  accountType: 'SAVINGS' | 'CURRENT' | 'FIXED_DEPOSIT';
  balance: number;
  createdAt?: string;
  // Fixed Deposit specific
  maturityDate?: string;
  interestRate?: number;
  depositPeriod?: string;
  depositPeriodLabel?: string;
  initialDeposit?: number;
  maturityAmount?: number;
}

export interface CreateAccountPayload {
  customerId: number;
  accountType: string;
  depositPeriod?: string;
  initialDeposit?: number;
}

export interface RecipientLookup {
  accountId: number;
  accountNumber: string;
  customerName: string;
  customerId: number;
}
