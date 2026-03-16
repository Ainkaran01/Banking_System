import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { useAuth } from '@/context/AuthContext';
import { getAccountsByCustomer, getTransactionsByAccount } from '@/services/mockApi';
import FormInput from '@/components/FormInput';
import Alert from '@/components/Alert';
import LoadingSpinner from '@/components/LoadingSpinner';
import type { Account } from '@/types/Account';
import type { Transaction } from '@/types/Transaction';

const TransactionHistory: React.FC = () => {
  const { customerId } = useAuth();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [selectedAccountId, setSelectedAccountId] = useState('');
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [alert, setAlert] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    getAccountsByCustomer(customerId!).then(setAccounts).catch(() => {});
  }, [customerId]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAccountId.trim()) return;
    setLoading(true);
    setAlert(null);
    try {
      const txs = await getTransactionsByAccount(parseInt(selectedAccountId));
      setTransactions(txs);
      setSearched(true);
      if (txs.length === 0) {
        setAlert({ type: 'error', message: 'No transactions found for this account.' });
      }
    } catch (err: any) {
      setAlert({ type: 'error', message: err.message || 'Failed to fetch transactions' });
      setTransactions([]);
      setSearched(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout title="Transaction History">
      <div className="max-w-3xl">
        {alert && <div className="mb-4"><Alert type={alert.type} message={alert.message} onClose={() => setAlert(null)} /></div>}

        <form onSubmit={handleSearch} className="flex gap-3 mb-6 items-end">
          <div className="flex-1">
            {accounts.length > 0 ? (
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground">Select Account</label>
                <select
                  value={selectedAccountId}
                  onChange={(e) => setSelectedAccountId(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all"
                >
                  <option value="">Choose an account...</option>
                  {accounts.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.accountType.replace('_', ' ')} — ID: {a.id} — ${a.balance.toFixed(2)}
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              <FormInput label="Account ID" value={selectedAccountId} onChange={(e) => setSelectedAccountId(e.target.value)} placeholder="Enter Account ID" />
            )}
          </div>
          <button type="submit" disabled={loading || !selectedAccountId} className="px-6 py-3 rounded-lg bg-primary text-primary-foreground font-semibold hover:opacity-90 transition-all disabled:opacity-50 flex items-center gap-2">
            {loading && <LoadingSpinner size="sm" />}
            Search
          </button>
        </form>

        {loading && <div className="flex justify-center py-10"><LoadingSpinner size="lg" /></div>}

        {!loading && searched && transactions.length > 0 && (
          <div className="glass-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-secondary/50">
                    <th className="text-left py-3 px-4 text-muted-foreground font-medium">Transaction ID</th>
                    <th className="text-left py-3 px-4 text-muted-foreground font-medium">Account ID</th>
                    <th className="text-left py-3 px-4 text-muted-foreground font-medium">Type</th>
                    <th className="text-right py-3 px-4 text-muted-foreground font-medium">Amount</th>
                    <th className="text-right py-3 px-4 text-muted-foreground font-medium">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((tx) => (
                    <tr key={tx.id} className="border-t border-border/50 hover:bg-secondary/30 transition-colors">
                      <td className="py-3 px-4 text-foreground font-medium">{tx.id}</td>
                      <td className="py-3 px-4 text-foreground">{tx.accountId}</td>
                      <td className="py-3 px-4">
                        <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          tx.type === 'DEPOSIT' ? 'bg-success/10 text-success' :
                          tx.type === 'WITHDRAWAL' ? 'bg-destructive/10 text-destructive' :
                          'bg-primary/10 text-primary'
                        }`}>{tx.type}</span>
                      </td>
                      <td className="py-3 px-4 text-right font-medium text-foreground">${tx.amount.toFixed(2)}</td>
                      <td className="py-3 px-4 text-right text-muted-foreground">{new Date(tx.date).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default TransactionHistory;
