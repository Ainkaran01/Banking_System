import React, { useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { useAuth } from '@/context/AuthContext';
import { createAccount } from '@/services/mockApi';
import Alert from '@/components/Alert';
import LoadingSpinner from '@/components/LoadingSpinner';

const accountTypes = [
  { value: 'SAVINGS', label: 'Savings', desc: 'Earn interest on your deposits' },
  { value: 'CURRENT', label: 'Current', desc: 'For everyday transactions' },
  { value: 'FIXED_DEPOSIT', label: 'Fixed Deposit', desc: 'Higher interest, fixed term' },
];

const FD_PERIODS = [
  { value: 'DAYS_100', label: '100 Days', rate: 6.5 },
  { value: 'MONTHS_6', label: '6 Months', rate: 7.0 },
  { value: 'YEAR_1', label: '1 Year', rate: 8.0 },
  { value: 'YEARS_5', label: '5 Years', rate: 10.0 },
];

function calcMaturityAmount(principal: number, ratePct: number, days: number): number {
  return principal * (1 + (ratePct / 100) * (days / 365));
}

const fdDaysMap: Record<string, number> = {
  DAYS_100: 100,
  MONTHS_6: 182,
  YEAR_1: 365,
  YEARS_5: 1825,
};

const CreateAccount: React.FC = () => {
  const { customerId } = useAuth();
  const [selected, setSelected] = useState('SAVINGS');
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // FD modal state
  const [showFDModal, setShowFDModal] = useState(false);
  const [fdPeriod, setFdPeriod] = useState('DAYS_100');
  const [fdAmount, setFdAmount] = useState('');
  const [fdAmountError, setFdAmountError] = useState('');

  const selectedFdPeriod = FD_PERIODS.find((p) => p.value === fdPeriod)!;
  const fdAmountNum = parseFloat(fdAmount) || 0;
  const maturityPreview = fdAmountNum > 0
    ? calcMaturityAmount(fdAmountNum, selectedFdPeriod.rate, fdDaysMap[fdPeriod])
    : null;

  const handleCreate = async () => {
    if (selected === 'FIXED_DEPOSIT') {
      setFdAmount('');
      setFdAmountError('');
      setShowFDModal(true);
      return;
    }
    setLoading(true);
    setAlert(null);
    try {
      const account = await createAccount({ customerId: customerId!, accountType: selected });
      setAlert({ type: 'success', message: `Account created successfully! Account No: ${account.accountNumber} (ID: ${account.id})` });
    } catch (err: any) {
      setAlert({ type: 'error', message: err.message || 'Failed to create account' });
    } finally {
      setLoading(false);
    }
  };

  const handleFDConfirm = async () => {
    const amt = parseFloat(fdAmount);
    if (!fdAmount || isNaN(amt) || amt <= 0) {
      setFdAmountError('Please enter a valid deposit amount greater than 0');
      return;
    }
    setFdAmountError('');
    setLoading(true);
    setAlert(null);
    try {
      const account = await createAccount({
        customerId: customerId!,
        accountType: 'FIXED_DEPOSIT',
        depositPeriod: fdPeriod,
        initialDeposit: amt,
      });
      const maturity = account.maturityAmount?.toFixed(2) ?? '—';
      const matDate = account.maturityDate
        ? new Date(account.maturityDate).toLocaleDateString('en-LK', { year: 'numeric', month: 'long', day: 'numeric' })
        : '—';
      setShowFDModal(false);
      setAlert({
        type: 'success',
        message: `Fixed Deposit created! A/C: ${account.accountNumber} (ID: ${account.id}) | Period: ${selectedFdPeriod.label} @ ${selectedFdPeriod.rate}% | Maturity Amount: $${maturity} | Maturity Date: ${matDate}`,
      });
    } catch (err: any) {
      setAlert({ type: 'error', message: err.message || 'Failed to create Fixed Deposit' });
      setShowFDModal(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout title="Create Account">
      <div className="max-w-lg">
        {alert && (
          <div className="mb-4">
            <Alert type={alert.type} message={alert.message} onClose={() => setAlert(null)} />
          </div>
        )}
        <div className="form-card">
          <h2 className="text-lg font-display font-semibold text-foreground mb-4">Select Account Type</h2>
          <div className="space-y-3 mb-6">
            {accountTypes.map((t) => (
              <button
                key={t.value}
                onClick={() => setSelected(t.value)}
                className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                  selected === t.value ? 'border-primary bg-primary/5' : 'border-border hover:border-muted-foreground/30'
                }`}
              >
                <p className="font-medium text-foreground">{t.label}</p>
                <p className="text-sm text-muted-foreground">{t.desc}</p>
              </button>
            ))}
          </div>
          <button
            onClick={handleCreate}
            disabled={loading}
            className="w-full py-3 rounded-lg bg-primary text-primary-foreground font-semibold hover:opacity-90 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading && <LoadingSpinner size="sm" />}
            {loading ? 'Creating...' : selected === 'FIXED_DEPOSIT' ? 'Continue to Fixed Deposit Setup' : 'Create Account'}
          </button>
        </div>
      </div>

      {/* ── Fixed Deposit Period Modal ── */}
      {showFDModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-card border border-border rounded-2xl shadow-2xl w-full max-w-md p-6 space-y-5">
            <div>
              <h3 className="text-xl font-display font-bold text-foreground">Fixed Deposit Setup</h3>
              <p className="text-sm text-muted-foreground mt-1">Select your deposit period and enter the amount.</p>
            </div>

            {/* Period selection */}
            <div className="space-y-2">
              <p className="text-sm font-medium text-foreground">Deposit Period</p>
              <div className="grid grid-cols-2 gap-2">
                {FD_PERIODS.map((p) => (
                  <button
                    key={p.value}
                    onClick={() => setFdPeriod(p.value)}
                    className={`p-3 rounded-lg border-2 text-left transition-all ${
                      fdPeriod === p.value
                        ? 'border-primary bg-primary/10'
                        : 'border-border hover:border-muted-foreground/40'
                    }`}
                  >
                    <p className="font-semibold text-foreground text-sm">{p.label}</p>
                    <p className="text-xs text-success font-medium mt-0.5">{p.rate}% p.a.</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Amount input */}
            <div className="space-y-1">
              <label className="text-sm font-medium text-foreground">Deposit Amount ($)</label>
              <input
                type="number"
                min="1"
                step="0.01"
                value={fdAmount}
                onChange={(e) => { setFdAmount(e.target.value); setFdAmountError(''); }}
                placeholder="e.g. 10000"
                className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
              {fdAmountError && <p className="text-xs text-destructive">{fdAmountError}</p>}
            </div>

            {/* Summary preview */}
            <div className="rounded-lg bg-secondary/60 p-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Period</span>
                <span className="font-medium text-foreground">{selectedFdPeriod.label}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Interest Rate</span>
                <span className="font-semibold text-success">{selectedFdPeriod.rate}% per annum</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Principal</span>
                <span className="font-medium text-foreground">
                  {fdAmountNum > 0 ? `$${fdAmountNum.toLocaleString('en-US', { minimumFractionDigits: 2 })}` : '—'}
                </span>
              </div>
              <div className="border-t border-border/50 pt-2 flex justify-between">
                <span className="text-muted-foreground font-medium">Maturity Amount</span>
                <span className="font-bold text-primary text-base">
                  {maturityPreview != null
                    ? `$${maturityPreview.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                    : '—'}
                </span>
              </div>
            </div>

            <div className="flex gap-3 pt-1">
              <button
                onClick={() => setShowFDModal(false)}
                className="flex-1 py-2.5 rounded-lg border border-border text-foreground text-sm font-medium hover:bg-secondary transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleFDConfirm}
                disabled={loading}
                className="flex-1 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading && <LoadingSpinner size="sm" />}
                {loading ? 'Creating...' : 'Confirm Fixed Deposit'}
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default CreateAccount;

