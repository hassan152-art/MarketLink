import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { AuthLayout } from '../components/AuthLayout';
import { AuthField } from '../components/AuthField';
import { GoogleSignInButton } from '../components/GoogleSignInButton';
import { AlertCircle, Shield, Store, User, Mail, Lock, Eye, EyeOff } from 'lucide-react';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const Login = () => {
  const { login, googleLogin } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [emailTouched, setEmailTouched] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const emailIsValid = EMAIL_REGEX.test(email.trim());
  const showEmailError = emailTouched && email.length > 0 && !emailIsValid;

  const goToDashboard = (role) => {
    if (role === 'Admin') navigate('/dashboard/admin');
    else if (role === 'Farmer') navigate('/dashboard/farmer');
    else navigate('/dashboard/customer');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!emailIsValid) {
      setEmailTouched(true);
      setError('Please enter a valid email address.');
      return;
    }

    try {
      setLoading(true);
      const res = await login(email.trim(), password);
      goToDashboard(res.user.role);
    } catch (err) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleCredential = async (credential, mockUser = null) => {
    setError('');
    try {
      setGoogleLoading(true);
      const res = await googleLogin(credential, mockUser);
      goToDashboard(res.user.role);
    } catch (err) {
      setError(err.message || 'Google sign-in failed. Please try again.');
    } finally {
      setGoogleLoading(false);
    }
  };

  const fillDemo = (demoEmail, demoPassword) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
    setEmailTouched(false);
    setError('');
  };

  return (
    <AuthLayout
      reverse
      title="Your Saturday market, saved for later."
      subtitle="Sign back in to pick up where you left off — pre-orders, favorite stalls, and this week's fresh harvest."
      panelQuote="Every listing on MarketLink comes straight from a local grower, not a warehouse."
    >
      <div className="mb-8">
        <h1 className="text-2xl font-bold font-serif text-slate-900">Sign in</h1>
        <p className="text-sm text-slate-500 mt-1">
          New here?{' '}
          <Link to="/register" className="font-semibold text-brand-700 hover:underline">
            Create an account
          </Link>
        </p>
      </div>

      {error && (
        <div className="mb-6 p-3 bg-red-50 text-red-700 rounded-xl text-xs font-semibold flex items-center gap-2 border border-red-100">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="space-y-3">
        <GoogleSignInButton onCredential={handleGoogleCredential} text="signin_with" />
        {googleLoading && <p className="text-center text-xs font-medium text-slate-400">Signing you in…</p>}
      </div>

      <div className="flex items-center gap-3 my-6">
        <div className="h-px flex-1 bg-slate-200" />
        <span className="text-[11px] text-slate-400">or with email</span>
        <div className="h-px flex-1 bg-slate-200" />
      </div>

      <form onSubmit={handleSubmit} className="space-y-5" noValidate>
        <AuthField
          label="Email address"
          icon={Mail}
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          onBlur={() => setEmailTouched(true)}
          required
          placeholder="name@marketlink.com"
          error={showEmailError ? 'Enter a valid email, e.g. name@example.com' : null}
        />

        <AuthField
          label="Password"
          icon={Lock}
          type={showPassword ? 'text' : 'password'}
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
          placeholder="••••••••"
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

        <div className="flex justify-end">
          <Link to="/forgot-password" className="text-xs font-semibold text-brand-700 hover:underline">
            Forgot password?
          </Link>
        </div>

        <button
          type="submit"
          disabled={loading || (email.length > 0 && !emailIsValid)}
          className="w-full py-3 rounded-full bg-brand-800 hover:bg-brand-900 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold text-sm shadow-sm transition-colors"
        >
          {loading ? 'Signing in…' : 'Sign in'}
        </button>
      </form>

      <div className="mt-8 pt-6 border-t border-slate-100">
        <p className="text-[11px] font-semibold text-slate-400 mb-2.5">Quick evaluation logins</p>
        <div className="grid grid-cols-3 gap-2">
          <button
            type="button"
            onClick={() => fillDemo('admin@marketlink.com', 'admin123')}
            className="py-2 rounded-lg border border-slate-200 hover:border-brand-400 hover:bg-brand-50 text-[11px] font-semibold text-slate-700 flex items-center justify-center gap-1 transition-colors"
          >
            <Shield className="w-3.5 h-3.5 text-brand-600" /> Admin
          </button>
          <button
            type="button"
            onClick={() => fillDemo('farmer1@marketlink.com', 'password123')}
            className="py-2 rounded-lg border border-slate-200 hover:border-brand-400 hover:bg-brand-50 text-[11px] font-semibold text-slate-700 flex items-center justify-center gap-1 transition-colors"
          >
            <Store className="w-3.5 h-3.5 text-amber-600" /> Farmer
          </button>
          <button
            type="button"
            onClick={() => fillDemo('customer1@marketlink.com', 'password123')}
            className="py-2 rounded-lg border border-slate-200 hover:border-brand-400 hover:bg-brand-50 text-[11px] font-semibold text-slate-700 flex items-center justify-center gap-1 transition-colors"
          >
            <User className="w-3.5 h-3.5 text-blue-600" /> Customer
          </button>
        </div>
      </div>
    </AuthLayout>
  );
};
