import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CheckCircle2,
  Download,
  MapPin,
  PackageCheck,
  Smartphone
} from 'lucide-react';
import Button from '../components/ui/Button.jsx';
import Badge from '../components/ui/Badge.jsx';

export default function OrderSuccessPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state;

  const [waUpdates, setWaUpdates] = useState(() => {
    return localStorage.getItem('rigamart_wa_updates') === 'true';
  });
  const [phone, setPhone] = useState('');
  const [showConfetti, setShowConfetti] = useState(true);

  useEffect(() => {
    if (!state || !state.orderId) {
      navigate('/my-orders', { replace: true });
    }
  }, [state, navigate]);

  useEffect(() => {
    const timer = setTimeout(() => setShowConfetti(false), 3000);
    return () => clearTimeout(timer);
  }, []);

  const handleWaToggle = (e) => {
    const isChecked = e.target.checked;
    setWaUpdates(isChecked);
    localStorage.setItem('rigamart_wa_updates', isChecked);
  };

  if (!state || !state.orderId) return null;

  const { orderId, orderNumber, totalAmount, paymentMethod } = state;
  const coinsEarned = Math.floor((totalAmount || 0) * 0.02);
  const displayId = String(orderId).slice(-8).toUpperCase();

  // Generate 30 random confetti pieces
  const confettiPieces = Array.from({ length: 30 }).map((_, i) => ({
    id: i,
    left: `${Math.random() * 100}%`,
    animationDelay: `${Math.random() * 2}s`,
    animationDuration: `${2 + Math.random() * 2}s`,
    backgroundColor: ['#22c55e', '#3b82f6', '#f59e0b', '#ef4444', '#a855f7'][Math.floor(Math.random() * 5)]
  }));

  return (
    <div className="min-h-[80vh] bg-canvas flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* CSS-only Confetti */}
      {showConfetti && (
        <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
          <style>
            {`
              @keyframes fall {
                0% { transform: translateY(-20px) rotate(0deg); opacity: 1; }
                100% { transform: translateY(100vh) rotate(720deg); opacity: 0; }
              }
            `}
          </style>
          {confettiPieces.map((p) => (
            <div
              key={p.id}
              style={{
                position: 'absolute',
                top: '-20px',
                left: p.left,
                width: '10px',
                height: '10px',
                backgroundColor: p.backgroundColor,
                animationName: 'fall',
                animationDuration: p.animationDuration,
                animationDelay: p.animationDelay,
                animationFillMode: 'forwards',
                animationTimingFunction: 'linear'
              }}
            />
          ))}
        </div>
      )}

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full bg-surface rounded-3xl p-8 shadow-elevation border border-line relative z-10 space-y-6"
      >
        {/* Success Hero */}
        <div className="text-center space-y-3">
          <motion.svg
            className="w-24 h-24 mx-auto text-success"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <motion.path
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              d="M22 11.08V12a10 10 0 1 1-5.93-9.14"
            />
            <motion.path
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.5, delay: 0.8, ease: "easeOut" }}
              d="M22 4L12 14.01l-3-3"
            />
          </motion.svg>
          
          <h1 className="text-2xl font-black text-ink">Order Placed Successfully! 🎉</h1>
          <p className="text-sm font-medium text-muted">Order #RM-{displayId}</p>
          <p className="text-xs text-ink/80">Estimated delivery: 3–5 business days</p>
        </div>

        {/* SuperCoins Earned Badge */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="relative bg-gradient-to-r from-amber-50 to-amber-100/50 border border-amber-200 rounded-2xl p-4 text-center overflow-hidden group"
        >
          <div className="absolute inset-0 bg-amber-400/10 animate-pulse" />
          <div className="relative z-10">
            <p className="text-sm font-bold text-amber-700 flex items-center justify-center gap-1.5">
              <span>✨</span> You earned {coinsEarned} Rigamart Coins on this order!
            </p>
            <p className="text-[10px] text-amber-600/80 mt-1">
              Coins can be used on your next purchase for instant discounts.
            </p>
          </div>
        </motion.div>

        {/* Order Summary mini-card */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-canvas border border-line rounded-2xl p-4 space-y-4"
        >
          <div className="flex justify-between items-center text-sm">
            <span className="text-muted">Order Total:</span>
            <span className="font-bold text-ink">₹{totalAmount}</span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="text-muted">Payment Method:</span>
            <Badge variant="brand" size="sm">{paymentMethod}</Badge>
          </div>
          
          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-line">
            <Button variant="outline" size="sm" as={Link} to={`/orders/${orderId}`} className="text-xs">
              <Download className="w-3.5 h-3.5 mr-1" /> Invoice
            </Button>
            <Button variant="outline" size="sm" as={Link} to={`/orders/${orderId}`} className="text-xs">
              <PackageCheck className="w-3.5 h-3.5 mr-1" /> Track
            </Button>
          </div>
        </motion.div>

        {/* WhatsApp Updates Toggle */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-[#25D366]/5 border border-[#25D366]/20 rounded-2xl p-4 space-y-3"
        >
          <label className="flex items-center justify-between cursor-pointer">
            <div className="flex items-center gap-2">
              <Smartphone className="w-4 h-4 text-[#25D366]" />
              <span className="text-sm font-bold text-ink">Get order updates on WhatsApp</span>
            </div>
            <div className="relative inline-flex items-center">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={waUpdates}
                onChange={handleWaToggle}
              />
              <div className="w-9 h-5 bg-line peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#25D366]"></div>
            </div>
          </label>
          <AnimatePresence>
            {waUpdates && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <input
                  type="text"
                  placeholder="Enter WhatsApp Number"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-surface border border-line rounded-xl px-3 py-2 text-xs text-ink focus:outline-none focus:border-[#25D366] focus:ring-1 focus:ring-[#25D366]"
                />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* CTA Buttons Row */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="flex gap-3 pt-2"
        >
          <Button variant="primary" size="lg" className="flex-1 text-xs" onClick={() => navigate('/')}>
            Continue Shopping
          </Button>
          <Button variant="outline" size="lg" className="flex-1 text-xs" onClick={() => navigate('/my-orders')}>
            View All Orders
          </Button>
        </motion.div>

      </motion.div>
    </div>
  );
}
