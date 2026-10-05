import React, { useState } from 'react';
import { 
  Button, 
  Input, 
  Skeleton, 
  Badge, 
  Sheet 
} from '../components/ui';
import { 
  Search, 
  ArrowRight, 
  Sparkles, 
  Check, 
  Mail, 
  Heart, 
  ShoppingBag, 
  Moon, 
  Sun,
  ShieldCheck,
  Truck,
  RotateCcw
} from 'lucide-react';

export default function StyleguidePage() {
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [inputError, setInputError] = useState('');
  const [isDarkMode, setIsDarkMode] = useState(() => {
    return document.documentElement.getAttribute('data-theme') === 'dark';
  });

  const toggleTheme = () => {
    const nextTheme = !isDarkMode;
    setIsDarkMode(nextTheme);
    if (nextTheme) {
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      document.documentElement.removeAttribute('data-theme');
    }
  };

  const colorTokens = [
    { name: 'Canvas', token: '--color-canvas', bg: 'bg-canvas', text: 'text-ink', border: 'border-line', desc: 'Page background canvas' },
    { name: 'Surface', token: '--color-surface', bg: 'bg-surface', text: 'text-ink', border: 'border-line', desc: 'Elevated cards & sheets' },
    { name: 'Ink', token: '--color-ink', bg: 'bg-ink', text: 'text-canvas', border: 'border-transparent', desc: 'Primary typography & high contrast' },
    { name: 'Muted', token: '--color-muted', bg: 'bg-muted', text: 'text-white', border: 'border-transparent', desc: 'Secondary text & hints' },
    { name: 'Line', token: '--color-line', bg: 'bg-line', text: 'text-ink', border: 'border-line', desc: 'Hairline borders & separators' },
    { name: 'Brand Emerald', token: '--color-brand', bg: 'bg-brand', text: 'text-white', border: 'border-transparent', desc: 'Primary CTA & brand resonance' },
    { name: 'Brand Dark', token: '--color-brand-dark', bg: 'bg-brand-dark', text: 'text-white', border: 'border-transparent', desc: 'Hover & pressed brand states' },
    { name: 'Brand Soft', token: '--color-brand-soft', bg: 'bg-brand-soft', text: 'text-brand-dark', border: 'border-brand/20', desc: 'Subtle pills, active backgrounds' },
    { name: 'Accent Saffron', token: '--color-accent', bg: 'bg-accent', text: 'text-ink', border: 'border-transparent', desc: 'Warm highlight & celebrations' },
    { name: 'Success', token: '--color-success', bg: 'bg-success', text: 'text-white', border: 'border-transparent', desc: 'Confirmed orders, verified badges' },
    { name: 'Warning', token: '--color-warning', bg: 'bg-warning', text: 'text-white', border: 'border-transparent', desc: 'Stock alerts, delivery warnings' },
    { name: 'Danger', token: '--color-danger', bg: 'bg-danger', text: 'text-white', border: 'border-transparent', desc: 'Errors, destructive actions' },
  ];

  return (
    <div className="min-h-screen bg-canvas text-ink py-10 px-4 sm:px-6 lg:px-8 transition-colors">
      <div className="max-w-6xl mx-auto space-y-12">
        {/* Header Strip */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-line gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Badge color="brand" variant="solid" size="sm">
                CALM EDITORIAL MARKETPLACE
              </Badge>
              <Badge color="accent" variant="subtle" size="sm">
                DESIGN SYSTEM v2.0
              </Badge>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black font-display tracking-tight text-ink">
              Component Styleguide
            </h1>
            <p className="text-sm text-muted mt-1 max-w-2xl">
              Radix-style accessible primitives, token-based color hierarchy, thumb-zone ergonomics, and fluid micro-interactions.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="secondary"
              size="sm"
              onClick={toggleTheme}
              leftIcon={isDarkMode ? <Sun className="w-4 h-4 text-accent" /> : <Moon className="w-4 h-4 text-muted" />}
            >
              {isDarkMode ? 'Light Mode' : 'Dark Mode'}
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => setIsSheetOpen(true)}
              leftIcon={<Sparkles className="w-4 h-4" />}
            >
              Test Sheet Drawer
            </Button>
          </div>
        </div>

        {/* Section 1: Color Tokens Palette */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-ink tracking-tight font-display">
                1. Color Matrix & Semantic Tokens
              </h2>
              <p className="text-xs text-muted">
                Zero raw hex codes in components. All surfaces inherit CSS custom variables with automated dark mode adaptations.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {colorTokens.map((item) => (
              <div
                key={item.name}
                className="bg-surface border border-line rounded-card p-3 shadow-subtle flex flex-col justify-between h-28"
              >
                <div className="flex items-start justify-between">
                  <div
                    className={`w-8 h-8 rounded-lg shadow-sm border ${item.bg} ${item.border}`}
                  />
                  <span className="text-[10px] font-mono text-muted">
                    {item.token.replace('--color-', '')}
                  </span>
                </div>
                <div>
                  <p className="text-xs font-semibold text-ink leading-tight">{item.name}</p>
                  <p className="text-[10px] text-muted truncate mt-0.5" title={item.desc}>
                    {item.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Section 2: Typography Scale */}
        <section className="space-y-4">
          <div>
            <h2 className="text-lg font-bold text-ink tracking-tight font-display">
              2. Typographic Hierarchy
            </h2>
            <p className="text-xs text-muted">
              Dual font architecture: <strong>Plus Jakarta Sans</strong> for display headlines and editorial poise, paired with <strong>Inter</strong> for reading ergonomics.
            </p>
          </div>

          <div className="bg-surface border border-line rounded-card p-6 shadow-subtle space-y-4">
            <div className="border-b border-line pb-3">
              <span className="text-[11px] font-mono text-muted uppercase">Display Hero (font-display font-black)</span>
              <p className="text-3xl sm:text-4xl font-black font-display tracking-tight text-ink mt-1">
                Luxury framing. Photos first, chrome second.
              </p>
            </div>

            <div className="border-b border-line pb-3">
              <span className="text-[11px] font-mono text-muted uppercase">Heading 1 (font-display font-bold)</span>
              <p className="text-2xl font-bold font-display tracking-tight text-ink mt-1">
                Curated Collections for the Discerning Indian Consumer
              </p>
            </div>

            <div className="border-b border-line pb-3">
              <span className="text-[11px] font-mono text-muted uppercase">Subheading (font-semibold)</span>
              <p className="text-base font-semibold text-ink mt-1">
                Handpicked textiles and modern electronics with guaranteed authenticity.
              </p>
            </div>

            <div className="border-b border-line pb-3">
              <span className="text-[11px] font-mono text-muted uppercase">Body & Tabular Numerals</span>
              <p className="text-sm text-muted leading-relaxed mt-1">
                Body text renders comfortably with tight kerning. Prices use tabular numerals for perfect visual vertical alignment: <span className="font-semibold text-ink tabular-nums">₹12,499.00</span> vs <span className="font-semibold text-ink tabular-nums">₹8,990.00</span>.
              </p>
            </div>

            <div>
              <span className="text-[11px] font-mono text-muted uppercase">Micro Badges & Metadata</span>
              <p className="text-xs text-muted uppercase tracking-wider font-semibold mt-1">
                AUTHENTICATED BY RIGAMART ESCROW • GST COMPLIANT INVOICE
              </p>
            </div>
          </div>
        </section>

        {/* Section 3: Buttons */}
        <section className="space-y-4">
          <div>
            <h2 className="text-lg font-bold text-ink tracking-tight font-display">
              3. Button Primitives & Interactive States
            </h2>
            <p className="text-xs text-muted">
              Built with physics press feedback (`active:scale-[0.98]`), accessible focus ring (`focus-visible:ring-2`), and loading spinners.
            </p>
          </div>

          <div className="bg-surface border border-line rounded-card p-6 shadow-subtle space-y-6">
            <div>
              <h3 className="text-xs font-semibold text-muted uppercase tracking-wider mb-3">Variants</h3>
              <div className="flex flex-wrap items-center gap-3">
                <Button variant="primary">Primary Brand</Button>
                <Button variant="secondary">Secondary Surface</Button>
                <Button variant="outline">Outline Brand</Button>
                <Button variant="ghost">Ghost Button</Button>
                <Button variant="accent">Accent Saffron</Button>
                <Button variant="destructive">Destructive</Button>
              </div>
            </div>

            <div>
              <h3 className="text-xs font-semibold text-muted uppercase tracking-wider mb-3">Sizes</h3>
              <div className="flex flex-wrap items-center gap-3">
                <Button size="sm">Small (h-8)</Button>
                <Button size="md">Medium (h-10)</Button>
                <Button size="lg">Large Hero (h-12)</Button>
                <Button size="icon" aria-label="Heart icon">
                  <Heart className="w-4 h-4 text-danger" />
                </Button>
                <Button size="icon-sm" variant="secondary" aria-label="Bag icon">
                  <ShoppingBag className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>

            <div>
              <h3 className="text-xs font-semibold text-muted uppercase tracking-wider mb-3">States: Loading, Disabled, Icons</h3>
              <div className="flex flex-wrap items-center gap-3">
                <Button isLoading>Loading State</Button>
                <Button disabled>Disabled Action</Button>
                <Button leftIcon={<Truck className="w-4 h-4" />}>
                  Track Shipment
                </Button>
                <Button variant="secondary" rightIcon={<ArrowRight className="w-4 h-4" />}>
                  Continue to Payment
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Section 4: Form Inputs */}
        <section className="space-y-4">
          <div>
            <h2 className="text-lg font-bold text-ink tracking-tight font-display">
              4. Input Primitives & Form Validation
            </h2>
            <p className="text-xs text-muted">
              Includes accessible labels, aria-invalid descriptors, helper hints, and prefix/suffix adornments.
            </p>
          </div>

          <div className="bg-surface border border-line rounded-card p-6 shadow-subtle">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="Search Products"
                placeholder="Try 'Cotton Kurta' or 'Sony Headphones'..."
                prefix={<Search className="w-4 h-4" />}
                value={inputValue}
                onChange={(e) => {
                  setInputValue(e.target.value);
                  if (inputError) setInputError('');
                }}
                helperText="Press Enter to view catalog results"
              />

              <Input
                label="Delivery Pincode"
                placeholder="6-digit Indian PIN code"
                prefix={<span className="font-semibold text-xs text-muted">PIN</span>}
                suffix={
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-7 text-xs px-2 text-brand font-semibold"
                    onClick={() => {
                      if (!inputValue || inputValue.length !== 6) {
                        setInputError('Please enter a valid 6-digit postal code.');
                      } else {
                        setInputError('');
                      }
                    }}
                  >
                    Check
                  </Button>
                }
                error={inputError}
              />

              <Input
                label="Email Address (Disabled)"
                value="customer@rigamart.in"
                disabled
                prefix={<Mail className="w-4 h-4" />}
                helperText="Verified account email cannot be changed"
              />

              <Input
                label="Expected Delivery Date"
                type="text"
                readOnly
                value="Thursday, 8 October — Express Delivery"
                prefix={<ShieldCheck className="w-4 h-4 text-success" />}
                helperText="Guaranteed courier hand-off within 24 hours"
              />
            </div>
          </div>
        </section>

        {/* Section 5: Badges & Status Chips */}
        <section className="space-y-4">
          <div>
            <h2 className="text-lg font-bold text-ink tracking-tight font-display">
              5. Semantic Badges & Trust Signals
            </h2>
            <p className="text-xs text-muted">
              Clean visual status pills that avoid dark patterns and communicate truthful inventory and delivery status.
            </p>
          </div>

          <div className="bg-surface border border-line rounded-card p-6 shadow-subtle space-y-4">
            <div>
              <h3 className="text-xs font-semibold text-muted uppercase tracking-wider mb-2">Subtle Tint (Default)</h3>
              <div className="flex flex-wrap gap-2">
                <Badge color="brand" dot>Verified Seller</Badge>
                <Badge color="accent">Limited Collection</Badge>
                <Badge color="success" dot>Delivered</Badge>
                <Badge color="warning">Low Stock (3 left)</Badge>
                <Badge color="danger">Out of Stock</Badge>
                <Badge color="neutral">Standard Delivery</Badge>
              </div>
            </div>

            <div>
              <h3 className="text-xs font-semibold text-muted uppercase tracking-wider mb-2">Solid High Contrast</h3>
              <div className="flex flex-wrap gap-2">
                <Badge variant="solid" color="brand">Rigamart Choice</Badge>
                <Badge variant="solid" color="accent">Festive Offer</Badge>
                <Badge variant="solid" color="success">Paid via UPI</Badge>
                <Badge variant="solid" color="warning">Dispatched</Badge>
                <Badge variant="solid" color="danger">Cancelled</Badge>
              </div>
            </div>

            <div>
              <h3 className="text-xs font-semibold text-muted uppercase tracking-wider mb-2">Clean Outline</h3>
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline" color="brand">100% Cotton</Badge>
                <Badge variant="outline" color="accent">Made in India</Badge>
                <Badge variant="outline" color="neutral">7-Day Returns</Badge>
              </div>
            </div>
          </div>
        </section>

        {/* Section 6: Skeletons & Loading States */}
        <section className="space-y-4">
          <div>
            <h2 className="text-lg font-bold text-ink tracking-tight font-display">
              6. Skeleton Loaders (CLS Zero Jitter)
            </h2>
            <p className="text-xs text-muted">
              Matches exact card dimensions to eliminate Cumulative Layout Shift (CLS) on slow networks.
            </p>
          </div>

          <div className="bg-surface border border-line rounded-card p-6 shadow-subtle">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-2xl">
              {/* Product Card Skeleton Preview */}
              <div className="border border-line rounded-card p-3 space-y-3">
                <Skeleton className="w-full aspect-[4/5] rounded-lg" />
                <Skeleton variant="text" className="w-3/4" />
                <Skeleton variant="text" className="w-1/2" />
                <div className="flex items-center justify-between pt-2">
                  <Skeleton variant="text" className="w-16 h-5" />
                  <Skeleton className="w-8 h-8 rounded-lg" />
                </div>
              </div>

              {/* User Review Skeleton Preview */}
              <div className="border border-line rounded-card p-4 space-y-3">
                <div className="flex items-center gap-3">
                  <Skeleton variant="circular" className="w-10 h-10" />
                  <div className="space-y-1.5 flex-1">
                    <Skeleton variant="text" className="w-2/3" />
                    <Skeleton variant="text" className="w-1/3" />
                  </div>
                </div>
                <Skeleton variant="text" className="w-full" />
                <Skeleton variant="text" className="w-4/5" />
              </div>
            </div>
          </div>
        </section>

        {/* Section 7: Mobile Thumb-Zone & Sheet Preview */}
        <section className="space-y-4">
          <div>
            <h2 className="text-lg font-bold text-ink tracking-tight font-display">
              7. Responsive Sheet (Mobile Bottom Sheet / Desktop Drawer)
            </h2>
            <p className="text-xs text-muted">
              Swipe down or click backdrop to dismiss. Converts centered modal clutter into an ergonomic thumb-reachable drawer.
            </p>
          </div>

          <div className="bg-surface border border-line rounded-card p-6 shadow-subtle flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-ink">Interactive Sheet Demo</p>
              <p className="text-xs text-muted">
                Test the fluid swipe gestures, ESC key trap, body scroll lock, and responsive presentation.
              </p>
            </div>
            <Button variant="primary" onClick={() => setIsSheetOpen(true)}>
              Open Demo Sheet
            </Button>
          </div>
        </section>
      </div>

      {/* Interactive Sheet Component */}
      <Sheet
        isOpen={isSheetOpen}
        onClose={() => setIsSheetOpen(false)}
        title="Delivery Preferences"
        description="Choose your preferred fulfillment and notification settings."
        footer={
          <div className="flex items-center justify-end gap-2">
            <Button variant="ghost" onClick={() => setIsSheetOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={() => setIsSheetOpen(false)}>
              Save Preferences
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          <div className="p-3 bg-canvas border border-line rounded-xl flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Truck className="w-5 h-5 text-brand" />
              <div>
                <p className="text-xs font-semibold text-ink">Contactless Express</p>
                <p className="text-[11px] text-muted">Deliver to doorstep without signature</p>
              </div>
            </div>
            <input type="checkbox" defaultChecked className="accent-brand w-4 h-4 rounded" />
          </div>

          <div className="p-3 bg-canvas border border-line rounded-xl flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Mail className="w-5 h-5 text-brand" />
              <div>
                <p className="text-xs font-semibold text-ink">SMS & WhatsApp Alerts</p>
                <p className="text-[11px] text-muted">Receive live OTP and courier live location</p>
              </div>
            </div>
            <input type="checkbox" defaultChecked className="accent-brand w-4 h-4 rounded" />
          </div>

          <div className="p-3 bg-canvas border border-line rounded-xl flex items-center justify-between">
            <div className="flex items-center gap-3">
              <RotateCcw className="w-5 h-5 text-brand" />
              <div>
                <p className="text-xs font-semibold text-ink">Hassle-free 7-Day Returns</p>
                <p className="text-[11px] text-muted">Pre-authorize doorstep reverse pickups</p>
              </div>
            </div>
            <input type="checkbox" defaultChecked className="accent-brand w-4 h-4 rounded" />
          </div>
        </div>
      </Sheet>
    </div>
  );
}
