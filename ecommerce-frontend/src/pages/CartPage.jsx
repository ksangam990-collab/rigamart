import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShoppingCart,
  Trash2,
  Plus,
  Minus,
  MapPin,
  ShieldCheck,
  ArrowRight,
  ShoppingBag,
  CheckCircle,
  PlusCircle,
  AlertTriangle,
  Truck,
  Sparkles,
  Navigation,
  Loader2,
  Tag,
  Ticket,
  X
} from 'lucide-react';
import api from '../utils/api.js';
import { triggerConfetti } from '../utils/confetti.js';
import {
  fetchCart,
  updateCartQuantity,
  removeFromCart,
  clearCart
} from '../features/cart/cartSlice.js';
import CheckoutModal from '../components/checkout/CheckoutModal.jsx';
import GuestOtpModal from '../components/checkout/GuestOtpModal.jsx';
import { drawerSlideDown, EASINGS } from '../utils/animations.js';

export default function CartPage() {
  const dispatch = useDispatch();
  const cart = useSelector((state) => state.cart);
  const { isAuthenticated, user } = useSelector((state) => state.auth);

  const [addresses, setAddresses] = useState([]);
  const [selectedAddressIndex, setSelectedAddressIndex] = useState(0);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isGuestOtpOpen, setIsGuestOtpOpen] = useState(false);

  // Coupon state
  const [couponInput, setCouponInput] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [availableCoupons, setAvailableCoupons] = useState([]);
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);
  const [couponError, setCouponError] = useState(null);
  const [couponSuccess, setCouponSuccess] = useState(null);
  const [showAvailableCoupons, setShowAvailableCoupons] = useState(false);

  // Address form fields
  const [addrName, setAddrName] = useState('');
  const [addrMobile, setAddrMobile] = useState('');
  const [addrStreet, setAddrStreet] = useState('');
  const [addrCity, setAddrCity] = useState('');
  const [addrState, setAddrState] = useState('');
  const [addrPincode, setAddrPincode] = useState('');
  const [savingAddress, setSavingAddress] = useState(false);
  const [locating, setLocating] = useState(false);
  const [geoNotice, setGeoNotice] = useState(null);

  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      setGeoNotice({ type: 'error', text: 'Geolocation is not supported by your browser.' });
      return;
    }

    setLocating(true);
    setGeoNotice({ type: 'info', text: 'Detecting your GPS location...' });

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const { latitude, longitude } = pos.coords;
          setGeoNotice({ type: 'info', text: 'Resolving address details...' });
          const res = await api.get('/users/reverse-geocode', {
            params: { lat: latitude, lon: longitude }
          });
          if (res.data?.success && res.data.data) {
            const { street, city, state, pincode, landmark } = res.data.data;
            if (street) setAddrStreet(street);
            if (city) setAddrCity(city);
            if (state) setAddrState(state);
            if (pincode) setAddrPincode(pincode);
            const detectedArea = [city, state].filter(Boolean).join(', ');
            setGeoNotice({
              type: 'success',
              text: `Location detected: ${detectedArea || 'Address updated'}`
            });
            setTimeout(() => setGeoNotice(null), 4000);
          }
        } catch (err) {
          setGeoNotice({
            type: 'error',
            text: err.response?.data?.message || 'Failed to resolve location address. Please fill manually.'
          });
        } finally {
          setLocating(false);
        }
      },
      (err) => {
        setLocating(false);
        if (err.code === 1) {
          setGeoNotice({
            type: 'error',
            text: 'Location permission was denied. Please allow access in browser or fill manually.'
          });
        } else if (err.code === 3) {
          setGeoNotice({ type: 'error', text: 'Location request timed out. Please enter manually.' });
        } else {
          setGeoNotice({ type: 'error', text: 'Unable to detect location. Please fill manually.' });
        }
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    );
  };

  // Fetch fresh cart and user profile addresses
  useEffect(() => {
    dispatch(fetchCart());

    if (isAuthenticated) {
      api.get('/users/profile')
        .then((res) => {
          const addrs = res.data.data?.user?.addresses || [];
          setAddresses(addrs);
          const defaultIdx = addrs.findIndex((a) => a.isDefault);
          setSelectedAddressIndex(defaultIdx >= 0 ? defaultIdx : 0);
        })
        .catch(() => {});
    }
  }, [dispatch, isAuthenticated]);

  const handleAddNewAddress = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      // Store locally for guest buyer
      const localAddr = {
        _id: 'guest_addr_' + Date.now(),
        name: addrName,
        mobile: addrMobile,
        street: addrStreet,
        city: addrCity,
        state: addrState,
        pincode: addrPincode,
        isDefault: true
      };
      setAddresses([localAddr]);
      setSelectedAddressIndex(0);
      setShowAddressForm(false);
      setAddrName('');
      setAddrMobile('');
      setAddrStreet('');
      setAddrCity('');
      setAddrState('');
      setAddrPincode('');
      return;
    }

    setSavingAddress(true);

    try {
      const res = await api.post('/users/address', {
        name: addrName,
        mobile: addrMobile,
        street: addrStreet,
        city: addrCity,
        state: addrState,
        pincode: addrPincode,
        isDefault: addresses.length === 0
      });
      const newAddrs = res.data.data?.addresses || [];
      setAddresses(newAddrs);
      setSelectedAddressIndex(newAddrs.length - 1);
      setShowAddressForm(false);
      // Reset form
      setAddrName('');
      setAddrMobile('');
      setAddrStreet('');
      setAddrCity('');
      setAddrState('');
      setAddrPincode('');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to save address');
    } finally {
      setSavingAddress(false);
    }
  };

  const handleProceedToCheckout = () => {
    if (!isAuthenticated) {
      setIsGuestOtpOpen(true);
      return;
    }
    setIsCheckoutOpen(true);
  };

  const handleGuestOtpSuccess = () => {
    // Reload user addresses and open checkout
    api.get('/users/profile')
      .then((res) => {
        const addrs = res.data.data?.user?.addresses || [];
        if (addrs.length > 0) {
          setAddresses(addrs);
          const defaultIdx = addrs.findIndex((a) => a.isDefault);
          setSelectedAddressIndex(defaultIdx >= 0 ? defaultIdx : 0);
        }
      })
      .catch(() => {});
    dispatch(fetchCart());
    setIsCheckoutOpen(true);
  };

  // Fetch available active coupons
  useEffect(() => {
    api.get('/coupons/active')
      .then((res) => {
        if (res.data?.success && res.data.data?.coupons) {
          setAvailableCoupons(res.data.data.coupons);
        }
      })
      .catch(() => {});
  }, []);

  const items = cart.items || [];
  const selectedAddress = addresses[selectedAddressIndex] || null;

  // Calculate live item subtotals using currentPrice (live variant price) or priceAtAddition
  const computedItemsPrice = items.reduce(
    (acc, i) => acc + (i.currentPrice ?? i.priceAtAddition ?? i.price ?? 0) * (i.quantity || 1),
    0
  );
  const itemsSubtotal = cart.itemsPrice || computedItemsPrice;
  const couponDiscount = appliedCoupon
    ? Math.min(appliedCoupon.discountAmount, itemsSubtotal)
    : 0;
  const postDiscountSubtotal = Math.max(0, itemsSubtotal - couponDiscount);
  const shippingFee = cart.shippingPrice ?? (itemsSubtotal >= 500 ? 0 : 40);
  const totalPayable = Math.max(0, postDiscountSubtotal + shippingFee);
  const progressToFreeShipping = Math.min(100, Math.round((itemsSubtotal / 500) * 100));

  // Invalidate coupon if cart total drops below required minimum
  useEffect(() => {
    if (appliedCoupon && itemsSubtotal < appliedCoupon.minCartValue) {
      setCouponError(
        `Coupon "${appliedCoupon.code}" removed: Minimum order value of ₹${appliedCoupon.minCartValue} no longer met.`
      );
      setAppliedCoupon(null);
    }
  }, [itemsSubtotal, appliedCoupon]);

  const handleApplyCoupon = async (codeOverride) => {
    const targetCode = (codeOverride || couponInput || '').trim().toUpperCase();
    if (!targetCode) {
      setCouponError('Please enter a coupon code');
      return;
    }

    setIsApplyingCoupon(true);
    setCouponError(null);
    setCouponSuccess(null);

    try {
      const res = await api.post('/coupons/apply', {
        code: targetCode,
        itemsPrice: itemsSubtotal
      });

      if (res.data?.success && res.data.data) {
        setAppliedCoupon(res.data.data);
        setCouponInput('');
        setCouponSuccess(res.data.message || `Coupon "${targetCode}" applied!`);
        triggerConfetti({ origin: { x: 0.75, y: 0.45 } });
        setTimeout(() => setCouponSuccess(null), 5000);
      }
    } catch (err) {
      setCouponError(
        err.response?.data?.message || 'Invalid or expired coupon code. Please try again.'
      );
    } finally {
      setIsApplyingCoupon(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponError(null);
    setCouponSuccess(null);
  };

  if (cart.isLoading && items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-48" />
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8 space-y-4">
            <div className="h-28 bg-gray-200 rounded-2xl w-full" />
            <div className="h-28 bg-gray-200 rounded-2xl w-full" />
            <div className="h-28 bg-gray-200 rounded-2xl w-full" />
          </div>
          <div className="lg:col-span-4">
            <div className="h-64 bg-gray-200 rounded-2xl w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="max-w-xl mx-auto py-20 px-4 text-center space-y-5">
        <motion.div
          animate={{ y: [0, -8, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          className="w-20 h-20 rounded-full bg-brand-50 text-brand-600 mx-auto flex items-center justify-center shadow-inner"
        >
          <ShoppingBag className="w-10 h-10" />
        </motion.div>
        <h2 className="text-2xl font-black text-gray-900 tracking-tight">Your Cart is Empty</h2>
        <p className="text-xs text-gray-500 max-w-sm mx-auto leading-relaxed">
          Looks like you haven't added anything to your cart yet. Explore our trending catalog and discover verified factory deals!
        </p>
        <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }} className="pt-2">
          <Link
            to="/search"
            className="inline-flex items-center gap-2 px-6 py-3 bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs rounded-xl shadow-md transition-all"
          >
            Explore Catalog Now
            <ArrowRight className="w-4 h-4" />
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div className="flex items-center justify-between pb-4 border-b border-gray-200">
        <h1 className="text-2xl font-black text-gray-900 tracking-tight flex items-center gap-2">
          <ShoppingCart className="w-6 h-6 text-brand-600" />
          Shopping Cart ({cart.totalCount || items.length} items)
        </h1>
        <motion.button
          whileTap={{ scale: 0.94 }}
          onClick={() => dispatch(clearCart())}
          className="text-xs font-semibold text-red-600 hover:text-red-700 hover:underline flex items-center gap-1 transition-colors"
        >
          <Trash2 className="w-3.5 h-3.5" />
          Clear Cart
        </motion.button>
      </div>

      {/* Free Shipping Gamification Meter */}
      <motion.div
        layout
        className={`p-4 rounded-2xl border transition-colors duration-300 space-y-2.5 ${
          progressToFreeShipping >= 100
            ? 'bg-gradient-to-r from-emerald-50/90 via-teal-50/70 to-emerald-50/90 border-emerald-200/90 shadow-xs'
            : 'bg-brand-50/80 border-brand-100'
        }`}
      >
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            {progressToFreeShipping >= 100 ? (
              <motion.div
                initial={{ scale: 0, rotate: -20 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: 'spring', stiffness: 350, damping: 20 }}
                className="w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-xs"
              >
                <Sparkles className="w-3 h-3" />
              </motion.div>
            ) : (
              <div className="w-5 h-5 rounded-full bg-brand-100 text-brand-600 flex items-center justify-center shrink-0">
                <Truck className="w-3 h-3" />
              </div>
            )}
            <span
              className={`font-bold tabular-nums ${
                progressToFreeShipping >= 100 ? 'text-emerald-900' : 'text-brand-900'
              }`}
            >
              {progressToFreeShipping >= 100 ? (
                <span>🎉 Free Pan-India Express Delivery Unlocked!</span>
              ) : (
                `Add ₹${(500 - itemsSubtotal).toLocaleString('en-IN')} more to unlock FREE Delivery!`
              )}
            </span>
          </div>
          <span
            className={`font-black tabular-nums ${
              progressToFreeShipping >= 100 ? 'text-emerald-700' : 'text-brand-700'
            }`}
          >
            {progressToFreeShipping}%
          </span>
        </div>

        {/* Progress Track */}
        <div className="w-full h-2.5 bg-brand-200/40 rounded-full overflow-hidden relative">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progressToFreeShipping}%` }}
            transition={{
              type: 'spring',
              stiffness: 140,
              damping: 18,
              mass: 0.8
            }}
            className={`h-full rounded-full relative overflow-hidden transition-colors duration-300 ${
              progressToFreeShipping >= 100
                ? 'bg-gradient-to-r from-emerald-500 to-teal-500 shadow-[0_0_10px_rgba(16,185,129,0.4)]'
                : 'bg-gradient-to-r from-brand-500 to-brand-600 shadow-[0_0_8px_rgba(234,88,12,0.3)]'
            }`}
          >
            {/* Smooth moving shimmer effect */}
            <motion.div
              animate={{ x: ['-100%', '200%'] }}
              transition={{
                repeat: Infinity,
                duration: 2.2,
                ease: 'easeInOut'
              }}
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/35 to-transparent w-full h-full pointer-events-none"
            />
          </motion.div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Cart Items & Delivery Address Picker (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          {/* Shipping Address Selection Section */}
          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-black uppercase tracking-wider text-gray-800 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-brand-600" />
                Select Delivery Address
              </h2>
              <motion.button
                whileTap={{ scale: 0.95 }}
                type="button"
                onClick={() => setShowAddressForm(!showAddressForm)}
                className="text-xs font-bold text-brand-600 hover:text-brand-700 flex items-center gap-1 transition-colors"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                Add New Address
              </motion.button>
            </div>

            {/* Address List */}
            {addresses.length === 0 && !showAddressForm ? (
              <div className="p-4 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-800 font-medium">
                No delivery address found. Please add a shipping destination to proceed with checkout.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {addresses.map((addr, idx) => (
                  <motion.div
                    key={addr._id || idx}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setSelectedAddressIndex(idx)}
                    className={`p-4 rounded-xl border cursor-pointer transition-all ${
                      selectedAddressIndex === idx
                        ? 'border-brand-600 bg-brand-50/50 ring-2 ring-brand-500 shadow-xs'
                        : 'border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-xs text-gray-900">{addr.name}</span>
                      {selectedAddressIndex === idx && (
                        <CheckCircle className="w-4 h-4 text-brand-600" />
                      )}
                    </div>
                    <p className="text-[11px] text-gray-600 leading-relaxed">
                      {addr.street}, {addr.city}, {addr.state} - {addr.pincode}
                    </p>
                    <span className="text-[10px] text-gray-500 font-semibold mt-1 block">
                      Phone: {addr.mobile}
                    </span>
                  </motion.div>
                ))}
              </div>
            )}

            {/* Inline New Address Form with Animated Accordion */}
            <AnimatePresence>
              {showAddressForm && (
                <motion.form
                  variants={drawerSlideDown}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  onSubmit={handleAddNewAddress}
                  className="p-4 bg-gray-50 rounded-xl border border-gray-200 space-y-3"
                >
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pb-1 border-b border-gray-200/80">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-gray-700">New Address Details</h3>
                    <button
                      type="button"
                      onClick={handleUseCurrentLocation}
                      disabled={locating}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-brand-50 hover:bg-brand-100 text-brand-700 text-xs font-bold rounded-lg border border-brand-200 transition-colors disabled:opacity-60 shadow-xs"
                    >
                      {locating ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin text-brand-600" />
                          <span>Detecting Location...</span>
                        </>
                      ) : (
                        <>
                          <Navigation className="w-3.5 h-3.5 text-brand-600" />
                          <span>Use Current Location</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Geolocation feedback notification banner */}
                  {geoNotice && (
                    <div
                      className={`text-xs px-3 py-2 rounded-xl flex items-center gap-2 ${
                        geoNotice.type === 'success'
                          ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                          : geoNotice.type === 'info'
                          ? 'bg-blue-50 text-blue-800 border border-blue-200'
                          : 'bg-amber-50 text-amber-800 border border-amber-200'
                      }`}
                    >
                      <span>{geoNotice.text}</span>
                    </div>
                  )}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <input
                      type="text"
                      required
                      placeholder="Recipient Name"
                      value={addrName}
                      onChange={(e) => setAddrName(e.target.value)}
                      className="px-3 py-2 bg-white border border-gray-200 rounded-lg text-xs outline-none focus:border-brand-500"
                    />
                    <input
                      type="tel"
                      required
                      maxLength={10}
                      placeholder="Mobile Number (10 digits)"
                      value={addrMobile}
                      onChange={(e) => setAddrMobile(e.target.value)}
                      className="px-3 py-2 bg-white border border-gray-200 rounded-lg text-xs outline-none focus:border-brand-500"
                    />
                    <input
                      type="text"
                      required
                      placeholder="House/Street, Landmark"
                      value={addrStreet}
                      onChange={(e) => setAddrStreet(e.target.value)}
                      className="px-3 py-2 bg-white border border-gray-200 rounded-lg text-xs sm:col-span-2 outline-none focus:border-brand-500"
                    />
                    <input
                      type="text"
                      required
                      placeholder="City"
                      value={addrCity}
                      onChange={(e) => setAddrCity(e.target.value)}
                      className="px-3 py-2 bg-white border border-gray-200 rounded-lg text-xs outline-none focus:border-brand-500"
                    />
                    <input
                      type="text"
                      required
                      placeholder="State"
                      value={addrState}
                      onChange={(e) => setAddrState(e.target.value)}
                      className="px-3 py-2 bg-white border border-gray-200 rounded-lg text-xs outline-none focus:border-brand-500"
                    />
                    <input
                      type="text"
                      required
                      maxLength={6}
                      placeholder="PIN Code (6 digits)"
                      value={addrPincode}
                      onChange={(e) => setAddrPincode(e.target.value)}
                      className="px-3 py-2 bg-white border border-gray-200 rounded-lg text-xs outline-none focus:border-brand-500"
                    />
                  </div>
                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowAddressForm(false)}
                      className="px-3 py-1.5 border border-gray-200 text-gray-600 rounded-lg text-xs hover:bg-gray-100 transition-colors"
                    >
                      Cancel
                    </button>
                    <motion.button
                      whileTap={{ scale: 0.96 }}
                      type="submit"
                      disabled={savingAddress}
                      className="px-4 py-1.5 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-lg text-xs shadow-sm transition-colors"
                    >
                      {savingAddress ? 'Saving...' : 'Save & Select Address'}
                    </motion.button>
                  </div>
                </motion.form>
              )}
            </AnimatePresence>
          </div>

          {/* Cart Item Cards with AnimatePresence exit animations */}
          <div className="space-y-4">
            <AnimatePresence mode="popLayout">
              {items.map((item) => {
                const product = item.product || {};
                const imageUrl =
                  product.images?.[0]?.url ||
                  product.images?.[0] ||
                  'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=200';

                const unitPrice = item.currentPrice ?? item.priceAtAddition ?? item.price ?? 0;
                const subtotal = unitPrice * (item.quantity || 1);

                return (
                  <motion.div
                    key={item._id}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -24, height: 0, marginBottom: 0, overflow: 'hidden' }}
                    transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
                    className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex flex-col sm:flex-row gap-5 items-start sm:items-center justify-between"
                  >
                    <div className="flex items-start gap-4 w-full sm:w-auto">
                      <img
                        src={imageUrl}
                        alt={product.name || 'Product'}
                        className="w-20 h-20 object-cover rounded-xl border border-gray-100 flex-shrink-0"
                      />
                      <div className="space-y-1">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                          {product.brand || 'Rigamart Exclusive'}
                        </span>
                        <h3 className="text-sm font-bold text-gray-900 line-clamp-1">{product.name}</h3>

                        <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500 pt-0.5">
                          {item.size && (
                            <span className="bg-gray-100 px-2 py-0.5 rounded text-[11px] font-medium text-gray-700">
                              Size: <strong className="text-gray-900">{item.size}</strong>
                            </span>
                          )}
                          {item.color && (
                            <span className="bg-gray-100 px-2 py-0.5 rounded text-[11px] font-medium text-gray-700">
                              Color: <strong className="text-gray-900">{item.color}</strong>
                            </span>
                          )}
                          {item.sku && (
                            <span className="font-mono text-[10px] text-gray-400">
                              SKU: {item.sku}
                            </span>
                          )}
                        </div>

                        {item.hasPriceChanged && (
                          <div className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded">
                            <AlertTriangle className="w-3 h-3 text-amber-600" />
                            Price updated from ₹{item.priceAtAddition} to ₹{item.currentPrice}
                          </div>
                        )}

                        {!item.isAvailable && item.unavailableReason && (
                          <div className="text-[10px] font-bold text-red-700 bg-red-50 border border-red-200 px-2 py-0.5 rounded inline-block">
                            {item.unavailableReason}
                          </div>
                        )}

                        <div className="text-xs font-black text-gray-900 pt-1 tabular-nums">
                          ₹{unitPrice.toLocaleString('en-IN')}{' '}
                          <span className="text-[11px] font-normal text-gray-500">each</span>
                        </div>
                      </div>
                    </div>

                    {/* Quantity Controller & Delete */}
                    <div className="flex items-center justify-between w-full sm:w-auto sm:gap-6 pt-3 sm:pt-0 border-t sm:border-t-0 border-gray-100">
                      <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden bg-gray-50 shadow-2xs">
                        <motion.button
                          whileTap={{ scale: 0.88 }}
                          onClick={() =>
                            dispatch(
                              updateCartQuantity({
                                itemId: item._id,
                                quantity: Math.max(1, item.quantity - 1)
                              })
                            )
                          }
                          className="w-8 h-8 sm:w-7 sm:h-7 flex items-center justify-center text-gray-600 hover:bg-gray-200 font-bold transition-colors"
                          aria-label="Decrease quantity"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </motion.button>
                        <span className="px-2 sm:px-3 py-1 text-xs font-bold text-gray-900 bg-white min-w-[32px] text-center tabular-nums">
                          {item.quantity}
                        </span>
                        <motion.button
                          whileTap={{ scale: 0.88 }}
                          onClick={() =>
                            dispatch(
                              updateCartQuantity({
                                itemId: item._id,
                                quantity: item.quantity + 1
                              })
                            )
                          }
                          className="w-8 h-8 sm:w-7 sm:h-7 flex items-center justify-center text-gray-600 hover:bg-gray-200 font-bold transition-colors"
                          aria-label="Increase quantity"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </motion.button>
                      </div>

                      <div className="text-right sm:min-w-[80px]">
                        <span className="text-sm font-black text-gray-900 block tabular-nums">
                          ₹{subtotal.toLocaleString('en-IN')}
                        </span>
                      </div>

                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => dispatch(removeFromCart(item._id))}
                        className="p-2 sm:p-1.5 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                        title="Remove item"
                        aria-label="Remove item from cart"
                      >
                        <Trash2 className="w-4 h-4" />
                      </motion.button>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        </div>

        {/* Right Column: Coupon Card + Price Breakdown Card (4 cols) */}
        <div className="lg:col-span-4 sticky top-24 space-y-4">
          {/* Coupon & Promo Code Section */}
          <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-black uppercase tracking-wider text-gray-800 flex items-center gap-1.5">
                <Tag className="w-4 h-4 text-brand-600" />
                Coupons & Offers
              </h3>
              {availableCoupons.length > 0 && (
                <button
                  type="button"
                  onClick={() => setShowAvailableCoupons((prev) => !prev)}
                  className="text-[11px] font-bold text-brand-600 hover:text-brand-700 hover:underline flex items-center gap-1 transition-colors"
                >
                  {showAvailableCoupons ? 'Hide Offers' : `${availableCoupons.length} Available`}
                </button>
              )}
            </div>

            {/* Applied Coupon Banner */}
            <AnimatePresence>
              {appliedCoupon && (
                <motion.div
                  initial={{ opacity: 0, y: -6, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -6, scale: 0.95 }}
                  className="bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-50 border border-emerald-200 rounded-xl p-3 flex items-center justify-between shadow-2xs"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-xs">
                      <Sparkles className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono text-xs font-black text-emerald-950 tracking-wider">
                          {appliedCoupon.code}
                        </span>
                        <span className="bg-emerald-200 text-emerald-800 text-[10px] font-bold px-1.5 py-0.5 rounded">
                          APPLIED
                        </span>
                      </div>
                      <p className="text-[11px] text-emerald-700 font-medium pt-0.5">
                        You save ₹{couponDiscount.toLocaleString('en-IN')}!
                      </p>
                    </div>
                  </div>
                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={handleRemoveCoupon}
                    className="p-1 text-emerald-600 hover:text-red-600 hover:bg-emerald-100 rounded-lg transition-colors"
                    title="Remove coupon"
                    aria-label="Remove coupon"
                  >
                    <X className="w-4 h-4" />
                  </motion.button>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Input Form (if no coupon applied) */}
            {!appliedCoupon && (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleApplyCoupon();
                }}
                className="space-y-2"
              >
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <input
                      type="text"
                      value={couponInput}
                      onChange={(e) => {
                        setCouponInput(e.target.value.toUpperCase());
                        if (couponError) setCouponError(null);
                      }}
                      placeholder="ENTER COUPON CODE"
                      className="w-full pl-3 pr-8 py-2 text-xs font-mono font-bold uppercase tracking-wider text-gray-800 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-all placeholder:font-sans placeholder:font-normal placeholder:text-gray-400"
                    />
                    {couponInput && (
                      <button
                        type="button"
                        onClick={() => setCouponInput('')}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.96 }}
                    type="submit"
                    disabled={isApplyingCoupon || !couponInput.trim()}
                    className="px-4 py-2 bg-gray-900 hover:bg-black text-white text-xs font-black tracking-wider uppercase rounded-xl transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center min-w-[72px]"
                  >
                    {isApplyingCoupon ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      'Apply'
                    )}
                  </motion.button>
                </div>
              </form>
            )}

            {/* Error Message */}
            {couponError && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-start gap-1.5 text-[11px] text-red-600 bg-red-50 border border-red-200 rounded-xl p-2.5"
              >
                <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5 text-red-500" />
                <span>{couponError}</span>
              </motion.div>
            )}

            {/* Success Feedback */}
            {couponSuccess && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-1.5 text-[11px] text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-xl p-2.5"
              >
                <CheckCircle className="w-3.5 h-3.5 shrink-0 text-emerald-600" />
                <span>{couponSuccess}</span>
              </motion.div>
            )}

            {/* Collapsible Available Coupons Drawer */}
            <AnimatePresence>
              {showAvailableCoupons && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden pt-2 border-t border-gray-100 space-y-2"
                >
                  <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">
                    Available Offers
                  </p>
                  <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                    {availableCoupons.map((c) => {
                      const isApplied = appliedCoupon?.code === c.code;
                      const isEligible = itemsSubtotal >= c.minCartValue;
                      return (
                        <div
                          key={c.code}
                          className={`p-2.5 rounded-xl border transition-all text-xs ${
                            isApplied
                              ? 'bg-emerald-50/60 border-emerald-300'
                              : 'bg-gray-50/60 border-dashed border-gray-300 hover:border-brand-400'
                          }`}
                        >
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-1.5">
                              <span className="font-mono font-black text-brand-700 bg-brand-50 border border-brand-200 px-2 py-0.5 rounded text-[11px]">
                                {c.code}
                              </span>
                              {c.discountType === 'percentage' ? (
                                <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded">
                                  {c.discountValue}% OFF
                                </span>
                              ) : (
                                <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">
                                  ₹{c.discountValue} FLAT
                                </span>
                              )}
                            </div>

                            {isApplied ? (
                              <span className="text-[10px] font-black text-emerald-700 uppercase">
                                Applied
                              </span>
                            ) : (
                              <button
                                type="button"
                                onClick={() => handleApplyCoupon(c.code)}
                                disabled={isApplyingCoupon}
                                className="text-[11px] font-black text-brand-600 hover:text-brand-800 uppercase tracking-wide hover:underline disabled:opacity-50"
                              >
                                Apply
                              </button>
                            )}
                          </div>
                          <p className="text-[11px] text-gray-600 mt-1.5 leading-snug">
                            {c.description}
                          </p>
                          {c.minCartValue > 0 && !isEligible && (
                            <p className="text-[10px] text-amber-700 font-medium mt-1">
                              • Add ₹{(c.minCartValue - itemsSubtotal).toLocaleString('en-IN')} more to unlock
                            </p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Price Breakdown Card */}
          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-4">
            <h2 className="text-sm font-black uppercase tracking-wider text-gray-800 pb-2 border-b border-gray-100">
              Price Details
            </h2>

            <div className="space-y-2.5 text-xs tabular-nums">
              <div className="flex justify-between text-gray-600">
                <span>Items Subtotal ({cart.totalCount || items.length} items)</span>
                <span className="font-bold text-gray-800">
                  ₹{itemsSubtotal.toLocaleString('en-IN')}
                </span>
              </div>

              {couponDiscount > 0 && (
                <motion.div
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex justify-between text-emerald-600 font-bold"
                >
                  <span className="flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5" />
                    Coupon Discount ({appliedCoupon?.code})
                  </span>
                  <span>-₹{couponDiscount.toLocaleString('en-IN')}</span>
                </motion.div>
              )}

              <div className="flex justify-between text-gray-600">
                <span>Estimated Taxes (GST)</span>
                <span className="font-bold text-gray-800">
                  ₹{(cart.taxPrice || 0).toLocaleString('en-IN')}
                </span>
              </div>

              <div className="flex justify-between text-gray-600">
                <span>Delivery Charges</span>
                <span className="font-bold">
                  {shippingFee === 0 ? (
                    <span className="text-emerald-600 uppercase font-black">Free</span>
                  ) : (
                    `₹${shippingFee}`
                  )}
                </span>
              </div>

              <div className="border-t border-gray-100 pt-3 flex justify-between text-base font-black text-gray-900 tabular-nums">
                <span>Total Amount</span>
                <span className={couponDiscount > 0 ? 'text-brand-700' : 'text-gray-900'}>
                  ₹{totalPayable.toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            {couponDiscount > 0 && (
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl py-2 px-3 text-center">
                <span className="text-xs font-bold text-emerald-800">
                  🎉 Total Savings on this order: ₹{couponDiscount.toLocaleString('en-IN')}
                </span>
              </div>
            )}

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleProceedToCheckout}
              className="w-full py-3.5 bg-brand-600 hover:bg-brand-700 text-white font-black text-sm rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2"
            >
              <span>Proceed to Checkout</span>
              <ArrowRight className="w-4 h-4" />
            </motion.button>

            <div className="flex items-center justify-center gap-1.5 text-[11px] text-gray-400 pt-1">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Safe & Secure Payments with Razorpay</span>
            </div>
          </div>
        </div>
      </div>

      {/* Guest Checkout Mobile OTP Modal */}
      <GuestOtpModal
        isOpen={isGuestOtpOpen}
        onClose={() => setIsGuestOtpOpen(false)}
        onSuccess={handleGuestOtpSuccess}
      />

      {/* Checkout Modal */}
      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        cart={{ ...cart, totalAmount: totalPayable, discountPrice: couponDiscount }}
        appliedCoupon={appliedCoupon}
        selectedAddress={selectedAddress}
      />
    </div>
  );
}
