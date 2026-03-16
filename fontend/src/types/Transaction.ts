export interface Transaction {
  id: number;
  accountId: number;
  type: 'DEPOSIT' | 'WITHDRAWAL' | 'TRANSFER';
  amount: number;
  date: string;
  toAccountId?: number;
}

export interface DepositPayload {
  accountId: number;
  amount: number;
}

export interface WithdrawPayload {
  accountId: number;
  amount: number;
}

export interface TransferPayload {
  fromAccountId: number;
  toAccountId: number;
  amount: number;
}
