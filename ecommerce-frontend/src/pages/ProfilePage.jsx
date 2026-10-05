import React, { useState, useEffect, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User,
  Mail,
  Phone,
  MapPin,
  Plus,
  Edit3,
  Trash2,
  CheckCircle2,
  ChevronUp,
  Star,
  AlertCircle,
  Shield,
  Store,
  Navigation,
  Loader2,
  X
} from 'lucide-react';
import api from '../utils/api.js';
import { Button, Badge } from '../components/ui/index.js';
import {
  fadeInUp,
  staggerContainer,
  staggerItem,
  drawerSlideDown,
} from '../utils/animations.js';

/* ─── Helpers ─────────────────────────────────────── */
const getInitials = (name = '') =>
  name
    .trim()
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join('');

const roleMeta = {
  admin: { label: 'Admin', variant: 'danger', icon: Shield },
  seller: { label: 'Seller', variant: 'brand', icon: Store },
  customer: { label: 'Customer', variant: 'secondary', icon: User },
};

const emptyAddress = {
  name: '',
  mobile: '',
  street: '',
  city: '',
  state: '',
  pincode: '',
  landmark: '',
  isDefault: false,
};

const inputClass =
  'w-full border border-line rounded px-3.5 py-2 text-xs text-ink bg-surface placeholder:text-muted focus:outline-none focus:border-brand transition-all';
const labelClass = 'block text-[11px] font-bold uppercase tracking-wider text-muted mb-1';
const errClass = 'text-[11px] text-danger mt-1';

/* ─── Skeleton ─────────────────────────────────────── */
function ProfileSkeleton() {
  return (
    <div className="min-h-screen bg-canvas">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 animate-pulse">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-4 space-y-4">
            <div className="bg-surface rounded-none border border-line p-6 space-y-4">
              <div className="w-18 h-18 rounded bg-line/60 mx-auto" />
              <div className="h-5 bg-line/60 rounded-sm w-40 mx-auto" />
              <div className="h-3 bg-line/40 rounded-sm w-32 mx-auto" />
              <div className="border-t border-line pt-4 space-y-3">
                <div className="h-9 bg-line/40 rounded" />
                <div className="h-9 bg-line/40 rounded" />
              </div>
            </div>
          </div>
          <div className="lg:col-span-8 space-y-4">
            <div className="h-8 bg-line/60 rounded-sm w-48" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="h-44 bg-surface rounded-none border border-line" />
              <div className="h-44 bg-surface rounded-none border border-line" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Address Form ─────────────────────────────────── */
function AddressForm({ initial = emptyAddress, onSubmit, onCancel, isSaving }) {
  const [form, setForm] = useState(initial);
  const [errors, setErrors] = useState({});
  const [locating, setLocating] = useState(false);
  const [geoNotice, setGeoNotice] = useState(null);

  const set = (k) => (e) =>
    setForm((p) => ({
      ...p,
      [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value
    }));

  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      setGeoNotice({ type: 'error', text: 'Geolocation is not supported by your browser.' });
      return;
    }

    setLocating(true);
    setGeoNotice({ type: 'info', text: 'Detecting GPS location...' });

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
            setForm((prev) => ({
              ...prev,
              street: street || prev.street,
              city: city || prev.city,
              state: state || prev.state,
              pincode: pincode || prev.pincode,
              landmark: landmark || prev.landmark
            }));
            const detectedArea = [city, state].filter(Boolean).join(', ');
            setGeoNotice({
              type: 'success',
              text: `Location detected: ${detectedArea || 'Address filled'}`
            });
            setTimeout(() => setGeoNotice(null), 4000);
          }
        } catch (err) {
          setGeoNotice({
            type: 'error',
            text: err.response?.data?.message || 'Failed to detect address. Please enter manually.'
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
            text: 'Location permission denied. Please fill manually.'
          });
        } else {
          setGeoNotice({ type: 'error', text: 'Location request timed out. Please enter manually.' });
        }
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    );
  };

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = 'Name is required';
    if (!/^\d{10}$/.test(form.mobile)) e.mobile = 'Enter a valid 10-digit mobile number';
    if (!form.street.trim()) e.street = 'Street address is required';
    if (!form.city.trim()) e.city = 'City is required';
    if (!form.state.trim()) e.state = 'State is required';
    if (!/^\d{6}$/.test(form.pincode)) e.pincode = 'Enter a valid 6-digit pincode';
    return e;
  };

  const handleSubmit = (ev) => {
    ev.preventDefault();
    const e = validate();
    if (Object.keys(e).length) {
      setErrors(e);
      return;
    }
    onSubmit(form);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 pt-2">
      {/* Geolocation auto-fill */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pb-2 border-b border-line">
        <p className="text-xs font-bold text-ink uppercase tracking-wider">Address Information</p>
        <button
          type="button"
          onClick={handleUseCurrentLocation}
          disabled={locating}
          className="inline-flex items-center gap-1.5 px-3 py-1 bg-surface hover:bg-line/40 text-brand text-xs font-semibold rounded border border-line transition-colors disabled:opacity-60"
        >
          {locating ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin text-brand" />
              <span>Detecting...</span>
            </>
          ) : (
            <>
              <Navigation className="w-3.5 h-3.5 text-brand" />
              <span>Use Current GPS Location</span>
            </>
          )}
        </button>
      </div>

      {geoNotice && (
        <div
          className={`text-xs px-3 py-2 rounded-sm flex items-center gap-2 ${
            geoNotice.type === 'success'
              ? 'bg-brand-soft text-brand-dark border border-brand/20'
              : 'bg-danger-soft text-danger border border-danger/20'
          }`}
        >
          <span>{geoNotice.text}</span>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className={labelClass}>Recipient Name *</label>
          <input
            className={inputClass}
            placeholder="Full Name"
            value={form.name}
            onChange={set('name')}
          />
          {errors.name && <p className={errClass}>{errors.name}</p>}
        </div>

        <div>
          <label className={labelClass}>Mobile Number *</label>
          <input
            className={inputClass}
            placeholder="10-digit number"
            value={form.mobile}
            onChange={set('mobile')}
            maxLength={10}
          />
          {errors.mobile && <p className={errClass}>{errors.mobile}</p>}
        </div>

        <div className="sm:col-span-2">
          <label className={labelClass}>Street Address / Flat / Building *</label>
          <input
            className={inputClass}
            placeholder="Flat no., Building, Street name"
            value={form.street}
            onChange={set('street')}
          />
          {errors.street && <p className={errClass}>{errors.street}</p>}
        </div>

        <div>
          <label className={labelClass}>City *</label>
          <input
            className={inputClass}
            placeholder="City"
            value={form.city}
            onChange={set('city')}
          />
          {errors.city && <p className={errClass}>{errors.city}</p>}
        </div>

        <div>
          <label className={labelClass}>State *</label>
          <input
            className={inputClass}
            placeholder="State"
            value={form.state}
            onChange={set('state')}
          />
          {errors.state && <p className={errClass}>{errors.state}</p>}
        </div>

        <div>
          <label className={labelClass}>Pincode *</label>
          <input
            className={inputClass}
            placeholder="6-digit pincode"
            value={form.pincode}
            onChange={set('pincode')}
            maxLength={6}
          />
          {errors.pincode && <p className={errClass}>{errors.pincode}</p>}
        </div>

        <div>
          <label className={labelClass}>
            Landmark <span className="text-muted font-normal">(Optional)</span>
          </label>
          <input
            className={inputClass}
            placeholder="Near metro, landmark…"
            value={form.landmark}
            onChange={set('landmark')}
          />
        </div>
      </div>

      <label className="flex items-center gap-2 text-xs text-ink cursor-pointer select-none pt-1">
        <input
          type="checkbox"
          checked={form.isDefault}
          onChange={set('isDefault')}
          className="w-4 h-4 accent-brand rounded border-line"
        />
        Set as default shipping address
      </label>

      <div className="flex gap-2 pt-2">
        <Button
          type="submit"
          variant="primary"
          size="sm"
          isLoading={isSaving}
        >
          Save Address
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onCancel}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}

/* ─── Address Card ─────────────────────────────────── */
function AddressCard({ addr, onEdit, onDelete }) {
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleEdit = async (form) => {
    setSaving(true);
    await onEdit(addr._id, form);
    setSaving(false);
    setEditing(false);
  };

  return (
    <motion.div
      variants={staggerItem}
      layout
      className="bg-surface rounded-none border border-line hover:border-ink transition-colors duration-150 overflow-hidden"
    >
      <div className="p-5">
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-sm font-bold text-ink">{addr.name}</p>
            {addr.isDefault && (
              <Badge variant="brand" size="sm" className="gap-1">
                <Star className="w-2.5 h-2.5" /> Default
              </Badge>
            )}
          </div>
        </div>

        <p className="text-xs text-muted mb-1 flex items-center gap-1.5">
          <Phone className="w-3.5 h-3.5 text-muted shrink-0" /> {addr.mobile}
        </p>

        <p className="text-xs text-muted leading-relaxed line-clamp-2">
          {addr.street}, {addr.city}, {addr.state} &ndash; {addr.pincode}
          {addr.landmark ? `, Near ${addr.landmark}` : ''}
        </p>

        {/* Card Actions */}
        <div className="flex items-center gap-2 mt-4 pt-3 border-t border-line/60">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setEditing((p) => !p);
              setConfirmDelete(false);
            }}
            className="text-brand hover:text-brand hover:bg-brand-soft text-xs"
          >
            <Edit3 className="w-3.5 h-3.5 mr-1" /> Edit
          </Button>

          <AnimatePresence mode="wait">
            {confirmDelete ? (
              <div className="flex items-center gap-1.5">
                <span className="text-xs text-danger font-medium">Remove address?</span>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => onDelete(addr._id)}
                >
                  Yes, Delete
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setConfirmDelete(false)}
                >
                  Cancel
                </Button>
              </div>
            ) : (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setConfirmDelete(true);
                  setEditing(false);
                }}
                className="text-muted hover:text-danger hover:bg-danger-soft text-xs"
              >
                <Trash2 className="w-3.5 h-3.5 mr-1" /> Delete
              </Button>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Inline Edit Form */}
      <AnimatePresence>
        {editing && (
          <motion.div
            variants={drawerSlideDown}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="border-t border-line bg-canvas p-5"
          >
            <AddressForm
              initial={{
                name: addr.name,
                mobile: addr.mobile,
                street: addr.street,
                city: addr.city,
                state: addr.state,
                pincode: addr.pincode,
                landmark: addr.landmark || '',
                isDefault: addr.isDefault,
              }}
              onSubmit={handleEdit}
              onCancel={() => setEditing(false)}
              isSaving={saving}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

/* ─── Main Component ─────────────────────────────────── */
export default function ProfilePage() {
  const { user: authUser } = useSelector((s) => s.auth);

  const [profile, setProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Profile Edit
  const [profileForm, setProfileForm] = useState({ name: '', mobile: '' });
  const [profileErrors, setProfileErrors] = useState({});
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState(false);
  const [profileApiError, setProfileApiError] = useState('');

  // Address
  const [addresses, setAddresses] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [addSaving, setAddSaving] = useState(false);
  const [addApiError, setAddApiError] = useState('');

  const fetchProfile = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/users/profile');
      const u = res.data.data?.user || {};
      setProfile(u);
      setProfileForm({ name: u.name || '', mobile: u.mobile || '' });
      setAddresses(u.addresses || []);
    } catch {
      setProfile(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const validateProfile = () => {
    const e = {};
    if (!profileForm.name.trim()) e.name = 'Name is required';
    if (profileForm.mobile && !/^\d{10}$/.test(profileForm.mobile))
      e.mobile = 'Enter a valid 10-digit mobile number';
    return e;
  };

  const handleProfileSave = async (ev) => {
    ev.preventDefault();
    const e = validateProfile();
    if (Object.keys(e).length) {
      setProfileErrors(e);
      return;
    }
    setProfileErrors({});
    setProfileApiError('');
    setProfileSaving(true);
    try {
      const res = await api.put('/users/profile', profileForm);
      const u = res.data.data?.user || {};
      setProfile((p) => ({ ...p, ...u }));
      setProfileSuccess(true);
      setTimeout(() => setProfileSuccess(false), 3000);
    } catch (err) {
      setProfileApiError(err.response?.data?.message || 'Failed to update profile.');
    } finally {
      setProfileSaving(false);
    }
  };

  const handleAddAddress = async (form) => {
    setAddSaving(true);
    setAddApiError('');
    try {
      await api.post('/users/address', form);
      await fetchProfile();
      setShowAddForm(false);
    } catch (err) {
      setAddApiError(err.response?.data?.message || 'Failed to save address.');
    } finally {
      setAddSaving(false);
    }
  };

  const handleEditAddress = async (id, form) => {
    try {
      await api.put(`/users/address/${id}`, form);
      await fetchProfile();
    } catch (err) {
      // handled
    }
  };

  const handleDeleteAddress = async (id) => {
    try {
      await api.delete(`/users/address/${id}`);
      setAddresses((p) => p.filter((a) => a._id !== id));
    } catch {
      // handled
    }
  };

  const RoleMeta = roleMeta[profile?.role] || roleMeta.customer;
  const RoleIcon = RoleMeta.icon;
  const memberSince = profile?.createdAt
    ? new Date(profile.createdAt).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })
    : null;

  if (isLoading) return <ProfileSkeleton />;

  return (
    <div className="min-h-screen bg-canvas">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* ── LEFT COLUMN: Sticky Profile Card (4 cols) ─────── */}
          <aside className="lg:col-span-4 lg:sticky lg:top-24 space-y-4">
            <div className="bg-surface rounded-none border border-line overflow-hidden">
              {/* Profile Header */}
              <div className="p-6 text-center border-b border-line bg-canvas/40">
                <div className="w-16 h-16 rounded bg-surface-2 text-ink font-bold text-xl flex items-center justify-center mx-auto mb-3 border border-line">
                  {getInitials(profile?.name || authUser?.name || 'U')}
                </div>
                <h1 className="text-base font-bold text-ink truncate">
                  {profile?.name || authUser?.name}
                </h1>
                <p className="text-xs text-muted truncate mt-0.5">{profile?.email}</p>
                <div className="mt-2.5 flex items-center justify-center gap-1.5">
                  <Badge variant={RoleMeta.variant} size="sm" className="gap-1">
                    <RoleIcon className="w-3 h-3" />
                    {RoleMeta.label}
                  </Badge>
                </div>
                {memberSince && (
                  <p className="text-[11px] text-muted mt-2">Member since {memberSince}</p>
                )}
              </div>

              {/* Edit Profile Form */}
              <div className="p-5 sm:p-6 space-y-4">
                <h2 className="text-xs font-bold uppercase tracking-wider text-muted flex items-center gap-1.5">
                  <Edit3 className="w-3.5 h-3.5 text-brand" /> Personal Details
                </h2>

                <form onSubmit={handleProfileSave} className="space-y-3">
                  <div>
                    <label className={labelClass}>Full Name</label>
                    <div className="relative">
                      <User className="w-4 h-4 text-muted absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <input
                        className={`${inputClass} pl-9`}
                        value={profileForm.name}
                        onChange={(e) => setProfileForm((p) => ({ ...p, name: e.target.value }))}
                        placeholder="Your full name"
                      />
                    </div>
                    {profileErrors.name && <p className={errClass}>{profileErrors.name}</p>}
                  </div>

                  <div>
                    <label className={labelClass}>Mobile Number</label>
                    <div className="relative">
                      <Phone className="w-4 h-4 text-muted absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <input
                        className={`${inputClass} pl-9`}
                        value={profileForm.mobile}
                        onChange={(e) => setProfileForm((p) => ({ ...p, mobile: e.target.value }))}
                        placeholder="10-digit mobile"
                        maxLength={10}
                      />
                    </div>
                    {profileErrors.mobile && <p className={errClass}>{profileErrors.mobile}</p>}
                  </div>

                  <div>
                    <label className={labelClass}>Email Address</label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-muted absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <input
                        readOnly
                        className={`${inputClass} pl-9 bg-canvas text-muted cursor-not-allowed`}
                        value={profile?.email || ''}
                      />
                    </div>
                  </div>

                  {profileApiError && (
                    <div className="flex items-center gap-2 bg-danger-soft text-danger text-xs px-3 py-2 rounded-sm border border-danger/20">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      <span>{profileApiError}</span>
                    </div>
                  )}

                  {profileSuccess && (
                    <div className="flex items-center gap-2 bg-brand-soft text-brand text-xs px-3 py-2 rounded-sm border border-brand/20">
                      <CheckCircle2 className="w-3.5 h-3.5 shrink-0 text-brand" />
                      <span>Profile updated successfully!</span>
                    </div>
                  )}

                  <Button
                    type="submit"
                    variant="primary"
                    size="md"
                    className="w-full text-xs font-bold"
                    isLoading={profileSaving}
                  >
                    Save Changes
                  </Button>
                </form>
              </div>
            </div>
          </aside>

          {/* ── RIGHT COLUMN: Saved Addresses (8 cols) ────────── */}
          <main className="lg:col-span-8 space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-line">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-ink tracking-tight flex items-center gap-2.5">
                  <MapPin className="w-5 h-5 text-brand" />
                  Saved Addresses
                </h2>
                <p className="text-xs text-muted mt-0.5">
                  Manage your delivery destinations for rapid checkout
                </p>
              </div>

              <Button
                variant={showAddForm ? 'secondary' : 'outline'}
                size="sm"
                onClick={() => setShowAddForm((p) => !p)}
                className="text-xs"
              >
                {showAddForm ? <ChevronUp className="w-4 h-4 mr-1.5" /> : <Plus className="w-4 h-4 mr-1.5" />}
                {showAddForm ? 'Close Form' : 'Add New Address'}
              </Button>
            </div>

            {/* Collapsible Add Address Form */}
            <AnimatePresence>
              {showAddForm && (
                <motion.div
                  variants={drawerSlideDown}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  className="bg-surface rounded-none border border-line p-5 sm:p-6"
                >
                  <h3 className="text-sm font-bold text-ink mb-1 flex items-center gap-2">
                    <Plus className="w-4 h-4 text-brand" />
                    New Delivery Address
                  </h3>

                  {addApiError && (
                    <div className="flex items-center gap-2 bg-danger-soft text-danger text-xs px-3 py-2 rounded-sm border border-danger/20 my-2">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      <span>{addApiError}</span>
                    </div>
                  )}

                  <AddressForm
                    onSubmit={handleAddAddress}
                    onCancel={() => setShowAddForm(false)}
                    isSaving={addSaving}
                  />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Empty state */}
            {addresses.length === 0 && !showAddForm && (
              <div className="bg-surface rounded-none border border-line p-12 text-center space-y-4">
                <div className="w-14 h-14 rounded bg-canvas border border-line text-ink mx-auto flex items-center justify-center">
                  <MapPin className="w-7 h-7 text-muted" />
                </div>
                <h3 className="text-base font-bold text-ink">No Saved Addresses</h3>
                <p className="text-xs text-muted max-w-xs mx-auto">
                  Save your home, office, or secondary delivery location for express checkout.
                </p>
                <Button
                  variant="primary"
                  size="md"
                  onClick={() => setShowAddForm(true)}
                  className=""
                >
                  <Plus className="w-4 h-4 mr-1.5" /> Add Your First Address
                </Button>
              </div>
            )}

            {/* Address Cards Grid */}
            {addresses.length > 0 && (
              <motion.div
                variants={staggerContainer(0.05)}
                initial="hidden"
                animate="visible"
                className="grid grid-cols-1 sm:grid-cols-2 gap-4"
              >
                <AnimatePresence>
                  {addresses.map((addr) => (
                    <AddressCard
                      key={addr._id}
                      addr={addr}
                      onEdit={handleEditAddress}
                      onDelete={handleDeleteAddress}
                    />
                  ))}
                </AnimatePresence>
              </motion.div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
