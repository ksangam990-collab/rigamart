import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { Mail, Lock, User, Phone, AlertCircle, ArrowRight, Store, ShoppingBag } from 'lucide-react';
import { registerUser, clearError } from '../features/auth/authSlice.js';
import Logo from '../components/common/Logo.jsx';
import GoogleAuthButton from '../components/auth/GoogleAuthButton.jsx';
import { Button } from '../components/ui/index.js';

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mobile, setMobile] = useState('');
  const [role, setRole] = useState('customer');

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { isLoading, error } = useSelector((state) => state.auth);

  const handleSubmit = async (e) => {
    e.preventDefault();
    dispatch(clearError());

    const result = await dispatch(
      registerUser({
        name,
        email,
        password,
        mobile: mobile ? mobile.trim() : undefined,
        role
      })
    );

    if (registerUser.fulfilled.match(result)) {
      navigate('/', { replace: true });
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
          <h1 className="text-2xl font-bold text-ink tracking-tight">Join Rigamart</h1>
          <p className="text-xs text-muted mt-1">Start shopping or sell products factory-direct</p>
        </div>

        {error && (
          <div className="flex items-center gap-2 p-3 bg-danger-soft border border-danger/20 text-danger text-xs rounded-xl">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Account Role Selector */}
          <div className="grid grid-cols-2 gap-3 mb-2">
            <button
              type="button"
              onClick={() => setRole('customer')}
              className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-1.5 transition-all text-xs font-semibold ${
                role === 'customer'
                  ? 'border-brand bg-brand-soft text-brand-dark shadow-subtle'
                  : 'border-line text-muted hover:bg-canvas'
              }`}
            >
              <ShoppingBag className="w-4 h-4" />
              <span>I'm a Customer</span>
            </button>
            <button
              type="button"
              onClick={() => setRole('seller')}
              className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-1.5 transition-all text-xs font-semibold ${
                role === 'seller'
                  ? 'border-brand bg-brand-soft text-brand-dark shadow-subtle'
                  : 'border-line text-muted hover:bg-canvas'
              }`}
            >
              <Store className="w-4 h-4" />
              <span>I'm a Seller</span>
            </button>
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-muted mb-1.5">
              Full Name
            </label>
            <div className="relative">
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Rohit Verma"
                className="w-full pl-10 pr-4 py-2.5 bg-canvas border border-line rounded-xl text-xs text-ink outline-none focus:bg-surface focus:border-brand focus:ring-1 focus:ring-brand transition-all placeholder:text-muted"
              />
              <User className="w-4 h-4 text-muted absolute left-3.5 top-3 pointer-events-none" />
            </div>
          </div>

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
                placeholder="rohit@example.com"
                className="w-full pl-10 pr-4 py-2.5 bg-canvas border border-line rounded-xl text-xs text-ink outline-none focus:bg-surface focus:border-brand focus:ring-1 focus:ring-brand transition-all placeholder:text-muted"
              />
              <Mail className="w-4 h-4 text-muted absolute left-3.5 top-3 pointer-events-none" />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-muted mb-1.5">
              Mobile Number (10 Digits)
            </label>
            <div className="relative">
              <input
                type="tel"
                value={mobile}
                onChange={(e) => setMobile(e.target.value)}
                placeholder="9876543210"
                maxLength={10}
                className="w-full pl-10 pr-4 py-2.5 bg-canvas border border-line rounded-xl text-xs text-ink outline-none focus:bg-surface focus:border-brand focus:ring-1 focus:ring-brand transition-all placeholder:text-muted"
              />
              <Phone className="w-4 h-4 text-muted absolute left-3.5 top-3 pointer-events-none" />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-muted mb-1.5">
              Password (Min 6 Characters)
            </label>
            <div className="relative">
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
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
            <span>Create Account</span>
            <ArrowRight className="w-4 h-4 ml-1.5" />
          </Button>
        </form>

        {/* Divider */}
        <div className="relative my-3">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-line" />
          </div>
          <div className="relative flex justify-center text-[10px] uppercase">
            <span className="bg-surface px-3 text-muted font-bold tracking-wider">Or register with</span>
          </div>
        </div>

        {/* Google Registration Button */}
        <GoogleAuthButton mode="register" role={role} enableOneTap={false} />

        <div className="text-center pt-1 text-xs text-muted">
          Already have an account?{' '}
          <Link to="/login" className="font-bold text-brand hover:underline">
            Sign In
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
