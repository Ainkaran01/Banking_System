import React, { useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { deposit, withdraw, transfer } from '@/services/mockApi';
import FormInput from '@/components/FormInput';
import Alert from '@/components/Alert';
import LoadingSpinner from '@/components/LoadingSpinner';
import { ArrowDownToLine, ArrowUpFromLine, ArrowLeftRight } from 'lucide-react';

type Tab = 'deposit' | 'withdraw' | 'transfer';

const tabsList: { key: Tab; label: string; icon: React.FC<{ className?: string }> }[] = [
  { key: 'deposit', label: 'Deposit', icon: ArrowDownToLine },
  { key: 'withdraw', label: 'Withdraw', icon: ArrowUpFromLine },
  { key: 'transfer', label: 'Transfer', icon: ArrowLeftRight },
];

const Transactions: React.FC = () => {
  const [tab, setTab] = useState<Tab>('deposit');
  const [accountId, setAccountId] = useState('');
  const [toAccountId, setToAccountId] = useState('');
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!accountId.trim()) errs.accountId = 'Account ID is required';
    if (tab === 'transfer' && !toAccountId.trim()) errs.toAccountId = 'Destination Account ID is required';
    if (!amount.trim()) errs.amount = 'Amount is required';
    else if (parseFloat(amount) <= 0) errs.amount = 'Amount must be positive';
    setErrors(errs);
    return Object.keys(errs).length === 0;
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
        await transfer({ fromAccountId: accId, toAccountId: parseInt(toAccountId), amount: amt });
      }
      setAlert({ type: 'success', message: `${tab.charAt(0).toUpperCase() + tab.slice(1)} successful!` });
      setAccountId('');
      setToAccountId('');
      setAmount('');
    } catch (err: any) {
      setAlert({ type: 'error', message: err.message || 'Transaction failed' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout title="Transactions">
      <div className="max-w-lg">
        <div className="flex gap-1 p-1 bg-secondary rounded-lg mb-6">
          {tabsList.map((t) => (
            <button
              key={t.key}
              onClick={() => { setTab(t.key); setAlert(null); setErrors({}); }}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-md text-sm font-medium transition-all ${
                tab === t.key ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <t.icon className="w-4 h-4" />
              {t.label}
            </button>
          ))}
        </div>

        {alert && <div className="mb-4"><Alert type={alert.type} message={alert.message} onClose={() => setAlert(null)} /></div>}

        <div className="form-card">
          <form onSubmit={handleSubmit} className="space-y-4">
            <FormInput label={tab === 'transfer' ? 'From Account ID' : 'Account ID'} value={accountId} onChange={(e) => setAccountId(e.target.value)} placeholder="Enter account ID" error={errors.accountId} required />
            {tab === 'transfer' && (
              <FormInput label="To Account ID" value={toAccountId} onChange={(e) => setToAccountId(e.target.value)} placeholder="Enter destination account ID" error={errors.toAccountId} required />
            )}
            <FormInput label="Amount ($)" type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0.00" error={errors.amount} required />
            <button type="submit" disabled={loading} className="w-full py-3 rounded-lg bg-primary text-primary-foreground font-semibold hover:opacity-90 transition-all disabled:opacity-50 flex items-center justify-center gap-2">
              {loading && <LoadingSpinner size="sm" />}
              {loading ? 'Processing...' : `Submit ${tab.charAt(0).toUpperCase() + tab.slice(1)}`}
            </button>
          </form>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Transactions;
