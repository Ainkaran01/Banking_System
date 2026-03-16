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

const CreateAccount: React.FC = () => {
  const { customerId } = useAuth();
  const [selected, setSelected] = useState('SAVINGS');
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const handleCreate = async () => {
    setLoading(true);
    setAlert(null);
    try {
      const account = await createAccount({ customerId: customerId!, accountType: selected });
      setAlert({ type: 'success', message: `Account created successfully! Account ID: ${account.id}` });
    } catch (err: any) {
      setAlert({ type: 'error', message: err.message || 'Failed to create account' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout title="Create Account">
      <div className="max-w-lg">
        {alert && <div className="mb-4"><Alert type={alert.type} message={alert.message} onClose={() => setAlert(null)} /></div>}
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
          <button onClick={handleCreate} disabled={loading} className="w-full py-3 rounded-lg bg-primary text-primary-foreground font-semibold hover:opacity-90 transition-all disabled:opacity-50 flex items-center justify-center gap-2">
            {loading && <LoadingSpinner size="sm" />}
            {loading ? 'Creating...' : 'Create Account'}
          </button>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default CreateAccount;
