'use client';
import React, { createContext, useContext, useEffect, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';

export const PaintTransitionContext = createContext({
  startPaintTransition: () => {}
});

export const usePaintTransition = () => useContext(PaintTransitionContext);

const COLOR = '#FFC62E';
// Sweep duration: ~950ms (faster than home page's ~5s, but clearly visible and guaranteed to cover the full page)
const SWEEP_DUR = 950;
const REVEAL_DUR = 220;

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

    // Accessibility: instant jump for prefers-reduced-motion
    if (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      router.push(targetDestination);
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
      return;
    }

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
    canvas.style.opacity = '1';
    canvas.style.display = 'block';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, W, H);

    // Dynamic roller dimensions matching home page 110x34 ratio
    const RW = W < 600 ? 95 : (W < 1200 ? 115 : 130);
    const CH = RW * (34 / 110);
    const CY = RW * (17 / 110);
    roller.style.width = RW + 'px';
    roller.style.display = 'block';
    roller.style.opacity = '1';

    // Generous vertical margins so the roller covers past screen edges
    const margin = CH + 50;
    // Step with ~18% overlap ensures 100% gapless coverage
    const step = RW * 0.82;
    const path = [];
    let d = 1; // 1 = down, 0 = up

    // Start slightly before 0 to guarantee left edge is fully painted
    const startX = Math.floor(RW * 0.45);
    for (let x = startX; x <= W + RW * 0.6; x += step) {
      const topY = -margin;
      const bottomY = H + margin;
      if (d === 1) {
        // Sweep downwards
        path.push([x, topY]);
        path.push([x, bottomY]);
      } else {
        // Sweep upwards
        path.push([x, bottomY]);
        path.push([x, topY]);
      }
      d = 1 - d;
    }

    if (path.length < 2) return;

    // Calculate total path distance for accurate timing
    let totalDist = 0;
    for (let i = 0; i < path.length - 1; i++) {
      totalDist += Math.hypot(path[i + 1][0] - path[i][0], path[i + 1][1] - path[i][1]);
    }

    // Speed in pixels per second calibrated to complete full sweep in SWEEP_DUR
    const SPEED = totalDist / (SWEEP_DUR / 1000);

    let lx = null;
    let ly = null;

    // Continuous solid paint stamp identical to home page stamp()
    const stamp = (x, y) => {
      ctx.fillStyle = COLOR;
      if (lx === null || ly === null) {
        lx = x;
        ly = y;
        ctx.fillRect(x - RW / 2, y - CH / 2, RW, CH);
        return;
      }

      const dist = Math.hypot(x - lx, y - ly);
      const steps = Math.max(1, Math.ceil(dist / 1.5));
      for (let i = 1; i <= steps; i++) {
        const interX = lx + (x - lx) * (i / steps);
        const interY = ly + (y - ly) * (i / steps);
        ctx.fillRect(interX - RW / 2, interY - CH / 2, RW, CH);
      }
      lx = x;
      ly = y;
    };

    const placeRoller = (x, y) => {
      roller.style.transform = `translate(${x - RW / 2}px, ${y - CY}px)`;
    };

    let pi = 0;
    let px = path[0][0];
    let py = path[0][1];
    let lastTime = null;
    let swapped = false;
    let revealStart = null;

    stamp(px, py);
    placeRoller(px, py);

    const frame = (now) => {
      if (!lastTime) lastTime = now;
      const dt = Math.min((now - lastTime) / 1000, 0.05);
      lastTime = now;

      if (pi < path.length) {
        // Phase 1: Column-by-column paint roller sweep across the entire page
        let remainingDist = SPEED * dt;

        while (remainingDist > 0 && pi < path.length) {
          const targetPt = path[pi];
          const dx = targetPt[0] - px;
          const dy = targetPt[1] - py;
          const dist = Math.hypot(dx, dy);

          if (dist <= remainingDist) {
            px = targetPt[0];
            py = targetPt[1];
            stamp(px, py);
            remainingDist -= dist;
            pi++;
          } else {
            px += (dx / dist) * remainingDist;
            py += (dy / dist) * remainingDist;
            stamp(px, py);
            remainingDist = 0;
          }
        }

        placeRoller(px, py);

        if (pi < path.length) {
          rafIdRef.current = requestAnimationFrame(frame);
          return;
        }
      }

      // Sweep finished: screen is 100% solidly covered with Sunshine Yellow!
      if (!swapped) {
        ctx.fillStyle = COLOR;
        ctx.fillRect(0, 0, W, H);
        swapped = true;
        revealStart = now;

        // Perform instant route switch under paint cover
        router.push(targetDestination);
        window.scrollTo({ top: 0, left: 0, behavior: 'instant' });

        rafIdRef.current = requestAnimationFrame(frame);
        return;
      }

      // Phase 2: Smooth snappy reveal of newly loaded page
      const revealElapsed = now - revealStart;
      if (revealElapsed < REVEAL_DUR) {
        const revealP = Math.min(revealElapsed / REVEAL_DUR, 1);
        const alpha = 1 - revealP;
        canvas.style.opacity = String(alpha);
        roller.style.opacity = String(alpha);
        rafIdRef.current = requestAnimationFrame(frame);
      } else {
        // Complete: clean up
        ctx.clearRect(0, 0, W, H);
        canvas.style.display = 'none';
        canvas.style.opacity = '1';
        roller.style.display = 'none';
        roller.style.opacity = '1';
        isTransitioningRef.current = false;
        animRef.current = null;
      }
    };

    rafIdRef.current = requestAnimationFrame(frame);
  };

  // Intercept all internal navigation link clicks
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
        if (url.hash) return;
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
          display: 'none',
          transition: 'opacity 0.05s linear'
        }}
      />

      {/* Exact Home Page AR Paint Roller */}
      <div
        id="roller"
        ref={rollerRef}
        style={{
          position: 'fixed',
          left: 0,
          top: 0,
          width: '110px',
          height: '100px',
          pointerEvents: 'none',
          zIndex: 999999,
          display: 'none',
          willChange: 'transform, opacity',
          filter: 'drop-shadow(0 8px 18px rgba(18, 37, 31, 0.28))'
        }}
      >
        <svg viewBox="0 0 110 100" style={{ width: '100%', height: '100%', overflow: 'visible' }}>
          <rect x="0" y="0" width="110" height="34" rx="17" fill={COLOR} stroke="#12251F" strokeWidth="3" />
          <path d="M110 17h10v26H55v20" fill="none" stroke="#12251F" strokeWidth="4" strokeLinejoin="round" />
          <rect x="46" y="60" width="18" height="40" rx="6" fill="#12251F" />
        </svg>
      </div>
    </PaintTransitionContext.Provider>
  );
}
