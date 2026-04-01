import React, { useEffect, useMemo, useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { useAuth } from '@/context/AuthContext';
import { deposit, withdraw, transfer, getAccountsByCustomer, lookupRecipientByAccountNumber } from '@/services/mockApi';
import FormInput from '@/components/FormInput';
import Alert from '@/components/Alert';
import LoadingSpinner from '@/components/LoadingSpinner';
import type { Account, RecipientLookup } from '@/types/Account';

type Tab = 'deposit' | 'withdraw' | 'transfer';

const Transactions: React.FC = () => {
  const { customerId, customerName } = useAuth();
  const [tab, setTab] = useState<Tab>('deposit');
  const [accountId, setAccountId] = useState('');
  const [toAccountId, setToAccountId] = useState('');
  const [destinationMode, setDestinationMode] = useState<'MY_ACCOUNT' | 'OTHER_ACCOUNT'>('MY_ACCOUNT');
  const [manualAccountNumber, setManualAccountNumber] = useState('');
  const [manualLookupLoading, setManualLookupLoading] = useState(false);
  const [resolvedRecipient, setResolvedRecipient] = useState<RecipientLookup | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [accountsLoading, setAccountsLoading] = useState(true);
  const [fromAccounts, setFromAccounts] = useState<Account[]>([]);
  const [alert, setAlert] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const loadAccounts = async () => {
    if (!customerId) return;
    setAccountsLoading(true);
    try {
      const mine = await getAccountsByCustomer(customerId);
      setFromAccounts(mine);

      if (!accountId && mine.length > 0) {
        setAccountId(String(mine[0].id));
      }
    } finally {
      setAccountsLoading(false);
    }
  };

  useEffect(() => {
    loadAccounts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [customerId]);

  const selectedFromAccount = useMemo(
    () => fromAccounts.find((a) => a.id === parseInt(accountId)),
    [fromAccounts, accountId]
  );

  const myDestinationAccounts = useMemo(
    () => fromAccounts.filter((a) => String(a.id) !== accountId),
    [fromAccounts, accountId]
  );

  const selectedDestinationMine = useMemo(
    () => fromAccounts.find((a) => String(a.id) === toAccountId),
    [fromAccounts, toAccountId]
  );

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!accountId.trim()) errs.accountId = 'From account is required';
    if (tab === 'transfer' && destinationMode === 'MY_ACCOUNT' && !toAccountId.trim()) {
      errs.toAccountId = 'To account is required';
    }
    if (tab === 'transfer' && destinationMode === 'MY_ACCOUNT' && accountId && toAccountId && accountId === toAccountId) {
      errs.toAccountId = 'Cannot transfer to the same account';
    }
    if (tab === 'transfer' && destinationMode === 'OTHER_ACCOUNT') {
      if (!manualAccountNumber.trim()) {
        errs.manualAccountNumber = 'Destination account number is required';
      } else if (!/^\d{7}$/.test(manualAccountNumber.trim())) {
        errs.manualAccountNumber = 'Account number must be 7 digits';
      } else if (!resolvedRecipient) {
        errs.manualAccountNumber = 'Please verify destination account first';
      }
    }
    if (!amount.trim()) errs.amount = 'Amount is required';
    else if (parseFloat(amount) <= 0) errs.amount = 'Amount must be positive';
    else if (tab === 'withdraw' && selectedFromAccount && parseFloat(amount) > selectedFromAccount.balance) {
      errs.amount = 'Cannot withdraw more than account balance';
    }
    else if (tab === 'transfer' && selectedFromAccount && parseFloat(amount) > selectedFromAccount.balance) {
      errs.amount = 'Cannot transfer more than account balance';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleVerifyManualAccount = async () => {
    const normalized = manualAccountNumber.trim();
    if (!/^\d{7}$/.test(normalized)) {
      setErrors((prev) => ({ ...prev, manualAccountNumber: 'Account number must be 7 digits' }));
      return;
    }

    if (selectedFromAccount?.accountNumber === normalized) {
      setErrors((prev) => ({ ...prev, manualAccountNumber: 'Cannot transfer to the same account' }));
      return;
    }

    setManualLookupLoading(true);
    try {
      const recipient = await lookupRecipientByAccountNumber(normalized);
      if (recipient.customerId === customerId) {
        setErrors((prev) => ({ ...prev, manualAccountNumber: 'Use My Account option for your own accounts' }));
        setResolvedRecipient(null);
        return;
      }
      setResolvedRecipient(recipient);
      setErrors((prev) => {
        const next = { ...prev };
        delete next.manualAccountNumber;
        return next;
      });
    } catch (err: any) {
      setResolvedRecipient(null);
      setErrors((prev) => ({ ...prev, manualAccountNumber: err.message || 'Account not found' }));
    } finally {
      setManualLookupLoading(false);
    }
  };

  const executeTransfer = async () => {
    const amt = parseFloat(amount);
    const accId = parseInt(accountId);
    const destinationId = destinationMode === 'MY_ACCOUNT'
      ? parseInt(toAccountId)
      : resolvedRecipient!.accountId;

    await transfer({ fromAccountId: accId, toAccountId: destinationId, amount: amt });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    setAlert(null);
    try {
      const amt = parseFloat(amount);
      const accId = parseInt(accountId);
      if (tab === 'deposit') {
        await deposit({ accountId: accId, amount: amt });
      } else if (tab === 'withdraw') {
        await withdraw({ accountId: accId, amount: amt });
      } else {
        setShowConfirmModal(true);
        setLoading(false);
        return;
      }

      await loadAccounts();
      window.dispatchEvent(new CustomEvent('bank:transactions-updated'));

      setAlert({ type: 'success', message: `${tab.charAt(0).toUpperCase() + tab.slice(1)} successful!` });
      if (tab !== 'transfer') {
        setToAccountId('');
      }
      setAmount('');
    } catch (err: any) {
      setAlert({ type: 'error', message: err.message || 'Transaction failed' });
    } finally {
      setLoading(false);
    }
  };

  const confirmTransfer = async () => {
    setLoading(true);
    setAlert(null);
    try {
      await executeTransfer();
      await loadAccounts();
      window.dispatchEvent(new CustomEvent('bank:transactions-updated'));
      setAlert({ type: 'success', message: 'Transfer successful!' });
      setShowConfirmModal(false);
      setToAccountId('');
      setManualAccountNumber('');
      setResolvedRecipient(null);
      setAmount('');
    } catch (err: any) {
      setAlert({ type: 'error', message: err.message || 'Transfer failed' });
      setShowConfirmModal(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout title="Transactions">
      <div className="max-w-lg">
        {alert && <div className="mb-4"><Alert type={alert.type} message={alert.message} onClose={() => setAlert(null)} /></div>}

        <div className="form-card">
          {accountsLoading ? (
            <div className="py-8 flex justify-center">
              <LoadingSpinner size="md" />
            </div>
          ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-medium text-foreground mb-1 block">Transaction Type</label>
              <select
                value={tab}
                onChange={(e) => {
                  setTab(e.target.value as Tab);
                  setAlert(null);
                  setErrors({});
                  setToAccountId('');
                  setManualAccountNumber('');
                  setResolvedRecipient(null);
                }}
                className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground"
              >
                <option value="deposit">Deposit</option>
                <option value="withdraw">Withdraw</option>
                <option value="transfer">Transfer</option>
              </select>
            </div>

            <div>
              <label className="text-sm font-medium text-foreground mb-1 block">From Account</label>
              <select
                value={accountId}
                onChange={(e) => setAccountId(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground"
              >
                {fromAccounts.length === 0 ? (
                  <option value="">No accounts found</option>
                ) : (
                  fromAccounts.map((acc) => (
                    <option key={acc.id} value={acc.id}>
                      {acc.accountNumber} - {acc.accountType.replace('_', ' ')} - ${acc.balance.toFixed(2)}
                    </option>
                  ))
                )}
              </select>
              {errors.accountId && <p className="mt-1 text-sm text-destructive">{errors.accountId}</p>}
            </div>

            {tab === 'transfer' && (
              <>
                <div>
                  <label className="text-sm font-medium text-foreground mb-1 block">Transfer Destination Type</label>
                  <select
                    value={destinationMode}
                    onChange={(e) => {
                      const mode = e.target.value as 'MY_ACCOUNT' | 'OTHER_ACCOUNT';
                      setDestinationMode(mode);
                      setToAccountId('');
                      setManualAccountNumber('');
                      setResolvedRecipient(null);
                      setErrors({});
                    }}
                    className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground"
                  >
                    <option value="MY_ACCOUNT">Transfer to my another account</option>
                    <option value="OTHER_ACCOUNT">Send to another user account number</option>
                  </select>
                </div>

                {destinationMode === 'MY_ACCOUNT' ? (
                  <div>
                    <label className="text-sm font-medium text-foreground mb-1 block">To Account (My Account)</label>
                    <select
                      value={toAccountId}
                      onChange={(e) => setToAccountId(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground"
                    >
                      <option value="">Select destination account</option>
                      {myDestinationAccounts.map((acc) => (
                        <option key={acc.id} value={acc.id}>
                          {acc.accountNumber} - {acc.accountType.replace('_', ' ')}
                        </option>
                      ))}
                    </select>
                    {errors.toAccountId && <p className="mt-1 text-sm text-destructive">{errors.toAccountId}</p>}
                    {selectedDestinationMine && (
                      <p className="mt-1 text-xs text-muted-foreground">Receiver Name: {customerName || 'Current User'}</p>
                    )}
                  </div>
                ) : (
                  <div>
                    <label className="text-sm font-medium text-foreground mb-1 block">Destination Account Number</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={manualAccountNumber}
                        onChange={(e) => {
                          const val = e.target.value.replace(/\D/g, '').slice(0, 7);
                          setManualAccountNumber(val);
                          setResolvedRecipient(null);
                        }}
                        placeholder="Enter 7-digit account number"
                        className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground"
                      />
                      <button
                        type="button"
                        onClick={handleVerifyManualAccount}
                        disabled={manualLookupLoading}
                        className="px-4 py-2 rounded-lg border border-border text-sm font-medium hover:bg-secondary"
                      >
                        {manualLookupLoading ? 'Checking...' : 'Verify'}
                      </button>
                    </div>
                    {errors.manualAccountNumber && <p className="mt-1 text-sm text-destructive">{errors.manualAccountNumber}</p>}
                    {resolvedRecipient && (
                      <p className="mt-1 text-xs text-success">Receiver Name: {resolvedRecipient.customerName}</p>
                    )}
                  </div>
                )}
              </>
            )}
            <FormInput label="Amount ($)" type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0.00" error={errors.amount} required />
            <button type="submit" disabled={loading} className="w-full py-3 rounded-lg bg-primary text-primary-foreground font-semibold hover:opacity-90 transition-all disabled:opacity-50 flex items-center justify-center gap-2">
              {loading && <LoadingSpinner size="sm" />}
              {loading ? 'Processing...' : `Submit ${tab.charAt(0).toUpperCase() + tab.slice(1)}`}
            </button>
          </form>
          )}
        </div>
      </div>

      {showConfirmModal && tab === 'transfer' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-card border border-border rounded-2xl shadow-2xl w-full max-w-md p-6 space-y-4">
            <h3 className="text-lg font-display font-bold text-foreground">Confirm Transfer</h3>
            <div className="rounded-lg bg-secondary/50 p-4 text-sm space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">From Account</span>
                <span className="font-medium text-foreground">{selectedFromAccount?.accountNumber ?? '—'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Receiver Name</span>
                <span className="font-medium text-foreground">
                  {destinationMode === 'MY_ACCOUNT'
                    ? (customerName || 'Current User')
                    : (resolvedRecipient?.customerName ?? '—')}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Amount</span>
                <span className="font-semibold text-primary">${(parseFloat(amount) || 0).toFixed(2)}</span>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setShowConfirmModal(false)}
                className="flex-1 py-2.5 rounded-lg border border-border text-foreground text-sm font-medium hover:bg-secondary"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmTransfer}
                disabled={loading}
                className="flex-1 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 disabled:opacity-50"
              >
                {loading ? 'Transferring...' : 'Confirm Transfer'}
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default Transactions;
