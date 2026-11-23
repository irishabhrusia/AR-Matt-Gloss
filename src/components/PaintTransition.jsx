'use client';
import React, { createContext, useContext, useEffect, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';

export const PaintTransitionContext = createContext({
  startPaintTransition: () => {}
});

export const usePaintTransition = () => useContext(PaintTransitionContext);

const COLOR = '#FFC62E';
const DUR = 2000; // 1s sweep-in to full yellow paint, 1s sweep-out to unveil new page
const S = 0.91;
const TIPX = 380 * S;
const TIPY = 100 * S;

const easeIO = (x) => (x < 0.5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2);

export function PaintTransition({ children }) {
  const router = useRouter();
  const pathname = usePathname() || '/';

  const canvasRef = useRef(null);
  const brushRef = useRef(null);
  const animRef = useRef(null);
  const isTransitioningRef = useRef(false);
  const rafIdRef = useRef(null);

  const curLocationRef = useRef(pathname);
  useEffect(() => {
    curLocationRef.current = pathname;
  }, [pathname]);

  const runTransition = (targetDestination) => {
    if (isTransitioningRef.current || !canvasRef.current || !brushRef.current) return;

    isTransitioningRef.current = true;
    const canvas = canvasRef.current;
    const brush = brushRef.current;
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

    brush.style.display = 'block';

    animRef.current = {
      t0: performance.now(),
      target: targetDestination,
      swapped: false,
      particles: [],
      W,
      H,
      ctx,
      canvas,
      brush
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
      const y = curH / 2 + Math.sin(t * Math.PI * 6) * curH * 0.25;
      const ang = Math.cos(t * Math.PI * 6) * 18 - 10;

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
        for (let k = 0; k < 4; k++) {
          anim.particles.push({
            x: lead + (Math.random() - 0.5) * 20,
            y: y + (Math.random() - 0.5) * 120,
            vx: 2 + Math.random() * 6,
            vy: (Math.random() - 0.5) * 8,
            r: 2 + Math.random() * 7,
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

      // Position the paintbrush
      anim.brush.style.transformOrigin = `${TIPX}px ${TIPY}px`;
      anim.brush.style.transform = `translate(${lead - TIPX}px, ${y - TIPY}px) rotate(${ang}deg)`;

      if (t < 1 || anim.particles.length > 0) {
        rafIdRef.current = requestAnimationFrame(frame);
      } else {
        // Finished
        anim.ctx.clearRect(0, 0, curW, curH);
        anim.brush.style.display = 'none';
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

      {/* Realistic Paintbrush */}
      <div
        id="brush"
        ref={brushRef}
        style={{
          position: 'fixed',
          left: 0,
          top: 0,
          width: '364px',
          height: '182px',
          pointerEvents: 'none',
          zIndex: 999999,
          display: 'none',
          color: COLOR
        }}
      >
        <svg width="364" height="182" viewBox="0 0 400 200" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="pt_hd" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#D9583A" />
              <stop offset=".45" stopColor="#A93A22" />
              <stop offset="1" stopColor="#7A2616" />
            </linearGradient>
            <linearGradient id="pt_fe" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#F4F6F8" />
              <stop offset=".4" stopColor="#B9BFC7" />
              <stop offset=".7" stopColor="#E9ECF0" />
              <stop offset="1" stopColor="#8E959E" />
            </linearGradient>
          </defs>
          {/* Handle */}
          <path d="M226 70 L140 80 Q60 84 30 92 Q14 100 30 108 Q60 116 140 120 L226 130 Z" fill="url(#pt_hd)" />
          <path d="M150 84 Q100 86 60 92" stroke="#FFFFFF" strokeOpacity=".25" strokeWidth="3" fill="none" />
          <ellipse cx="30" cy="100" rx="6" ry="9" fill="#4A1509" />
          {/* Ferrule */}
          <rect x="222" y="50" width="82" height="100" rx="4" fill="url(#pt_fe)" stroke="#7d848d" strokeWidth="1.5" />
          <line x1="240" y1="52" x2="240" y2="148" stroke="#7d848d" strokeWidth="2" />
          <line x1="290" y1="52" x2="290" y2="148" stroke="#7d848d" strokeWidth="2" />
          <circle cx="250" cy="72" r="3" fill="#6b727b" />
          <circle cx="250" cy="128" r="3" fill="#6b727b" />
          {/* Bristles */}
          <path d="M300 50 L358 30 L378 34 L380 166 L358 170 L300 150 Z" fill="#E6CF9A" />
          <path d="M300 50 L358 30 L378 34 L380 100 L300 96 Z" fill="#F3E4BE" opacity=".8" />
          <path d="M322 52 L322 148 M344 40 L344 160" stroke="#C4A96C" strokeWidth="1.5" opacity=".7" />
          {/* Wet paint tip in #FFC62E */}
          <path d="M356 30 L378 34 L380 100 L366 101 Z" fill="currentColor" opacity=".95" />
        </svg>
      </div>
    </PaintTransitionContext.Provider>
  );
}
