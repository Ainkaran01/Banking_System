import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { useAuth } from '@/context/AuthContext';
import { getAccountsByCustomer, getTransactionsByAccount, getLoansByCustomer } from '@/services/mockApi';
import LoadingSpinner from '@/components/LoadingSpinner';
import { Wallet, CreditCard, ArrowUpDown, TrendingUp, Lock } from 'lucide-react';
import type { Account } from '@/types/Account';
import type { Transaction } from '@/types/Transaction';
import type { Loan } from '@/types/Loan';

const Dashboard: React.FC = () => {
  const { customerId } = useAuth();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loans, setLoans] = useState<Loan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [accs, fetchedLoans] = await Promise.all([
          getAccountsByCustomer(customerId!),
          getLoansByCustomer(customerId!),
        ]);
        setAccounts(accs);
        setLoans(fetchedLoans);

        // Gather recent transactions from all accounts
        const allTx: Transaction[] = [];
        for (const acc of accs) {
          const txs = await getTransactionsByAccount(acc.id);
          allTx.push(...txs);
        }
        const unique = Array.from(new Map(allTx.map(t => [t.id, t])).values());
        unique.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        setTransactions(unique.slice(0, 5));
      } catch {
        // silent
      } finally {
        setLoading(false);
      }
    };
    const handleRefresh = () => {
      fetchData();
    };

    fetchData();
    window.addEventListener('bank:transactions-updated', handleRefresh);

    return () => {
      window.removeEventListener('bank:transactions-updated', handleRefresh);
    };
  }, [customerId]);

  const totalBalance = accounts.reduce((sum, a) => sum + (a.balance || 0), 0);

  const stats = [
    { label: 'Total Accounts', value: accounts.length, icon: CreditCard, color: 'text-primary' },
    { label: 'Total Balance', value: `$${totalBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}`, icon: Wallet, color: 'text-accent' },
    { label: 'Recent Transactions', value: transactions.length, icon: ArrowUpDown, color: 'text-warning' },
    { label: 'Active Loans', value: loans.filter(l => l.status === 'PENDING' || l.status === 'APPROVED').length, icon: TrendingUp, color: 'text-success' },
  ];

  const loanStatusColor: Record<string, string> = {
    PENDING: 'bg-warning/10 text-warning',
    APPROVED: 'bg-success/10 text-success',
    REJECTED: 'bg-destructive/10 text-destructive',
    DISBURSED: 'bg-primary/10 text-primary',
    CLOSED: 'bg-muted text-muted-foreground',
  };

  return (
    <DashboardLayout title="Dashboard">
      {loading ? (
        <div className="flex justify-center py-20"><LoadingSpinner size="lg" /></div>
      ) : (
        <>
          {/* ── Stats ── */}
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

          {/* ── Accounts ── */}
          <div className="glass-card p-6 mb-6">
            <h2 className="text-lg font-display font-semibold text-foreground mb-4">Your Accounts</h2>
            {accounts.length === 0 ? (
              <p className="text-muted-foreground text-sm">No accounts yet. Create one to get started.</p>
            ) : (
              <div className="space-y-3">
                {accounts.map((acc) => {
                  const isFD = acc.accountType === 'FIXED_DEPOSIT';
                  const isMatured = isFD && acc.maturityDate && new Date(acc.maturityDate) <= new Date();
                  return (
                    <div key={acc.id} className="p-4 rounded-lg bg-secondary/50 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {isFD && <Lock className="w-4 h-4 text-warning shrink-0" />}
                          <div>
                            <p className="font-medium text-foreground">
                              {acc.accountType.replace('_', ' ')} Account
                            </p>
                            <p className="text-xs text-muted-foreground">A/C: {acc.accountNumber} (ID: {acc.id})</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-display font-bold text-foreground">
                            ${(acc.balance || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                          </p>
                          {isFD && <p className="text-xs text-muted-foreground">Maturity value</p>}
                        </div>
                      </div>

                      {isFD && (
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-xs border-t border-border/50">
                          <div>
                            <p className="text-muted-foreground">Principal</p>
                            <p className="font-medium text-foreground">
                              ${(acc.initialDeposit ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                            </p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Rate</p>
                            <p className="font-medium text-success">{acc.interestRate}% p.a.</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Period</p>
                            <p className="font-medium text-foreground">{acc.depositPeriodLabel ?? acc.depositPeriod ?? '—'}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Matures</p>
                            <p className={`font-medium ${isMatured ? 'text-success' : 'text-warning'}`}>
                              {acc.maturityDate
                                ? new Date(acc.maturityDate).toLocaleDateString('en-LK')
                                : '—'}
                              {isMatured && ' ✓'}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* ── Recent Transactions ── */}
          <div className="glass-card p-6 mb-6">
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

          {/* ── Loans ── */}
          <div className="glass-card p-6">
            <h2 className="text-lg font-display font-semibold text-foreground mb-4">Your Loans</h2>
            {loans.length === 0 ? (
              <p className="text-muted-foreground text-sm">No loan applications yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-3 px-2 text-muted-foreground font-medium">ID</th>
                      <th className="text-left py-3 px-2 text-muted-foreground font-medium">Type</th>
                      <th className="text-right py-3 px-2 text-muted-foreground font-medium">Amount</th>
                      <th className="text-left py-3 px-2 text-muted-foreground font-medium">Status</th>
                      <th className="text-right py-3 px-2 text-muted-foreground font-medium">Applied</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loans.map((loan) => (
                      <tr key={loan.id} className="border-b border-border/50">
                        <td className="py-3 px-2 text-foreground">{loan.id}</td>
                        <td className="py-3 px-2 text-foreground capitalize">{loan.loanType.replace('_', ' ')}</td>
                        <td className="py-3 px-2 text-right font-medium text-foreground">
                          ${loan.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="py-3 px-2">
                          <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${loanStatusColor[loan.status] ?? 'bg-muted text-muted-foreground'}`}>
                            {loan.status}
                          </span>
                        </td>
                        <td className="py-3 px-2 text-right text-muted-foreground">
                          {loan.appliedAt ? new Date(loan.appliedAt).toLocaleDateString() : '—'}
                        </td>
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
