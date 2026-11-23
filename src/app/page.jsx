'use client';
import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePageStyle } from '@/hooks/usePageStyle';
import { useReveal } from '@/hooks/useReveal';
import { SERVICES } from '@/data/servicesData';
import { PORTFOLIO_PROJECTS, getImageUrl } from '@/data/portfolioData';

const COLORS = [
  ['#FFC62E', 'Sunshine'],
  ['#E8663D', 'Terracotta'],
  ['#2F6B57', 'Forest'],
  ['#6C9BD1', 'Sky blue'],
  ['#F2A7B8', 'Blush'],
  ['#12B5B0', 'Teal'],
  ['#8B4DFF', 'Violet']
];

export function Home() {
  usePageStyle('/assets/css/home.css');
  useReveal();

  // Color picker state & canvas
  const [activeColor, setActiveColor] = useState(COLORS[0][0]);
  const activeColorRef = useRef(COLORS[0][0]);
  const canvasRef = useRef(null);
  const heroRef = useRef(null);
  const rollerRef = useRef(null);
  const animRef = useRef(null);
  const initialTimerRef = useRef(null);

  // Discover section state
  const [activeService, setActiveService] = useState(0);
  const [activeImageIdx, setActiveImageIdx] = useState(0);
  const [isPhotoChanging, setIsPhotoChanging] = useState(false);
  const touchStartRef = useRef(null);

  // Recent projects showcase state
  const [recentIdx, setRecentIdx] = useState(0);
  const [lightboxIdx, setLightboxIdx] = useState(null);

  // Contact form submission state
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [phoneVal, setPhoneVal] = useState('');

  // Dynamic backend data states
  const [heroData, setHeroData] = useState({
    headline: 'Make your walls unforgettable.',
    subheading: 'Grab the roller. Paint this wall.',
    description: '28+ years. 1,247 happy clients. 4.9/5. Professional interior & exterior painting, limewash and spray finishes across London and Surrey. Fully insured, spotlessly tidy.',
    primaryCtaText: 'Get a free quote',
    primaryCtaLink: '#contact',
    secondaryCtaText: 'See our work',
    secondaryCtaLink: '/portfolio',
    phoneBadge: '07309 092376',
    statsYears: '28+',
    statsClients: '1,247',
    statsRating: '4.9/5',
  });
  const [aboutData, setAboutData] = useState(null);
  const [servicesList, setServicesList] = useState(SERVICES);
  const [portfolioList, setPortfolioList] = useState(PORTFOLIO_PROJECTS);
  const [reviewsList, setReviewsList] = useState([]);

  // Fetch dynamic content from APIs
  useEffect(() => {
    fetch('/api/settings')
      .then((r) => r.json())
      .then((j) => {
        if (j.success && j.settings) {
          if (j.settings.hero) setHeroData((prev) => ({ ...prev, ...j.settings.hero }));
          if (j.settings.about) setAboutData(j.settings.about);
        }
      })
      .catch((e) => console.error(e));

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
                  discoverImages: s.discoverImages?.length ? s.discoverImages : fallback.discoverImages,
                  features: s.features?.length ? s.features : fallback.features,
                };
              });
            });
          }
        }
      })
      .catch((e) => console.error(e));

    fetch('/api/portfolio')
      .then((r) => r.json())
      .then((j) => {
        if (j.success && j.portfolio?.length) {
          const activeOnly = j.portfolio.filter((p) => p.active !== false);
          if (activeOnly.length) {
            setPortfolioList(activeOnly);
          }
        }
      })
      .catch((e) => console.error(e));

    fetch('/api/reviews')
      .then((r) => r.json())
      .then((j) => {
        if (j.success && j.reviews?.length) {
          const activeOnly = j.reviews.filter((r) => r.active !== false);
          if (activeOnly.length) {
            setReviewsList(activeOnly);
          }
        }
      })
      .catch((e) => console.error(e));
  }, []);

  // 1. Hero Canvas Setup - Production-Grade Paint Roller & Brush Interaction
  useEffect(() => {
    const cv = canvasRef.current;
    const hero = heroRef.current;
    const rl = rollerRef.current;
    if (!cv || !hero || !rl) return;

    const cx = cv.getContext('2d');
    let W = 0, H = 0, RW = 110, CH = 34, CY = 17;
    let lx = null, ly = null;
    let auto = false;
    let isInteracting = false;
    let path = [], pi = 0, px = 0, py = 0;
    let lastTime = null;
    const RM = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion:reduce)').matches;

    function size() {
      const r = hero.getBoundingClientRect();
      const heroH = Math.round(Math.max(r.height, hero.offsetHeight || 0, hero.clientHeight || 0, 620));
      const heroW = Math.round(Math.max(r.width, hero.offsetWidth || 0, hero.clientWidth || 0, 320));

      if (heroW <= 0 || heroH <= 0) return;

      if (cv.width > 0 && cv.height > 0 && (cv.width !== heroW || cv.height !== heroH)) {
        const temp = document.createElement('canvas');
        temp.width = cv.width;
        temp.height = cv.height;
        const tempCtx = temp.getContext('2d');
        tempCtx.drawImage(cv, 0, 0);

        W = cv.width = heroW;
        H = cv.height = heroH;
        cx.drawImage(temp, 0, 0, W, H);
      } else if (cv.width === 0 || cv.height === 0) {
        W = cv.width = heroW;
        H = cv.height = heroH;
      }

      RW = W < 700 ? 82 : 115;
      CH = RW * (34 / 110);
      CY = RW * (17 / 110);
      rl.style.width = RW + 'px';
    }

    function getCanvasCoords(e) {
      const rect = cv.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) return { x: 0, y: 0, cssX: 0, cssY: 0 };
      const scaleX = cv.width / rect.width;
      const scaleY = cv.height / rect.height;
      return {
        x: (e.clientX - rect.left) * scaleX,
        y: (e.clientY - rect.top) * scaleY,
        cssX: e.clientX - rect.left,
        cssY: e.clientY - rect.top,
      };
    }

    function stamp(x, y, color) {
      cx.fillStyle = color;
      if (lx === null || ly === null) {
        lx = x;
        ly = y;
        cx.fillRect(x - RW / 2, y - CH / 2, RW, CH);
        return;
      }

      const d = Math.hypot(x - lx, y - ly);
      // Fine 1.5px step creates an ultra-smooth, gapless, solid paint stripe with zero dots
      const steps = Math.max(1, Math.ceil(d / 1.5));

      for (let i = 1; i <= steps; i++) {
        const interX = lx + (x - lx) * (i / steps);
        const interY = ly + (y - ly) * (i / steps);
        cx.fillRect(interX - RW / 2, interY - CH / 2, RW, CH);
      }
      lx = x;
      ly = y;
    }

    function place(x, y) {
      rl.style.opacity = '1';
      rl.style.transform = `translate(${x - RW / 2}px, ${y - CY}px)`;
    }

    function cancelAutoSweep() {
      auto = false;
      cancelAnimationFrame(animRef.current);
      if (initialTimerRef.current) {
        clearTimeout(initialTimerRef.current);
        initialTimerRef.current = null;
      }
    }

    function sweep(color) {
      cancelAutoSweep();
      if (RM) {
        cx.fillStyle = color;
        cx.fillRect(0, 0, W, H);
        return;
      }
      auto = true;
      lx = null;
      ly = null;
      lastTime = null;
      path = [];
      let d = 1;
      const margin = CH + 40;
      for (let x = RW / 2; x < W + RW / 2; x += RW * 0.85) {
        path.push([x, d ? -margin : H + margin], [x, d ? H + margin : -margin]);
        d = !d;
      }
      if (path.length === 0) return;
      pi = 0;
      px = path[0][0];
      py = path[0][1];

      // Roller sweep speed in pixels/second (higher = faster)
      const SPEED = Math.max(1600, Math.min(2200, H * 2.4));

      function f(now) {
        if (!auto) return;
        if (!lastTime) lastTime = now;
        const dt = Math.min((now - lastTime) / 1000, 0.05);
        lastTime = now;

        const sp = SPEED * dt;
        const t = path[pi];
        const dx = t[0] - px;
        const dy = t[1] - py;
        const dist = Math.hypot(dx, dy);

        if (dist <= sp) {
          px = t[0];
          py = t[1];
          pi++;
        } else {
          px += (dx / dist) * sp;
          py += (dy / dist) * sp;
        }

        stamp(px, py, color);
        place(px, py);

        if (pi >= path.length) {
          auto = false;
          lx = null;
          ly = null;
          rl.style.opacity = '0';
          return;
        }
        animRef.current = requestAnimationFrame(f);
      }
      animRef.current = requestAnimationFrame(f);
    }

    hero._sweep = sweep;
    hero._clear = () => {
      cx.clearRect(0, 0, W, H);
      lx = null;
      ly = null;
    };

    function shouldIgnoreTarget(target) {
      return !!(target && target.closest('.rs, .hbar, .dock'));
    }

    function onPointerDown(e) {
      if (shouldIgnoreTarget(e.target)) {
        lx = null;
        ly = null;
        return;
      }
      cancelAutoSweep();
      isInteracting = true;
      const coords = getCanvasCoords(e);
      lx = coords.x;
      ly = coords.y;
      stamp(coords.x, coords.y, activeColorRef.current);
      place(coords.cssX, coords.cssY);
    }

    function onPointerMove(e) {
      if (shouldIgnoreTarget(e.target)) {
        lx = null;
        ly = null;
        rl.style.opacity = '0';
        return;
      }
      cancelAutoSweep();

      const isTouch = e.pointerType === 'touch' || e.pointerType === 'pen';
      if (isTouch && !isInteracting && e.buttons === 0) {
        return;
      }

      const coords = getCanvasCoords(e);
      stamp(coords.x, coords.y, activeColorRef.current);
      place(coords.cssX, coords.cssY);
    }

    function onPointerUp() {
      isInteracting = false;
      lx = null;
      ly = null;
    }

    function onPointerEnter(e) {
      if (shouldIgnoreTarget(e.target)) return;
      lx = null;
      ly = null;
      if (e.pointerType === 'mouse') {
        rl.style.opacity = '1';
      }
    }

    function onPointerLeave() {
      isInteracting = false;
      lx = null;
      ly = null;
      rl.style.opacity = '0';
    }

    size();
    window.addEventListener('resize', size);

    let ro = null;
    if (typeof ResizeObserver !== 'undefined') {
      ro = new ResizeObserver(() => size());
      ro.observe(hero);
    }

    hero.addEventListener('pointerdown', onPointerDown);
    hero.addEventListener('pointerenter', onPointerEnter);
    hero.addEventListener('pointermove', onPointerMove);
    hero.addEventListener('pointerup', onPointerUp);
    hero.addEventListener('pointercancel', onPointerLeave);
    hero.addEventListener('pointerleave', onPointerLeave);

    initialTimerRef.current = setTimeout(() => sweep(activeColorRef.current), 500);

    return () => {
      cancelAutoSweep();
      window.removeEventListener('resize', size);
      if (ro) ro.disconnect();
      hero.removeEventListener('pointerdown', onPointerDown);
      hero.removeEventListener('pointerenter', onPointerEnter);
      hero.removeEventListener('pointermove', onPointerMove);
      hero.removeEventListener('pointerup', onPointerUp);
      hero.removeEventListener('pointercancel', onPointerLeave);
      hero.removeEventListener('pointerleave', onPointerLeave);
    };
  }, []);

  const handleColorChange = (c) => {
    activeColorRef.current = c;
    setActiveColor(c);
    document.documentElement.style.setProperty('--pc', c);
    if (heroRef.current && heroRef.current._sweep) {
      heroRef.current._sweep(c);
    }
  };

  const handleRepaint = () => {
    if (heroRef.current && heroRef.current._clear && heroRef.current._sweep) {
      heroRef.current._clear();
      heroRef.current._sweep(activeColorRef.current);
    }
  };

  // 2. Discover section photo switch
  const selectService = (idx) => {
    setActiveService(idx);
    setActiveImageIdx(0);
  };

  const setDiscoverImage = (idx) => {
    setIsPhotoChanging(true);
    setActiveImageIdx(idx);
    setTimeout(() => {
      setIsPhotoChanging(false);
    }, 95);
  };

  const handleDiscoverNext = () => {
    const nextIdx = (activeService + 1) % servicesList.length;
    selectService(nextIdx);
  };

  const curSvc = servicesList[activeService] || servicesList[0] || SERVICES[0];
  const curDiscoverImg = curSvc.discoverImages?.[activeImageIdx] || curSvc.discoverImages?.[0] || curSvc.heroImage;

  // 3. Recent projects
  const curRecent = portfolioList[recentIdx] || portfolioList[0] || PORTFOLIO_PROJECTS[0];
  const notes = {
    Interior: 'Spaces made to feel like home',
    Exterior: 'A first impression that lasts',
    Roofline: 'The details are everything'
  };

  // Keyboard navigation for lightbox
  useEffect(() => {
    if (lightboxIdx === null) return;
    function onKeyDown(e) {
      if (e.key === 'Escape') setLightboxIdx(null);
      if (e.key === 'ArrowLeft') {
        setLightboxIdx((prev) => (prev - 1 + portfolioList.length) % portfolioList.length);
      }
      if (e.key === 'ArrowRight') {
        setLightboxIdx((prev) => (prev + 1) % portfolioList.length);
      }
    }
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [lightboxIdx, portfolioList.length]);

  return (
    <main>
      {/* Hero */}
      <div className="hero" id="home" ref={heroRef}>
        <canvas id="cv" ref={canvasRef}></canvas>
        <h1>{heroData.headline || 'Make your walls unforgettable.'}</h1>
        <div className="hint">{heroData.subheading || 'Grab the roller. Paint this wall.'}</div>
        <button className="rs" id="rs" onClick={handleRepaint}>↻ Repaint</button>
        <div className="roller" id="rl" ref={rollerRef}>
          <svg viewBox="0 0 110 100">
            <rect x="0" y="0" width="110" height="34" rx="17" style={{ fill: activeColor }} stroke="#12251F" strokeWidth="3" />
            <path d="M110 17h10v26H55v20" fill="none" stroke="#12251F" strokeWidth="4" strokeLinejoin="round" />
            <rect x="46" y="60" width="18" height="40" rx="6" fill="#12251F" />
          </svg>
        </div>
        <div className="hbar">
          <p>
            <b>{heroData.statsYears || '28+'} years. {heroData.statsClients || '1,247'} happy clients. {heroData.statsRating || '4.9/5'}.</b>{' '}
            {heroData.description || 'Professional interior & exterior painting across London and Surrey.'}
          </p>
          <div className="cta">
            <a className="btn p" href={heroData.primaryCtaLink || '#contact'}>
              {heroData.primaryCtaText || 'Get a free quote'}{' '}
              <svg className="i">
                <use href="#ar" />
              </svg>
            </a>
            <Link className="btn o" href={heroData.secondaryCtaLink || '/portfolio'}>
              {heroData.secondaryCtaText || 'See our work'}
            </Link>
          </div>
        </div>
      </div>

      {/* Marquee */}
      <div className="mq">
        <div className="tr" id="tr">
          {Array(4).fill(['Interior', 'Exterior', 'Limewash', 'Wallpaper', 'Feature walls', 'Spray painting']).flat().map((w, i) => (
            <span key={i}>{w}</span>
          ))}
        </div>
      </div>

      {/* Discover Services */}
      <section id="services" className="discover-section">
        <div className="w">
          <div className="hd rvl discover-intro">
            <div>
              <div className="eb">Explore our services</div>
              <h2>Every surface.<br /><em>One crew.</em></h2>
            </div>
            <div className="discover-intro-side">
              <span className="discover-intro-mark">✳</span>
              <p>Every home has a story. Choose what you’d like to transform and explore the finishes we do best.</p>
            </div>
          </div>
          <div className="discover-grid rvl">
            <div className="discover-nav">
              <div className="discover-nav-top">
                <span className="discover-live-dot"></span>
                <span>CHOOSE WHAT TO TRANSFORM</span>
                <span className="discover-guide-arrow" aria-hidden="true">↘</span>
              </div>
              <div className="discover-choices" role="group" aria-label="Preview our decorating services">
                {servicesList.map((s, idx) => (
                  <button
                    key={s.slug || idx}
                    type="button"
                    className={`discover-choice ${activeService === idx ? 'is-active' : ''}`}
                    aria-pressed={activeService === idx ? 'true' : 'false'}
                    aria-controls="discover-stage"
                    onClick={() => selectService(idx)}
                    onKeyDown={(e) => {
                      if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
                        e.preventDefault();
                        selectService((idx + 1) % servicesList.length);
                      } else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
                        e.preventDefault();
                        selectService((idx - 1 + servicesList.length) % servicesList.length);
                      }
                    }}
                  >
                    <span className="discover-choice-ico">
                      {idx === 0 && (
                        <svg aria-hidden="true" className="swi" viewBox="0 0 64 64">
                          <rect height="14" rx="5" width="40" x="8" y="10"></rect>
                          <path d="M48 17h8v14H30v10"></path>
                          <rect height="16" rx="3" width="8" x="26" y="41"></rect>
                        </svg>
                      )}
                      {idx === 1 && (
                        <svg aria-hidden="true" className="swi" viewBox="0 0 64 64">
                          <path d="M6 30 32 9l26 21"></path>
                          <path d="M13 27v27h38V27"></path>
                          <rect height="16" width="10" x="27" y="38"></rect>
                          <path d="M44 12v8"></path>
                        </svg>
                      )}
                      {idx === 2 && (
                        <svg aria-hidden="true" className="swi" viewBox="0 0 64 64">
                          <path d="M12 52c6-2 8-8 6-12l22-22c3-3 8-3 10 0s2 7-1 10L27 50c-4 2-9 4-15 2z"></path>
                          <path d="M40 20l6 6"></path>
                          <path d="M8 58h18"></path>
                        </svg>
                      )}
                      {idx === 3 && (
                        <svg aria-hidden="true" className="swi" viewBox="0 0 64 64">
                          <rect height="21" width="21" x="9" y="9"></rect>
                          <path d="M34 9h21v21z"></path>
                          <circle cx="20" cy="44" r="11"></circle>
                          <path d="M34 55l11-21 11 21z"></path>
                        </svg>
                      )}
                      {idx === 4 && (
                        <svg aria-hidden="true" className="swi" viewBox="0 0 64 64">
                          <rect height="48" rx="3" width="48" x="8" y="8"></rect>
                          <path d="M32 8v48M8 32h48"></path>
                          <circle cx="27" cy="20" r="1.6"></circle>
                          <circle cx="37" cy="20" r="1.6"></circle>
                          <circle cx="27" cy="44" r="1.6"></circle>
                          <circle cx="37" cy="44" r="1.6"></circle>
                        </svg>
                      )}
                      {idx === 5 && (
                        <svg aria-hidden="true" className="swi" viewBox="0 0 64 64">
                          <rect height="48" width="28" x="12" y="8"></rect>
                          <path d="M40 26h12v30H40M19 17h5M28 17h5M19 27h5M28 27h5M19 37h5M28 37h5M19 47h5M28 47h5"></path>
                          <path d="M6 56h52"></path>
                        </svg>
                      )}
                    </span>
                    <span className="discover-choice-copy">
                      <strong>{s.title}</strong>
                      <small>{s.sub}</small>
                    </span>
                    <span className="discover-choice-arrow" aria-hidden="true">↗</span>
                  </button>
                ))}
              </div>
              <div className="discover-nav-bottom">
                <span>Not sure where to start?</span>
                <Link href="/contact">Let's talk about your space <span aria-hidden="true">↗</span></Link>
              </div>
            </div>

            <div
              className="discover-stage"
              id="discover-stage"
              style={{ '--disc-accent': curSvc.accent }}
            >
              <div
                className={`discover-photo-area ${isPhotoChanging ? 'is-changing' : ''}`}
                id="discover-photo-area"
                style={{ '--disc-photo': `url('${curDiscoverImg}')` }}
                onTouchStart={(e) => {
                  if (e.target.closest('button')) return;
                  touchStartRef.current = e.touches[0].clientX;
                }}
                onTouchEnd={(e) => {
                  if (touchStartRef.current === null || e.target.closest('button')) return;
                  const dx = e.changedTouches[0].clientX - touchStartRef.current;
                  if (Math.abs(dx) > 55) {
                    const step = dx < 0 ? 1 : -1;
                    selectService((activeService + step + SERVICES.length) % SERVICES.length);
                  }
                  touchStartRef.current = null;
                }}
              >
                <img
                  id="discover-main-image"
                  src={curDiscoverImg}
                  alt={`${curSvc.title} finish`}
                  decoding="async"
                />
                <div className="discover-image-top">
                  <span className="discover-portfolio-tag">
                    <span className="discover-star">✳</span>{' '}
                    {activeService === 2 ? 'FINISH INSPIRATION' : 'SERVICE SHOWCASE'}
                  </span>
                  <span className="discover-stage-label">REAL PROJECTS. REAL FINISHES.</span>
                </div>
                <div className="discover-image-bottom">
                  <span className="discover-photo-descriptor">A closer look at the craft</span>
                  <div className="discover-photos" id="discover-photos" role="group" aria-label="Browse project photos">
                    {curSvc.discoverImages.map((img, j) => (
                      <button
                        key={j}
                        type="button"
                        className={`discover-photo-button ${j === activeImageIdx ? 'is-active' : ''}`}
                        aria-pressed={j === activeImageIdx ? 'true' : 'false'}
                        aria-label={`Show ${curSvc.title} project photo ${j + 1}`}
                        onClick={() => setDiscoverImage(j)}
                      >
                        <img src={img} alt="" loading="lazy" />
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="discover-detail" aria-live="polite" aria-atomic="true">
                <div className="discover-headrow">
                  <div>
                    <span className="discover-eyebrow" id="discover-kicker">{curSvc.kicker}</span>
                    <h3 id="discover-title">{curSvc.title}</h3>
                    <p id="discover-description">{curSvc.desc}</p>
                  </div>
                  <div className="discover-next-wrap">
                    <button
                      type="button"
                      className="discover-next"
                      id="discover-next"
                      aria-label="Preview next service"
                      onClick={handleDiscoverNext}
                    >→</button>
                    <small>Next finish</small>
                  </div>
                </div>
                <div className="discover-meta">
                  <div className="discover-bullets" id="discover-bullets">
                    {curSvc.features.map((feat, i) => (
                      <span key={i}>{feat}</span>
                    ))}
                  </div>
                  <Link
                    id="discover-link"
                    className="discover-link"
                    href={curSvc.slug === 'limewash-specialist' ? '/services/limewash-specialist' : `/services/${curSvc.slug}`}
                    aria-label={`Explore ${curSvc.title} details`}
                  >
                    Explore this service{' '}
                    <svg className="i" aria-hidden="true">
                      <use href="#ar" />
                    </svg>
                  </Link>
                </div>
              </div>
            </div>
          </div>
          <div className="discover-all">
            <span>Good walls. Good feelings. Great spaces.</span>
            <Link href="/services">See all our services <span aria-hidden="true">↗</span></Link>
          </div>
        </div>
      </section>

      {/* Portfolio Showcase */}
      <section id="portfolio" style={{ background: 'var(--paper2) var(--nz)' }}>
        <div className="w">
          <div className="hd rvl">
            <div>
              <div className="eb">Recent projects</div>
              <h2>The finish is<br /><em>everything.</em></h2>
            </div>
            <p className="lead">
              A curated look at completed projects. Browse the finished results here, or visit our portfolio
              for the full before-and-after stories.
            </p>
          </div>
          <div className="rft rvl" id="rft">
            {portfolioList.map((p, i) => (
              <button
                key={i}
                className={i === recentIdx ? 'on' : ''}
                onClick={() => setRecentIdx(i)}
              >
                {p.title}
              </button>
            ))}
          </div>
          <div className="rfs rvl">
            <button
              className="rfa"
              id="rfp"
              aria-label="Previous project"
              onClick={() => setRecentIdx((recentIdx - 1 + portfolioList.length) % portfolioList.length)}
            >←</button>
            <div className="rfd" id="rfd">
              <figure
                className="rf-finished rfr"
                style={{ '--u': `url('${getImageUrl(curRecent.imgAfter)}')`, cursor: 'pointer' }}
                onClick={() => setLightboxIdx(recentIdx)}
              >
                <img src={getImageUrl(curRecent.imgAfter)} alt={`Finished ${curRecent.title} project`} />
                <span className="rf-finished-tag">COMPLETED FINISH</span>
                <span className="en">View larger ↗</span>
              </figure>
              <div className="rf-editorial">
                <span className="rf-editorial-kicker">A CLOSER LOOK</span>
                <div>
                  <h3>{curRecent.title}</h3>
                  <p>
                    {notes[curRecent.category] || 'Spaces made to feel like home'}. Every completed finish is the result
                    of careful preparation and a sharp eye for the details.
                  </p>
                  <div className="rf-editorial-rule"></div>
                  <span className="rf-editorial-category">{curRecent.category} · Project highlight</span>
                </div>
                <Link href="/portfolio" className="rf-editorial-link">
                  See the full transformation <span aria-hidden="true">↗</span>
                </Link>
              </div>
            </div>
            <button
              className="rfa"
              id="rfn"
              aria-label="Next project"
              onClick={() => setRecentIdx((recentIdx + 1) % portfolioList.length)}
            >→</button>
          </div>
          <div className="rfm rvl">
            <div>
              <span className="rtag" id="rfg">{curRecent.category}</span>
              <h3 id="rfh">{curRecent.title}</h3>
            </div>
            <div className="rfx">
              <span id="rfc">Completed work</span>
              <Link className="btn p" href="/portfolio">
                View the full portfolio{' '}
                <svg className="i">
                  <use href="#ar" />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Limewash feature */}
      <section className="dk lw lw-home-feature" id="limewash">
        <div className="w lw-home-grid">
          <div className="lw-home-art rvl">
            <div className="lw-home-artframe" style={{ position: 'relative', zIndex: 1 }}>
              <div className="lw-home-fallback" aria-hidden="true">
                <div className="lw-home-fallback-sun"></div>
                <div className="lw-home-fallback-arch"></div>
                <div className="lw-home-fallback-floor"></div>
                <div className="lw-home-fallback-couch"></div>
                <div className="lw-home-fallback-pot"></div>
              </div>
              <img
                src="https://images.pexels.com/photos/27522843/pexels-photo-27522843/free-photo-of-studio-with-limewash-textured-walls-and-wood-armchair.jpeg?auto=compress&cs=tinysrgb&w=1350"
                alt="Soft neutral walls with natural surface texture in an inspirational interior"
                onError={(e) => { e.target.style.display = 'none'; }}
                loading="lazy"
                decoding="async"
              />
              <span className="lw-home-inspire">Limewash inspiration · texture and tone</span>
            </div>
            <div className="lw-home-mat" style={{ zIndex: 10 }}>
              <span>THE NATURAL FINISH</span>
              <span className="lw-home-sample" aria-hidden="true"></span>
              <span>SOFT DEPTH / QUIET CHARACTER</span>
            </div>
          </div>
          <div className="lw-home-content rvl">
            <div className="eb">The beauty of limewash</div>
            <h2>Walls with <em>a little soul.</em></h2>
            <p className="lw-home-lead">
              Not every wall needs to shout. Hand-applied limewash brings soft movement, gentle colour variation and a finish that feels beautifully individual.
            </p>
            <div className="lw-home-features">
              <div><b>Soft movement</b><span>Subtle, naturally varied tones</span></div>
              <div><b>Rich in character</b><span>A finish that changes with the light</span></div>
              <div><b>Made for your space</b><span>Personalised colours and application</span></div>
            </div>
            <Link className="btn p" href="/services/limewash-specialist">
              Discover limewash finishes{' '}
              <svg className="i" aria-hidden="true">
                <use href="#ar" />
              </svg>
            </Link>
            <p className="lw-home-micro">Curious about the finish? Explore colours, textures and real transformations.</p>
          </div>
        </div>
      </section>

      {/* Why AR Matt & Gloss */}
      <section>
        <div className="w">
          <div className="hd rvl">
            <div>
              <div className="eb">Why AR Matt &amp; Gloss</div>
              <h2>Quality you can see.</h2>
            </div>
          </div>
          <div className="why rvl">
            <div className="bx">
              <h3>Work we do</h3>
              <ul>
                <li><svg className="i"><use href="#ck" /></svg>Interior painting (walls, ceilings, woodwork)</li>
                <li><svg className="i"><use href="#ck" /></svg>Exterior painting (houses, sheds, fences, roof tiles)</li>
                <li><svg className="i"><use href="#ck" /></svg>Limewash, wallpaper, feature walls</li>
                <li><svg className="i"><use href="#ck" /></svg>Surface preparation &amp; repair</li>
              </ul>
            </div>
            <div className="bx">
              <h3>Attitude to work</h3>
              <ul>
                <li><svg className="i"><use href="#ck" /></svg>Professional and certified painters</li>
                <li><svg className="i"><use href="#ck" /></svg>High-quality materials and finishes</li>
                <li><svg className="i"><use href="#ck" /></svg>Fully insured and licensed</li>
                <li><svg className="i"><use href="#ck" /></svg>Clean and tidy. Satisfaction guaranteed</li>
              </ul>
            </div>
          </div>
          <div className="stats rvl">
            <div><b data-n="28" data-s="+">0</b><span>Years of experience</span></div>
            <div><b data-n="1247">0</b><span>Happy clients</span></div>
            <div><b data-n="1500" data-s="+">0</b><span>Projects completed</span></div>
            <div><b>24/7</b><span>Support available</span></div>
          </div>
          <div className="steps">
            <div className="st rvl">
              <h3>Request a quote</h3>
              <p>Under a minute. No obligation.</p>
            </div>
            <div className="st rvl">
              <h3>Free consultation</h3>
              <p>Colour advice and a clear price.</p>
            </div>
            <div className="st rvl">
              <h3>Expert execution</h3>
              <p>Careful prep, precise finish, spotless site.</p>
            </div>
            <div className="st rvl">
              <h3>Final walk-through</h3>
              <p>We finish when you’re happy.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="tsec">
        <div className="w">
          <div className="th2 rvl">
            <div>
              <div className="ey2"><i></i>Kind words, real people</div>
              <h2>Loved by the people we work with.</h2>
            </div>
            <p>Feedback published on AR Matt &amp; Gloss Decorators’ existing Testimonials page.</p>
          </div>
          <div className="tg3">
            {(reviewsList.length ? reviewsList.slice(0, 3) : [
              {
                q: 'Outstanding work from start to finish. The team was professional, punctual, and the quality of their painting exceeded my expectations.',
                n: 'Marcus Thompson',
                l: 'Kensington, London',
                c: '#F3F2EC',
              },
              {
                q: 'I hired Jimmy and the team from AR Matt & Gloss for my entire home exterior. They were meticulous with preparation and the finish is flawless.',
                n: 'Priya Sharma',
                l: 'Fulham, London',
                c: '#E4EDCF',
              },
              {
                q: 'The attention to detail was impressive. They took the time to protect all my furniture and cleaned up thoroughly each day.',
                n: 'Elena Rodriguez',
                l: 'Paddington, London',
                c: '#FCF0E8',
              },
            ]).map((rev, i) => (
              <figure key={i} className="tc rvl" style={{ background: rev.c || (i === 0 ? '#F3F2EC' : i === 1 ? '#E4EDCF' : '#FCF0E8') }}>
                <div className="ts">★★★★★</div>
                <blockquote>“{rev.q}”</blockquote>
                <figcaption>
                  <span className="av">{(rev.n || 'C').split(' ').map((x) => x[0]).join('')}</span>
                  <span><b>{rev.n}</b><small>{rev.l}</small></span>
                </figcaption>
              </figure>
            ))}
          </div>
          <div style={{ textAlign: 'center', marginTop: '34px' }}>
            <Link className="btn p" href="/testimonials">
              Read all testimonials{' '}
              <svg className="i">
                <use href="#ar" />
              </svg>
            </Link>
          </div>
          <p className="tnote">
            Testimonials reproduced in shortened form from the{' '}
            <a href="https://ar-mattandgloss-decorators.com/testimonials" target="_blank" rel="noopener">
              existing company website ↗
            </a>.
          </p>
        </div>
      </section>

      {/* Contact Section */}
      <section className="dk" id="contact">
        <div className="w">
          <div className="qt">
            <div className="rvl">
              <div className="eb">Contact</div>
              <h2>Let’s make it <span className="hl">unforgettable.</span></h2>
              <p className="lead">
                No job is too small or too big. Tell us your idea and we’ll reply with expert advice and a fair quote within 24 hours.
              </p>
              <div className="ct">
                <div>
                  <svg className="i"><use href="#ph" /></svg>07309 092376 / 02034 880652
                </div>
                <div>
                  <svg className="i"><use href="#ml" /></svg>contact@ar-mattandgloss-decorators.com
                </div>
                <div>
                  <svg className="i"><use href="#mp" /></svg>23 Church Road, Richmond, Surrey TW9 2QA
                </div>
              </div>
            </div>

            <form
              id="f"
              className="rvl"
              onSubmit={(e) => {
                e.preventDefault();
                if (!phoneVal.trim()) {
                  document.getElementById('p')?.focus();
                  return;
                }

                const s = document.getElementById('s')?.value || 'Interior painting';
                const n = document.getElementById('n')?.value || '';
                const a = document.getElementById('a')?.value || '';
                const bd = document.getElementById('bd')?.value || '';

                fetch('/api/queries', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    name: n,
                    phone: phoneVal,
                    postcode: a,
                    service: s,
                    budget: bd,
                    source: 'Homepage Quick Quote (/)',
                  }),
                }).catch((err) => console.error('Error submitting query:', err));

                setFormSubmitted(true);
              }}
            >
              {!formSubmitted ? (
                <div id="fb" style={{ display: 'grid', gap: '16px' }}>
                  <div>
                    <label htmlFor="s">Service</label>
                    <select id="s">
                      <option>Interior painting</option>
                      <option>Exterior painting</option>
                      <option>Limewash painting</option>
                      <option>Wallpaper hanging &amp; removal</option>
                      <option>Feature wall</option>
                      <option>Other / not sure</option>
                    </select>
                  </div>
                  <div className="two">
                    <div>
                      <label htmlFor="n">Name</label>
                      <input id="n" placeholder="Your name" autoComplete="name" />
                    </div>
                    <div>
                      <label htmlFor="p">Phone</label>
                      <input
                        id="p"
                        type="tel"
                        placeholder="07…"
                        autoComplete="tel"
                        value={phoneVal}
                        onChange={(e) => setPhoneVal(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="two">
                    <div>
                      <label htmlFor="a">Postcode</label>
                      <input id="a" placeholder="e.g. TW9 2QA" autoComplete="postal-code" />
                    </div>
                    <div>
                      <label htmlFor="bd">Budget</label>
                      <select id="bd" defaultValue="">
                        <option value="">Select a range</option>
                        <option>Under £500</option>
                        <option>£500 – £1,000</option>
                        <option>£1,000 – £2,500</option>
                        <option>£2,500 – £5,000</option>
                        <option>£5,000+</option>
                        <option>Not sure yet</option>
                      </select>
                    </div>
                  </div>
                  <button className="btn p" type="submit" style={{ justifyContent: 'center' }}>
                    Get my free quote{' '}
                    <svg className="i">
                      <use href="#ar" />
                    </svg>
                  </button>
                  <small>Reply within 24 hours. No obligation.</small>
                </div>
              ) : (
                <div className="done" id="dn" style={{ display: 'block' }}>
                  <svg className="i" style={{ width: '48px', height: '48px', color: 'var(--acct)' }}>
                    <use href="#ck" />
                  </svg>
                  <h3 style={{ margin: '12px 0 6px' }}>Thank you, we’ve got it.</h3>
                  <p style={{ margin: 0, color: 'var(--mut)' }}>The team will be in touch shortly.</p>
                </div>
              )}
            </form>
          </div>

          <div style={{ maxWidth: '820px', marginTop: '80px' }}>
            <div className="eb">FAQs</div>
            <details>
              <summary>Which areas do you cover?</summary>
              <p>Greater London, West London and Surrey, plus up to 30 miles outside the M25.</p>
            </details>
            <details>
              <summary>Are you insured and licensed?</summary>
              <p>Yes, fully insured and licensed, with a satisfaction guarantee on every job.</p>
            </details>
            <details>
              <summary>Do you offer colour advice?</summary>
              <p>Yes. Free colour consultations come with every quote.</p>
            </details>
          </div>
        </div>
      </section>

      {/* Lightbox for Recent Projects */}
      <div
        className={`lb2 ${lightboxIdx !== null ? 'o' : ''}`}
        id="lb2"
        onClick={(e) => {
          if (e.target.id === 'lb2' || e.target.closest('.x')) {
            setLightboxIdx(null);
          }
        }}
      >
        <button className="x" aria-label="Close" onClick={() => setLightboxIdx(null)}>×</button>
        <button
          className="pv2"
          aria-label="Previous"
          onClick={(e) => {
            e.stopPropagation();
            setLightboxIdx((lightboxIdx - 1 + PORTFOLIO_PROJECTS.length) % PORTFOLIO_PROJECTS.length);
          }}
        >‹</button>
        {lightboxIdx !== null && (
          <>
            <img src={getImageUrl(PORTFOLIO_PROJECTS[lightboxIdx].imgAfter)} alt="" />
            <div className="cap">{PORTFOLIO_PROJECTS[lightboxIdx].title} · finished result</div>
          </>
        )}
        <button
          className="nx"
          aria-label="Next"
          onClick={(e) => {
            e.stopPropagation();
            setLightboxIdx((lightboxIdx + 1) % PORTFOLIO_PROJECTS.length);
          }}
        >›</button>
      </div>

      {/* Floating Paint Color Picker Dock */}
      <div className="dock">
        <small>Pick a paint colour</small>
        <span id="sw2" style={{ display: 'contents' }}>
          {COLORS.map(([hex, label]) => (
            <button
              key={hex}
              className={`sw ${activeColor === hex ? 'on' : ''}`}
              style={{ background: hex }}
              title={label}
              aria-label={label}
              onClick={() => handleColorChange(hex)}
            ></button>
          ))}
        </span>
      </div>
    </main>
  );
}

export default Home;
