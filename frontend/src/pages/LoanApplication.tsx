import React, { useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { useAuth } from '@/context/AuthContext';
import { applyLoan } from '@/services/mockApi';
import FormInput from '@/components/FormInput';
import Alert from '@/components/Alert';
import LoadingSpinner from '@/components/LoadingSpinner';

const loanTypes = ['Personal', 'Home', 'Education', 'Vehicle', 'Business'];

const LoanApplication: React.FC = () => {
  const { customerId } = useAuth();
  const [loanType, setLoanType] = useState('Personal');
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const errs: Record<string, string> = {};
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
      const loan = await applyLoan({ customerId: customerId!, loanType, amount: parseFloat(amount) });
      setAlert({ type: 'success', message: `Loan application submitted! Loan ID: ${loan.id} — Status: ${loan.status}` });
      setAmount('');
    } catch (err: any) {
      setAlert({ type: 'error', message: err.message || 'Loan application failed' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout title="Loan Application">
      <div className="max-w-lg">
        {alert && <div className="mb-4"><Alert type={alert.type} message={alert.message} onClose={() => setAlert(null)} /></div>}
        <div className="form-card">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">Loan Type</label>
              <select
                value={loanType}
                onChange={(e) => setLoanType(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all"
              >
                {loanTypes.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <FormInput label="Loan Amount ($)" type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0.00" error={errors.amount} required />
            <button type="submit" disabled={loading} className="w-full py-3 rounded-lg bg-primary text-primary-foreground font-semibold hover:opacity-90 transition-all disabled:opacity-50 flex items-center justify-center gap-2">
              {loading && <LoadingSpinner size="sm" />}
              {loading ? 'Submitting...' : 'Apply for Loan'}
            </button>
          </form>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default LoanApplication;
