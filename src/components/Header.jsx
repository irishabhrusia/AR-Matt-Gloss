'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export function Header({ menuOpen, setMenuOpen }) {
  const pathname = usePathname() || '/';
  const path = pathname;

  const [phone, setPhone] = useState('07309 092376');
  const [logo, setLogo] = useState('https://horizons-cdn.hostinger.com/f595585e-4a4f-4dfc-a114-05631f9697b2/1275896739a421cf642ea5e88346c08b.png');

  useEffect(() => {
    fetch('/api/settings')
      .then((res) => res.json())
      .then((json) => {
        if (json.success && json.settings) {
          if (json.settings.company?.phone1) setPhone(json.settings.company.phone1);
          if (json.settings.footer?.logoUrl) setLogo(json.settings.footer.logoUrl);
        }
      })
      .catch((err) => console.error('Error loading header settings:', err));
  }, []);

  const isHome = path === '/' || path === '/index.html';
  const isServices = path.startsWith('/services') && !path.includes('limewash-specialist');
  const isLimewash = path.includes('limewash-specialist');
  const isPortfolio = path === '/portfolio' || path === '/portfolio.html';
  const isTestimonials = path === '/testimonials' || path === '/testimonials.html';
  const isContact = path === '/contact' || path === '/contact.html';

  const handleHomeClick = (e) => {
    if (isHome) {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <header style={{ position: 'sticky', top: 0, zIndex: 1000, background: 'rgba(255, 255, 255, 0.96)', backdropFilter: 'blur(14px)', WebkitBackdropFilter: 'blur(14px)' }}>
      <div className="w">
        <Link className="logo" href="/" onClick={handleHomeClick}>
          <img
            src={logo}
            alt="AR Matt & Gloss Decorators"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = '/assets/graphics/brand-fallback.svg';
            }}
          />
        </Link>
        <nav>
          <Link className={isHome ? 'on' : ''} href="/" onClick={handleHomeClick}>Home</Link>
          <div className="dd">
            <Link className={isServices ? 'on' : ''} href="/services">
              Services <span className="dd-chevron" aria-hidden="true">▾</span>
            </Link>
            <div className="ddm">
              <div>
                <Link
                  className={path.includes('interior-painting') ? 'cur' : ''}
                  href="/services/interior-painting"
                >
                  Interior Painting<span>→</span>
                </Link>
                <Link
                  className={path.includes('exterior-painting') ? 'cur' : ''}
                  href="/services/exterior-painting"
                >
                  Exterior Painting<span>→</span>
                </Link>
                <Link
                  className={path.includes('limewash-specialist') ? 'cur' : ''}
                  href="/services/limewash-specialist"
                >
                  Limewash Specialist<span>→</span>
                </Link>
                <Link
                  className={path.includes('decorative-finishes') ? 'cur' : ''}
                  href="/services/decorative-finishes"
                >
                  Decorative Finishes<span>→</span>
                </Link>
                <Link
                  className={path.includes('cabinet-refinishing') || path.includes('spray-refinishing') ? 'cur' : ''}
                  href="/services/cabinet-refinishing"
                >
                  Spray Refinishing<span>→</span>
                </Link>
                <Link
                  className={path.includes('commercial-painting') ? 'cur' : ''}
                  href="/services/commercial-painting"
                >
                  Commercial Painting<span>→</span>
                </Link>
              </div>
            </div>
          </div>
          <Link className={isPortfolio ? 'on' : ''} href="/portfolio">Portfolio</Link>
          <Link className={isLimewash ? 'on' : ''} href="/services/limewash-specialist">Limewash</Link>
          <Link className={isTestimonials ? 'on' : ''} href="/testimonials">Testimonials</Link>
          <Link className={isContact ? 'on' : ''} href="/contact">Contact</Link>
        </nav>
        <div className="hc">
          <a className="tel" href={`tel:${phone.replace(/\s+/g, '')}`}>
            <svg className="i">
              <use href="#ph" />
            </svg>
            {phone}
          </a>
          <Link
            className="btn p btn-quote"
            href="/contact"
            style={{ background: '#8F9C95', borderColor: '#8F9C95', color: '#FFFFFF' }}
          >
            Get free quote
          </Link>
          <button
            className={`burger ${menuOpen ? 'o' : ''}`}
            id="bg"
            aria-label="Menu"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen(!menuOpen)}
          ></button>
        </div>
      </div>
    </header>
  );
}
