import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Mail,
  Lock,
  ArrowRight,
  ArrowLeft,
  KeyRound,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  Phone
} from 'lucide-react';
import api from '../utils/api.js';
import Logo from '../components/common/Logo.jsx';
import Button from '../components/ui/Button.jsx';

export default function ForgotPasswordPage() {
  const navigate = useNavigate();

  // Multi-step flow: 1 = Request OTP, 2 = Enter OTP & New Password, 3 = Success
  const [step, setStep] = useState(1);
  const [identifier, setIdentifier] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Password Strength calculation
  const strengthScore = React.useMemo(() => {
    if (!newPassword) return 0;
    let score = 0;
    if (newPassword.length >= 8) score++;
    if (/\d/.test(newPassword)) score++;
    if (/[a-zA-Z]/.test(newPassword)) score++;
    if (/[!@#$%^&*(),.?":{}|<>]/.test(newPassword)) score++;
    return score;
  }, [newPassword]);

  // Step 1: Send OTP
  const handleRequestOtp = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!identifier.trim()) {
      setErrorMsg('Please enter your email address or mobile number.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await api.post('/auth/forgot-password', {
        identifier: identifier.trim()
      });
      setSuccessMsg(res.data.message || 'Verification code sent successfully.');
      setStep(2);
    } catch (err) {
      setErrorMsg(
        err.response?.data?.message || 'Failed to send reset code. Please check your credentials.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Step 2: Verify OTP and Reset Password
  const handleResetPassword = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (otpCode.length !== 6) {
      setErrorMsg('Please enter a valid 6-digit verification code.');
      return;
    }

    if (newPassword.length < 8 || !/\d/.test(newPassword) || !/[a-zA-Z]/.test(newPassword)) {
      setErrorMsg('Password must be at least 8 characters long and include both letters and numbers.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMsg('Passwords do not match. Please re-enter.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await api.post('/auth/reset-password', {
        identifier: identifier.trim(),
        code: otpCode.trim(),
        newPassword
      });
      setSuccessMsg(res.data.message || 'Password has been reset successfully!');
      setStep(3);
      setTimeout(() => {
        navigate('/login', { replace: true });
      }, 2500);
    } catch (err) {
      setErrorMsg(
        err.response?.data?.message || 'Failed to reset password. Please check your code.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] bg-canvas flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12">
      <motion.div
        initial={{ opacity: 0, y: 12, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="max-w-md w-full bg-surface rounded-2xl shadow-subtle border border-line p-7 sm:p-8 space-y-6"
      >
        <div className="text-center">
          <div className="flex justify-center mb-3">
            <Logo variant="icon" size="lg" />
          </div>
          <h1 className="text-2xl font-bold text-ink tracking-tight">
            {step === 3 ? 'Password Updated!' : 'Reset Your Password'}
          </h1>
          <p className="text-xs text-muted mt-1">
            {step === 1
              ? 'Enter your registered email or mobile to receive a 6-digit recovery code'
              : step === 2
              ? 'Enter the 6-digit code and choose a new secure password'
              : 'Your account is secured. Redirecting you to sign in...'}
          </p>
        </div>

        {errorMsg && (
          <div className="flex items-center gap-2 p-3 bg-danger-soft border border-danger/20 text-danger text-xs rounded-xl">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && step !== 3 && (
          <div className="flex items-center gap-2 p-3 bg-success/15 border border-success/30 text-success text-xs rounded-xl font-medium">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        <AnimatePresence mode="wait">
          {/* STEP 1: Request OTP */}
          {step === 1 && (
            <motion.form
              key="step1"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              onSubmit={handleRequestOtp}
              className="space-y-4"
            >
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-muted mb-1.5">
                  Email or 10-Digit Mobile Number
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder="name@example.com or 9876543210"
                    className="w-full pl-10 pr-4 py-2.5 bg-canvas border border-line rounded-xl text-xs text-ink outline-none focus:bg-surface focus:border-brand focus:ring-1 focus:ring-brand transition-all placeholder:text-muted"
                  />
                  <Mail className="w-4 h-4 text-muted absolute left-3.5 top-3 pointer-events-none" />
                </div>
              </div>

              <Button
                type="submit"
                variant="primary"
                size="lg"
                isLoading={isLoading}
                className="w-full text-xs font-bold shadow-subtle"
              >
                <span>Send Verification Code</span>
                <ArrowRight className="w-4 h-4 ml-1.5" />
              </Button>

              <div className="text-center pt-2">
                <Link
                  to="/login"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted hover:text-ink transition-colors"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back to Sign In</span>
                </Link>
              </div>
            </motion.form>
          )}

          {/* STEP 2: Enter Code & New Password */}
          {step === 2 && (
            <motion.form
              key="step2"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              onSubmit={handleResetPassword}
              className="space-y-4"
            >
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-muted">
                    6-Digit Verification Code
                  </label>
                  <button
                    type="button"
                    onClick={handleRequestOtp}
                    disabled={isLoading}
                    className="text-[11px] text-brand hover:underline font-medium"
                  >
                    Resend Code
                  </button>
                </div>
                <div className="relative">
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                    placeholder="123456"
                    className="w-full pl-10 pr-4 py-2.5 bg-canvas border border-line rounded-xl text-xs tracking-widest font-mono text-ink outline-none focus:bg-surface focus:border-brand focus:ring-1 focus:ring-brand transition-all placeholder:text-muted text-center"
                  />
                  <KeyRound className="w-4 h-4 text-muted absolute left-3.5 top-3 pointer-events-none" />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-muted mb-1.5">
                  New Password (Min 8 Characters)
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    minLength={8}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-10 py-2.5 bg-canvas border border-line rounded-xl text-xs text-ink outline-none focus:bg-surface focus:border-brand focus:ring-1 focus:ring-brand transition-all placeholder:text-muted"
                  />
                  <Lock className="w-4 h-4 text-muted absolute left-3.5 top-3 pointer-events-none" />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-2.5 text-muted hover:text-ink transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                {/* Password Strength Indicator */}
                {newPassword.length > 0 && (
                  <div className="mt-2 space-y-1.5 p-2 bg-canvas rounded-xl border border-line">
                    <div className="flex items-center justify-between text-[10px]">
                      <span className="text-muted">Password Strength:</span>
                      <span
                        className={`font-bold ${
                          strengthScore <= 1
                            ? 'text-danger'
                            : strengthScore <= 3
                            ? 'text-amber-500'
                            : 'text-success'
                        }`}
                      >
                        {strengthScore <= 1 ? 'Weak' : strengthScore <= 3 ? 'Medium' : 'Strong'}
                      </span>
                    </div>
                    <div className="h-1.5 w-full bg-line rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all duration-300 ${
                          strengthScore <= 1
                            ? 'w-1/3 bg-danger'
                            : strengthScore <= 3
                            ? 'w-2/3 bg-amber-500'
                            : 'w-full bg-success'
                        }`}
                      />
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-muted mb-1.5">
                  Confirm New Password
                </label>
                <div className="relative">
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-4 py-2.5 bg-canvas border border-line rounded-xl text-xs text-ink outline-none focus:bg-surface focus:border-brand focus:ring-1 focus:ring-brand transition-all placeholder:text-muted"
                  />
                  <Lock className="w-4 h-4 text-muted absolute left-3.5 top-3 pointer-events-none" />
                </div>
              </div>

              <Button
                type="submit"
                variant="primary"
                size="lg"
                isLoading={isLoading}
                className="w-full text-xs font-bold shadow-subtle"
              >
                <span>Update Password</span>
                <ArrowRight className="w-4 h-4 ml-1.5" />
              </Button>

              <div className="flex items-center justify-between pt-1">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="text-xs text-muted hover:text-ink transition-colors flex items-center gap-1 font-medium"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  Change Email/Mobile
                </button>
                <Link
                  to="/login"
                  className="text-xs font-semibold text-brand hover:underline"
                >
                  Back to Sign In
                </Link>
              </div>
            </motion.form>
          )}

          {/* STEP 3: Success Screen */}
          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-6 space-y-4"
            >
              <div className="w-14 h-14 rounded-full bg-success/15 text-success flex items-center justify-center mx-auto ring-4 ring-success/20">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h2 className="text-base font-bold text-ink">Password Changed Successfully!</h2>
              <p className="text-xs text-muted">
                You can now log in with your new password. Taking you to the login screen...
              </p>
              <Button
                type="button"
                variant="primary"
                size="md"
                onClick={() => navigate('/login', { replace: true })}
                className="w-full text-xs font-bold"
              >
                Sign In Now
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
