'use client';

import React, { useRef, useState, useEffect, useCallback } from 'react';
import ServiceCard from './ServiceCard';

const SPEED_PX_PER_SEC = 58; // ~42 seconds per full 6-card cycle

export default function ServicesMarquee({ cards = [] }) {
  const wrapRef = useRef(null);
  const trackRef = useRef(null);

  const xRef = useRef(0);
  const singleSetWidthRef = useRef(0);
  const isDraggingRef = useRef(false);
  const isHoveredRef = useRef(false);
  const hasDraggedRef = useRef(false);
  const dragStartXRef = useRef(0);
  const dragStartOffsetRef = useRef(0);
  const reducedMotionRef = useRef(false);

  const [isGrabbing, setIsGrabbing] = useState(false);

  // Measure track and single-set width
  const updateMetrics = useCallback(() => {
    if (!trackRef.current) return;
    const totalWidth = trackRef.current.scrollWidth;
    const setWidth = totalWidth / 3;
    singleSetWidthRef.current = setWidth;

    // Initialize to start of Set 2 (middle buffer) if at 0
    if (xRef.current === 0 && setWidth > 0) {
      xRef.current = -setWidth;
      trackRef.current.style.transform = `translate3d(${xRef.current}px, 0, 0)`;
    }
  }, []);

  useEffect(() => {
    // Check reduced motion preference
    if (typeof window !== 'undefined') {
      const media = window.matchMedia('(prefers-reduced-motion: reduce)');
      reducedMotionRef.current = media.matches;
      const handleMediaChange = (e) => {
        reducedMotionRef.current = e.matches;
      };
      media.addEventListener('change', handleMediaChange);

      updateMetrics();
      window.addEventListener('resize', updateMetrics);

      let rafId;
      let lastTime = performance.now();

      const animate = (now) => {
        const dt = Math.min((now - lastTime) / 1000, 0.1);
        lastTime = now;

        if (!isDraggingRef.current && !isHoveredRef.current && !reducedMotionRef.current) {
          xRef.current -= SPEED_PX_PER_SEC * dt;

          const setWidth = singleSetWidthRef.current;
          if (setWidth > 0) {
            // Seamless infinite wrap in both directions
            while (xRef.current <= -2 * setWidth) {
              xRef.current += setWidth;
            }
            while (xRef.current >= 0) {
              xRef.current -= setWidth;
            }
          }

          if (trackRef.current) {
            trackRef.current.style.transform = `translate3d(${xRef.current}px, 0, 0)`;
          }
        }

        rafId = requestAnimationFrame(animate);
      };

      rafId = requestAnimationFrame(animate);

      return () => {
        cancelAnimationFrame(rafId);
        window.removeEventListener('resize', updateMetrics);
        media.removeEventListener('change', handleMediaChange);
      };
    }
  }, [cards, updateMetrics]);

  // Pointer Drag Handlers (supports both mouse and touch)
  const handlePointerDown = (e) => {
    if (e.button !== undefined && e.button !== 0) return; // Primary button only

    isDraggingRef.current = true;
    hasDraggedRef.current = false;
    dragStartXRef.current = e.clientX;
    dragStartOffsetRef.current = xRef.current;
    setIsGrabbing(true);

    if (e.currentTarget.setPointerCapture) {
      try {
        e.currentTarget.setPointerCapture(e.pointerId);
      } catch {}
    }
  };

  const handlePointerMove = (e) => {
    if (!isDraggingRef.current) return;

    const dx = e.clientX - dragStartXRef.current;
    if (Math.abs(dx) > 6) {
      hasDraggedRef.current = true;
    }

    let nextX = dragStartOffsetRef.current + dx;
    const setWidth = singleSetWidthRef.current;

    // Wrap dynamically during drag so user can scroll indefinitely left or right
    if (setWidth > 0) {
      while (nextX <= -2 * setWidth) {
        nextX += setWidth;
        dragStartOffsetRef.current += setWidth;
      }
      while (nextX >= 0) {
        nextX -= setWidth;
        dragStartOffsetRef.current -= setWidth;
      }
    }

    xRef.current = nextX;
    if (trackRef.current) {
      trackRef.current.style.transform = `translate3d(${nextX}px, 0, 0)`;
    }
  };

  const handlePointerUp = (e) => {
    if (!isDraggingRef.current) return;

    isDraggingRef.current = false;
    setIsGrabbing(false);

    if (e.currentTarget.releasePointerCapture) {
      try {
        e.currentTarget.releasePointerCapture(e.pointerId);
      } catch {}
    }

    // Keep hasDraggedRef true for a tiny window to block accidental link triggers
    if (hasDraggedRef.current) {
      setTimeout(() => {
        hasDraggedRef.current = false;
      }, 60);
    }
  };

  const handlePointerCancel = (e) => {
    handlePointerUp(e);
  };

  // Intercept click if the user was dragging
  const handleClickCapture = (e) => {
    if (hasDraggedRef.current) {
      e.preventDefault();
      e.stopPropagation();
    }
  };

  const handleMouseEnter = () => {
    isHoveredRef.current = true;
  };

  const handleMouseLeave = (e) => {
    isHoveredRef.current = false;
    if (isDraggingRef.current) {
      handlePointerUp(e);
    }
  };

  if (!cards || cards.length === 0) return null;

  return (
    <div
      ref={wrapRef}
      className={`services-marquee-wrap ${isGrabbing ? 'is-dragging' : ''}`}
      aria-label="Our services interactive marquee"
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerCancel}
      onClickCapture={handleClickCapture}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div ref={trackRef} className="services-marquee-track">
        {/* Set 1: Pre-buffer for dragging backwards */}
        {cards.map((svc, i) => (
          <ServiceCard
            key={`pre-${svc.slug || i}`}
            svc={svc}
            isDuplicate={true}
          />
        ))}

        {/* Set 2: Primary active cards for SEO & screen readers */}
        {cards.map((svc, i) => (
          <ServiceCard
            key={`main-${svc.slug || i}`}
            svc={svc}
            isDuplicate={false}
          />
        ))}

        {/* Set 3: Post-buffer for continuous forward scrolling & dragging */}
        {cards.map((svc, i) => (
          <ServiceCard
            key={`post-${svc.slug || i}`}
            svc={svc}
            isDuplicate={true}
          />
        ))}
      </div>
    </div>
  );
}
