import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { AuthLayout } from '../components/AuthLayout';
import { AuthField } from '../components/AuthField';
import { GoogleSignInButton } from '../components/GoogleSignInButton';
import { AlertCircle, CheckCircle2, User, Store, Mail, Lock, Eye, EyeOff } from 'lucide-react';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const NAME_REGEX = /^[\p{L}][\p{L}\s.'-]{1,99}$/u;
const PHONE_REGEX = /^\+?[0-9][0-9\s().-]{6,19}$/;

export const Register = () => {
  const { register, googleLogin } = useAuth();
  const navigate = useNavigate();

  const [role, setRole] = useState('Customer');
  const [formData, setFormData] = useState({
    name: '', email: '', password: '', contact_number: '', address: '', stall_name: '', bio: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [emailTouched, setEmailTouched] = useState(false);
  const [nameTouched, setNameTouched] = useState(false);
  const [phoneTouched, setPhoneTouched] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const emailIsValid = EMAIL_REGEX.test(formData.email.trim());
  const nameIsValid = NAME_REGEX.test(formData.name.trim());
  const phoneIsValid = formData.contact_number.trim() === '' || PHONE_REGEX.test(formData.contact_number.trim());
  const showEmailError = emailTouched && formData.email.length > 0 && !emailIsValid;
  const showNameError = nameTouched && formData.name.length > 0 && !nameIsValid;
  const showPhoneError = phoneTouched && formData.contact_number.length > 0 && !phoneIsValid;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (!nameIsValid) {
      setNameTouched(true);
      setError('Please enter a valid name (2-100 letters, spaces, apostrophes, dots, or hyphens).');
      return;
    }
    if (!emailIsValid) {
      setEmailTouched(true);
      setError('Please enter a valid email address.');
      return;
    }
    if (!phoneIsValid) {
      setPhoneTouched(true);
      setError('Please enter a valid phone number.');
      return;
    }
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    try {
      setLoading(true);
      await register({ ...formData, email: formData.email.trim(), role });
      if (role === 'Farmer') {
        setSuccessMsg('Registration submitted! Your stall account is pending Admin approval.');
      } else {
        navigate('/dashboard/customer');
      }
    } catch (err) {
      setError(err.message || 'Registration failed. Please check form fields.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleCredential = async (credential, mockUser = null) => {
    setError('');
    try {
      setGoogleLoading(true);
      await googleLogin(credential, mockUser);
      navigate('/dashboard/customer');
    } catch (err) {
      setError(err.message || 'Google sign-up failed. Please try again.');
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Grown near you, picked for you."
      subtitle="Join the community pre-ordering fresh, local produce for pickup at markets around them each week."
      panelQuote="Farmer accounts are reviewed by hand before their stall goes live — no bots, no resellers."
    >
      <div className="mb-7">
        <h1 className="text-2xl font-bold font-serif text-slate-900">Create your account</h1>
        <p className="text-sm text-slate-500 mt-1">
          Already have one?{' '}
          <Link to="/login" className="font-semibold text-brand-700 hover:underline">
            Sign in
          </Link>
        </p>
      </div>

      {/* Role switcher */}
      <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-full mb-6">
        <button
          type="button"
          onClick={() => setRole('Customer')}
          className={`py-2 rounded-full text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
            role === 'Customer' ? 'bg-white text-brand-800 shadow-sm' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <User className="w-3.5 h-3.5" /> Customer
        </button>
        <button
          type="button"
          onClick={() => setRole('Farmer')}
          className={`py-2 rounded-full text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
            role === 'Farmer' ? 'bg-white text-brand-800 shadow-sm' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Store className="w-3.5 h-3.5" /> Farmer / Stall
        </button>
      </div>

      {error && (
        <div className="mb-6 p-3 bg-red-50 text-red-700 rounded-xl text-xs font-semibold flex items-center gap-2 border border-red-100">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {successMsg && (
        <div className="mb-6 p-3 bg-emerald-50 text-emerald-800 rounded-xl text-xs font-semibold flex items-center gap-2 border border-emerald-100">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
          <span>{successMsg}</span>
        </div>
      )}

      {role === 'Customer' && !successMsg && (
        <>
          <div className="space-y-3">
            <GoogleSignInButton onCredential={handleGoogleCredential} text="signup_with" />
            {googleLoading && <p className="text-center text-xs font-medium text-slate-400">Creating your account…</p>}
          </div>
          <div className="flex items-center gap-3 my-6">
            <div className="h-px flex-1 bg-slate-200" />
            <span className="text-[11px] text-slate-400">or with email</span>
            <div className="h-px flex-1 bg-slate-200" />
          </div>
        </>
      )}

      {!successMsg && (
        <form onSubmit={handleSubmit} className="space-y-5" noValidate>
          <AuthField
            label="Full name / contact person"
            value={formData.name}
            onChange={e => setFormData({ ...formData, name: e.target.value })}
            onBlur={() => setNameTouched(true)}
            required
            placeholder="e.g. Robert Vance"
            error={showNameError ? 'Enter a valid name (2-100 characters).' : null}
          />

          <AuthField
            label="Email address"
            icon={Mail}
            type="email"
            value={formData.email}
            onChange={e => setFormData({ ...formData, email: e.target.value })}
            onBlur={() => setEmailTouched(true)}
            required
            placeholder="vance@greenacres.com"
            error={showEmailError ? 'Enter a valid email, e.g. name@example.com' : null}
          />

          <AuthField
            label="Password"
            icon={Lock}
            type={showPassword ? 'text' : 'password'}
            value={formData.password}
            onChange={e => setFormData({ ...formData, password: e.target.value })}
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
            label="Contact phone number"
            value={formData.contact_number}
            onChange={e => setFormData({ ...formData, contact_number: e.target.value })}
            onBlur={() => setPhoneTouched(true)}
            placeholder="+92 300 1234567"
            error={showPhoneError ? 'Enter a valid phone number.' : null}
          />

          {role === 'Farmer' && (
            <>
              <AuthField
                label="Stall / farm business name"
                value={formData.stall_name}
                onChange={e => setFormData({ ...formData, stall_name: e.target.value })}
                required
                placeholder="Green Acres Organic Farm"
              />
              <AuthField
                label="Farm / stall address"
                value={formData.address}
                onChange={e => setFormData({ ...formData, address: e.target.value })}
                placeholder="452 Valley View Road, Farmville"
              />
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">Stall bio / farm description</label>
                <textarea
                  value={formData.bio}
                  onChange={e => setFormData({ ...formData, bio: e.target.value })}
                  rows="3"
                  placeholder="Describe your organic crops, family heritage, pesticide-free methods…"
                  className="w-full bg-transparent py-2 text-sm text-slate-900 placeholder:text-slate-400 outline-none border-b-2 border-slate-200 focus:border-brand-700 transition-colors resize-none"
                />
              </div>
            </>
          )}

          <button
            type="submit"
            disabled={loading || !nameIsValid || !emailIsValid || !phoneIsValid}
            className="w-full py-3 rounded-full bg-brand-800 hover:bg-brand-900 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold text-sm shadow-sm transition-colors"
          >
            {loading ? 'Submitting…' : `Register as ${role}`}
          </button>
        </form>
      )}
    </AuthLayout>
  );
};
