import type { Account, CreateAccountPayload, RecipientLookup } from '@/types/Account';
import type { Transaction, DepositPayload, WithdrawPayload, TransferPayload } from '@/types/Transaction';
import type { Loan, LoanApplicationPayload } from '@/types/Loan';
import api from './api';

// Helper to simulate network delay
const delay = (ms = 500) => new Promise((r) => setTimeout(r, ms));

const extractErrorMessage = (error: any): string => {
  if (error?.response?.data?.message) return error.response.data.message;
  if (Array.isArray(error?.response?.data?.details) && error.response.data.details.length > 0) {
    return error.response.data.details[0];
  }
  return error?.message || 'Request failed';
};
const mapTransactionType = (type: string): Transaction['type'] => {
  if (type === 'DEPOSIT') return 'DEPOSIT';
  if (type === 'WITHDRAWAL') return 'WITHDRAWAL';
  return 'TRANSFER';
};

// LocalStorage keys
const KEYS = {
  customers: 'nb_customers',
  accounts: 'nb_accounts',
  transactions: 'nb_transactions',
  loans: 'nb_loans',
  nextId: 'nb_next_id',
};

function getStore<T>(key: string): T[] {
  try {
    return JSON.parse(localStorage.getItem(key) || '[]');
  } catch {
    return [];
  }
}

function setStore<T>(key: string, data: T[]) {
  localStorage.setItem(key, JSON.stringify(data));
}

function nextId(): number {
  const current = parseInt(localStorage.getItem(KEYS.nextId) || '1000');
  localStorage.setItem(KEYS.nextId, String(current + 1));
  return current;
}


// ─── ACCOUNTS ───────────────────────────────────────────────

export async function createAccount(payload: CreateAccountPayload): Promise<Account> {
  try {
    const body: Record<string, unknown> = {
      customerId: payload.customerId,
      accountType: payload.accountType,
    };
    if (payload.depositPeriod) body.depositPeriod = payload.depositPeriod;
    if (payload.initialDeposit !== undefined) body.initialDeposit = payload.initialDeposit;

    const { data } = await api.post('/accounts', body);
    return {
      id: data.id,
      accountNumber: data.accountNumber,
      customerId: data.customerId,
      accountType: data.accountType,
      balance: Number(data.balance),
      createdAt: data.createdAt,
      maturityDate: data.maturityDate ?? undefined,
      interestRate: data.interestRate !== null ? Number(data.interestRate) : undefined,
      depositPeriod: data.depositPeriod ?? undefined,
      depositPeriodLabel: data.depositPeriodLabel ?? undefined,
      initialDeposit: data.initialDeposit !== null ? Number(data.initialDeposit) : undefined,
      maturityAmount: data.maturityAmount !== null ? Number(data.maturityAmount) : undefined,
    };
  } catch (error: any) {
    throw new Error(extractErrorMessage(error));
  }
}

export async function getAccountsByCustomer(customerId: number): Promise<Account[]> {
  try {
    const { data } = await api.get(`/accounts/customer/${customerId}`);
    return data.map((item: any) => ({
      id: item.id,
      accountNumber: item.accountNumber,
      customerId: item.customerId,
      accountType: item.accountType,
      balance: Number(item.balance),
      createdAt: item.createdAt,
      maturityDate: item.maturityDate ?? undefined,
      interestRate: item.interestRate !== null ? Number(item.interestRate) : undefined,
      depositPeriod: item.depositPeriod ?? undefined,
      depositPeriodLabel: item.depositPeriodLabel ?? undefined,
      initialDeposit: item.initialDeposit !== null ? Number(item.initialDeposit) : undefined,
      maturityAmount: item.maturityAmount !== null ? Number(item.maturityAmount) : undefined,
    }));
  } catch (error: any) {
    throw new Error(extractErrorMessage(error));
  }
}

export async function getAllAccounts(): Promise<Account[]> {
  try {
    const { data } = await api.get('/accounts');
    return data.map((item: any) => ({
      id: item.id,
      accountNumber: item.accountNumber,
      customerId: item.customerId,
      accountType: item.accountType,
      balance: Number(item.balance),
      createdAt: item.createdAt,
      maturityDate: item.maturityDate ?? undefined,
      interestRate: item.interestRate !== null ? Number(item.interestRate) : undefined,
      depositPeriod: item.depositPeriod ?? undefined,
      depositPeriodLabel: item.depositPeriodLabel ?? undefined,
      initialDeposit: item.initialDeposit !== null ? Number(item.initialDeposit) : undefined,
      maturityAmount: item.maturityAmount !== null ? Number(item.maturityAmount) : undefined,
    }));
  } catch (error: any) {
    throw new Error(extractErrorMessage(error));
  }
}

export async function lookupRecipientByAccountNumber(accountNumber: string): Promise<RecipientLookup> {
  try {
    const { data } = await api.get(`/accounts/lookup/${accountNumber}`);
    return {
      accountId: data.accountId,
      accountNumber: data.accountNumber,
      customerName: data.customerName,
      customerId: data.customerId,
    };
  } catch (error: any) {
    throw new Error(extractErrorMessage(error));
  }
}

// ─── TRANSACTIONS ───────────────────────────────────────────

export async function deposit(payload: DepositPayload): Promise<Transaction> {
  try {
    const { data } = await api.post('/transactions/deposit', payload);
    return {
      id: data.id,
      accountId: data.accountId,
      amount: Number(data.amount),
      type: mapTransactionType(data.type),
      toAccountId: data.relatedAccountId ?? undefined,
      date: data.createdAt,
    };
  } catch (error: any) {
    throw new Error(extractErrorMessage(error));
  }
}

export async function withdraw(payload: WithdrawPayload): Promise<Transaction> {
  try {
    const { data } = await api.post('/transactions/withdraw', payload);
    return {
      id: data.id,
      accountId: data.accountId,
      amount: Number(data.amount),
      type: mapTransactionType(data.type),
      toAccountId: data.relatedAccountId ?? undefined,
      date: data.createdAt,
    };
  } catch (error: any) {
    throw new Error(extractErrorMessage(error));
  }
}

export async function transfer(payload: TransferPayload): Promise<Transaction> {
  try {
    const { data } = await api.post('/transactions/transfer', payload);
    return {
      id: data.id,
      accountId: data.accountId,
      amount: Number(data.amount),
      type: 'TRANSFER',
      toAccountId: data.relatedAccountId ?? undefined,
      date: data.createdAt,
    };
  } catch (error: any) {
    throw new Error(extractErrorMessage(error));
  }
}

export async function getTransactionsByAccount(accountId: number): Promise<Transaction[]> {
  try {
    const { data } = await api.get(`/transactions/${accountId}`);
    return data.map((item: any) => ({
      id: item.id,
      accountId: item.accountId,
      amount: Number(item.amount),
      type: mapTransactionType(item.type),
      toAccountId: item.relatedAccountId ?? undefined,
      date: item.createdAt,
    }));
  } catch (error: any) {
    throw new Error(extractErrorMessage(error));
  }
}


// ─── LOANS ──────────────────────────────────────────────────

export async function applyLoan(payload: LoanApplicationPayload): Promise<Loan> {
  try {
    const { data } = await api.post('/loans/apply', payload);
    return {
      id: data.id,
      customerId: data.customerId,
      loanType: data.loanType,
      amount: Number(data.amount),
      status: data.status,
      appliedAt: data.appliedAt,
    };
  } catch (error: any) {
    throw new Error(extractErrorMessage(error));
  }
}

export async function getLoansByCustomer(customerId: number): Promise<Loan[]> {
  try {
    const { data } = await api.get(`/loans/customer/${customerId}`);
    return data.map((item: any) => ({
      id: item.id,
      customerId: item.customerId,
      loanType: item.loanType,
      amount: Number(item.amount),
      status: item.status,
      appliedAt: item.appliedAt,
    }));
  } catch (error: any) {
    throw new Error(extractErrorMessage(error));
  }
}
