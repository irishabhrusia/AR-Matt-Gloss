'use client';
import React, { createContext, useContext, useEffect, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';

export const PaintTransitionContext = createContext({
  startPaintTransition: () => {}
});

export const usePaintTransition = () => useContext(PaintTransitionContext);

const COLOR = '#FFC62E';
const IN_DUR = 380; // Fast 380ms home page style sweep across screen
const OUT_DUR = 220; // 220ms smooth reveal of newly loaded page

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

    // Check for prefers-reduced-motion
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

    // Dynamic roller size matching home page ratio (110x34)
    const RW = W < 600 ? 95 : (W < 1200 ? 115 : 130);
    const CH = RW * (34 / 110);
    const CY = RW * (17 / 110);
    roller.style.width = RW + 'px';
    roller.style.display = 'block';
    roller.style.opacity = '1';

    // Build the exact vertical column sweep path from home page
    const margin = CH + 40;
    const step = RW * 0.82; // Overlapping columns guarantee zero gaps
    const path = [];
    let d = 1; // 1 = down, 0 = up
    for (let x = RW / 2; x < W + RW; x += step) {
      path.push([x, d ? -margin : H + margin], [x, d ? H + margin : -margin]);
      d = !d;
    }

    // Precalculate cumulative distances along the sweep path
    const segLengths = [];
    let totalDist = 0;
    for (let i = 0; i < path.length - 1; i++) {
      const segD = Math.hypot(path[i + 1][0] - path[i][0], path[i + 1][1] - path[i][1]);
      segLengths.push(segD);
      totalDist += segD;
    }

    let lx = null;
    let ly = null;

    // Smooth paint stamping matching home page stamp()
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

    const t0 = performance.now();
    let swapped = false;

    const frame = (now) => {
      const elapsed = now - t0;

      if (elapsed < IN_DUR) {
        // Phase 1: Fast home page roller sweep painting the whole screen
        const p = Math.min(elapsed / IN_DUR, 1);
        const currentTargetDist = p * totalDist;

        // Find position on path
        let acc = 0;
        let curX = path[0][0];
        let curY = path[0][1];

        for (let i = 0; i < segLengths.length; i++) {
          if (acc + segLengths[i] >= currentTargetDist) {
            const segRatio = (currentTargetDist - acc) / (segLengths[i] || 1);
            curX = path[i][0] + (path[i + 1][0] - path[i][0]) * segRatio;
            curY = path[i][1] + (path[i + 1][1] - path[i][1]) * segRatio;
            break;
          }
          acc += segLengths[i];
          if (i === segLengths.length - 1) {
            curX = path[path.length - 1][0];
            curY = path[path.length - 1][1];
          }
        }

        stamp(curX, curY);
        placeRoller(curX, curY);
        rafIdRef.current = requestAnimationFrame(frame);
      } else if (!swapped) {
        // Screen fully covered in solid yellow paint!
        ctx.fillStyle = COLOR;
        ctx.fillRect(0, 0, W, H);
        swapped = true;

        // Perform instant route transition under paint cover
        router.push(targetDestination);
        window.scrollTo({ top: 0, left: 0, behavior: 'instant' });

        rafIdRef.current = requestAnimationFrame(frame);
      } else if (elapsed < IN_DUR + OUT_DUR) {
        // Phase 2: Snappy reveal of new page
        const revealP = Math.min((elapsed - IN_DUR) / OUT_DUR, 1);
        const alpha = 1 - revealP;
        canvas.style.opacity = String(alpha);
        roller.style.opacity = String(alpha);

        rafIdRef.current = requestAnimationFrame(frame);
      } else {
        // Finished: cleanup & hide
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

  // Intercept all internal page navigation links
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
        if (url.hash) return; // Allow normal hash jump
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
