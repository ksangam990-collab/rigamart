import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, CreditCard, Banknote, AlertCircle, X, CheckCircle } from 'lucide-react';
import api from '../../utils/api.js';
import { clearCart } from '../../features/cart/cartSlice.js';
import { modalBackdropVariants, modalContentVariants } from '../../utils/animations.js';

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

export default function CheckoutModal({ isOpen, onClose, cart, selectedAddress }) {
  const [paymentMethod, setPaymentMethod] = useState('RAZORPAY');
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const totalPayable = cart?.totalAmount || 0;

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
        paymentMethod
      });

      const orderData = res.data.data;

      // 2. Handle Cash on Delivery (COD)
      if (paymentMethod === 'COD') {
        dispatch(clearCart());
        setSuccessMsg('🎉 Order placed successfully with Cash on Delivery!');
        setTimeout(() => {
          onClose();
          navigate('/my-orders');
        }, 1500);
        return;
      }

      // 3. Handle Razorpay Gateway
      const isScriptLoaded = await loadRazorpayScript();
      if (!isScriptLoaded) {
        throw new Error('Failed to load Razorpay payment gateway SDK.');
      }

      const options = {
        key: orderData.keyId || orderData.key || import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: orderData.amount,
        currency: orderData.currency || 'INR',
        name: 'RIGAMART INDIA',
        description: `Order Payment for #${orderData.orderId}`,
        image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=100',
        order_id: orderData.razorpayOrderId,
        handler: async (response) => {
          try {
            // Verify HMAC signature on backend
            await api.post('/payment/verify', {
              orderId: orderData.orderId,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature
            });

            dispatch(clearCart());
            setSuccessMsg('Payment verified! Your order has been placed.');
            setTimeout(() => {
              onClose();
              navigate('/my-orders');
            }, 1500);
          } catch (verifyErr) {
            setErrorMsg(
              verifyErr.response?.data?.message || 'Payment signature verification failed.'
            );
          }
        },
        prefill: {
          name: selectedAddress.name,
          contact: selectedAddress.mobile
        },
        theme: {
          color: '#2563EB' // Brand blue
        },
        modal: {
          ondismiss: () => {
            setIsProcessing(false);
          }
        }
      };

      const razorpayInstance = new window.Razorpay(options);
      razorpayInstance.open();
    } catch (err) {
      setErrorMsg(err.response?.data?.message || err.message || 'Payment processing error.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            variants={modalBackdropVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
          />

          {/* Modal Container */}
          <motion.div
            variants={modalContentVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl relative space-y-6 z-10"
          >
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={onClose}
              className="absolute top-4 right-4 p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </motion.button>

            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-700 bg-brand-50 px-2.5 py-1 rounded-full mb-2">
                <ShieldCheck className="w-4 h-4" />
                256-bit Encrypted Checkout
              </div>
              <h2 className="text-xl font-black text-gray-900 tracking-tight">Confirm Payment & Delivery</h2>
            </div>

            {errorMsg && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-2 p-3 bg-red-50 text-red-700 text-xs rounded-xl border border-red-200"
              >
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{errorMsg}</span>
              </motion.div>
            )}

            {successMsg && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex items-center gap-2 p-3.5 bg-emerald-50 text-emerald-800 text-xs font-bold rounded-xl border border-emerald-200 shadow-sm"
              >
                <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                <span>{successMsg}</span>
              </motion.div>
            )}

            {/* Selected Shipping Address Snapshot */}
            <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 text-xs space-y-1">
              <div className="font-bold text-gray-700 uppercase tracking-wider text-[10px]">
                Delivery Destination:
              </div>
              {selectedAddress ? (
                <p className="text-gray-800 font-medium">
                  <span className="font-bold">{selectedAddress.name}</span> ({selectedAddress.mobile})<br />
                  {selectedAddress.street}, {selectedAddress.city}, {selectedAddress.state} -{' '}
                  <span className="font-bold">{selectedAddress.pincode}</span>
                </p>
              ) : (
                <p className="text-amber-600 font-semibold">No address selected.</p>
              )}
            </div>

            {/* Payment Method Selector */}
            <div className="space-y-3">
              <label className="text-xs font-bold uppercase tracking-wider text-gray-700 block">
                Select Payment Method
              </label>

              <div className="grid grid-cols-2 gap-3">
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  type="button"
                  onClick={() => setPaymentMethod('RAZORPAY')}
                  className={`p-4 rounded-xl border text-left flex flex-col justify-between transition-all ${
                    paymentMethod === 'RAZORPAY'
                      ? 'border-brand-600 bg-brand-50/70 ring-2 ring-brand-500 shadow-xs'
                      : 'border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <CreditCard className="w-5 h-5 text-brand-600" />
                    <span className="text-xs font-bold text-gray-900">Online Payment</span>
                  </div>
                  <span className="text-[11px] text-gray-500">
                    UPI, Cards, Net Banking
                  </span>
                </motion.button>

                <motion.button
                  whileTap={{ scale: 0.97 }}
                  type="button"
                  onClick={() => setPaymentMethod('COD')}
                  className={`p-4 rounded-xl border text-left flex flex-col justify-between transition-all ${
                    paymentMethod === 'COD'
                      ? 'border-emerald-600 bg-emerald-50/70 ring-2 ring-emerald-500 shadow-xs'
                      : 'border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <Banknote className="w-5 h-5 text-emerald-600" />
                    <span className="text-xs font-bold text-gray-900">Cash on Delivery</span>
                  </div>
                  <span className="text-[11px] text-gray-500">Doorstep cash payment</span>
                </motion.button>
              </div>
            </div>

            {/* Order Final Amount */}
            <div className="border-t border-gray-100 pt-4 flex items-center justify-between">
              <div>
                <span className="text-xs text-gray-400">Total Payable Amount</span>
                <div className="text-2xl font-black text-gray-900">
                  ₹{totalPayable.toLocaleString('en-IN')}
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                onClick={handlePayment}
                disabled={isProcessing || !selectedAddress}
                className="px-6 py-3 bg-brand-600 hover:bg-brand-700 text-white font-black text-sm rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center gap-2 disabled:opacity-50"
              >
                {isProcessing ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Processing...
                  </>
                ) : paymentMethod === 'COD' ? (
                  'Confirm Order (COD)'
                ) : (
                  'Proceed to Razorpay'
                )}
              </motion.button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
