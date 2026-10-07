import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { Mail, Lock, AlertCircle, ArrowRight, Loader2, Phone, Eye, EyeOff } from 'lucide-react';
import { loginUser, clearError } from '../features/auth/authSlice.js';
import Logo from '../components/common/Logo.jsx';
import GoogleAuthButton from '../components/auth/GoogleAuthButton.jsx';
import GuestOtpModal from '../components/checkout/GuestOtpModal.jsx';
import { Button } from '../components/ui/index.js';

export default function LoginPage() {
  const [email, setEmail] = useState(() => {
    return localStorage.getItem('rigamart_remembered_email') || '';
  });
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(() => {
    return !!localStorage.getItem('rigamart_remembered_email');
  });
  const [isOtpModalOpen, setIsOtpModalOpen] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const { isLoading, error } = useSelector((state) => state.auth);

  const redirectPath = location.state?.from?.pathname || '/';

  const handleSubmit = async (e) => {
    e.preventDefault();
    dispatch(clearError());

    // Save or clear remembered email
    if (rememberMe) {
      localStorage.setItem('rigamart_remembered_email', email.trim());
    } else {
      localStorage.removeItem('rigamart_remembered_email');
    }

    const result = await dispatch(loginUser({ email, password }));
    if (loginUser.fulfilled.match(result)) {
      navigate(redirectPath, { replace: true });
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
          <h1 className="text-2xl font-bold text-ink tracking-tight">Welcome Back</h1>
          <p className="text-xs text-muted mt-1">Sign in to manage orders, wishlist & addresses</p>
        </div>

        {error && (
          <div className="flex items-center gap-2 p-3 bg-danger-soft border border-danger/20 text-danger text-xs rounded-xl">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-muted mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full pl-10 pr-4 py-2.5 bg-canvas border border-line rounded-xl text-xs text-ink outline-none focus:bg-surface focus:border-brand focus:ring-1 focus:ring-brand transition-all placeholder:text-muted"
              />
              <Mail className="w-4 h-4 text-muted absolute left-3.5 top-3 pointer-events-none" />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-[11px] font-bold uppercase tracking-wider text-muted">
                Password
              </label>
              <Link
                to="/forgot-password"
                className="text-[11px] font-medium text-brand hover:underline"
              >
                Forgot Password?
              </Link>
            </div>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-10 py-2.5 bg-canvas border border-line rounded-xl text-xs text-ink outline-none focus:bg-surface focus:border-brand focus:ring-1 focus:ring-brand transition-all placeholder:text-muted"
              />
              <Lock className="w-4 h-4 text-muted absolute left-3.5 top-3 pointer-events-none" />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-2.5 text-muted hover:text-ink transition-colors"
                title={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Remember Me Checkbox */}
          <div className="flex items-center pt-1">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 rounded border-line text-brand focus:ring-brand focus:ring-offset-0 transition-colors"
              />
              <span className="text-xs text-ink font-medium">Remember my login</span>
            </label>
          </div>

          <Button
            type="submit"
            variant="primary"
            size="lg"
            isLoading={isLoading}
            className="w-full text-xs font-bold shadow-subtle"
          >
            <span>Sign In</span>
            <ArrowRight className="w-4 h-4 ml-1.5" />
          </Button>
        </form>

        {/* Divider */}
        <div className="relative my-3">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-line" />
          </div>
          <div className="relative flex justify-center text-[10px] uppercase">
            <span className="bg-surface px-3 text-muted font-bold tracking-wider">Or continue with</span>
          </div>
        </div>

        {/* Google One-Tap & Sign In Button */}
        <GoogleAuthButton mode="login" enableOneTap={true} />

        {/* Mobile OTP Instant Login Button */}
        <Button
          type="button"
          variant="outline"
          size="md"
          onClick={() => setIsOtpModalOpen(true)}
          className="w-full text-xs text-ink"
        >
          <Phone className="w-3.5 h-3.5 mr-2 text-brand" />
          <span>Sign In with Mobile OTP (Instant)</span>
        </Button>

        <div className="text-center pt-1 text-xs text-muted">
          New to Rigamart?{' '}
          <Link to="/register" className="font-bold text-brand hover:underline">
            Create an account
          </Link>
        </div>
      </motion.div>

      {/* Mobile OTP Login Modal */}
      <GuestOtpModal
        isOpen={isOtpModalOpen}
        onClose={() => setIsOtpModalOpen(false)}
        onSuccess={() => navigate(redirectPath, { replace: true })}
        title="Sign In with Mobile OTP"
        subtitle="Enter your 10-digit mobile number to sign in instantly with a 6-digit code."
      />
    </div>
  );
}
