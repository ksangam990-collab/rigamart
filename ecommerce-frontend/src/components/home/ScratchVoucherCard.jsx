import React, { useRef, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Check, Copy, Tag, Gift, Award } from 'lucide-react';

export default function ScratchVoucherCard() {
  const canvasRef = useRef(null);
  const [isScratched, setIsScratched] = useState(false);
  const [isDrawing, setIsDrawing] = useState(false);
  const [scratchPercent, setScratchPercent] = useState(0);
  const [copied, setCopied] = useState(false);

  const voucherCode = 'FESTIVE500';
  const discountText = 'Flat ₹500 Instant Discount on Orders Above ₹1,999';

  // Initialize Canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas dimensions to parent element size
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * (window.devicePixelRatio || 1);
    canvas.height = rect.height * (window.devicePixelRatio || 1);
    ctx.scale(window.devicePixelRatio || 1, window.devicePixelRatio || 1);

    // Draw rich metallic golden foil gradient
    const grad = ctx.createLinearGradient(0, 0, rect.width, rect.height);
    grad.addColorStop(0, '#d97706'); // amber-600
    grad.addColorStop(0.25, '#fbbf24'); // amber-400
    grad.addColorStop(0.5, '#fef08a'); // yellow-200
    grad.addColorStop(0.75, '#f59e0b');
    grad.addColorStop(1, '#b45309'); // amber-700

    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, rect.width, rect.height);

    // Add decorative shimmer text & stars on the foil
    ctx.fillStyle = '#78350f';
    ctx.font = 'bold 15px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('✨ SCRATCH HERE TO UNLOCK ✨', rect.width / 2, rect.height / 2 - 8);

    ctx.font = '11px system-ui, sans-serif';
    ctx.fillStyle = '#92400e';
    ctx.fillText('Win up to ₹500 instant discount', rect.width / 2, rect.height / 2 + 14);

    // Non-passive touch listener to prevent page scrolling during scratching on mobile
    const onTouchStart = (e) => {
      e.preventDefault();
      setIsDrawing(true);
      if (e.touches[0]) {
        scratch(e.touches[0].clientX, e.touches[0].clientY);
      }
    };

    const onTouchMove = (e) => {
      e.preventDefault();
      if (e.touches[0]) {
        scratch(e.touches[0].clientX, e.touches[0].clientY);
      }
    };

    const onTouchEnd = () => setIsDrawing(false);

    canvas.addEventListener('touchstart', onTouchStart, { passive: false });
    canvas.addEventListener('touchmove', onTouchMove, { passive: false });
    canvas.addEventListener('touchend', onTouchEnd);

    return () => {
      canvas.removeEventListener('touchstart', onTouchStart);
      canvas.removeEventListener('touchmove', onTouchMove);
      canvas.removeEventListener('touchend', onTouchEnd);
    };
  }, []);

  // Calculate scratched area
  const checkScratchPercentage = () => {
    const canvas = canvasRef.current;
    if (!canvas || isScratched) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    try {
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;
      let transparentPixels = 0;
      const totalPixels = data.length / 4;

      for (let i = 3; i < data.length; i += 16) { // Sample every 4th pixel for speed
        if (data[i] === 0) transparentPixels++;
      }

      const percent = Math.round((transparentPixels / (totalPixels / 4)) * 100);
      setScratchPercent(percent);

      if (percent > 35 && !isScratched) {
        setIsScratched(true);
        // Clear canvas completely
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    } catch {
      // Ignore
    }
  };

  const scratch = (clientX, clientY) => {
    if (isScratched) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = clientX - rect.left;
    const y = clientY - rect.top;

    ctx.globalCompositeOperation = 'destination-out';
    ctx.beginPath();
    ctx.arc(x, y, 24, 0, Math.PI * 2);
    ctx.fill();

    checkScratchPercentage();
  };

  const handleMouseDown = (e) => {
    setIsDrawing(true);
    scratch(e.clientX, e.clientY);
  };

  const handleMouseMove = (e) => {
    if (!isDrawing) return;
    scratch(e.clientX, e.clientY);
  };

  const handleMouseUp = () => setIsDrawing(false);

  const copyVoucher = () => {
    navigator.clipboard?.writeText(voucherCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-surface border border-line rounded-3xl p-5 sm:p-6 shadow-card flex flex-col justify-between space-y-4 relative overflow-hidden">
      {/* Ambient Gold Glow */}
      <div className="absolute top-0 right-0 w-36 h-36 bg-amber-400/10 rounded-full blur-2xl pointer-events-none" />

      {/* Header */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-xl bg-amber-500 text-amber-950 flex items-center justify-center font-bold text-sm shadow-subtle shrink-0">
            <Gift className="w-4 h-4 text-white" />
          </div>
          <div className="min-w-0">
            <h3 className="text-xs sm:text-sm font-bold text-ink truncate">
              Festive Gold Scratch Card
            </h3>
            <p className="text-[10px] sm:text-[11px] text-muted truncate">
              Scratch the gold foil to uncover your surprise discount!
            </p>
          </div>
        </div>

        <span className="text-[10px] font-black uppercase bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 px-2.5 py-0.5 rounded-full shrink-0 tracking-wider">
          ✨ Win ₹500
        </span>
      </div>

      {/* Scratch Canvas Card Frame */}
      <div className="relative w-full h-40 sm:h-44 rounded-2xl overflow-hidden border-2 border-dashed border-amber-400/60 shadow-inner flex items-center justify-center select-none bg-canvas">
        
        {/* Underlying Secret Voucher */}
        <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 via-surface to-brand-soft/20 p-4 flex flex-col items-center justify-center text-center space-y-2">
          {/* Confetti particles when revealed */}
          {isScratched && (
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
              {[...Array(16)].map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ y: -20, opacity: 1, scale: Math.random() * 0.8 + 0.4 }}
                  animate={{ y: 180, opacity: 0, rotate: Math.random() * 360 }}
                  transition={{ duration: 1.8 + Math.random(), delay: Math.random() * 0.4 }}
                  style={{
                    left: `${(i / 16) * 100}%`,
                    backgroundColor: ['#f59e0b', '#3b82f6', '#10b981', '#ec4899', '#8b5cf6'][i % 5]
                  }}
                  className="absolute w-2 h-2 rounded-xs"
                />
              ))}
            </div>
          )}

          <span className="text-[10px] font-black uppercase text-amber-600 dark:text-amber-400 tracking-wider flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>FESTIVAL WINNER!</span>
          </span>

          <div className="text-2xl sm:text-3xl font-black text-brand font-mono tracking-widest bg-brand-soft px-4 py-1 rounded-xl border border-brand/30 shadow-subtle">
            {voucherCode}
          </div>

          <p className="text-[11px] text-muted font-medium max-w-xs">
            {discountText}
          </p>

          <button
            type="button"
            onClick={copyVoucher}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-brand hover:bg-brand-dark text-white font-bold text-xs shadow-subtle transition-all cursor-pointer active:scale-95"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-300" />
                <span>Copied to Clipboard!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy &amp; Apply at Checkout</span>
              </>
            )}
          </button>
        </div>

        {/* Real HTML5 Foil Canvas Layer */}
        {!isScratched && (
          <canvas
            ref={canvasRef}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            className="absolute inset-0 w-full h-full cursor-crosshair z-10 touch-none"
          />
        )}
      </div>

      {/* Helper text */}
      <div className="text-center text-[11px] text-muted font-medium">
        {isScratched ? (
          <span className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center justify-center gap-1">
            <Check className="w-3.5 h-3.5" />
            <span>Voucher unlocked! Apply code <strong>{voucherCode}</strong> at checkout for flat ₹500 discount.</span>
          </span>
        ) : (
          <span>
            💡 Scratch across the golden foil with your finger or cursor to uncover your reward.
          </span>
        )}
      </div>
    </div>
  );
}
