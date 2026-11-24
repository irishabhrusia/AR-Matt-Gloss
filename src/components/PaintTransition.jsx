'use client';
import React, { createContext, useContext, useEffect, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';

export const PaintTransitionContext = createContext({
  startPaintTransition: () => {}
});

export const usePaintTransition = () => useContext(PaintTransitionContext);

const COLOR = '#FFC62E';
const DUR = 1800; // 900ms sweep-in to full yellow paint, 900ms sweep-out to unveil new page
const TIPX = 40;
const TIPY = 95;

const easeIO = (x) => (x < 0.5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2);

export function PaintTransition({ children }) {
  const router = useRouter();
  const pathname = usePathname() || '/';

  const canvasRef = useRef(null);
  const rollerRef = useRef(null);
  const animRef = useRef(null);
  const isTransitioningRef = useRef(false);
  const rafIdRef = useRef(null);

  const curLocationRef = useRef(pathname);
  useEffect(() => {
    curLocationRef.current = pathname;
  }, [pathname]);

  const runTransition = (targetDestination) => {
    if (isTransitioningRef.current || !canvasRef.current || !rollerRef.current) return;

    isTransitioningRef.current = true;
    const canvas = canvasRef.current;
    const roller = rollerRef.current;
    const ctx = canvas.getContext('2d');

    const dpr = typeof window !== 'undefined' ? (window.devicePixelRatio || 1) : 1;
    const W = window.innerWidth;
    const H = window.innerHeight;

    canvas.width = Math.round(W * dpr);
    canvas.height = Math.round(H * dpr);
    canvas.style.width = W + 'px';
    canvas.style.height = H + 'px';
    canvas.style.display = 'block';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    roller.style.display = 'block';

    animRef.current = {
      t0: performance.now(),
      target: targetDestination,
      swapped: false,
      particles: [],
      W,
      H,
      ctx,
      canvas,
      roller
    };

    const frame = (now) => {
      const anim = animRef.current;
      if (!anim) return;

      const curW = window.innerWidth;
      const curH = window.innerHeight;
      const t = Math.min((now - anim.t0) / DUR, 1);
      const half = 0.5;
      let a = 0;
      let b = 0;

      if (t < half) {
        b = easeIO(t / half) * curW;
      } else {
        b = curW;
        a = easeIO((t - half) / half) * curW;
      }

      // Exactly at half: the screen is 100% solidly covered with yellow paint!
      // Switch the route under the paint cover and scroll to top.
      if (!anim.swapped && t >= half) {
        anim.swapped = true;
        router.push(anim.target);
        window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
      }

      const lead = t < half ? b : a;
      const y = curH / 2 + Math.sin(t * Math.PI * 4) * curH * 0.18;
      const ang = Math.cos(t * Math.PI * 4) * 8 - 2;

      // Draw wavy paint edge on canvas
      anim.ctx.clearRect(0, 0, curW, curH);
      anim.ctx.fillStyle = COLOR;
      anim.ctx.beginPath();
      const wobble = now / 120;

      for (let yy = 0; yy <= curH; yy += 12) {
        const xr = b >= curW ? curW : b + Math.sin(yy * 0.02 + wobble) * 12;
        if (yy === 0) anim.ctx.moveTo(Math.max(0, xr), 0);
        else anim.ctx.lineTo(Math.max(0, xr), yy);
      }

      for (let yy = curH; yy >= 0; yy -= 12) {
        const xl = a <= 0 ? 0 : a + Math.sin(yy * 0.02 - wobble) * 12;
        anim.ctx.lineTo(Math.max(0, xl), yy);
      }
      anim.ctx.closePath();
      anim.ctx.fill();

      // Splatter particles
      if (t > 0.02 && t < 0.98) {
        for (let k = 0; k < 3; k++) {
          anim.particles.push({
            x: lead + (Math.random() - 0.5) * 16,
            y: y + (Math.random() - 0.5) * 130,
            vx: 1 + Math.random() * 4,
            vy: (Math.random() - 0.5) * 6,
            r: 2 + Math.random() * 5,
            life: 1
          });
        }
      }

      anim.particles = anim.particles.filter((p) => p.life > 0);
      anim.ctx.fillStyle = COLOR;
      for (const p of anim.particles) {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.25;
        p.life -= 0.03;
        anim.ctx.globalAlpha = Math.max(p.life, 0);
        anim.ctx.beginPath();
        anim.ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        anim.ctx.fill();
      }
      anim.ctx.globalAlpha = 1;

      // Position the paint roller
      anim.roller.style.transformOrigin = `${TIPX}px ${TIPY}px`;
      anim.roller.style.transform = `translate(${lead - TIPX}px, ${y - TIPY}px) rotate(${ang}deg)`;

      if (t < 1 || anim.particles.length > 0) {
        rafIdRef.current = requestAnimationFrame(frame);
      } else {
        // Finished
        anim.ctx.clearRect(0, 0, curW, curH);
        anim.roller.style.display = 'none';
        anim.canvas.style.display = 'none';
        animRef.current = null;
        isTransitioningRef.current = false;
      }
    };

    rafIdRef.current = requestAnimationFrame(frame);
  };

  // Intercept all internal page-to-page navigation link clicks
  useEffect(() => {
    const onGlobalClick = (e) => {
      if (isTransitioningRef.current) {
        e.preventDefault();
        e.stopPropagation();
        return;
      }

      if (e.defaultPrevented || e.button !== 0) return;
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;

      const anchor = e.target.closest('a');
      if (!anchor) return;

      if (anchor.target && anchor.target !== '_self') return;
      if (anchor.hasAttribute('download')) return;

      const rawHref = anchor.getAttribute('href');
      if (!rawHref) return;

      // Skip in-page anchors, tel:, mailto:, javascript:
      if (
        rawHref.startsWith('#') ||
        rawHref.startsWith('tel:') ||
        rawHref.startsWith('mailto:') ||
        rawHref.startsWith('javascript:')
      ) {
        return;
      }

      let url;
      try {
        url = new URL(anchor.href, window.location.origin);
      } catch {
        return;
      }

      // External links
      if (url.origin !== window.location.origin) return;

      const normalize = (p) =>
        p
          .replace(/\/index\.html$/, '/')
          .replace(/\.html$/, '')
          .replace(/\/$/, '') || '/';

      const curNorm = normalize(curLocationRef.current);
      const targetNorm = normalize(url.pathname);

      // If clicking same route
      if (curNorm === targetNorm) {
        if (url.hash) {
          // Allow normal hash navigation
          return;
        }
        e.preventDefault();
        return;
      }

      // Target is a different page -> Start paint transition!
      e.preventDefault();
      e.stopPropagation();

      const destination = url.pathname + url.search + url.hash;
      runTransition(destination);
    };

    document.addEventListener('click', onGlobalClick, true);
    return () => {
      document.removeEventListener('click', onGlobalClick, true);
      if (rafIdRef.current) cancelAnimationFrame(rafIdRef.current);
    };
  }, []);

  // Handle window resizing while animation is active
  useEffect(() => {
    const handleResize = () => {
      if (!animRef.current || !canvasRef.current) return;
      const dpr = window.devicePixelRatio || 1;
      const W = window.innerWidth;
      const H = window.innerHeight;
      canvasRef.current.width = Math.round(W * dpr);
      canvasRef.current.height = Math.round(H * dpr);
      canvasRef.current.style.width = W + 'px';
      canvasRef.current.style.height = H + 'px';
      const ctx = canvasRef.current.getContext('2d');
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <PaintTransitionContext.Provider value={{ startPaintTransition: runTransition }}>
      {children}

      {/* Paint Wipe Canvas Layer */}
      <canvas
        id="fx"
        ref={canvasRef}
        style={{
          position: 'fixed',
          left: 0,
          top: 0,
          width: '100vw',
          height: '100vh',
          pointerEvents: 'none',
          zIndex: 999998,
          display: 'none'
        }}
      />

      {/* Luxury AR Paint Roller */}
      <div
        id="roller"
        ref={rollerRef}
        style={{
          position: 'fixed',
          left: 0,
          top: 0,
          width: '230px',
          height: '215px',
          pointerEvents: 'none',
          zIndex: 999999,
          display: 'none',
          filter: 'drop-shadow(0 12px 24px rgba(0,0,0,0.22))'
        }}
      >
        <svg width="230" height="215" viewBox="0 0 230 215" fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            {/* 3D Wet Paint Sleeve Gradient */}
            <linearGradient id="pt_roller_sleeve" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#D99B18" />
              <stop offset="25%" stopColor="#FFC62E" />
              <stop offset="55%" stopColor="#FFF1B8" />
              <stop offset="78%" stopColor="#FFC62E" />
              <stop offset="100%" stopColor="#C4890C" />
            </linearGradient>

            {/* Stainless Steel Cage Arm */}
            <linearGradient id="pt_metal_frame" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#FFFFFF" />
              <stop offset="30%" stopColor="#CBD5E1" />
              <stop offset="60%" stopColor="#64748B" />
              <stop offset="85%" stopColor="#E2E8F0" />
              <stop offset="100%" stopColor="#475569" />
            </linearGradient>

            {/* Matte Luxury Handle */}
            <linearGradient id="pt_handle_body" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#253D34" />
              <stop offset="35%" stopColor="#12251F" />
              <stop offset="80%" stopColor="#0B1713" />
              <stop offset="100%" stopColor="#050C0A" />
            </linearGradient>

            {/* Gold Brass Collar Ring */}
            <linearGradient id="pt_gold_ferrule" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#FDE68A" />
              <stop offset="45%" stopColor="#C5A880" />
              <stop offset="100%" stopColor="#92400E" />
            </linearGradient>
          </defs>

          {/* 1. Metal Frame behind the cylinder */}
          <path
            d="M 40 165 L 40 184 Q 40 196 54 196 L 94 196 Q 106 196 106 184 L 106 126 Q 106 112 120 112 L 140 112"
            fill="none"
            stroke="url(#pt_metal_frame)"
            strokeWidth="6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M 40 165 L 40 184 Q 40 196 54 196 L 94 196 Q 106 196 106 184 L 106 126 Q 106 112 120 112 L 140 112"
            fill="none"
            stroke="#FFFFFF"
            strokeWidth="1.5"
            strokeOpacity="0.65"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* 2. Roller Cylinder (Sleeve loaded with Sunshine Yellow paint) */}
          <rect x="18" y="25" width="44" height="140" rx="12" fill="url(#pt_roller_sleeve)" stroke="#B45309" strokeWidth="1" />

          {/* Wet paint gloss sheen stripe */}
          <rect x="36" y="28" width="6" height="134" rx="3" fill="#FFFFFF" fillOpacity="0.45" />

          {/* Subtle nap texture fibers */}
          <path d="M 22 45 Q 38 48 58 46" stroke="#FFFFFF" strokeWidth="1.2" strokeOpacity="0.35" strokeLinecap="round" />
          <path d="M 22 75 Q 38 78 58 76" stroke="#FFFFFF" strokeWidth="1.2" strokeOpacity="0.35" strokeLinecap="round" />
          <path d="M 22 105 Q 38 108 58 106" stroke="#FFFFFF" strokeWidth="1.2" strokeOpacity="0.35" strokeLinecap="round" />
          <path d="M 22 135 Q 38 138 58 136" stroke="#FFFFFF" strokeWidth="1.2" strokeOpacity="0.35" strokeLinecap="round" />

          {/* Top end cap & bolt */}
          <ellipse cx="40" cy="25" rx="22" ry="7" fill="#12251F" stroke="#000000" strokeWidth="0.8" />
          <circle cx="40" cy="25" r="4.5" fill="#CBD5E1" stroke="#475569" strokeWidth="0.8" />

          {/* Bottom end cap & bolt */}
          <ellipse cx="40" cy="165" rx="22" ry="7" fill="#C4890C" stroke="#92400E" strokeWidth="0.8" />
          <circle cx="40" cy="165" r="4.5" fill="#CBD5E1" stroke="#475569" strokeWidth="0.8" />

          {/* 3. Handle Assembly */}
          <rect x="136" y="103" width="8" height="18" rx="2" fill="url(#pt_gold_ferrule)" stroke="#78350F" strokeWidth="0.8" />
          <path
            d="M 144 102 L 208 102 Q 216 102 216 112 Q 216 122 208 122 L 144 122 Z"
            fill="url(#pt_handle_body)"
            stroke="#0A1612"
            strokeWidth="1"
          />

          {/* Ergonomic handle rubber ribs */}
          <rect x="160" y="104" width="3" height="16" rx="1.5" fill="#0A1612" />
          <rect x="172" y="104" width="3" height="16" rx="1.5" fill="#0A1612" />
          <rect x="184" y="104" width="3" height="16" rx="1.5" fill="#0A1612" />

          {/* Handle highlight & end hole */}
          <line x1="148" y1="105" x2="204" y2="105" stroke="#FFFFFF" strokeOpacity="0.25" strokeWidth="1.5" strokeLinecap="round" />
          <circle cx="208" cy="112" r="3.5" fill="#050C0A" />

          {/* Paint drips off the roller bottom */}
          <circle cx="34" cy="174" r="2.5" fill="#FFC62E" />
          <circle cx="48" cy="178" r="1.8" fill="#FFC62E" />
        </svg>
      </div>
    </PaintTransitionContext.Provider>
  );
}
