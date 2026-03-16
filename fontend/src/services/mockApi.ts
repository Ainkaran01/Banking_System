import type { Customer, RegisterPayload, LoginPayload, AuthResponse } from '@/types/Customer';
import type { Account, CreateAccountPayload } from '@/types/Account';
import type { Transaction, DepositPayload, WithdrawPayload, TransferPayload } from '@/types/Transaction';
import type { Loan, LoanApplicationPayload } from '@/types/Loan';

// Helper to simulate network delay
const delay = (ms = 500) => new Promise((r) => setTimeout(r, ms));

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

// ─── AUTH / CUSTOMERS ───────────────────────────────────────

export async function registerCustomer(payload: RegisterPayload): Promise<Customer> {
  await delay();
  const customers = getStore<Customer>(KEYS.customers);
  if (customers.find((c) => c.email === payload.email)) {
    throw new Error('Email already registered');
  }
  const customer: Customer = { id: nextId(), ...payload };
  customers.push(customer);
  setStore(KEYS.customers, customers);
  return customer;
}

export async function loginCustomer(payload: LoginPayload): Promise<AuthResponse> {
  await delay();
  const customers = getStore<Customer>(KEYS.customers);
  const customer = customers.find((c) => c.email === payload.email && c.password === payload.password);
  if (!customer) throw new Error('Invalid email or password');
  return {
    token: `mock-token-${customer.id}-${Date.now()}`,
    customerId: customer.id,
    name: customer.name,
    email: customer.email,
  };
}

// ─── ACCOUNTS ───────────────────────────────────────────────

export async function createAccount(payload: CreateAccountPayload): Promise<Account> {
  await delay();
  const accounts = getStore<Account>(KEYS.accounts);
  const account: Account = {
    id: nextId(),
    customerId: payload.customerId,
    accountType: payload.accountType as Account['accountType'],
    balance: 0,
    createdAt: new Date().toISOString(),
  };
  accounts.push(account);
  setStore(KEYS.accounts, accounts);
  return account;
}

export async function getAccountsByCustomer(customerId: number): Promise<Account[]> {
  await delay(300);
  return getStore<Account>(KEYS.accounts).filter((a) => a.customerId === customerId);
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
