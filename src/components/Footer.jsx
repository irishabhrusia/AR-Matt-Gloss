'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';

const DEFAULT_FOOTER = {
  aboutText:
    'Professional painters and decorators across Surrey, London and Greater London. We undertake jobs within Greater London areas and up to 30 miles outside M25.',
  logoUrl:
    'https://horizons-cdn.hostinger.com/f595585e-4a4f-4dfc-a114-05631f9697b2/1275896739a421cf642ea5e88346c08b.png',
  servicesHeading: 'Services',
  servicesLinks: [
    { label: 'Interior Painting', href: '/services/interior-painting' },
    { label: 'Exterior Painting', href: '/services/exterior-painting' },
    { label: 'Limewash Specialist', href: '/services/limewash-specialist' },
    { label: 'Decorative Finishes', href: '/services/decorative-finishes' },
    { label: 'Spray Refinishing', href: '/services/cabinet-refinishing' },
    { label: 'Commercial Painting', href: '/services/commercial-painting' },
  ],
  contactHeading: 'Contact us',
  phone1: '07309 092376',
  phone2: '02034 880652',
  email: 'contact@ar-mattandgloss-decorators.com',
  address: '23 Church Road, Richmond, Surrey TW9 2QA',
  hoursHeading: 'Business hours',
  hoursWeekday: 'Monday to Friday: 8am – 5pm',
  hoursSaturday: 'Saturday: 8am – 5pm',
  hoursSunday: 'Sunday: on request',
  copyright: '© 2026 AR Matt & Gloss Decorators',
};

export function Footer() {
  const [data, setData] = useState(DEFAULT_FOOTER);

  useEffect(() => {
    fetch('/api/settings')
      .then((res) => res.json())
      .then((json) => {
        if (json.success && json.settings?.footer) {
          setData((prev) => ({
            ...prev,
            ...json.settings.footer,
          }));
        }
      })
      .catch((err) => console.error('Error loading dynamic footer:', err));
  }, []);

  return (
    <footer>
      <div className="w">
        {/* Column 1: Logo & About */}
        <div>
          <div className="logo" style={{ display: 'inline-block', marginBottom: '16px' }}>
            <img
              src={data.logoUrl || DEFAULT_FOOTER.logoUrl}
              alt="AR Matt & Gloss Decorators"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = '/assets/graphics/brand-fallback.svg';
              }}
            />
          </div>
          <p>{data.aboutText}</p>
        </div>

        {/* Column 2: Services Quick Links */}
        <div>
          <h4>{data.servicesHeading || 'Services'}</h4>
          {(data.servicesLinks || DEFAULT_FOOTER.servicesLinks).map((link, idx) => (
            <Link key={idx} href={link.href}>
              {link.label}
            </Link>
          ))}
        </div>

        {/* Column 3: Contact details */}
        <div>
          <h4>{data.contactHeading || 'Contact us'}</h4>
          {data.phone1 && <a href={`tel:${data.phone1.replace(/\s+/g, '')}`}>{data.phone1}</a>}
          {data.phone2 && <a href={`tel:${data.phone2.replace(/\s+/g, '')}`}>{data.phone2}</a>}
          {data.email && <a href={`mailto:${data.email}`}>{data.email}</a>}
          {data.address && <p>{data.address}</p>}
        </div>

        {/* Column 4: Business Hours & Copyright */}
        <div>
          <h4>{data.hoursHeading || 'Business hours'}</h4>
          {data.hoursWeekday && <p>{data.hoursWeekday}</p>}
          {data.hoursSaturday && <p>{data.hoursSaturday}</p>}
          {data.hoursSunday && <p>{data.hoursSunday}</p>}
          <p style={{ marginTop: '16px', fontSize: '.8rem' }}>{data.copyright}</p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
