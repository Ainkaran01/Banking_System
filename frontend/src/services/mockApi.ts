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

function addTransaction(tx: Omit<Transaction, 'id' | 'date'>): Transaction {
  const transactions = getStore<Transaction>(KEYS.transactions);
  const full: Transaction = { ...tx, id: nextId(), date: new Date().toISOString() };
  transactions.push(full);
  setStore(KEYS.transactions, transactions);
  return full;
}

export async function deposit(payload: DepositPayload): Promise<Transaction> {
  await delay();
  const accounts = getStore<Account>(KEYS.accounts);
  const idx = accounts.findIndex((a) => a.id === payload.accountId);
  if (idx === -1) throw new Error('Account not found');
  accounts[idx].balance += payload.amount;
  setStore(KEYS.accounts, accounts);
  return addTransaction({ accountId: payload.accountId, type: 'DEPOSIT', amount: payload.amount });
}

export async function withdraw(payload: WithdrawPayload): Promise<Transaction> {
  await delay();
  const accounts = getStore<Account>(KEYS.accounts);
  const idx = accounts.findIndex((a) => a.id === payload.accountId);
  if (idx === -1) throw new Error('Account not found');
  if (accounts[idx].balance < payload.amount) throw new Error('Insufficient balance');
  accounts[idx].balance -= payload.amount;
  setStore(KEYS.accounts, accounts);
  return addTransaction({ accountId: payload.accountId, type: 'WITHDRAWAL', amount: payload.amount });
}

export async function transfer(payload: TransferPayload): Promise<Transaction> {
  await delay();
  const accounts = getStore<Account>(KEYS.accounts);
  const fromIdx = accounts.findIndex((a) => a.id === payload.fromAccountId);
  const toIdx = accounts.findIndex((a) => a.id === payload.toAccountId);
  if (fromIdx === -1) throw new Error('Source account not found');
  if (toIdx === -1) throw new Error('Destination account not found');
  if (accounts[fromIdx].balance < payload.amount) throw new Error('Insufficient balance');
  accounts[fromIdx].balance -= payload.amount;
  accounts[toIdx].balance += payload.amount;
  setStore(KEYS.accounts, accounts);
  return addTransaction({
    accountId: payload.fromAccountId,
    type: 'TRANSFER',
    amount: payload.amount,
    toAccountId: payload.toAccountId,
  });
}

export async function getTransactionsByAccount(accountId: number): Promise<Transaction[]> {
  await delay(300);
  return getStore<Transaction>(KEYS.transactions)
    .filter((t) => t.accountId === accountId || t.toAccountId === accountId)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

// ─── LOANS ──────────────────────────────────────────────────

export async function applyLoan(payload: LoanApplicationPayload): Promise<Loan> {
  await delay();
  const loans = getStore<Loan>(KEYS.loans);
  const loan: Loan = {
    id: nextId(),
    customerId: payload.customerId,
    loanType: payload.loanType,
    amount: payload.amount,
    status: 'PENDING',
    appliedAt: new Date().toISOString(),
  };
  loans.push(loan);
  setStore(KEYS.loans, loans);
  return loan;
}

export async function getLoansByCustomer(customerId: number): Promise<Loan[]> {
  await delay(300);
  return getStore<Loan>(KEYS.loans).filter((l) => l.customerId === customerId);
}
