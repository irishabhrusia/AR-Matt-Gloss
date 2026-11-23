'use client';
import { useEffect } from 'react';

export function useReveal(deps = []) {
  useEffect(() => {
    // 1. Reveal on scroll observer
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1 });

    const revealElements = document.querySelectorAll('.rvl');
    revealElements.forEach((el) => io.observe(el));

    // 2. Animated numbers observer
    const io2 = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const b = entry.target;
        const targetNumber = +b.dataset.n;
        const suffix = b.dataset.s || '';
        const startTime = performance.now();
        const duration = 1400;

        function animateNumber(now) {
          const progress = Math.min(1, (now - startTime) / duration);
          const currentVal = Math.round(targetNumber * (1 - Math.pow(1 - progress, 3)));
          b.textContent = currentVal.toLocaleString('en-GB') + (progress === 1 ? suffix : '');
          if (progress < 1) {
            requestAnimationFrame(animateNumber);
          }
        }

        requestAnimationFrame(animateNumber);
        io2.unobserve(b);
      });
    });

    const countElements = document.querySelectorAll('[data-n]');
    countElements.forEach((b) => io2.observe(b));

    return () => {
      io.disconnect();
      io2.disconnect();
    };
  }, deps);
}
