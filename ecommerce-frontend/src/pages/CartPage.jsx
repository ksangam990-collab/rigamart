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
  X,
  CheckCircle2
} from 'lucide-react';
import api from '../utils/api.js';
import { triggerConfetti } from '../utils/confetti.js';
import usePincode from '../hooks/usePincode.js';
import {
  fetchCart,
  updateCartQuantity,
  removeFromCart,
  clearCart
} from '../features/cart/cartSlice.js';
import CheckoutModal from '../components/checkout/CheckoutModal.jsx';
import GuestOtpModal from '../components/checkout/GuestOtpModal.jsx';
import CouponDrawer from '../components/checkout/CouponDrawer.jsx';
import { Button, Badge } from '../components/ui/index.js';
import { drawerSlideDown } from '../utils/animations.js';

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(amount || 0);
};

export default function CartPage() {
  const dispatch = useDispatch();
  const cart = useSelector((state) => state.cart);
  const { isAuthenticated, user } = useSelector((state) => state.auth);

  const [addresses, setAddresses] = useState([]);
  const [selectedAddressIndex, setSelectedAddressIndex] = useState(0);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isGuestOtpOpen, setIsGuestOtpOpen] = useState(false);
  const [isCouponDrawerOpen, setIsCouponDrawerOpen] = useState(false);

  // Coupon state
  const [couponInput, setCouponInput] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [availableCoupons, setAvailableCoupons] = useState([]);
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);
  const [couponError, setCouponError] = useState(null);
  const [couponSuccess, setCouponSuccess] = useState(null);

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

  const { city: autoCity, state: autoState, loading: pinLoading } = usePincode(addrPincode);
  const [showAutoBadge, setShowAutoBadge] = useState(false);

  useEffect(() => {
    if (autoCity && autoState) {
      setAddrCity(autoCity);
      setAddrState(autoState);
      setShowAutoBadge(true);
      const timer = setTimeout(() => setShowAutoBadge(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [autoCity, autoState]);

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
            const { street, city, state, pincode } = res.data.data;
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
      return { success: false, message: 'Please enter a coupon code' };
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
        return { success: true, data: res.data.data };
      }
      return { success: false, message: 'Failed to apply coupon' };
    } catch (err) {
      const msg = err.response?.data?.message || 'Invalid or expired coupon code. Please try again.';
      setCouponError(msg);
      return { success: false, message: msg };
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
      <div className="min-h-screen bg-canvas">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6 animate-pulse">
          <div className="h-8 bg-line/60 rounded-lg w-48" />
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-8 space-y-4">
              <div className="h-32 bg-surface rounded-2xl border border-line" />
              <div className="h-32 bg-surface rounded-2xl border border-line" />
              <div className="h-32 bg-surface rounded-2xl border border-line" />
            </div>
            <div className="lg:col-span-4">
              <div className="h-80 bg-surface rounded-2xl border border-line" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Editorial Empty State
  if (items.length === 0) {
    return (
      <div className="min-h-[75vh] bg-canvas flex items-center justify-center px-4 py-16">
        <div className="max-w-md w-full text-center space-y-6">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.4 }}
            className="w-20 h-20 rounded-full bg-brand-soft text-brand mx-auto flex items-center justify-center shadow-subtle"
          >
            <ShoppingBag className="w-9 h-9" />
          </motion.div>
          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-ink tracking-tight">Your shopping bag is empty</h1>
            <p className="text-sm text-muted leading-relaxed max-w-sm mx-auto">
              Explore our curated selection of direct-from-factory pieces and timeless everyday essentials.
            </p>
          </div>
          <div className="pt-2">
            <Link to="/catalog">
              <Button variant="primary" size="lg" className="px-8 shadow-subtle">
                Explore Catalog
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-canvas">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
        {/* Header Bar */}
        <div className="flex items-center justify-between pb-4 border-b border-line">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-bold text-ink tracking-tight">Shopping Bag</h1>
            <Badge variant="secondary">
              {cart.totalCount || items.length} {items.length === 1 ? 'item' : 'items'}
            </Badge>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => dispatch(clearCart())}
            className="text-danger hover:text-danger hover:bg-danger-soft/50 text-xs"
          >
            <Trash2 className="w-3.5 h-3.5 mr-1.5" />
            Clear Bag
          </Button>
        </div>

        {/* Free Shipping Progress Meter */}
        <div
          className={`p-4 sm:p-5 rounded-2xl border transition-all duration-300 space-y-2.5 ${
            progressToFreeShipping >= 100
              ? 'bg-brand-soft/70 border-brand/30 shadow-subtle'
              : 'bg-surface border-line shadow-subtle'
          }`}
        >
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2.5">
              {progressToFreeShipping >= 100 ? (
                <div className="w-5 h-5 rounded-full bg-brand text-white flex items-center justify-center shrink-0 shadow-subtle">
                  <Sparkles className="w-3 h-3" />
                </div>
              ) : (
                <div className="w-5 h-5 rounded-full bg-canvas text-brand flex items-center justify-center shrink-0 border border-line">
                  <Truck className="w-3 h-3" />
                </div>
              )}
              <span
                className={`font-semibold ${
                  progressToFreeShipping >= 100 ? 'text-brand-dark' : 'text-ink'
                }`}
              >
                {progressToFreeShipping >= 100 ? (
                  <span>Complimentary Pan-India Express Delivery Unlocked</span>
                ) : (
                  <span>
                    Add <strong className="font-bold text-brand">{formatCurrency(500 - itemsSubtotal)}</strong> more for complimentary delivery
                  </span>
                )}
              </span>
            </div>
            <span className="font-bold tabular-nums text-muted text-xs">
              {progressToFreeShipping}%
            </span>
          </div>

          {/* Progress Bar Track */}
          <div className="w-full h-2 bg-line rounded-full overflow-hidden relative">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progressToFreeShipping}%` }}
              transition={{ type: 'spring', stiffness: 140, damping: 18 }}
              className={`h-full rounded-full ${
                progressToFreeShipping >= 100 ? 'bg-brand' : 'bg-brand/80'
              }`}
            />
          </div>
        </div>

        {/* Main 2-Column Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Delivery Address & Cart Items (8 cols) */}
          <div className="lg:col-span-8 space-y-6">
            {/* Delivery Address Section */}
            <div className="bg-surface p-5 sm:p-6 rounded-2xl border border-line shadow-subtle space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xs font-bold uppercase tracking-wider text-muted flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-brand" />
                  Delivery Destination
                </h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowAddressForm(!showAddressForm)}
                  className="text-brand hover:text-brand hover:bg-brand-soft text-xs"
                >
                  <PlusCircle className="w-3.5 h-3.5 mr-1" />
                  Add New Address
                </Button>
              </div>

              {/* Address List */}
              {addresses.length === 0 && !showAddressForm ? (
                <div className="p-4 bg-accent-soft/40 rounded-xl border border-accent/20 text-xs text-ink">
                  Please add a delivery destination to review final shipping and proceed with checkout.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {addresses.map((addr, idx) => {
                    const isSelected = selectedAddressIndex === idx;
                    return (
                      <div
                        key={addr._id || idx}
                        onClick={() => setSelectedAddressIndex(idx)}
                        className={`p-4 rounded-xl border cursor-pointer transition-all ${
                          isSelected
                            ? 'border-brand bg-brand-soft/30 ring-1 ring-brand shadow-subtle'
                            : 'border-line hover:border-muted/50 bg-surface'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="font-bold text-xs text-ink">{addr.name}</span>
                          {isSelected && <CheckCircle className="w-4 h-4 text-brand" />}
                        </div>
                        <p className="text-[11px] text-muted leading-relaxed line-clamp-2">
                          {addr.street}, {addr.city}, {addr.state} &ndash; {addr.pincode}
                        </p>
                        <span className="text-[10px] text-muted font-medium mt-1.5 block">
                          Phone: {addr.mobile}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Add Address Form Accordion */}
              <AnimatePresence>
                {showAddressForm && (
                  <motion.form
                    variants={drawerSlideDown}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    onSubmit={handleAddNewAddress}
                    className="p-4 sm:p-5 bg-canvas rounded-xl border border-line space-y-4 mt-3"
                  >
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pb-2 border-b border-line">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-ink">New Address Details</h3>
                      <button
                        type="button"
                        onClick={handleUseCurrentLocation}
                        disabled={locating}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-surface hover:bg-line/40 text-brand text-xs font-semibold rounded-lg border border-line transition-colors disabled:opacity-60 shadow-subtle"
                      >
                        {locating ? (
                          <>
                            <Loader2 className="w-3.5 h-3.5 animate-spin text-brand" />
                            <span>Detecting Location...</span>
                          </>
                        ) : (
                          <>
                            <Navigation className="w-3.5 h-3.5 text-brand" />
                            <span>Use Current Location</span>
                          </>
                        )}
                      </button>
                    </div>

                    {geoNotice && (
                      <div
                        className={`text-xs px-3 py-2 rounded-lg flex items-center gap-2 ${
                          geoNotice.type === 'success'
                            ? 'bg-brand-soft text-brand-dark border border-brand/20'
                            : 'bg-danger-soft text-danger border border-danger/20'
                        }`}
                      >
                        <span>{geoNotice.text}</span>
                      </div>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <input
                        type="text"
                        required
                        placeholder="Recipient Full Name"
                        value={addrName}
                        onChange={(e) => setAddrName(e.target.value)}
                        className="px-3 py-2 bg-surface border border-line rounded-lg text-xs text-ink outline-none focus:border-brand focus:ring-1 focus:ring-brand"
                      />
                      <input
                        type="tel"
                        required
                        maxLength={10}
                        placeholder="Mobile Number (10 digits)"
                        value={addrMobile}
                        onChange={(e) => setAddrMobile(e.target.value)}
                        className="px-3 py-2 bg-surface border border-line rounded-lg text-xs text-ink outline-none focus:border-brand focus:ring-1 focus:ring-brand"
                      />
                      <input
                        type="text"
                        required
                        placeholder="House, Street, Flat, Area"
                        value={addrStreet}
                        onChange={(e) => setAddrStreet(e.target.value)}
                        className="px-3 py-2 bg-surface border border-line rounded-lg text-xs text-ink sm:col-span-2 outline-none focus:border-brand focus:ring-1 focus:ring-brand"
                      />
                      <div className="relative">
                        <input
                          type="text"
                          required
                          placeholder="City"
                          value={addrCity}
                          onChange={(e) => setAddrCity(e.target.value)}
                          className="w-full px-3 py-2 bg-surface border border-line rounded-lg text-xs text-ink outline-none focus:border-brand focus:ring-1 focus:ring-brand"
                        />
                        {pinLoading && <Loader2 className="w-4 h-4 text-brand animate-spin absolute right-3 top-1/2 -translate-y-1/2" />}
                      </div>
                      <div className="relative flex items-center">
                        <input
                          type="text"
                          required
                          placeholder="State"
                          value={addrState}
                          onChange={(e) => setAddrState(e.target.value)}
                          className="w-full px-3 py-2 bg-surface border border-line rounded-lg text-xs text-ink outline-none focus:border-brand focus:ring-1 focus:ring-brand"
                        />
                        {pinLoading && <Loader2 className="w-4 h-4 text-brand animate-spin absolute right-3 top-1/2 -translate-y-1/2" />}
                        <AnimatePresence>
                          {showAutoBadge && (
                            <motion.span
                              initial={{ opacity: 0, x: -5 }}
                              animate={{ opacity: 1, x: 0 }}
                              exit={{ opacity: 0 }}
                              className="absolute right-3 inline-flex items-center gap-1 text-[10px] text-success bg-success/10 px-1.5 py-0.5 rounded font-bold pointer-events-none"
                            >
                              <CheckCircle2 className="w-3 h-3" /> Auto-filled
                            </motion.span>
                          )}
                        </AnimatePresence>
                      </div>
                      <input
                        type="text"
                        required
                        maxLength={6}
                        placeholder="PIN Code (6 digits)"
                        value={addrPincode}
                        onChange={(e) => setAddrPincode(e.target.value)}
                        className="px-3 py-2 bg-surface border border-line rounded-lg text-xs text-ink outline-none focus:border-brand focus:ring-1 focus:ring-brand"
                      />
                    </div>

                    <div className="flex justify-end gap-2 pt-2">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowAddressForm(false)}
                      >
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        variant="primary"
                        size="sm"
                        isLoading={savingAddress}
                      >
                        Save & Select Address
                      </Button>
                    </div>
                  </motion.form>
                )}
              </AnimatePresence>
            </div>

            {/* Bag Item Cards */}
            <div className="space-y-3">
              <AnimatePresence mode="popLayout">
                {items.map((item) => {
                  const product = item.product || {};
                  const imageUrl =
                    product.images?.[0]?.url ||
                    product.images?.[0] ||
                    'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=200';

                  const unitPrice = item.currentPrice ?? item.priceAtAddition ?? item.price ?? 0;
                  const subtotal = unitPrice * (item.quantity || 1);
                  const productId = product._id || product.slug;

                  return (
                    <motion.div
                      key={item._id}
                      layout
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -16, height: 0, overflow: 'hidden' }}
                      transition={{ duration: 0.2 }}
                      className="bg-surface p-4 sm:p-5 rounded-2xl border border-line shadow-subtle flex flex-col sm:flex-row gap-4 sm:gap-5 items-start sm:items-center justify-between"
                    >
                      <div className="flex items-start gap-4 w-full sm:w-auto">
                        <Link to={productId ? `/products/${productId}` : '#'} className="shrink-0">
                          <img
                            src={imageUrl}
                            alt={product.name || 'Product'}
                            className="w-20 h-24 sm:w-24 sm:h-28 object-cover rounded-xl bg-canvas border border-line shrink-0 hover:opacity-90 transition-opacity"
                          />
                        </Link>
                        <div className="space-y-1.5 flex-1 min-w-0">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-muted">
                            {product.brand || 'Rigamart Verified'}
                          </span>
                          <h3 className="text-sm font-bold text-ink line-clamp-1">
                            <Link
                              to={productId ? `/products/${productId}` : '#'}
                              className="hover:text-brand transition-colors"
                            >
                              {product.name}
                            </Link>
                          </h3>

                          <div className="flex flex-wrap items-center gap-1.5 text-xs pt-0.5">
                            {item.size && (
                              <Badge variant="secondary" size="sm">
                                Size: {item.size}
                              </Badge>
                            )}
                            {item.color && (
                              <Badge variant="secondary" size="sm">
                                Color: {item.color}
                              </Badge>
                            )}
                            {item.sku && (
                              <span className="font-mono text-[10px] text-muted">
                                SKU: {item.sku}
                              </span>
                            )}
                          </div>

                          {item.hasPriceChanged && (
                            <div className="inline-flex items-center gap-1 text-[10px] font-semibold text-accent bg-accent-soft px-2 py-0.5 rounded-md border border-accent/20">
                              <AlertTriangle className="w-3 h-3 text-accent shrink-0" />
                              Price updated: ₹{item.priceAtAddition} &rarr; ₹{item.currentPrice}
                            </div>
                          )}

                          {!item.isAvailable && item.unavailableReason && (
                            <div className="text-[10px] font-semibold text-danger bg-danger-soft px-2 py-0.5 rounded-md border border-danger/20 inline-block">
                              {item.unavailableReason}
                            </div>
                          )}

                          <div className="text-xs font-semibold text-muted pt-0.5 tabular-nums">
                            {formatCurrency(unitPrice)} <span className="font-normal text-[11px]">each</span>
                          </div>
                        </div>
                      </div>

                      {/* Quantity Controller & Total */}
                      <div className="flex items-center justify-between w-full sm:w-auto sm:gap-6 pt-3 sm:pt-0 border-t sm:border-t-0 border-line">
                        {/* Stepper */}
                        <div className="inline-flex items-center border border-line rounded-lg bg-canvas shadow-2xs">
                          <button
                            type="button"
                            onClick={() =>
                              dispatch(
                                updateCartQuantity({
                                  itemId: item._id,
                                  quantity: Math.max(1, item.quantity - 1)
                                })
                              )
                            }
                            className="w-8 h-8 flex items-center justify-center text-muted hover:text-ink hover:bg-line/40 transition-colors"
                            aria-label="Decrease quantity"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="px-3 py-1 text-xs font-bold text-ink bg-surface min-w-[34px] text-center tabular-nums">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() =>
                              dispatch(
                                updateCartQuantity({
                                  itemId: item._id,
                                  quantity: item.quantity + 1
                                })
                              )
                            }
                            className="w-8 h-8 flex items-center justify-center text-muted hover:text-ink hover:bg-line/40 transition-colors"
                            aria-label="Increase quantity"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        {/* Line subtotal */}
                        <div className="text-right sm:min-w-[80px]">
                          <span className="text-sm font-bold text-ink block tabular-nums">
                            {formatCurrency(subtotal)}
                          </span>
                        </div>

                        {/* Delete button */}
                        <button
                          type="button"
                          onClick={() => dispatch(removeFromCart(item._id))}
                          className="p-1.5 text-muted hover:text-danger hover:bg-danger-soft/50 rounded-lg transition-colors"
                          title="Remove item"
                          aria-label="Remove item from cart"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          </div>

          {/* Right Column: Order Summary & Checkout (4 cols, Sticky) */}
          <div className="lg:col-span-4 sticky top-24 space-y-4">
            {/* Coupon Card */}
            <div className="bg-surface p-5 rounded-2xl border border-line shadow-subtle space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-muted flex items-center gap-1.5">
                  <Tag className="w-3.5 h-3.5 text-brand" />
                  Coupons & Offers
                </h3>
                <button
                  type="button"
                  onClick={() => setIsCouponDrawerOpen(true)}
                  className="text-[11px] font-bold text-brand hover:underline flex items-center gap-1"
                >
                  <Sparkles className="w-3 h-3 text-brand" />
                  View Offers
                </button>
              </div>

              {/* Applied Coupon Banner */}
              <AnimatePresence>
                {appliedCoupon && (
                  <motion.div
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    className="bg-brand-soft border border-brand/20 rounded-xl p-3 flex items-center justify-between shadow-2xs"
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-lg bg-brand text-white flex items-center justify-center shrink-0">
                        <Sparkles className="w-3 h-3" />
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono text-xs font-bold text-brand-dark">
                            {appliedCoupon.code}
                          </span>
                          <Badge variant="brand" size="sm">
                            APPLIED
                          </Badge>
                        </div>
                        <p className="text-[11px] text-brand-dark font-medium pt-0.5">
                          Saved {formatCurrency(couponDiscount)}
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={handleRemoveCoupon}
                      className="p-1 text-brand hover:text-danger transition-colors"
                      title="Remove coupon"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Coupon Form */}
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
                        className="w-full pl-3 pr-8 py-2 text-xs font-mono font-bold uppercase tracking-wider text-ink bg-canvas border border-line rounded-xl focus:bg-surface focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand transition-all placeholder:font-sans placeholder:font-normal placeholder:text-muted"
                      />
                      {couponInput && (
                        <button
                          type="button"
                          onClick={() => setCouponInput('')}
                          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted hover:text-ink"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                    <Button
                      type="submit"
                      variant="secondary"
                      size="sm"
                      disabled={isApplyingCoupon || !couponInput.trim()}
                      className="text-xs uppercase font-bold"
                    >
                      {isApplyingCoupon ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Apply'}
                    </Button>
                  </div>
                </form>
              )}

              {couponError && (
                <div className="flex items-start gap-1.5 text-[11px] text-danger bg-danger-soft border border-danger/20 rounded-xl p-2.5">
                  <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5 text-danger" />
                  <span>{couponError}</span>
                </div>
              )}

              {couponSuccess && (
                <div className="flex items-center gap-1.5 text-[11px] text-brand-dark bg-brand-soft border border-brand/20 rounded-xl p-2.5">
                  <CheckCircle className="w-3.5 h-3.5 shrink-0 text-brand" />
                  <span>{couponSuccess}</span>
                </div>
              )}
            </div>

            {/* Price Details Card */}
            <div className="bg-surface p-6 rounded-2xl border border-line shadow-subtle space-y-4">
              <h2 className="text-xs font-bold uppercase tracking-wider text-muted pb-2 border-b border-line">
                Price Breakdown
              </h2>

              <div className="space-y-2.5 text-xs tabular-nums">
                <div className="flex justify-between text-muted">
                  <span>Subtotal ({cart.totalCount || items.length} items)</span>
                  <span className="font-semibold text-ink">
                    {formatCurrency(itemsSubtotal)}
                  </span>
                </div>

                {couponDiscount > 0 && (
                  <div className="flex justify-between text-brand font-semibold">
                    <span className="flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5" />
                      Promotional Discount ({appliedCoupon?.code})
                    </span>
                    <span>&minus;{formatCurrency(couponDiscount)}</span>
                  </div>
                )}

                <div className="flex justify-between text-muted">
                  <span>Estimated Taxes (GST)</span>
                  <span className="font-semibold text-ink">
                    {formatCurrency(cart.taxPrice || 0)}
                  </span>
                </div>

                <div className="flex justify-between text-muted">
                  <span>Delivery Charges</span>
                  <span className="font-semibold">
                    {shippingFee === 0 ? (
                      <span className="text-brand font-bold uppercase">Free</span>
                    ) : (
                      formatCurrency(shippingFee)
                    )}
                  </span>
                </div>

                <div className="border-t border-line pt-3 flex justify-between text-base font-bold text-ink tabular-nums">
                  <span>Total Amount</span>
                  <span className="text-xl tracking-tight">
                    {formatCurrency(totalPayable)}
                  </span>
                </div>
              </div>

              {couponDiscount > 0 && (
                <div className="bg-brand-soft border border-brand/20 rounded-xl py-2 px-3 text-center">
                  <span className="text-xs font-bold text-brand-dark">
                    Total Savings: {formatCurrency(couponDiscount)}
                  </span>
                </div>
              )}

              {/* Exactly ONE solid primary action button per screen */}
              <Button
                variant="primary"
                size="lg"
                onClick={handleProceedToCheckout}
                className="w-full text-sm font-bold shadow-subtle flex items-center justify-center gap-2"
              >
                <span>Proceed to Checkout</span>
                <ArrowRight className="w-4 h-4" />
              </Button>

              <div className="flex items-center justify-center gap-1.5 text-[11px] text-muted pt-1">
                <ShieldCheck className="w-4 h-4 text-brand shrink-0" />
                <span>Encrypted 256-bit Razorpay checkout &middot; Cash on Delivery</span>
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

        {/* Interactive Coupons & Promo Code Drawer */}
        <CouponDrawer
          isOpen={isCouponDrawerOpen}
          onClose={() => setIsCouponDrawerOpen(false)}
          currentSubtotal={itemsSubtotal}
          appliedCoupon={appliedCoupon}
          onApplyCoupon={handleApplyCoupon}
          onRemoveCoupon={handleRemoveCoupon}
          isApplying={isApplyingCoupon}
        />

        {/* Checkout Modal */}
        <CheckoutModal
          isOpen={isCheckoutOpen}
          onClose={() => setIsCheckoutOpen(false)}
          cart={{ ...cart, totalAmount: totalPayable, discountPrice: couponDiscount }}
          appliedCoupon={appliedCoupon}
          selectedAddress={selectedAddress}
          onOpenCouponDrawer={() => setIsCouponDrawerOpen(true)}
        />
      </div>
    </div>
  );
}
