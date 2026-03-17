import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { registerCustomer } from '@/services/authService';
import FormInput from '@/components/FormInput';
import Alert from '@/components/Alert';
import LoadingSpinner from '@/components/LoadingSpinner';
import { Landmark } from 'lucide-react';

const Register: React.FC = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState({
    password: false,
  });
  const [alert, setAlert] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [loading, setLoading] = useState(false);

  // 👇 Track password focus
  const [isPasswordFocused, setIsPasswordFocused] = useState(false);

  // 🔐 Password checks
  const passwordChecks = {
    length: form.password.length >= 8,
    uppercase: /[A-Z]/.test(form.password),
    lowercase: /[a-z]/.test(form.password),
    number: /[0-9]/.test(form.password),
    special: /[!@#$%^&*(),.?":{}|<>]/.test(form.password),
  };

  // ✅ Final validation on submit
  const validate = () => {
    const errs: Record<string, string> = {};

    if (!form.name.trim()) errs.name = 'Name is required';
    else if (form.name.length > 15) errs.name = 'Max 15 characters allowed';

    if (!form.email.trim()) errs.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      errs.email = 'Invalid email';

    if (!form.phone.trim()) errs.phone = 'Phone is required';
    else if (!/^\d{9,10}$/.test(form.phone))
      errs.phone = 'Phone must be 9 or 10 digits';

    if (!form.password) errs.password = 'Password is required';
    else if (
      !passwordChecks.length ||
      !passwordChecks.uppercase ||
      !passwordChecks.lowercase ||
      !passwordChecks.number ||
      !passwordChecks.special
    ) {
      errs.password = 'Password does not meet requirements';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    setAlert(null);

    try {
      await registerCustomer(form);
      setAlert({ type: 'success', message: 'Registration successful! Redirecting...' });
      setTimeout(() => navigate('/login'), 1500);
    } catch (err: any) {
      setAlert({ type: 'error', message: err.message || 'Registration failed' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-primary mx-auto mb-4 flex items-center justify-center">
            <Landmark className="w-7 h-7 text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-bold">Create Account</h1>
          <p className="text-muted-foreground">Join NeoBank today</p>
        </div>

        <div className="form-card">
          {alert && (
            <div className="mb-4">
              <Alert type={alert.type} message={alert.message} onClose={() => setAlert(null)} />
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">

            {/* 🔹 Full Name */}
            <FormInput
              label="Full Name"
              value={form.name}
              onChange={(e) => {
                const value = e.target.value;
                setForm({ ...form, name: value });

                if (value.length > 15) {
                  setErrors((prev) => ({ ...prev, name: 'Max 15 characters allowed' }));
                } else if (!value.trim()) {
                  setErrors((prev) => ({ ...prev, name: 'Name is required' }));
                } else {
                  setErrors((prev) => ({ ...prev, name: '' }));
                }
              }}
              placeholder="John Doe"
              error={errors.name}
              required
            />

            {/* 🔹 Email */}
            <FormInput
              label="Email"
              type="email"
              value={form.email}
              onChange={(e) => {
                const value = e.target.value;
                setForm({ ...form, email: value });

                if (!value.trim()) {
                  setErrors((prev) => ({ ...prev, email: 'Email is required' }));
                } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
                  setErrors((prev) => ({ ...prev, email: 'Invalid email' }));
                } else {
                  setErrors((prev) => ({ ...prev, email: '' }));
                }
              }}
              placeholder="john@example.com"
              error={errors.email}
              required
            />

            {/* 🔹 Phone */}
            <FormInput
              label="Phone"
              value={form.phone}
              onChange={(e) => {
                const value = e.target.value;

                // Allow only numbers
                if (!/^\d*$/.test(value)) return;

                setForm({ ...form, phone: value });

                if (value.length < 9 || value.length > 10) {
                  setErrors((prev) => ({ ...prev, phone: 'Phone must be 9 or 10 digits' }));
                } else {
                  setErrors((prev) => ({ ...prev, phone: '' }));
                }
              }}
              placeholder="1234567890"
              error={errors.phone}
              required
            />

            {/* 🔹 Password */}
            <FormInput
              label="Password"
              type="password"
              value={form.password}
              onFocus={() => setIsPasswordFocused(true)}
              onBlur={() => setIsPasswordFocused(false)}
              onChange={(e) => {
                const value = e.target.value;
                setForm({ ...form, password: value });

                if (value.length < 8) {
                  setErrors((prev) => ({ ...prev, password: 'Minimum 8 characters required' }));
                } else {
                  setErrors((prev) => ({ ...prev, password: '' }));
                }
              }}
              placeholder="Min 8 characters"
              error={errors.password}
              required
            />

            {/* 🔐 Password Rules (HIDE WHEN ALL CHECKS PASS) */}
            {(isPasswordFocused || (form.password.length > 0 && !Object.values(passwordChecks).every(v => v))) && (
              <div className="text-sm space-y-1">
                <p className={passwordChecks.length ? "text-green-600" : "text-red-500"}>
                  • Minimum 8 characters
                </p>
                <p className={passwordChecks.uppercase ? "text-green-600" : "text-red-500"}>
                  • Uppercase letter (A-Z)
                </p>
                <p className={passwordChecks.lowercase ? "text-green-600" : "text-red-500"}>
                  • Lowercase letter (a-z)
                </p>
                <p className={passwordChecks.number ? "text-green-600" : "text-red-500"}>
                  • Number (0-9)
                </p>
                <p className={passwordChecks.special ? "text-green-600" : "text-red-500"}>
                  • Special character (!@#$...)
                </p>
              </div>
            )}

            {/* 🔘 Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-lg bg-primary text-white font-semibold hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading && <LoadingSpinner size="sm" />}
              {loading ? 'Creating...' : 'Register'}
            </button>

          </form>

          <p className="text-center text-sm mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-primary font-medium hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;