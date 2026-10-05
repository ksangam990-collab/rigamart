import React, { useState, useEffect, useRef } from 'react';
import { useDispatch } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Phone,
  ShieldCheck,
  ArrowRight,
  Loader2,
  X,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Zap,
  Lock,
  UserCheck
} from 'lucide-react';
import api from '../../utils/api.js';
import { loginWithMobileOtp } from '../../features/auth/authSlice.js';
import { modalBackdropVariants, modalContentVariants } from '../../utils/animations.js';

export default function GuestOtpModal({
  isOpen,
  onClose,
  onSuccess,
  title = 'Instant Checkout with Mobile OTP',
  subtitle = 'No password needed. Enter your mobile number to checkout in seconds.'
}) {
  const dispatch = useDispatch();

  // Step: 1 = Enter Mobile, 2 = Enter 6-digit OTP
  const [step, setStep] = useState(1);
  const [mobile, setMobile] = useState('');
  const [name, setName] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);
  const [devOtpHint, setDevOtpHint] = useState(null);

  // 30-second resend countdown timer
  const [resendTimer, setResendTimer] = useState(30);
  const [canResend, setCanResend] = useState(false);

  const otpInputRefs = useRef([]);

  // Reset state when modal opens or closes
  useEffect(() => {
    if (isOpen) {
      setStep(1);
      setMobile('');
      setName('');
      setOtp(['', '', '', '', '', '']);
      setErrorMsg(null);
      setSuccessMsg(null);
      setDevOtpHint(null);
      setIsSubmitting(false);
    }
  }, [isOpen]);

  // Resend timer countdown interval
  useEffect(() => {
    let interval = null;
    if (step === 2 && resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    } else if (resendTimer === 0) {
      setCanResend(true);
    }
    return () => clearInterval(interval);
  }, [step, resendTimer]);

  // Step 1: Request 6-digit OTP
  const handleSendOtp = async (e) => {
    if (e) e.preventDefault();
    const cleanMobile = mobile.replace(/\D/g, '');

    if (!cleanMobile || !/^[6-9]\d{9}$/.test(cleanMobile)) {
      setErrorMsg('Please enter a valid 10-digit Indian mobile number (starts with 6-9)');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      const res = await api.post('/auth/send-otp', {
        identifier: cleanMobile,
        type: 'login'
      });

      if (res.data?.success) {
        setStep(2);
        setResendTimer(30);
        setCanResend(false);
        if (res.data?.data?.devOtp) {
          setDevOtpHint(res.data.data.devOtp);
        }
        // Focus first OTP input
        setTimeout(() => {
          otpInputRefs.current[0]?.focus();
        }, 100);
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to dispatch verification OTP. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Step 2: Handle Individual Digit Inputs
  const handleOtpChange = (index, value) => {
    const digit = value.replace(/\D/g, '').slice(-1);
    const newOtp = [...otp];
    newOtp[index] = digit;
    setOtp(newOtp);

    // Auto-advance to next input if digit entered
    if (digit && index < 5) {
      otpInputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
  };

  // Handle Paste (e.g. user copies '983421' from SMS)
  const handleOtpPaste = (e) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (!pasteData) return;

    const newOtp = [...otp];
    for (let i = 0; i < pasteData.length; i++) {
      newOtp[i] = pasteData[i];
    }
    setOtp(newOtp);

    const nextIndex = Math.min(pasteData.length, 5);
    otpInputRefs.current[nextIndex]?.focus();

    // Auto-verify if all 6 digits pasted
    if (pasteData.length === 6) {
      submitVerifyOtp(pasteData);
    }
  };

  // Step 2: Verify OTP & Authenticate/Auto-Provision
  const submitVerifyOtp = async (codeString) => {
    const fullCode = codeString || otp.join('');
    if (fullCode.length !== 6) {
      setErrorMsg('Please enter all 6 digits of the OTP verification code');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      const cleanMobile = mobile.replace(/\D/g, '');
      const result = await dispatch(
        loginWithMobileOtp({
          mobile: cleanMobile,
          code: fullCode,
          name: name.trim() || undefined
        })
      ).unwrap();

      setSuccessMsg('🎉 Verified! Preparing your checkout...');
      setTimeout(() => {
        if (onSuccess) {
          onSuccess(result);
        }
        onClose();
      }, 700);
    } catch (err) {
      setErrorMsg(typeof err === 'string' ? err : 'Invalid or expired OTP. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerifySubmit = (e) => {
    e.preventDefault();
    submitVerifyOtp();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          variants={modalBackdropVariants}
          initial="hidden"
          animate="visible"
          exit="hidden"
          onClick={onClose}
          className="fixed inset-0 bg-gray-900/60 backdrop-blur-xs transition-opacity"
        />

        <div className="flex min-h-full items-center justify-center p-4 text-center sm:p-0">
          <motion.div
            variants={modalContentVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="relative transform overflow-hidden rounded-2xl bg-white text-left shadow-2xl transition-all sm:my-8 sm:w-full sm:max-w-md p-6 sm:p-7 border border-gray-100"
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute right-4 top-4 p-1.5 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Header Icon & Title */}
            <div className="text-center sm:text-left">
              <div className="w-12 h-12 rounded-2xl bg-brand-50 border border-brand-200/80 flex items-center justify-center text-brand-600 mb-3 shadow-2xs mx-auto sm:mx-0">
                {step === 1 ? (
                  <Phone className="w-6 h-6 stroke-[2.2]" />
                ) : (
                  <ShieldCheck className="w-6 h-6 stroke-[2.2] text-emerald-600" />
                )}
              </div>

              <h3 className="text-xl font-black text-gray-900 tracking-tight">
                {step === 1 ? title : 'Verify Mobile OTP'}
              </h3>
              <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                {step === 1 ? (
                  subtitle
                ) : (
                  <>
                    Enter the 6-digit code sent to{' '}
                    <strong className="text-gray-900">+91 {mobile}</strong>
                  </>
                )}
              </p>
            </div>

            {/* Error Notification */}
            {errorMsg && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4 p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-2.5 text-rose-700 text-xs"
              >
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span className="leading-snug">{errorMsg}</span>
              </motion.div>
            )}

            {/* Success Notification */}
            {successMsg && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4 p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2.5 text-emerald-800 text-xs font-bold"
              >
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                <span>{successMsg}</span>
              </motion.div>
            )}

            {/* Dev OTP Hint Banner (development mode only) */}
            {devOtpHint && step === 2 && (
              <div className="mt-3 p-2.5 bg-amber-50 border border-amber-200 rounded-lg text-[11px] text-amber-800 flex items-center justify-between">
                <span>🔑 Test OTP Code: <strong className="font-mono text-xs">{devOtpHint}</strong></span>
                <button
                  type="button"
                  onClick={() => {
                    const digits = devOtpHint.split('');
                    setOtp(digits);
                    submitVerifyOtp(devOtpHint);
                  }}
                  className="px-2 py-0.5 bg-amber-200 hover:bg-amber-300 text-amber-900 font-bold rounded text-[10px]"
                >
                  Auto-Fill
                </button>
              </div>
            )}

            {/* STEP 1: Enter Mobile Number */}
            {step === 1 && (
              <form onSubmit={handleSendOtp} className="mt-5 space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                    Mobile Number
                  </label>
                  <div className="relative flex rounded-xl border border-gray-300 focus-within:border-brand-500 focus-within:ring-2 focus-within:ring-brand-100 overflow-hidden shadow-2xs transition-all">
                    <span className="inline-flex items-center gap-1.5 px-3 bg-gray-50 text-gray-600 text-xs font-bold border-r border-gray-200 select-none">
                      <span className="text-base">🇮🇳</span>
                      <span>+91</span>
                    </span>
                    <input
                      type="tel"
                      required
                      autoFocus
                      maxLength={10}
                      value={mobile}
                      onChange={(e) => setMobile(e.target.value.replace(/\D/g, ''))}
                      placeholder="Enter 10-digit number"
                      className="w-full px-3 py-2.5 text-sm text-gray-900 font-semibold tracking-wide outline-none placeholder:font-normal placeholder:text-gray-400"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                    Full Name <span className="text-gray-400 font-normal lowercase">(optional)</span>
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Rahul Sharma"
                    className="w-full px-3.5 py-2.5 bg-white border border-gray-300 rounded-xl text-xs text-gray-800 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100 shadow-2xs transition-all"
                  />
                </div>

                <motion.button
                  type="submit"
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.98 }}
                  disabled={isSubmitting || mobile.length < 10}
                  className="w-full py-3 bg-brand-600 hover:bg-brand-700 text-white font-bold text-sm rounded-xl shadow-md flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Sending OTP...</span>
                    </>
                  ) : (
                    <>
                      <Zap className="w-4 h-4 text-amber-300 fill-amber-300" />
                      <span>Send Verification Code</span>
                      <ArrowRight className="w-4 h-4 ml-1" />
                    </>
                  )}
                </motion.button>

                <div className="pt-2 flex items-center justify-center gap-2 text-[11px] text-gray-500 font-medium">
                  <Lock className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Zero password friction • Instant order tracking</span>
                </div>
              </form>
            )}

            {/* STEP 2: Enter 6-digit OTP */}
            {step === 2 && (
              <form onSubmit={handleVerifySubmit} className="mt-5 space-y-5">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
                      Enter 6-Digit OTP
                    </label>
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="text-xs font-semibold text-brand-600 hover:text-brand-800 hover:underline"
                    >
                      Change Number
                    </button>
                  </div>

                  {/* 6 Individual Digit Inputs */}
                  <div className="flex items-center justify-between gap-1.5 sm:gap-2" onPaste={handleOtpPaste}>
                    {otp.map((digit, idx) => (
                      <input
                        key={idx}
                        ref={(el) => (otpInputRefs.current[idx] = el)}
                        type="tel"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleOtpChange(idx, e.target.value)}
                        onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                        className={`w-11 h-12 sm:w-12 sm:h-13 text-center text-lg font-black rounded-xl border outline-none transition-all ${
                          digit
                            ? 'border-brand-600 bg-brand-50/40 text-brand-900 ring-2 ring-brand-100'
                            : 'border-gray-300 bg-gray-50 text-gray-900 focus:bg-white focus:border-brand-500 focus:ring-2 focus:ring-brand-100'
                        }`}
                      />
                    ))}
                  </div>
                </div>

                {/* Resend Timer / Resend Button */}
                <div className="flex items-center justify-between text-xs text-gray-500 pt-1">
                  <span>Didn&apos;t receive code?</span>
                  {canResend ? (
                    <button
                      type="button"
                      onClick={handleSendOtp}
                      disabled={isSubmitting}
                      className="font-bold text-brand-600 hover:text-brand-800 flex items-center gap-1 hover:underline"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>Resend OTP</span>
                    </button>
                  ) : (
                    <span className="font-semibold text-gray-400">
                      Resend in {resendTimer}s
                    </span>
                  )}
                </div>

                <motion.button
                  type="submit"
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.98 }}
                  disabled={isSubmitting || otp.join('').length < 6}
                  className="w-full py-3 bg-brand-600 hover:bg-brand-700 text-white font-bold text-sm rounded-xl shadow-md flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Verifying Code...</span>
                    </>
                  ) : (
                    <>
                      <UserCheck className="w-4 h-4" />
                      <span>Verify & Continue to Checkout</span>
                    </>
                  )}
                </motion.button>
              </form>
            )}
          </motion.div>
        </div>
      </div>
    </AnimatePresence>
  );
}
