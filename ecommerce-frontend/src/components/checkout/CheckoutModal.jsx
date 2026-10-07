import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShieldCheck,
  CreditCard,
  Banknote,
  AlertCircle,
  X,
  CheckCircle,
  Sparkles,
  Tag,
  Loader2,
  CheckCircle2
} from 'lucide-react';
import api from '../../utils/api.js';
import { clearCart } from '../../features/cart/cartSlice.js';
import Button from '../ui/Button.jsx';
import Badge from '../ui/Badge.jsx';
import { modalBackdropVariants, modalContentVariants } from '../../utils/animations.js';
import usePincode from '../../hooks/usePincode.js';

// Format Indian Currency standard
const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount || 0);
};

// Dynamic script loader for Razorpay Checkout
const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

export default function CheckoutModal({
  isOpen,
  onClose,
  cart,
  selectedAddress,
  appliedCoupon,
  onOpenCouponDrawer,
}) {
  const [paymentMethod, setPaymentMethod] = useState('RAZORPAY');
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const totalPayable = cart?.totalAmount || 0;
  
  // Use pincode auto-fill logic for the checkout modal (address section logic)
  const { city: autoCity, state: autoState, loading: pinLoading } = usePincode(selectedAddress?.pincode || '');

  const handlePayment = async () => {
    if (!selectedAddress) {
      setErrorMsg('Please select a shipping delivery address before checking out.');
      return;
    }

    setIsProcessing(true);
    setErrorMsg(null);

    try {
      // 1. Initiate order on backend
      const res = await api.post('/payment/create-order', {
        shippingAddress: selectedAddress,
        paymentMethod,
        couponCode: appliedCoupon?.code || undefined,
      });

      const orderData = res.data.data;

      // Scenario A: Cash on Delivery (Immediate completion)
      if (paymentMethod === 'COD') {
        dispatch(clearCart());
        setSuccessMsg('Your Cash on Delivery order has been placed successfully!');
        setTimeout(() => {
          onClose();
          navigate('/order-success', {
            state: {
              orderId: orderData.order?._id || orderData._id,
              orderNumber: orderData.order?.orderNumber || orderData.orderNumber || orderData.order?._id || orderData._id,
              totalAmount: totalPayable,
              paymentMethod: 'COD'
            }
          });
        }, 1500);
        return;
      }

      // Scenario B: Online Gateway via Razorpay
      const isLoaded = await loadRazorpayScript();
      if (!isLoaded) {
        throw new Error('Razorpay SDK failed to load. Please check your internet connection.');
      }

      const options = {
        key: orderData.razorpayKeyId,
        amount: orderData.amount,
        currency: orderData.currency || 'INR',
        name: 'Rigamart Marketplace',
        description: `Order #${orderData.orderId}`,
        order_id: orderData.razorpayOrderId,
        handler: async function (response) {
          try {
            // Verify payment signature
            await api.post('/payment/verify', {
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
              orderId: orderData.orderId,
            });

            dispatch(clearCart());
            setSuccessMsg('Payment confirmed! Your order is being prepared for dispatch.');
            setTimeout(() => {
              onClose();
              navigate('/order-success', {
                state: {
                  orderId: orderData.orderId,
                  orderNumber: orderData.orderId,
                  totalAmount: totalPayable,
                  paymentMethod: 'RAZORPAY'
                }
              });
            }, 1500);
          } catch (verifyErr) {
            setErrorMsg(
              verifyErr.response?.data?.message ||
                'Payment verification failed. Please contact support.'
            );
          }
        },
        prefill: {
          name: selectedAddress.name,
          contact: selectedAddress.mobile,
        },
        theme: {
          color: '#2563EB',
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', function (resp) {
        setErrorMsg(`Payment Failed: ${resp.error.description || 'Transaction declined'}`);
        setIsProcessing(false);
      });
      rzp.open();
    } catch (err) {
      setErrorMsg(
        err.response?.data?.message || err.message || 'Failed to initiate checkout. Please retry.'
      );
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 font-sans">
          {/* Backdrop */}
          <motion.div
            variants={modalBackdropVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={onClose}
            className="fixed inset-0 bg-ink/40 backdrop-blur-sm"
          />

          {/* Modal Card */}
          <motion.div
            variants={modalContentVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="bg-surface rounded-card max-w-lg w-full p-6 shadow-elevation border border-line relative space-y-6 z-10 text-ink"
          >
            <button
              type="button"
              onClick={onClose}
              className="absolute top-4 right-4 p-1.5 text-muted hover:text-ink rounded-lg hover:bg-canvas transition-colors"
              aria-label="Close dialog"
            >
              <X className="w-4 h-4" />
            </button>

            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-bold text-brand bg-brand-soft px-2.5 py-0.5 rounded-full mb-2">
                <ShieldCheck className="w-3.5 h-3.5" />
                256-bit Encrypted Escrow
              </div>
              <h2 className="text-xl font-bold font-display text-ink tracking-tight">
                Confirm Payment &amp; Delivery
              </h2>
            </div>

            {errorMsg && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-2 p-3 bg-danger/10 text-danger text-xs rounded-xl border border-danger/20 font-medium"
              >
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </motion.div>
            )}

            {successMsg && (
              <motion.div
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex items-center gap-2 p-3.5 bg-success/15 text-success text-xs font-bold rounded-xl border border-success/30 shadow-subtle"
              >
                <CheckCircle className="w-4 h-4 text-success shrink-0" />
                <span>{successMsg}</span>
              </motion.div>
            )}

            {/* Selected Shipping Address Snapshot */}
            <div className="bg-canvas p-4 rounded-xl border border-line text-xs space-y-1">
              <div className="font-bold text-muted uppercase tracking-wider text-[10px] font-mono">
                Delivery Destination
              </div>
              {selectedAddress ? (
                <p className="text-ink font-medium leading-relaxed">
                  <strong className="text-ink font-bold">{selectedAddress.name}</strong> ({selectedAddress.mobile})<br />
                  {selectedAddress.street}, {selectedAddress.city}, {selectedAddress.state} &ndash;{' '}
                  <span className="font-bold tabular-nums">{selectedAddress.pincode}</span>
                  {autoCity && autoState && (
                    <span className="inline-flex items-center gap-1 ml-2 text-[10px] text-success bg-success/10 px-1.5 py-0.5 rounded font-bold">
                      <CheckCircle2 className="w-3 h-3" /> Auto-filled
                    </span>
                  )}
                </p>
              ) : (
                <p className="text-warning font-semibold">No delivery address selected.</p>
              )}
            </div>

            {/* Payment Method Selector */}
            <div className="space-y-2.5">
              <label className="text-xs font-bold uppercase tracking-wider text-muted font-mono block">
                Select Payment Method
              </label>

              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('RAZORPAY')}
                  className={`p-3.5 rounded-xl border text-left flex flex-col justify-between transition-all shadow-subtle ${
                    paymentMethod === 'RAZORPAY'
                      ? 'border-brand bg-brand-soft ring-2 ring-brand/30 text-brand-dark'
                      : 'border-line bg-surface hover:bg-canvas text-ink'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1.5">
                    <CreditCard className="w-4 h-4 text-brand" />
                    <span className="text-xs font-bold">Online Payment</span>
                  </div>
                  <span className="text-[11px] text-muted leading-tight">
                    UPI, Cards, Net Banking
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('COD')}
                  className={`p-3.5 rounded-xl border text-left flex flex-col justify-between transition-all shadow-subtle ${
                    paymentMethod === 'COD'
                      ? 'border-brand bg-brand-soft ring-2 ring-brand/30 text-brand-dark'
                      : 'border-line bg-surface hover:bg-canvas text-ink'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1.5">
                    <Banknote className="w-4 h-4 text-brand" />
                    <span className="text-xs font-bold">Cash on Delivery</span>
                  </div>
                  <span className="text-[11px] text-muted leading-tight">
                    Doorstep cash payment
                  </span>
                </button>
              </div>
            </div>

            {/* Applied Coupon Banner */}
            {appliedCoupon && appliedCoupon.discountAmount > 0 ? (
              <div className="flex items-center justify-between bg-brand-soft border border-brand/20 rounded-xl px-3.5 py-2.5 text-xs">
                <div className="flex items-center gap-2 text-brand-dark font-semibold">
                  <Sparkles className="w-3.5 h-3.5 text-brand shrink-0" />
                  <div>
                    <span>
                      Coupon: <strong className="font-mono">{appliedCoupon.code}</strong>
                    </span>
                    <span className="text-[10px] text-muted block font-normal">
                      Promotional discount applied
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-bold text-brand-dark text-sm tabular-nums">
                    &minus;{formatCurrency(appliedCoupon.discountAmount)}
                  </span>
                  {onOpenCouponDrawer && (
                    <button
                      type="button"
                      onClick={onOpenCouponDrawer}
                      className="text-[11px] font-bold text-brand hover:underline"
                    >
                      Change
                    </button>
                  )}
                </div>
              </div>
            ) : (
              onOpenCouponDrawer && (
                <button
                  type="button"
                  onClick={onOpenCouponDrawer}
                  className="w-full flex items-center justify-between p-3 bg-canvas hover:bg-line/30 border border-dashed border-line rounded-xl text-xs text-ink transition-colors"
                >
                  <div className="flex items-center gap-2 font-bold">
                    <Tag className="w-3.5 h-3.5 text-accent" />
                    <span>Apply Coupon or Promo Code</span>
                  </div>
                  <span className="text-[11px] font-bold text-brand hover:underline">
                    View Offers &rarr;
                  </span>
                </button>
              )
            )}

            {/* Order Final Amount & Primary Checkout Action */}
            <div className="border-t border-line pt-4 flex items-center justify-between gap-4">
              <div>
                <span className="text-xs text-muted block">Total Payable</span>
                <div className="text-2xl font-black text-ink tracking-tight tabular-nums">
                  {formatCurrency(totalPayable)}
                </div>
              </div>

              <Button
                variant="primary"
                size="lg"
                onClick={handlePayment}
                isLoading={isProcessing}
                disabled={!selectedAddress}
              >
                {paymentMethod === 'COD' ? 'Confirm Order (COD)' : 'Proceed to Razorpay'}
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
