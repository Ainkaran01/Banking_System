import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { useAuth } from '@/context/AuthContext';
import { getAccountsByCustomer, getTransactionsByAccount } from '@/services/mockApi';
import LoadingSpinner from '@/components/LoadingSpinner';
import { Wallet, CreditCard, ArrowUpDown, TrendingUp } from 'lucide-react';
import type { Account } from '@/types/Account';
import type { Transaction } from '@/types/Transaction';

const Dashboard: React.FC = () => {
  const { customerId } = useAuth();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const accs = await getAccountsByCustomer(customerId!);
        setAccounts(accs);

        // Gather recent transactions from all accounts
        const allTx: Transaction[] = [];
        for (const acc of accs) {
          const txs = await getTransactionsByAccount(acc.id);
          allTx.push(...txs);
        }
        // Deduplicate by id & sort by date desc, take 5
        const unique = Array.from(new Map(allTx.map(t => [t.id, t])).values());
        unique.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        setTransactions(unique.slice(0, 5));
      } catch {
        // silent
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [customerId]);

  const totalBalance = accounts.reduce((sum, a) => sum + (a.balance || 0), 0);

  const stats = [
    { label: 'Total Accounts', value: accounts.length, icon: CreditCard, color: 'text-primary' },
    { label: 'Current Balance', value: `$${totalBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}`, icon: Wallet, color: 'text-accent' },
    { label: 'Recent Transactions', value: transactions.length, icon: ArrowUpDown, color: 'text-warning' },
    { label: 'Active Since', value: 'Today', icon: TrendingUp, color: 'text-success' },
  ];

  return (
    <DashboardLayout title="Dashboard">
      {loading ? (
        <div className="flex justify-center py-20"><LoadingSpinner size="lg" /></div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {stats.map((s) => (
              <div key={s.label} className="stat-card">
                <div className="flex items-center justify-between mb-3">
                  <s.icon className={`w-6 h-6 ${s.color}`} />
                </div>
                <p className="text-2xl font-display font-bold text-foreground">{s.value}</p>
                <p className="text-sm text-muted-foreground mt-1">{s.label}</p>
              </div>
            ))}
          </div>

          <div className="glass-card p-6 mb-6">
            <h2 className="text-lg font-display font-semibold text-foreground mb-4">Your Accounts</h2>
            {accounts.length === 0 ? (
              <p className="text-muted-foreground text-sm">No accounts yet. Create one to get started.</p>
            ) : (
              <div className="space-y-3">
                {accounts.map((acc) => (
                  <div key={acc.id} className="flex items-center justify-between p-4 rounded-lg bg-secondary/50">
                    <div>
                      <p className="font-medium text-foreground">{acc.accountType.replace('_', ' ')} Account</p>
                      <p className="text-xs text-muted-foreground">ID: {acc.id}</p>
                    </div>
                    <p className="font-display font-bold text-foreground">
                      ${(acc.balance || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="glass-card p-6">
            <h2 className="text-lg font-display font-semibold text-foreground mb-4">Recent Transactions</h2>
            {transactions.length === 0 ? (
              <p className="text-muted-foreground text-sm">No transactions yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-3 px-2 text-muted-foreground font-medium">ID</th>
                      <th className="text-left py-3 px-2 text-muted-foreground font-medium">Type</th>
                      <th className="text-right py-3 px-2 text-muted-foreground font-medium">Amount</th>
                      <th className="text-right py-3 px-2 text-muted-foreground font-medium">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactions.map((tx) => (
                      <tr key={tx.id} className="border-b border-border/50">
                        <td className="py-3 px-2 text-foreground">{tx.id}</td>
                        <td className="py-3 px-2">
                          <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${
                            tx.type === 'DEPOSIT' ? 'bg-success/10 text-success' :
                            tx.type === 'WITHDRAWAL' ? 'bg-destructive/10 text-destructive' :
                            'bg-primary/10 text-primary'
                          }`}>{tx.type}</span>
                        </td>
                        <td className="py-3 px-2 text-right font-medium text-foreground">${tx.amount.toFixed(2)}</td>
                        <td className="py-3 px-2 text-right text-muted-foreground">{new Date(tx.date).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </DashboardLayout>
  );
};

export default Dashboard;
