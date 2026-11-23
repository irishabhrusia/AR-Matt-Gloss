'use client';
import { useEffect } from 'react';

export function usePageStyle(cssPath) {
  useEffect(() => {
    let link = document.getElementById('active-page-style');
    if (!link) {
      link = document.createElement('link');
      link.id = 'active-page-style';
      link.rel = 'stylesheet';
      document.head.appendChild(link);
    }
    if (link.getAttribute('href') !== cssPath) {
      link.setAttribute('href', cssPath);
    }
  }, [cssPath]);
}
