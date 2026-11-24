'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export function MobileMenu({ isOpen, onClose }) {
  const pathname = usePathname() || '/';
  const path = pathname;
  const [servicesOpen, setServicesOpen] = useState(false);

  // Auto-expand services if the user is currently on a service page
  useEffect(() => {
    if (path.startsWith('/services')) {
      setServicesOpen(true);
    }
  }, [path]);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const toggleServices = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setServicesOpen((prev) => !prev);
  };

  return (
    <div
      className={`menu ${isOpen ? 'o' : ''}`}
      id="mn"
      aria-hidden={!isOpen}
      onClick={(e) => {
        if (e.target.id === 'mn') {
          onClose();
        }
      }}
    >
      {/* Top Header inside Menu */}
      <div className="mobile-menu-top">
        <span className="mobile-menu-brand">AR Matt &amp; Gloss</span>
        <button
          type="button"
          className="mobile-menu-close"
          onClick={onClose}
          aria-label="Close menu"
        >
          ✕
        </button>
      </div>

      <Link className="mobile-menu-link" href="/" onClick={onClose}>
        Home
      </Link>

      {/* Services with Collapse / Expand Accordion */}
      <div className="mobile-services-accordion">
        <div className="mobile-services-header">
          <Link className="mobile-menu-link" href="/services" onClick={onClose}>
            Services
          </Link>
          <button
            type="button"
            className={`mobile-expand-btn ${servicesOpen ? 'open' : ''}`}
            onClick={toggleServices}
            aria-label="Toggle Services submenu"
            aria-expanded={servicesOpen}
          >
            <svg viewBox="0 0 24 24" className="mobile-chevron-icon">
              <path
                d="M6 9l6 6 6-6"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>

        <div className={`mobile-sub-menu ${servicesOpen ? 'expanded' : ''}`}>
          <Link
            className={`sm ${path === '/services/interior-painting' ? 'active' : ''}`}
            href="/services/interior-painting"
            onClick={onClose}
          >
            Interior Painting <span>→</span>
          </Link>
          <Link
            className={`sm ${path === '/services/exterior-painting' ? 'active' : ''}`}
            href="/services/exterior-painting"
            onClick={onClose}
          >
            Exterior Painting <span>→</span>
          </Link>
          <Link
            className={`sm ${path === '/services/limewash-specialist' ? 'active' : ''}`}
            href="/services/limewash-specialist"
            onClick={onClose}
          >
            Limewash Specialist <span>→</span>
          </Link>
          <Link
            className={`sm ${path === '/services/decorative-finishes' ? 'active' : ''}`}
            href="/services/decorative-finishes"
            onClick={onClose}
          >
            Decorative Finishes <span>→</span>
          </Link>
          <Link
            className={`sm ${path === '/services/cabinet-refinishing' || path === '/services/spray-refinishing' ? 'active' : ''}`}
            href="/services/cabinet-refinishing"
            onClick={onClose}
          >
            Spray Refinishing <span>→</span>
          </Link>
          <Link
            className={`sm ${path === '/services/commercial-painting' ? 'active' : ''}`}
            href="/services/commercial-painting"
            onClick={onClose}
          >
            Commercial Painting <span>→</span>
          </Link>
        </div>
      </div>

      <Link className="mobile-menu-link" href="/portfolio" onClick={onClose}>
        Portfolio
      </Link>
      <Link className="mobile-menu-link" href="/services/limewash-specialist" onClick={onClose}>
        Limewash Specialist
      </Link>
      <Link className="mobile-menu-link" href="/testimonials" onClick={onClose}>
        Testimonials
      </Link>
      <Link className="mobile-menu-link" href="/contact" onClick={onClose}>
        Contact
      </Link>

      {/* Quick Call & Quote at bottom of menu */}
      <div className="mobile-menu-cta">
        <a className="mobile-tel-link" href="tel:07309092376">
          <svg className="i" style={{ width: '1.2em', height: '1.2em' }}>
            <use href="#ph" />
          </svg>
          07309 092376
        </a>
        <Link
          className="btn p btn-quote"
          href="/contact"
          onClick={onClose}
          style={{ background: '#8F9C95', borderColor: '#8F9C95', color: '#FFFFFF' }}
        >
          Get free quote
        </Link>
      </div>
    </div>
  );
}
