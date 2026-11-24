'use client';
import React, { createContext, useContext, useEffect, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';

export const PaintTransitionContext = createContext({
  startPaintTransition: () => {}
});

export const usePaintTransition = () => useContext(PaintTransitionContext);

const COLOR = '#FFC62E';
// Sweep duration: ~1400ms (calm, satisfying speed that thoroughly paints the full screen)
const SWEEP_DUR = 1400;
const REVEAL_DUR = 260;

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

      {/* 3D Illusion AR Paint Roller */}
      <div
        id="roller"
        ref={rollerRef}
        style={{
          position: 'fixed',
          left: 0,
          top: 0,
          width: '120px',
          height: '110px',
          pointerEvents: 'none',
          zIndex: 999999,
          display: 'none',
          willChange: 'transform, opacity',
          filter: 'drop-shadow(0 14px 26px rgba(18, 37, 31, 0.38)) drop-shadow(0 4px 8px rgba(0,0,0,0.22))'
        }}
      >
        <svg viewBox="-6 -4 126 112" style={{ width: '100%', height: '100%', overflow: 'visible' }}>
          <defs>
            {/* 3D Cylindrical Wet Paint Specular Glaze & Shading */}
            <linearGradient id="pt_cyl_shading" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#000000" stopOpacity="0.25" />
              <stop offset="18%" stopColor="#FFFFFF" stopOpacity="0.75" />
              <stop offset="35%" stopColor="#FFFFFF" stopOpacity="0.2" />
              <stop offset="65%" stopColor="#000000" stopOpacity="0.05" />
              <stop offset="90%" stopColor="#000000" stopOpacity="0.38" />
              <stop offset="100%" stopColor="#000000" stopOpacity="0.6" />
            </linearGradient>

            {/* Stainless Steel Chrome Wire Frame */}
            <linearGradient id="pt_chrome_frame" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#FFFFFF" />
              <stop offset="25%" stopColor="#E2E8F0" />
              <stop offset="50%" stopColor="#64748B" />
              <stop offset="75%" stopColor="#CBD5E1" />
              <stop offset="100%" stopColor="#334155" />
            </linearGradient>

            {/* Luxury Brass Ferrule Collar */}
            <linearGradient id="pt_brass_collar" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#78350F" />
              <stop offset="30%" stopColor="#FDE68A" />
              <stop offset="60%" stopColor="#D97706" />
              <stop offset="85%" stopColor="#FDE68A" />
              <stop offset="100%" stopColor="#451A03" />
            </linearGradient>

            {/* 3D Ergonomic Rubber Grip Handle */}
            <linearGradient id="pt_handle_3d" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#0B1311" />
              <stop offset="25%" stopColor="#253D34" />
              <stop offset="45%" stopColor="#3B5A4E" />
              <stop offset="70%" stopColor="#1B2D26" />
              <stop offset="100%" stopColor="#050C0A" />
            </linearGradient>
          </defs>

          {/* 1. Ambient Contact Shadow under Cylinder */}
          <ellipse cx="55" cy="33.5" rx="52" ry="3" fill="#000000" fillOpacity="0.28" />

          {/* 2. Stainless Steel Chrome Arm Behind */}
          <path
            d="M110 17h10v26H55v20"
            fill="none"
            stroke="#000000"
            strokeOpacity="0.25"
            strokeWidth="5"
            strokeLinecap="round"
            strokeLinejoin="round"
            transform="translate(1, 2)"
          />
          <path
            d="M110 17h10v26H55v20"
            fill="none"
            stroke="url(#pt_chrome_frame)"
            strokeWidth="4.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M110 16.5h9.5v25.5H55v19"
            fill="none"
            stroke="#FFFFFF"
            strokeOpacity="0.75"
            strokeWidth="1.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* 3. Roller Cylinder (Base Paint Color) */}
          <rect x="0" y="0" width="110" height="34" rx="17" fill={COLOR} />

          {/* 3D Cylindrical Wet Paint Specular Glaze & Shading */}
          <rect x="0" y="0" width="110" height="34" rx="17" fill="url(#pt_cyl_shading)" />

          {/* Wet Gloss Sheen Stripe across center */}
          <rect x="6" y="5" width="98" height="3.5" rx="1.75" fill="#FFFFFF" fillOpacity="0.65" />
          <rect x="12" y="9.5" width="86" height="1.5" rx="0.75" fill="#FFFFFF" fillOpacity="0.35" />

          {/* Microfiber nap texture fibers */}
          <path d="M15 15h12M40 18h16M75 14h14M28 24h18M65 25h20" stroke="#FFFFFF" strokeOpacity="0.25" strokeWidth="1" strokeLinecap="round" />

          {/* Left End-Cap with Bolt (3D Ellipse) */}
          <ellipse cx="6" cy="17" rx="4" ry="12" fill="#0F172A" stroke="#334155" strokeWidth="0.8" />
          <ellipse cx="6" cy="17" rx="2.5" ry="5.5" fill="url(#pt_chrome_frame)" />
          <circle cx="6" cy="17" r="1.5" fill="#FFFFFF" />

          {/* Right End-Cap with Chrome Pivot Entry */}
          <ellipse cx="104" cy="17" rx="4" ry="12" fill="#0F172A" stroke="#334155" strokeWidth="0.8" />
          <ellipse cx="104" cy="17" rx="3" ry="6" fill="url(#pt_chrome_frame)" />
          <circle cx="104" cy="17" r="1.8" fill="#1E293B" />

          {/* Cylinder Outer Contour Stroke for Crisp Contrast */}
          <rect x="0" y="0" width="110" height="34" rx="17" fill="none" stroke="#0F172A" strokeWidth="1.5" strokeOpacity="0.45" />

          {/* 4. Luxury Brass Collar / Ferrule at Top of Handle */}
          <rect x="44" y="56" width="22" height="7" rx="2" fill="url(#pt_brass_collar)" stroke="#451A03" strokeWidth="0.6" />
          <rect x="45" y="57" width="20" height="1.5" rx="0.75" fill="#FFFFFF" fillOpacity="0.5" />

          {/* 5. 3D Ergonomic Rubber Grip Handle */}
          <path
            d="M45 62 C44 70 42 80 43 92 C43.5 99 47 103 55 103 C63 103 66.5 99 67 92 C68 80 66 70 65 62 Z"
            fill="url(#pt_handle_3d)"
            stroke="#050C0A"
            strokeWidth="1.2"
          />

          {/* Ergonomic handle rubber ribs */}
          <rect x="44.5" y="67" width="21" height="2.5" rx="1.25" fill="#070D0B" />
          <rect x="44.5" y="67" width="21" height="1" rx="0.5" fill="#3B5A4E" fillOpacity="0.4" />

          <rect x="43.5" y="73" width="23" height="2.5" rx="1.25" fill="#070D0B" />
          <rect x="43.5" y="73" width="23" height="1" rx="0.5" fill="#3B5A4E" fillOpacity="0.4" />

          <rect x="43" y="79" width="24" height="2.5" rx="1.25" fill="#070D0B" />
          <rect x="43" y="79" width="24" height="1" rx="0.5" fill="#3B5A4E" fillOpacity="0.4" />

          <rect x="43.5" y="85" width="23" height="2.5" rx="1.25" fill="#070D0B" />
          <rect x="43.5" y="85" width="23" height="1" rx="0.5" fill="#3B5A4E" fillOpacity="0.4" />

          {/* Handle Left Specular 3D Highlight Curve */}
          <path
            d="M45.5 64 C44.5 72 43.5 80 44.5 91"
            fill="none"
            stroke="#FFFFFF"
            strokeOpacity="0.25"
            strokeWidth="1.2"
            strokeLinecap="round"
          />

          {/* Bottom hanging hole with 3D inner rim */}
          <circle cx="55" cy="95.5" r="3.2" fill="#070D0B" stroke="#253D34" strokeWidth="0.8" />
          <circle cx="55" cy="95.5" r="1.8" fill="#EEF1EF" fillOpacity="0.8" />
        </svg>
      </div>
    </PaintTransitionContext.Provider>
  );
}
