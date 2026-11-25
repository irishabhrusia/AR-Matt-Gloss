'use client';

import React from 'react';
import ServiceCard from './ServiceCard';

export default function ServicesMarquee({ cards = [] }) {
  if (!cards || cards.length === 0) return null;

  return (
    <div className="services-marquee-wrap" aria-label="Our services marquee">
      <div className="services-marquee-track">
        {/* Original set of service cards */}
        {cards.map((svc, index) => (
          <ServiceCard
            key={`orig-${svc.slug || index}`}
            svc={svc}
            isDuplicate={false}
          />
        ))}

        {/* Duplicate set for seamless continuous marquee loop */}
        {cards.map((svc, index) => (
          <ServiceCard
            key={`dup-${svc.slug || index}`}
            svc={svc}
            isDuplicate={true}
          />
        ))}
      </div>
    </div>
  );
}
