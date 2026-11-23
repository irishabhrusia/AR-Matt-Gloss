'use client';
import React, { useState } from 'react';
import { usePathname } from 'next/navigation';
import { PaintTransition } from './PaintTransition';
import { ScrollToTopAndHash } from './ScrollToTopAndHash';
import { SvgDefs } from './SvgDefs';
import { ScrollProgress } from './ScrollProgress';
import { Header } from './Header';
import { MobileMenu } from './MobileMenu';
import { MobileBottomBar } from './MobileBottomBar';
import { Footer } from './Footer';
import { WhatsAppButton } from './WhatsAppButton';

export default function ClientLayoutWrapper({ children }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith('/admin');

  if (isAdmin) {
    return <div style={{ height: '100vh', maxHeight: '100vh', overflow: 'hidden', background: '#f8fafc' }}>{children}</div>;
  }

  return (
    <PaintTransition>
      <ScrollToTopAndHash />
      <SvgDefs />
      <ScrollProgress />

      <Header menuOpen={menuOpen} setMenuOpen={setMenuOpen} />
      <MobileMenu isOpen={menuOpen} onClose={() => setMenuOpen(false)} />

      {children}

      <WhatsAppButton />
      <Footer />
      <MobileBottomBar />
    </PaintTransition>
  );
}
