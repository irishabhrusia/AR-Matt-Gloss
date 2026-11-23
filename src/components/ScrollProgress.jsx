'use client';
import React, { useEffect, useState } from 'react';

export function ScrollProgress() {
  const [width, setWidth] = useState(0);

  useEffect(() => {
    function handleScroll() {
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (scrollHeight > 0) {
        setWidth((window.scrollY / scrollHeight) * 100);
      } else {
        setWidth(0);
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return <div id="bar" style={{ width: `${width}%` }}></div>;
}
