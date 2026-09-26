import React, { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { AuthLayout } from '../components/AuthLayout';
import { AuthField } from '../components/AuthField';
import { Lock, Eye, EyeOff, AlertCircle, CheckCircle2 } from 'lucide-react';

export const ResetPassword = () => {
  const { token } = useParams();
  const { resetPassword } = useAuth();
  const navigate = useNavigate();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    try {
      setLoading(true);
      await resetPassword(token, password);
      setSuccess(true);
      setTimeout(() => navigate('/login'), 2500);
    } catch (err) {
      setError(err.message || 'This reset link is invalid or has expired.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Choose a new password."
      subtitle="Make it something you'll remember — you can always change it again later from your profile."
      panelQuote="Once this is set, your old password stops working right away."
    >
      <h1 className="text-2xl font-bold font-serif text-slate-900 mb-1">Reset your password</h1>
      <p className="text-sm text-slate-500 mb-7">Enter and confirm your new password below.</p>

      {error && (
        <div className="mb-6 p-3 bg-red-50 text-red-700 rounded-xl text-xs font-semibold flex items-center gap-2 border border-red-100">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {success ? (
        <div className="p-3.5 bg-emerald-50 text-emerald-800 rounded-xl text-xs font-semibold flex items-center gap-2 border border-emerald-100">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
          <span>Password reset! Redirecting you to sign in…</span>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-5" noValidate>
          <AuthField
            label="New password"
            icon={Lock}
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            minLength={6}
            placeholder="At least 6 characters"
            rightElement={
              <button
                type="button"
                onClick={() => setShowPassword(s => !s)}
                className="text-slate-400 hover:text-slate-600 ml-2"
                tabIndex={-1}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            }
          />

          <AuthField
            label="Confirm new password"
            icon={Lock}
            type={showPassword ? 'text' : 'password'}
            value={confirmPassword}
            onChange={e => setConfirmPassword(e.target.value)}
            required
            minLength={6}
            placeholder="Re-enter new password"
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-full bg-brand-800 hover:bg-brand-900 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold text-sm shadow-sm transition-colors"
          >
            {loading ? 'Resetting…' : 'Reset password'}
          </button>
        </form>
      )}

      <div className="mt-6 text-center">
        <Link to="/login" className="text-xs font-semibold text-brand-700 hover:underline">
          Back to sign in
        </Link>
      </div>
    </AuthLayout>
  );
};
