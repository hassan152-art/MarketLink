import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { AuthLayout } from '../components/AuthLayout';
import { AuthField } from '../components/AuthField';
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle2,
  ArrowLeft,
  KeyRound,
  ShieldCheck,
  RefreshCw,
  Sparkles
} from 'lucide-react';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const ForgotPassword = () => {
  const { sendOTP, resetPasswordWithOTP } = useAuth();
  const navigate = useNavigate();

  // Step management: 1 = Enter Email, 2 = Enter OTP & New Password, 3 = Success
  const [step, setStep] = useState(1);

  // Form State
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Validation & UI State
  const [emailTouched, setEmailTouched] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [devOtp, setDevOtp] = useState('');
  const [resendCooldown, setResendCooldown] = useState(0);

  const emailIsValid = EMAIL_REGEX.test(email.trim());
  const showEmailError = emailTouched && email.length > 0 && !emailIsValid;

  // Countdown timer for resend button
  useEffect(() => {
    let timer;
    if (resendCooldown > 0) {
      timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [resendCooldown]);

  // Step 1: Request OTP
  const handleSendOTP = async (e) => {
    if (e) e.preventDefault();
    setError('');
    setDevOtp('');

    if (!emailIsValid) {
      setEmailTouched(true);
      setError('Please enter a valid email address.');
      return;
    }

    try {
      setLoading(true);
      const res = await sendOTP(email.trim());
      setStep(2);
      setResendCooldown(30);
      setSuccessMsg('A 6-digit verification code has been dispatched to your email.');

      if (res?.devOtp) {
        setDevOtp(res.devOtp);
      }
    } catch (err) {
      setError(err.message || 'Unable to send verification code. Please check your email.');
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify OTP & Reset Password
  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError('');

    const cleanOtp = otp.trim();
    if (!cleanOtp || cleanOtp.length < 6) {
      setError('Please enter the complete 6-digit verification code.');
      return;
    }

    if (!newPassword || newPassword.length < 6) {
      setError('New password must be at least 6 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match. Please re-enter.');
      return;
    }

    try {
      setLoading(true);
      const res = await resetPasswordWithOTP(email.trim(), cleanOtp, newPassword);
      setStep(3);
      setSuccessMsg(res.message || 'Password reset successfully!');

      // Auto redirect after 3 seconds
      setTimeout(() => {
        if (res.user?.role === 'Admin') navigate('/dashboard/admin');
        else if (res.user?.role === 'Farmer') navigate('/dashboard/farmer');
        else navigate('/dashboard/customer');
      }, 2500);
    } catch (err) {
      setError(err.message || 'Failed to reset password. Please check your verification code.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Secure Password Recovery."
      subtitle="Verify your email with a 6-digit one-time code and create a fresh password in seconds."
      panelQuote="All password reset actions are signed and logged in your security audit trail."
    >
      <Link
        to="/login"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-brand-700 mb-6 transition-colors"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        Back to sign in
      </Link>

      {/* Progress Step Pills */}
      <div className="flex items-center gap-2 mb-6">
        <div className={`h-1.5 flex-1 rounded-full transition-colors ${step >= 1 ? 'bg-brand-600' : 'bg-slate-200'}`} />
        <div className={`h-1.5 flex-1 rounded-full transition-colors ${step >= 2 ? 'bg-brand-600' : 'bg-slate-200'}`} />
        <div className={`h-1.5 flex-1 rounded-full transition-colors ${step >= 3 ? 'bg-brand-600' : 'bg-slate-200'}`} />
      </div>

      {/* Error Banner */}
      {error && (
        <div className="mb-6 p-3.5 bg-red-50 text-red-700 rounded-2xl text-xs font-semibold flex items-center gap-2.5 border border-red-100 animate-shake">
          <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
          <span>{error}</span>
        </div>
      )}

      {/* Success Notification */}
      {successMsg && step !== 3 && (
        <div className="mb-6 p-3.5 bg-emerald-50 text-emerald-800 rounded-2xl text-xs font-semibold flex items-center gap-2.5 border border-emerald-100">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* STEP 1: ENTER EMAIL */}
      {step === 1 && (
        <div>
          <div className="mb-6">
            <h1 className="text-2xl font-bold font-serif text-slate-900">Forgot your password?</h1>
            <p className="text-sm text-slate-500 mt-1">
              Enter your registered email address and we'll dispatch a 6-digit OTP code.
            </p>
          </div>

          <form onSubmit={handleSendOTP} className="space-y-5" noValidate>
            <AuthField
              label="Email address"
              icon={Mail}
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onBlur={() => setEmailTouched(true)}
              required
              placeholder="name@marketlink.com"
              error={showEmailError ? 'Enter a valid email, e.g. name@example.com' : null}
            />

            <button
              type="submit"
              disabled={loading || (email.length > 0 && !emailIsValid)}
              className="w-full py-3.5 rounded-full bg-brand-800 hover:bg-brand-900 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold text-sm shadow-md shadow-brand-800/20 transition-all flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Dispatching OTP...</span>
                </>
              ) : (
                <>
                  <span>Send Verification Code</span>
                  <KeyRound className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Evaluation Helper */}
          <div className="mt-8 pt-6 border-t border-slate-100">
            <p className="text-[11px] font-semibold text-slate-400 mb-2">Quick test accounts</p>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setEmail('customer1@marketlink.com')}
                className="px-3 py-1.5 rounded-lg border border-slate-200 hover:border-brand-500 hover:bg-brand-50 text-[11px] font-medium text-slate-600 transition-colors"
              >
                customer1@marketlink.com
              </button>
              <button
                type="button"
                onClick={() => setEmail('farmer1@marketlink.com')}
                className="px-3 py-1.5 rounded-lg border border-slate-200 hover:border-brand-500 hover:bg-brand-50 text-[11px] font-medium text-slate-600 transition-colors"
              >
                farmer1@marketlink.com
              </button>
            </div>
          </div>
        </div>
      )}

      {/* STEP 2: ENTER OTP & NEW PASSWORD */}
      {step === 2 && (
        <div>
          <div className="mb-6">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold font-serif text-slate-900">Enter Code & Reset</h1>
              <button
                type="button"
                onClick={() => setStep(1)}
                className="text-xs text-brand-700 hover:underline font-semibold"
              >
                Change email
              </button>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Code sent to <strong className="text-slate-800">{email}</strong>.
            </p>
          </div>

          {/* Dev Helper Chip if SMTP is in dev mode */}
          {devOtp && (
            <div className="mb-5 p-3.5 bg-amber-50 rounded-2xl border border-amber-200 text-xs text-amber-900 flex items-center justify-between">
              <div>
                <span className="font-bold block">Testing Sandbox OTP:</span>
                <span className="font-mono text-base font-extrabold tracking-widest text-amber-700">{devOtp}</span>
              </div>
              <button
                type="button"
                onClick={() => setOtp(devOtp)}
                className="px-3 py-1 bg-amber-200 hover:bg-amber-300 text-amber-900 font-bold rounded-lg text-[11px] transition-colors"
              >
                Auto-fill Code
              </button>
            </div>
          )}

          <form onSubmit={handleResetPassword} className="space-y-4" noValidate>
            {/* 6-Digit OTP Field */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                6-Digit Verification Code
              </label>
              <div className="relative">
                <input
                  type="text"
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                  placeholder="• • • • • •"
                  className="w-full text-center tracking-[0.5em] text-2xl font-mono font-bold py-3 px-4 rounded-xl border border-slate-300 focus:border-brand-600 focus:ring-2 focus:ring-brand-500/20 outline-none transition-all bg-white"
                  autoFocus
                  required
                />
              </div>
            </div>

            {/* New Password */}
            <AuthField
              label="New Password"
              icon={Lock}
              type={showPassword ? 'text' : 'password'}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              placeholder="Minimum 6 characters"
              rightElement={
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-slate-400 hover:text-slate-600 ml-2"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              }
            />

            {/* Confirm Password */}
            <AuthField
              label="Confirm New Password"
              icon={Lock}
              type={showPassword ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              placeholder="Re-enter your new password"
            />

            <button
              type="submit"
              disabled={loading || otp.length < 6 || newPassword.length < 6}
              className="w-full py-3.5 rounded-full bg-brand-800 hover:bg-brand-900 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold text-sm shadow-md shadow-brand-800/20 transition-all flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Updating Password...</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  <span>Reset & Sign In</span>
                </>
              )}
            </button>

            {/* Resend OTP button */}
            <div className="text-center pt-2">
              <button
                type="button"
                onClick={handleSendOTP}
                disabled={resendCooldown > 0 || loading}
                className="text-xs font-semibold text-brand-700 hover:underline disabled:text-slate-400 disabled:no-underline"
              >
                {resendCooldown > 0 ? `Resend code in ${resendCooldown}s` : "Didn't get code? Resend OTP"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* STEP 3: SUCCESS CELEBRATION */}
      {step === 3 && (
        <div className="text-center py-6 space-y-5">
          <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner animate-bounce">
            <Sparkles className="w-8 h-8" />
          </div>

          <div>
            <h2 className="text-2xl font-bold font-serif text-slate-900">Password Reset Complete!</h2>
            <p className="text-xs text-slate-500 mt-2 max-w-sm mx-auto">
              Your password has been successfully updated. You are securely signed in. Redirecting to your dashboard...
            </p>
          </div>

          <Link
            to="/login"
            className="inline-flex items-center justify-center px-6 py-3 rounded-full bg-brand-800 hover:bg-brand-900 text-white font-bold text-xs shadow-md transition-colors"
          >
            Continue to Dashboard Now
          </Link>
        </div>
      )}
    </AuthLayout>
  );
};