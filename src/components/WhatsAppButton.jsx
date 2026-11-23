'use client';
import React, { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';

export function WhatsAppButton() {
  const pathname = usePathname();
  const [isHovered, setIsHovered] = useState(false);
  const [waData, setWaData] = useState({
    enabled: true,
    phone: '447309092376',
    message: 'Hello AR Matt & Gloss, I have a query about your painting & decorating services.',
    label: 'Chat on WhatsApp',
  });

  useEffect(() => {
    fetch('/api/settings')
      .then((res) => res.json())
      .then((json) => {
        if (json.success && json.settings?.whatsapp) {
          setWaData((prev) => ({
            ...prev,
            ...json.settings.whatsapp,
          }));
        }
      })
      .catch((err) => console.error('Error loading WhatsApp settings:', err));
  }, []);

  // Hide on admin portal or if disabled in backend
  if (pathname?.startsWith('/admin') || waData.enabled === false) {
    return null;
  }

  const phone = (waData.phone || '447309092376').replace(/\D/g, '');
  const defaultMessage = encodeURIComponent(waData.message || 'Hello AR Matt & Gloss!');
  const waUrl = `https://wa.me/${phone}?text=${defaultMessage}`;

  return (
    <div className="wa-float-wrapper">
      {/* Tooltip Badge on Hover */}
      <div className={`wa-pill-tooltip ${isHovered ? 'visible' : ''}`}>
        <span className="wa-online-dot"></span>
        {waData.label || 'Chat on WhatsApp'}
      </div>

      {/* Floating Action Button */}
      <a
        href={waUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat with AR Matt & Gloss on WhatsApp"
        className="wa-action-btn"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Official WhatsApp White Icon on Vibrant Green */}
        <svg
          viewBox="0 0 448 512"
          width="32"
          height="32"
          fill="#ffffff"
          style={{ display: 'block', transform: 'translateY(-0.5px)' }}
        >
          <path d="M380.9 97.1C339 55.1 283.2 32 223.9 32c-122.4 0-222 99.6-222 222 0 39.1 10.2 77.3 29.6 111L0 480l117.7-30.9c32.4 17.7 68.9 27 106.1 27h.1c122.3 0 224.1-99.6 224.1-222 0-59.3-25.2-115-67.1-157zm-157 341.6c-33.2 0-65.7-8.9-94-25.7l-6.7-4-69.8 18.3L72 359.2l-4.4-7c-18.5-29.4-28.2-63.3-28.2-98.2 0-101.7 82.8-184.5 184.6-184.5 49.3 0 95.6 19.2 130.4 54.1 34.8 34.9 56.2 81.2 56.1 130.5 0 101.8-84.9 184.6-186.6 184.6zm101.2-138.2c-5.5-2.8-32.8-16.2-37.9-18-5.1-1.9-8.8-2.8-12.5 2.8-3.7 5.6-14.3 18-17.6 21.8-3.2 3.7-6.5 4.2-12 1.4-32.6-16.3-54-29.1-75.5-66-5.7-9.8 5.7-9.1 16.3-30.3 1.8-3.7.9-6.9-.5-9.7-1.4-2.8-12.5-30.1-17.1-41.2-4.5-10.8-9.1-9.3-12.5-9.5-3.2-.2-6.9-.2-10.6-.2-3.7 0-9.7 1.4-14.8 6.9-5.1 5.6-19.4 19-19.4 46.3 0 27.3 19.9 53.7 22.6 57.4 2.8 3.7 39.1 59.7 94.8 83.8 35.2 15.2 49 16.5 66.6 13.9 10.7-1.6 32.8-13.4 37.4-26.4 4.6-13 4.6-24.1 3.2-26.4-1.3-2.5-5-3.9-10.5-6.6z" />
        </svg>
      </a>

      {/* Scoped CSS with pointer-events isolation */}
      <style jsx global>{`
        .wa-float-wrapper {
          position: fixed;
          right: 28px;
          bottom: 28px;
          z-index: 95;
          display: flex;
          align-items: center;
          gap: 12px;
          pointer-events: none !important; /* CRITICAL: Never block canvas paint events */
        }

        .wa-pill-tooltip {
          background: #111a16;
          color: #ffffff;
          padding: 8px 16px;
          border-radius: 30px;
          font-size: 0.84rem;
          font-weight: 700;
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.25);
          border: 1px solid rgba(255, 255, 255, 0.15);
          pointer-events: none;
          white-space: nowrap;
          display: flex;
          align-items: center;
          gap: 8px;
          opacity: 0;
          transform: translateX(12px);
          transition: all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
        }

        .wa-pill-tooltip.visible {
          opacity: 1;
          transform: translateX(0);
        }

        .wa-online-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #25D366;
          display: inline-block;
          box-shadow: 0 0 8px #25D366;
        }

        .wa-action-btn {
          pointer-events: auto !important; /* Only the circular button is clickable */
          cursor: pointer !important;
          width: 60px;
          height: 60px;
          border-radius: 50%;
          background: #25D366 !important;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 8px 26px rgba(0, 0, 0, 0.3), 0 0 0 3px #ffffff, 0 0 0 5px rgba(37, 211, 102, 0.3);
          transition: transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.25s ease;
          text-decoration: none;
        }

        .wa-action-btn:hover {
          transform: scale(1.1) rotate(4deg);
          box-shadow: 0 12px 32px rgba(37, 211, 102, 0.5), 0 0 0 3px #ffffff, 0 0 0 6px rgba(37, 211, 102, 0.4);
        }

        @media (max-width: 980px) {
          .wa-float-wrapper {
            right: 16px;
            bottom: 78px; /* Perfectly sits above mobile bottom bar */
          }
          .wa-pill-tooltip {
            display: none !important;
          }
          .wa-action-btn {
            width: 52px !important;
            height: 52px !important;
          }
          .wa-action-btn svg {
            width: 27px !important;
            height: 27px !important;
          }
        }
      `}</style>
    </div>
  );
}

export default WhatsAppButton;
