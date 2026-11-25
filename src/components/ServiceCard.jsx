import Link from 'next/link';

export default function ServiceCard({ svc, isDuplicate = false }) {
  if (!svc) return null;

  return (
    <Link
      href={svc.slug === 'limewash-specialist' ? '/services/limewash-specialist' : `/services/${svc.slug}`}
      className={`home-service-card services-marquee-card ${svc.popular ? 'is-popular' : ''}`}
      style={{ background: svc.bg }}
      aria-hidden={isDuplicate ? 'true' : undefined}
      tabIndex={isDuplicate ? -1 : undefined}
    >
      <div className="service-card-top">
        <div className="service-card-icon" style={{ color: svc.iconColor, background: 'rgba(255, 255, 255, 0.75)' }}>
          {svc.icon === 'home' && (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
              <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
          )}
          {svc.icon === 'roller' && (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="3" width="16" height="6" rx="2" />
              <path d="M18 6h3a1 1 0 0 1 1 1v4a1 1 0 0 1-1 1h-8v3" />
              <rect x="11" y="15" width="2" height="6" rx="1" />
            </svg>
          )}
          {svc.icon === 'palette' && (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="13.5" cy="6.5" r=".5" fill="currentColor" />
              <circle cx="17.5" cy="10.5" r=".5" fill="currentColor" />
              <circle cx="8.5" cy="7.5" r=".5" fill="currentColor" />
              <circle cx="6.5" cy="12.5" r=".5" fill="currentColor" />
              <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z" />
            </svg>
          )}
          {svc.icon === 'brush' && (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18.37 2.63 14 7l-1.59-1.59a2 2 0 0 0-2.82 0L8 7l9 9 1.59-1.59a2 2 0 0 0 0-2.82L17 10l4.37-4.37a2.12 2.12 0 1 0-3-3Z" />
              <path d="M9 8c-2 3-4 3.5-7 4l8 8c.5-3 1-5 4-7" />
              <path d="M14.5 17.5 4.5 7.5" />
            </svg>
          )}
          {svc.icon === 'sparkle' && (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
              <path d="M5 3v4" />
              <path d="M19 17v4" />
            </svg>
          )}
          {svc.icon === 'shield' && (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
          )}
        </div>
        {svc.popular && (
          <span className="service-card-badge">Popular</span>
        )}
      </div>

      <h3 className="service-card-title">{svc.title}</h3>
      <p className="service-card-desc">{svc.desc}</p>

      <ul className="service-card-bullets">
        {svc.bullets.map((bullet, bi) => (
          <li key={bi}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#111111" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="bullet-check">
              <polyline points="20 6 9 17 4 12" />
            </svg>
            <span>{bullet}</span>
          </li>
        ))}
      </ul>
    </Link>
  );
}
