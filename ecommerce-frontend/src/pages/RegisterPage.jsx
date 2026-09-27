import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { Mail, Lock, User, Phone, AlertCircle, ArrowRight, Loader2, Store, ShoppingBag } from 'lucide-react';
import { registerUser, clearError } from '../features/auth/authSlice.js';
import Logo from '../components/common/Logo.jsx';

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
    <div className="min-h-[80vh] flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12">
      <motion.div
        initial={{ opacity: 0, y: 16, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
        className="max-w-md w-full bg-white rounded-2xl shadow-xl border border-gray-100 p-8 space-y-6"
      >
        <div className="text-center">
          <div className="flex justify-center mb-3">
            <Logo variant="icon" size="lg" />
          </div>
          <h2 className="text-2xl font-black text-gray-900 tracking-tight">Join Rigamart</h2>
          <p className="text-sm text-gray-500 mt-1">Start shopping or sell products across India</p>
        </div>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-2 p-3.5 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg"
          >
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </motion.div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Account Role Selector */}
          <div className="grid grid-cols-2 gap-3 mb-2">
            <motion.button
              whileTap={{ scale: 0.96 }}
              type="button"
              onClick={() => setRole('customer')}
              className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-1.5 transition-all text-xs font-semibold ${
                role === 'customer'
                  ? 'border-brand-600 bg-brand-50/70 text-brand-700 shadow-xs'
                  : 'border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}
            >
              <ShoppingBag className="w-4 h-4" />
              I'm a Customer
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.96 }}
              type="button"
              onClick={() => setRole('seller')}
              className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-1.5 transition-all text-xs font-semibold ${
                role === 'seller'
                  ? 'border-indigo-600 bg-indigo-50/70 text-indigo-700 shadow-xs'
                  : 'border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}
            >
              <Store className="w-4 h-4" />
              I'm a Seller
            </motion.button>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
              Full Name
            </label>
            <div className="relative">
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Rohit Verma"
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-800 focus:bg-white focus:border-brand-500 focus:ring-2 focus:ring-brand-100 outline-none transition-all"
              />
              <User className="w-4 h-4 text-gray-400 absolute left-3.5 top-3 pointer-events-none" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="rohit@example.com"
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-800 focus:bg-white focus:border-brand-500 focus:ring-2 focus:ring-brand-100 outline-none transition-all"
              />
              <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-3 pointer-events-none" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
              Mobile Number (10 Digits)
            </label>
            <div className="relative">
              <input
                type="tel"
                value={mobile}
                onChange={(e) => setMobile(e.target.value)}
                placeholder="9876543210"
                maxLength={10}
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-800 focus:bg-white focus:border-brand-500 focus:ring-2 focus:ring-brand-100 outline-none transition-all"
              />
              <Phone className="w-4 h-4 text-gray-400 absolute left-3.5 top-3 pointer-events-none" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
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
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-800 focus:bg-white focus:border-brand-500 focus:ring-2 focus:ring-brand-100 outline-none transition-all"
              />
              <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-3 pointer-events-none" />
            </div>
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={isLoading}
            className="w-full py-3 bg-brand-600 hover:bg-brand-700 text-white font-bold text-sm rounded-lg shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Creating Account...
              </>
            ) : (
              <>
                Register Account
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </motion.button>
        </form>

        <div className="text-center pt-2 text-xs text-gray-500">
          Already have an account?{' '}
          <Link to="/login" className="font-bold text-brand-600 hover:underline">
            Sign In
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
