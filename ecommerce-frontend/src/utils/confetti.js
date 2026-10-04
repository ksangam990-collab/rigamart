/**
 * Zero-dependency, GPU-accelerated HTML5 Canvas Confetti celebration engine.
 * Spawns celebratory colorful confetti particles with realistic 2D physics.
 */
export function triggerConfetti(options = {}) {
  if (typeof window === 'undefined') return;

  const {
    particleCount = 90,
    colors = ['#FF6B00', '#10B981', '#6366F1', '#EC4899', '#F59E0B', '#3B82F6', '#14B8A6', '#8B5CF6'],
    origin = { x: 0.5, y: 0.55 },
    duration = 2600
  } = options;

  let canvas = document.getElementById('rigamart-confetti-canvas');
  if (!canvas) {
    canvas = document.createElement('canvas');
    canvas.id = 'rigamart-confetti-canvas';
    canvas.style.position = 'fixed';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.width = '100vw';
    canvas.style.height = '100vh';
    canvas.style.pointerEvents = 'none';
    canvas.style.zIndex = '99999';
    document.body.appendChild(canvas);
  }

  const ctx = canvas.getContext('2d');
  const dpr = window.devicePixelRatio || 1;
  const width = window.innerWidth;
  const height = window.innerHeight;
  canvas.width = width * dpr;
  canvas.height = height * dpr;
  ctx.scale(dpr, dpr);

  const particles = [];
  const startX = width * origin.x;
  const startY = height * origin.y;

  for (let i = 0; i < particleCount; i++) {
    const angle = (Math.random() * Math.PI) + Math.PI; // Upward spray
    const speed = 7 + Math.random() * 12;
    particles.push({
      x: startX + (Math.random() - 0.5) * 40,
      y: startY,
      vx: Math.cos(angle) * speed + (Math.random() - 0.5) * 5,
      vy: Math.sin(angle) * speed - (3 + Math.random() * 5),
      size: 5 + Math.random() * 6,
      color: colors[Math.floor(Math.random() * colors.length)],
      rotation: Math.random() * 360,
      rotationSpeed: (Math.random() - 0.5) * 12,
      scaleX: 1,
      scaleSpeed: 0.08 + Math.random() * 0.05,
      opacity: 1,
      gravity: 0.38 + Math.random() * 0.1,
      drag: 0.965,
      shape: Math.random() > 0.3 ? 'rect' : 'circle'
    });
  }

  const startTime = performance.now();
  let animationFrameId;

  function render(now) {
    const elapsed = now - startTime;
    const progress = elapsed / duration;

    ctx.clearRect(0, 0, width, height);

    if (progress >= 1) {
      if (canvas && canvas.parentNode) {
        canvas.parentNode.removeChild(canvas);
      }
      return;
    }

    particles.forEach((p) => {
      p.x += p.vx;
      p.y += p.vy;
      p.vy += p.gravity;
      p.vx *= p.drag;
      p.vy *= p.drag;
      p.rotation += p.rotationSpeed;
      p.scaleX = Math.cos((p.rotation * Math.PI) / 180);

      if (progress > 0.65) {
        p.opacity = Math.max(0, 1 - (progress - 0.65) / 0.35);
      }

      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate((p.rotation * Math.PI) / 180);
      ctx.scale(p.scaleX, 1);
      ctx.fillStyle = p.color;
      ctx.globalAlpha = p.opacity;

      if (p.shape === 'rect') {
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 1.4);
      } else {
        ctx.beginPath();
        ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();
    });

    animationFrameId = requestAnimationFrame(render);
  }

  animationFrameId = requestAnimationFrame(render);

  // Optional second micro-burst for rich depth
  setTimeout(() => {
    if (!document.body.contains(canvas)) return;
    for (let i = 0; i < 30; i++) {
      const angle = (Math.random() * Math.PI) + Math.PI;
      const speed = 6 + Math.random() * 8;
      particles.push({
        x: startX + (Math.random() - 0.5) * 50,
        y: startY,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 4,
        size: 4 + Math.random() * 5,
        color: colors[Math.floor(Math.random() * colors.length)],
        rotation: Math.random() * 360,
        rotationSpeed: (Math.random() - 0.5) * 14,
        scaleX: 1,
        scaleSpeed: 0.1,
        opacity: 1,
        gravity: 0.35,
        drag: 0.97,
        shape: 'rect'
      });
    }
  }, 220);
}
