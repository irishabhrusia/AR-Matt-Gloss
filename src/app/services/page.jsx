'use client';
import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePageStyle } from '@/hooks/usePageStyle';
import { useReveal } from '@/hooks/useReveal';
import { SERVICES, BRANDS, HOSTINGER_CDN } from '@/data/servicesData';

export function Services() {
  usePageStyle('/assets/css/services.css');
  useReveal();

  const [servicesList, setServicesList] = useState(SERVICES);
  const stackRef = useRef(null);

  useEffect(() => {
    fetch('/api/services')
      .then((r) => r.json())
      .then((j) => {
        if (j.success && j.services?.length) {
          const activeOnly = j.services.filter((s) => s.active !== false);
          if (activeOnly.length) {
            setServicesList((prev) => {
              return activeOnly.map((s) => {
                const fallback = prev.find((p) => p.slug === s.slug) || prev[0];
                return {
                  ...fallback,
                  ...s,
                  serviceOverviewBullets: s.features?.length ? s.features : fallback.serviceOverviewBullets,
                  serviceOverviewLabel: fallback.serviceOverviewLabel || s.title,
                };
              });
            });
          }
        }
      })
      .catch((e) => console.error(e));
  }, []);

  useEffect(() => {
    function flow() {
      if (!stackRef.current) return;
      const cards = stackRef.current.querySelectorAll('.sv');
      if (window.innerWidth < 981 || window.matchMedia('(prefers-reduced-motion:reduce)').matches) {
        cards.forEach((c) => {
          c.style.transform = '';
          c.style.filter = '';
        });
        return;
      }
      cards.forEach((c, i) => {
        const n = cards[i + 1];
        if (!n) return;
        const top = c.getBoundingClientRect().top;
        const nt = n.getBoundingClientRect().top;
        const h = c.offsetHeight;
        const d = nt - top;
        const p = Math.max(0, Math.min(1, 1 - d / (h * 0.9)));
        c.style.transform = `scale(${1 - 0.07 * p}) translateY(${p * -14}px)`;
        c.style.filter = `brightness(${1 - 0.32 * p}) blur(${p * 2.4}px)`;
      });
    }

    window.addEventListener('scroll', flow, { passive: true });
    window.addEventListener('resize', flow);
    flow();

    return () => {
      window.removeEventListener('scroll', flow);
      window.removeEventListener('resize', flow);
    };
  }, []);

  return (
    <main>
      <link rel="stylesheet" href="/assets/css/services.css" precedence="default" />
      <div className="hero">
        <div className="w">
          <div className="crumb">
            <Link href="/">Home</Link>/<b>Services</b>
          </div>
          <div className="eb">What we do</div>
          <h1>Our <span>Services</span></h1>
          <p className="lead">
            Professional painting and decorating for homes and businesses across Greater London and Surrey. Choose a service to see exactly what’s included.
          </p>
          <div className="jump" id="jump">
            {servicesList.map((s, i) => (
              <a key={s.slug} href={`#s${i}`}>{s.title}</a>
            ))}
          </div>
        </div>
      </div>

      <div className="w stack" id="stack" ref={stackRef}>
        {servicesList.map((s, i) => {
          const imgUrl = s.heroImage || (HOSTINGER_CDN + (s.serviceOverviewImage || ''));
          const serviceUrl = s.slug === 'limewash-specialist' ? '/services/limewash-specialist' : `/services/${s.slug}`;
          return (
            <Link
              key={s.slug}
              className="sv"
              id={`s${i}`}
              href={serviceUrl}
              style={{ '--t': s.tint || '#FFF3CF', '--k': i }}
            >
              <div className="tx">
                <h2>{s.title}</h2>
                <p>{s.desc}</p>
                <ul>
                  {(s.serviceOverviewBullets || s.features || []).map((b, bi) => (
                    <li key={bi}>
                      <svg className="i">
                        <use href="#ck" />
                      </svg>
                      {b}
                    </li>
                  ))}
                </ul>
                <span className="go">
                  Explore {s.title}{' '}
                  <svg className="i">
                    <use href="#ar" />
                  </svg>
                </span>
              </div>
              <div className="fr" style={{ '--u': `url('${imgUrl}')` }}>
                <img
                  src={imgUrl}
                  alt={`${s.serviceOverviewLabel || s.title} by AR Matt & Gloss Decorators`}
                  loading="lazy"
                />
                <small>{s.serviceOverviewLabel || s.title}</small>
              </div>
            </Link>
          );
        })}
      </div>

      <section className="band">
        <div className="w">
          <div className="hd rvl">
            <div>
              <div className="eb">Trusted brands</div>
              <h2>Brands we use.</h2>
            </div>
            <p className="lead">
              We partner with industry-leading manufacturers for premium quality, exceptional durability and a flawless finish.
            </p>
          </div>
          <div className="brands rvl" id="br">
            {BRANDS.map((brand, i) => (
              <span key={i}>{brand}</span>
            ))}
          </div>
        </div>
      </section>

      <section className="dk service-process-grey" style={{ background: '#B0BBC0', color: '#111111' }}>
        <div className="w">
          <div className="hd rvl">
            <div>
              <div className="eb" style={{ color: '#8F6A00' }}>Our process</div>
              <h2 style={{ color: '#111111' }}>Our proven process.</h2>
            </div>
            <p className="lead" style={{ color: '#222222' }}>A systematic approach that ensures quality results on every project.</p>
          </div>
          <div className="steps rvl">
            <div className="st">
              <h3 style={{ color: '#111111' }}>Consultation</h3>
              <p style={{ color: '#333333' }}>Free on-site assessment and detailed quote.</p>
            </div>
            <div className="st">
              <h3 style={{ color: '#111111' }}>Preparation</h3>
              <p style={{ color: '#333333' }}>Surface prep, protection, and material selection.</p>
            </div>
            <div className="st">
              <h3 style={{ color: '#111111' }}>Execution</h3>
              <p style={{ color: '#333333' }}>Professional painting with attention to detail.</p>
            </div>
            <div className="st">
              <h3 style={{ color: '#111111' }}>Inspection</h3>
              <p style={{ color: '#333333' }}>Final walkthrough and quality assurance.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="cta">
        <div className="w rvl">
          <h2>Not sure which service you need?</h2>
          <p>Tell us about your project and we’ll recommend the right approach, with a free, no-obligation quote.</p>
          <div className="acts">
            <Link className="btn k" href="/contact">
              Get a free quote{' '}
              <svg className="i">
                <use href="#ar" />
              </svg>
            </Link>
            <Link className="btn o" href="/portfolio">See our portfolio</Link>
          </div>
        </div>
      </section>
    </main>
  );
}

export default Services;
