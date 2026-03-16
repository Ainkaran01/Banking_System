export interface Account {
  id: number;
  customerId: number;
  accountType: 'SAVINGS' | 'CURRENT' | 'FIXED_DEPOSIT';
  balance: number;
  createdAt?: string;
}

export interface CreateAccountPayload {
  customerId: number;
  accountType: string;
}
