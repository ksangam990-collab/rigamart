import React, { useState, useEffect } from 'react';
import { Truck, Check, AlertCircle, ShieldCheck } from 'lucide-react';
import Button from '../ui/Button.jsx';
import Badge from '../ui/Badge.jsx';

const PINCODE_STORAGE_KEY = 'rigamart_delivery_pincode';

export default function PincodeDeliveryEstimator() {
  const [pincode, setPincode] = useState(() => {
    return localStorage.getItem(PINCODE_STORAGE_KEY) || '';
  });
  const [estimate, setEstimate] = useState(null);
  const [error, setError] = useState('');

  // Check stored pincode on boot
  useEffect(() => {
    if (pincode && pincode.length === 6) {
      calculateEstimate(pincode);
    }
  }, []);

  const calculateEstimate = (pin) => {
    if (!/^\d{6}$/.test(pin)) {
      setError('Please enter a valid 6-digit Indian postal code');
      setEstimate(null);
      return;
    }

    setError('');
    localStorage.setItem(PINCODE_STORAGE_KEY, pin);

    // Dynamic delivery ETA calculation
    const today = new Date();
    const isMetro = /^(11|40|56|50|70|60)/.test(pin); // Delhi, Mumbai, Bengaluru, Hyderabad, Kolkata, Chennai
    const transitDays = isMetro ? 2 : 4;

    const deliveryDate = new Date(today);
    deliveryDate.setDate(today.getDate() + transitDays);

    const formattedDate = deliveryDate.toLocaleDateString('en-IN', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });

    setEstimate({
      date: formattedDate,
      isMetro,
      isCodAvailable: true,
      freeShipping: true,
    });
  };

  const handleCheck = (e) => {
    e.preventDefault();
    calculateEstimate(pincode.trim());
  };

  return (
    <div className="p-4 bg-canvas rounded-none border border-line space-y-3 font-sans">
      <div className="flex items-center justify-between">
        <label
          htmlFor="pincode-input"
          className="text-xs font-bold uppercase tracking-wider text-muted font-mono flex items-center gap-1.5"
        >
          <Truck className="w-3.5 h-3.5 text-brand" />
          Delivery &amp; Logistics
        </label>
        {estimate && (
          <Badge color="success" variant="subtle" size="sm" dot>
            Serviceable
          </Badge>
        )}
      </div>

      {/* Pincode Input Form */}
      <form onSubmit={handleCheck} className="flex items-center gap-2">
        <div className="relative flex-1">
          <input
            id="pincode-input"
            type="text"
            maxLength={6}
            placeholder="Enter 6-digit Indian Pincode"
            value={pincode}
            onChange={(e) => {
              const val = e.target.value.replace(/\D/g, '');
              setPincode(val);
              if (error) setError('');
            }}
            className="w-full h-9 px-3 text-xs bg-surface border border-line rounded text-ink placeholder:text-muted/60 focus:border-ink focus:ring-1 focus:ring-ink outline-none tabular-nums font-medium"
          />
        </div>

        <Button
          type="submit"
          variant="secondary"
          size="sm"
          className="h-9 px-3 text-xs shrink-0"
        >
          Check
        </Button>
      </form>

      {error && (
        <p className="text-[11px] text-danger font-medium flex items-center gap-1">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          <span>{error}</span>
        </p>
      )}

      {estimate && (
        <div className="space-y-1.5 pt-1 text-xs">
          <div className="flex items-center gap-2 text-ink">
            <Check className="w-4 h-4 text-success shrink-0" />
            <span>
              Estimated Delivery by{' '}
              <strong className="text-brand-dark font-semibold">
                {estimate.date}
              </strong>
            </span>
          </div>

          <div className="flex items-center gap-4 text-[11px] text-muted pl-6">
            <span>✓ Cash on Delivery (COD) Available</span>
            <span>✓ Free Express Shipping</span>
          </div>
        </div>
      )}
    </div>
  );
}
