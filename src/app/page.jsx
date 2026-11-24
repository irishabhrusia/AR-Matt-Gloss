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
  ['#8B4DFF', 'Violet'],
  ['#8F9C95', 'Light Grey']
];

export function Home() {
  usePageStyle('/assets/css/home.css');
  useReveal();

  // Color picker state & canvas
  const [activeColor, setActiveColor] = useState(COLORS[0][0]);
  const activeColorRef = useRef(COLORS[0][0]);
  const isLightGrey = activeColor === '#8F9C95';
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
  const [homeData, setHomeData] = useState({
    marquee: ['Interior', 'Exterior', 'Limewash', 'Wallpaper', 'Feature walls', 'Spray painting'],
    servicesIntro: {
      eyebrow: 'Services · What we do best',
      headline: 'Decorating, done properly.',
      subtitle: 'Every home has a story. Choose what you’d like to transform and explore the finishes we do best.',
    },
    portfolioIntro: {
      eyebrow: 'Recent projects',
      headline: 'The finish is everything.',
      lead: 'A curated look at completed projects. Browse the finished results here, or visit our portfolio for the full before-and-after stories.',
      ctaText: 'View the full portfolio',
      ctaLink: '/portfolio',
    },
    limewash: {
      image: 'https://images.pexels.com/photos/27522843/pexels-photo-27522843/free-photo-of-studio-with-limewash-textured-walls-and-wood-armchair.jpeg?auto=compress&cs=tinysrgb&w=1350',
      caption: 'Limewash inspiration · texture and tone',
      matTag1: 'THE NATURAL FINISH',
      matTag2: 'SOFT DEPTH / QUIET CHARACTER',
      eyebrow: 'The beauty of limewash',
      headline: 'Walls with a little soul.',
      lead: 'Not every wall needs to shout. Hand-applied limewash brings soft movement, gentle colour variation and a finish that feels beautifully individual.',
      feature1Title: 'Soft movement',
      feature1Desc: 'Subtle, naturally varied tones',
      feature2Title: 'Rich in character',
      feature2Desc: 'A finish that changes with the light',
      feature3Title: 'Made for your space',
      feature3Desc: 'Personalised colours and application',
      ctaText: 'Discover limewash finishes',
      ctaLink: '/services/limewash-specialist',
      microCopy: 'Curious about the finish? Explore colours, textures and real transformations.',
    },
    why: {
      eyebrow: 'Why AR Matt & Gloss',
      headline: 'Quality you can see.',
      box1Title: 'Work we do',
      box1Items: [
        'Interior painting (walls, ceilings, woodwork)',
        'Exterior painting (houses, sheds, fences, roof tiles)',
        'Limewash, wallpaper, feature walls',
        'Surface preparation & repair',
      ],
      box2Title: 'Attitude to work',
      box2Items: [
        'Professional and certified painters',
        'High-quality materials and finishes',
        'Fully insured and licensed',
        'Clean and tidy. Satisfaction guaranteed',
      ],
      statsYears: '28+',
      statsClients: '1247',
      statsProjects: '1500+',
      statsSupport: '24/7',
    },
    process: {
      step1Title: 'Request a quote',
      step1Desc: 'Under a minute. No obligation.',
      step2Title: 'Free consultation',
      step2Desc: 'Colour advice and a clear price.',
      step3Title: 'Expert execution',
      step3Desc: 'Careful prep, precise finish, spotless site.',
      step4Title: 'Final walk-through',
      step4Desc: 'We finish when you’re happy.',
    },
    testimonialsIntro: {
      eyebrow: 'What people say',
      headline: 'Loved by the people we work with.',
      lead: 'Feedback published on AR Matt & Gloss Decorators’ existing Testimonials page.',
    },
    contactIntro: {
      eyebrow: 'Quick quote',
      headline: 'Tell us about your walls.',
      lead: 'Send a few details and we’ll reply with clear guidance and next steps. Prefer to talk? Call Marcus on 07309 092376.',
      phone: '07309 092376 / 02034 880652',
      email: 'contact@ar-mattandgloss-decorators.com',
      address: '23 Church Road, Richmond, Surrey TW9 2QA',
    },
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
          if (j.settings.home) {
            setHomeData((prev) => ({
              ...prev,
              ...j.settings.home,
              servicesIntro: { ...prev.servicesIntro, ...(j.settings.home.servicesIntro || {}) },
              portfolioIntro: { ...prev.portfolioIntro, ...(j.settings.home.portfolioIntro || {}) },
              limewash: { ...prev.limewash, ...(j.settings.home.limewash || {}) },
              why: { ...prev.why, ...(j.settings.home.why || {}) },
              process: { ...prev.process, ...(j.settings.home.process || {}) },
              testimonialsIntro: { ...prev.testimonialsIntro, ...(j.settings.home.testimonialsIntro || {}) },
              contactIntro: { ...prev.contactIntro, ...(j.settings.home.contactIntro || {}) },
            }));
          }
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

  // Live Sync with Admin Preview
  useEffect(() => {
    function handleAdminMsg(event) {
      if (event.data?.type === 'AR_ADMIN_SYNC') {
        if (event.data.hero) {
          setHeroData((prev) => ({ ...prev, ...event.data.hero }));
        }
        if (event.data.home) {
          setHomeData((prev) => ({
            ...prev,
            ...event.data.home,
            servicesIntro: { ...prev.servicesIntro, ...(event.data.home.servicesIntro || {}) },
            portfolioIntro: { ...prev.portfolioIntro, ...(event.data.home.portfolioIntro || {}) },
            limewash: { ...prev.limewash, ...(event.data.home.limewash || {}) },
            why: { ...prev.why, ...(event.data.home.why || {}) },
            process: { ...prev.process, ...(event.data.home.process || {}) },
            testimonialsIntro: { ...prev.testimonialsIntro, ...(event.data.home.testimonialsIntro || {}) },
            contactIntro: { ...prev.contactIntro, ...(event.data.home.contactIntro || {}) },
          }));
        }
      } else if (event.data?.type === 'AR_SCROLL_TO') {
        const id = event.data.target;
        const el = document.getElementById(id) || document.querySelector(id.startsWith('.') ? id : `.${id}`);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }
    }
    window.addEventListener('message', handleAdminMsg);
    return () => window.removeEventListener('message', handleAdminMsg);
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
    if (heroRef.current && heroRef.current._clear && heroRef.current._sweep) {
      heroRef.current._clear();
      heroRef.current._sweep(c);
    } else if (heroRef.current && heroRef.current._sweep) {
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
    <main suppressHydrationWarning>
      {/* Hero */}
      <div className="hero" id="home" ref={heroRef}>
        <canvas id="cv" ref={canvasRef}></canvas>
        <h1
          style={
            isLightGrey
              ? {
                  color: '#FFFFFF',
                  mixBlendMode: 'normal',
                  textShadow: '0 3px 20px rgba(0, 0, 0, 0.55), 0 1px 4px rgba(0, 0, 0, 0.75)'
                }
              : undefined
          }
        >
          {heroData.headline || 'Make your walls unforgettable.'}
        </h1>
        <div className="hint">{heroData.subheading || 'Grab the roller. Paint this wall.'}</div>
        <button className="rs" id="rs" onClick={handleRepaint} suppressHydrationWarning>↻ Repaint</button>
        <div className="roller" id="rl" ref={rollerRef}>
          <svg viewBox="-6 -4 126 112" style={{ width: '100%', height: '100%', overflow: 'visible' }}>
            <defs>
              {/* 3D Cylindrical Wet Paint Specular Glaze & Shading */}
              <linearGradient id="rl_cyl_shading" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#000000" stopOpacity="0.25" />
                <stop offset="18%" stopColor="#FFFFFF" stopOpacity="0.75" />
                <stop offset="35%" stopColor="#FFFFFF" stopOpacity="0.2" />
                <stop offset="65%" stopColor="#000000" stopOpacity="0.05" />
                <stop offset="90%" stopColor="#000000" stopOpacity="0.38" />
                <stop offset="100%" stopColor="#000000" stopOpacity="0.6" />
              </linearGradient>

              {/* Stainless Steel Chrome Wire Frame */}
              <linearGradient id="rl_chrome_frame" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#FFFFFF" />
                <stop offset="25%" stopColor="#E2E8F0" />
                <stop offset="50%" stopColor="#64748B" />
                <stop offset="75%" stopColor="#CBD5E1" />
                <stop offset="100%" stopColor="#334155" />
              </linearGradient>

              {/* Luxury Brass Ferrule Collar */}
              <linearGradient id="rl_brass_collar" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#78350F" />
                <stop offset="30%" stopColor="#FDE68A" />
                <stop offset="60%" stopColor="#D97706" />
                <stop offset="85%" stopColor="#FDE68A" />
                <stop offset="100%" stopColor="#451A03" />
              </linearGradient>

              {/* 3D Ergonomic Rubber Grip Handle */}
              <linearGradient id="rl_handle_3d" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#0B1311" />
                <stop offset="25%" stopColor="#253D34" />
                <stop offset="45%" stopColor="#3B5A4E" />
                <stop offset="70%" stopColor="#1B2D26" />
                <stop offset="100%" stopColor="#050C0A" />
              </linearGradient>
            </defs>

            {/* 1. Ambient Contact Shadow under Cylinder */}
            <ellipse cx="55" cy="33.5" rx="52" ry="3" fill="#000000" fillOpacity="0.28" />

            {/* 2. Stainless Steel Chrome Arm Behind */}
            <path
              d="M110 17h10v26H55v20"
              fill="none"
              stroke="#000000"
              strokeOpacity="0.25"
              strokeWidth="5"
              strokeLinecap="round"
              strokeLinejoin="round"
              transform="translate(1, 2)"
            />
            <path
              d="M110 17h10v26H55v20"
              fill="none"
              stroke="url(#rl_chrome_frame)"
              strokeWidth="4.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M110 16.5h9.5v25.5H55v19"
              fill="none"
              stroke="#FFFFFF"
              strokeOpacity="0.75"
              strokeWidth="1.4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* 3. Roller Cylinder (Base Paint Color) */}
            <rect x="0" y="0" width="110" height="34" rx="17" style={{ fill: activeColor }} />

            {/* 3D Cylindrical Wet Paint Specular Glaze & Shading */}
            <rect x="0" y="0" width="110" height="34" rx="17" fill="url(#rl_cyl_shading)" />

            {/* Wet Gloss Sheen Stripe across center */}
            <rect x="6" y="5" width="98" height="3.5" rx="1.75" fill="#FFFFFF" fillOpacity="0.65" />
            <rect x="12" y="9.5" width="86" height="1.5" rx="0.75" fill="#FFFFFF" fillOpacity="0.35" />

            {/* Microfiber nap texture fibers */}
            <path d="M15 15h12M40 18h16M75 14h14M28 24h18M65 25h20" stroke="#FFFFFF" strokeOpacity="0.25" strokeWidth="1" strokeLinecap="round" />

            {/* Left End-Cap with Bolt (3D Ellipse) */}
            <ellipse cx="6" cy="17" rx="4" ry="12" fill="#0F172A" stroke="#334155" strokeWidth="0.8" />
            <ellipse cx="6" cy="17" rx="2.5" ry="5.5" fill="url(#rl_chrome_frame)" />
            <circle cx="6" cy="17" r="1.5" fill="#FFFFFF" />

            {/* Right End-Cap with Chrome Pivot Entry */}
            <ellipse cx="104" cy="17" rx="4" ry="12" fill="#0F172A" stroke="#334155" strokeWidth="0.8" />
            <ellipse cx="104" cy="17" rx="3" ry="6" fill="url(#rl_chrome_frame)" />
            <circle cx="104" cy="17" r="1.8" fill="#1E293B" />

            {/* Cylinder Outer Contour Stroke for Crisp Contrast */}
            <rect x="0" y="0" width="110" height="34" rx="17" fill="none" stroke="#0F172A" strokeWidth="1.5" strokeOpacity="0.45" />

            {/* 4. Luxury Brass Collar / Ferrule at Top of Handle */}
            <rect x="44" y="56" width="22" height="7" rx="2" fill="url(#rl_brass_collar)" stroke="#451A03" strokeWidth="0.6" />
            <rect x="45" y="57" width="20" height="1.5" rx="0.75" fill="#FFFFFF" fillOpacity="0.5" />

            {/* 5. 3D Ergonomic Rubber Grip Handle */}
            <path
              d="M45 62 C44 70 42 80 43 92 C43.5 99 47 103 55 103 C63 103 66.5 99 67 92 C68 80 66 70 65 62 Z"
              fill="url(#rl_handle_3d)"
              stroke="#050C0A"
              strokeWidth="1.2"
            />

            {/* Ergonomic handle rubber ribs */}
            <rect x="44.5" y="67" width="21" height="2.5" rx="1.25" fill="#070D0B" />
            <rect x="44.5" y="67" width="21" height="1" rx="0.5" fill="#3B5A4E" fillOpacity="0.4" />

            <rect x="43.5" y="73" width="23" height="2.5" rx="1.25" fill="#070D0B" />
            <rect x="43.5" y="73" width="23" height="1" rx="0.5" fill="#3B5A4E" fillOpacity="0.4" />

            <rect x="43" y="79" width="24" height="2.5" rx="1.25" fill="#070D0B" />
            <rect x="43" y="79" width="24" height="1" rx="0.5" fill="#3B5A4E" fillOpacity="0.4" />

            <rect x="43.5" y="85" width="23" height="2.5" rx="1.25" fill="#070D0B" />
            <rect x="43.5" y="85" width="23" height="1" rx="0.5" fill="#3B5A4E" fillOpacity="0.4" />

            {/* Handle Left Specular 3D Highlight Curve */}
            <path
              d="M45.5 64 C44.5 72 43.5 80 44.5 91"
              fill="none"
              stroke="#FFFFFF"
              strokeOpacity="0.25"
              strokeWidth="1.2"
              strokeLinecap="round"
            />

            {/* Bottom hanging hole with 3D inner rim */}
            <circle cx="55" cy="95.5" r="3.2" fill="#070D0B" stroke="#253D34" strokeWidth="0.8" />
            <circle cx="55" cy="95.5" r="1.8" fill="#EEF1EF" fillOpacity="0.8" />
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
          {Array(4).fill(homeData.marquee && homeData.marquee.length ? homeData.marquee : ['Interior', 'Exterior', 'Limewash', 'Wallpaper', 'Feature walls', 'Spray painting']).flat().map((w, i) => (
            <span key={i}>{w}</span>
          ))}
        </div>
      </div>

      {/* Discover Services */}
      <section id="services" className="discover-section">
        <div className="w">
          <div className="hd rvl discover-intro">
            <div>
              <div className="eb">{homeData.servicesIntro?.eyebrow || 'Explore our services'}</div>
              <h2>{homeData.servicesIntro?.headline || 'Every surface. One crew.'}</h2>
            </div>
            <div className="discover-intro-side">
              <span className="discover-intro-mark">✳</span>
              <p>{homeData.servicesIntro?.subtitle || 'Every home has a story. Choose what you’d like to transform and explore the finishes we do best.'}</p>
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
                    suppressHydrationWarning
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
                        suppressHydrationWarning
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
                      suppressHydrationWarning
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
              <div className="eb">{homeData.portfolioIntro?.eyebrow || 'Recent projects'}</div>
              <h2>{homeData.portfolioIntro?.headline || 'The finish is everything.'}</h2>
            </div>
            <p className="lead">
              {homeData.portfolioIntro?.lead || 'A curated look at completed projects. Browse the finished results here, or visit our portfolio for the full before-and-after stories.'}
            </p>
          </div>
          <div className="rft rvl" id="rft">
            {portfolioList.map((p, i) => (
              <button
                key={i}
                className={i === recentIdx ? 'on' : ''}
                onClick={() => setRecentIdx(i)}
                suppressHydrationWarning
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
              suppressHydrationWarning
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
              suppressHydrationWarning
            >→</button>
          </div>
          <div className="rfm rvl">
            <div>
              <span className="rtag" id="rfg">{curRecent.category}</span>
              <h3 id="rfh">{curRecent.title}</h3>
            </div>
            <div className="rfx">
              <span id="rfc">Completed work</span>
              <Link className="btn p" href={homeData.portfolioIntro?.ctaLink || '/portfolio'}>
                {homeData.portfolioIntro?.ctaText || 'View the full portfolio'}{' '}
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
                src={getImageUrl(homeData.limewash?.image || 'https://images.pexels.com/photos/27522843/pexels-photo-27522843/free-photo-of-studio-with-limewash-textured-walls-and-wood-armchair.jpeg?auto=compress&cs=tinysrgb&w=1350')}
                alt="Soft neutral walls with natural surface texture in an inspirational interior"
                onError={(e) => { e.target.style.display = 'none'; }}
                loading="lazy"
                decoding="async"
              />
              <span className="lw-home-inspire">{homeData.limewash?.caption || 'Limewash inspiration · texture and tone'}</span>
            </div>
            <div className="lw-home-mat" style={{ zIndex: 10 }}>
              <span>{homeData.limewash?.matTag1 || 'THE NATURAL FINISH'}</span>
              <span className="lw-home-sample" aria-hidden="true"></span>
              <span>{homeData.limewash?.matTag2 || 'SOFT DEPTH / QUIET CHARACTER'}</span>
            </div>
          </div>
          <div className="lw-home-content rvl">
            <div className="eb">{homeData.limewash?.eyebrow || 'The beauty of limewash'}</div>
            <h2>{homeData.limewash?.headline || 'Walls with a little soul.'}</h2>
            <p className="lw-home-lead">
              {homeData.limewash?.lead || 'Not every wall needs to shout. Hand-applied limewash brings soft movement, gentle colour variation and a finish that feels beautifully individual.'}
            </p>
            <div className="lw-home-features">
              <div><b>{homeData.limewash?.feature1Title || 'Soft movement'}</b><span>{homeData.limewash?.feature1Desc || 'Subtle, naturally varied tones'}</span></div>
              <div><b>{homeData.limewash?.feature2Title || 'Rich in character'}</b><span>{homeData.limewash?.feature2Desc || 'A finish that changes with the light'}</span></div>
              <div><b>{homeData.limewash?.feature3Title || 'Made for your space'}</b><span>{homeData.limewash?.feature3Desc || 'Personalised colours and application'}</span></div>
            </div>
            <Link className="btn p" href={homeData.limewash?.ctaLink || '/services/limewash-specialist'}>
              {homeData.limewash?.ctaText || 'Discover limewash finishes'}{' '}
              <svg className="i" aria-hidden="true">
                <use href="#ar" />
              </svg>
            </Link>
            <p className="lw-home-micro">{homeData.limewash?.microCopy || 'Curious about the finish? Explore colours, textures and real transformations.'}</p>
          </div>
        </div>
      </section>

      {/* Why AR Matt & Gloss */}
      <section>
        <div className="w">
          <div className="hd rvl">
            <div>
              <div className="eb">{homeData.why?.eyebrow || 'Why AR Matt & Gloss'}</div>
              <h2>{homeData.why?.headline || 'Quality you can see.'}</h2>
            </div>
          </div>
          <div className="why rvl">
            <div className="bx">
              <h3>{homeData.why?.box1Title || 'Work we do'}</h3>
              <ul>
                {(homeData.why?.box1Items || [
                  'Interior painting (walls, ceilings, woodwork)',
                  'Exterior painting (houses, sheds, fences, roof tiles)',
                  'Limewash, wallpaper, feature walls',
                  'Surface preparation & repair'
                ]).map((item, idx) => (
                  <li key={idx}><svg className="i"><use href="#ck" /></svg>{item}</li>
                ))}
              </ul>
            </div>
            <div className="bx">
              <h3>{homeData.why?.box2Title || 'Attitude to work'}</h3>
              <ul>
                {(homeData.why?.box2Items || [
                  'Professional and certified painters',
                  'High-quality materials and finishes',
                  'Fully insured and licensed',
                  'Clean and tidy. Satisfaction guaranteed'
                ]).map((item, idx) => (
                  <li key={idx}><svg className="i"><use href="#ck" /></svg>{item}</li>
                ))}
              </ul>
            </div>
          </div>
          <div className="stats rvl">
            <div><b data-n={homeData.why?.statsYears ? homeData.why.statsYears.replace(/\D/g, '') || '28' : '28'} data-s="+">{homeData.why?.statsYears || '28+'}</b><span>Years of experience</span></div>
            <div><b data-n={homeData.why?.statsClients ? homeData.why.statsClients.replace(/\D/g, '') || '1247' : '1247'}>{homeData.why?.statsClients || '1,247'}</b><span>Happy clients</span></div>
            <div><b data-n={homeData.why?.statsProjects ? homeData.why.statsProjects.replace(/\D/g, '') || '1500' : '1500'} data-s="+">{homeData.why?.statsProjects || '1500+'}</b><span>Projects completed</span></div>
            <div><b>{homeData.why?.statsSupport || '24/7'}</b><span>Support available</span></div>
          </div>
          <div className="steps">
            <div className="st rvl">
              <h3>{homeData.process?.step1Title || 'Request a quote'}</h3>
              <p>{homeData.process?.step1Desc || 'Under a minute. No obligation.'}</p>
            </div>
            <div className="st rvl">
              <h3>{homeData.process?.step2Title || 'Free consultation'}</h3>
              <p>{homeData.process?.step2Desc || 'Colour advice and a clear price.'}</p>
            </div>
            <div className="st rvl">
              <h3>{homeData.process?.step3Title || 'Expert execution'}</h3>
              <p>{homeData.process?.step3Desc || 'Careful prep, precise finish, spotless site.'}</p>
            </div>
            <div className="st rvl">
              <h3>{homeData.process?.step4Title || 'Final walk-through'}</h3>
              <p>{homeData.process?.step4Desc || 'We finish when you’re happy.'}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="tsec">
        <div className="w">
          <div className="th2 rvl">
            <div>
              <div className="ey2"><i></i>{homeData.testimonialsIntro?.eyebrow || 'Kind words, real people'}</div>
              <h2>{homeData.testimonialsIntro?.headline || 'Loved by the people we work with.'}</h2>
            </div>
            <p>{homeData.testimonialsIntro?.lead || 'Feedback published on AR Matt & Gloss Decorators’ existing Testimonials page.'}</p>
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
              <div className="eb">{homeData.contactIntro?.eyebrow || 'Contact'}</div>
              <h2>{homeData.contactIntro?.headline || 'Let’s make it unforgettable.'}</h2>
              <p className="lead">
                {homeData.contactIntro?.lead || 'No job is too small or too big. Tell us your idea and we’ll reply with expert advice and a fair quote within 24 hours.'}
              </p>
              <div className="ct">
                <div>
                  <svg className="i"><use href="#ph" /></svg>{homeData.contactIntro?.phone || '07309 092376 / 02034 880652'}
                </div>
                <div>
                  <svg className="i"><use href="#ml" /></svg>{homeData.contactIntro?.email || 'contact@ar-mattandgloss-decorators.com'}
                </div>
                <div>
                  <svg className="i"><use href="#mp" /></svg>{homeData.contactIntro?.address || '23 Church Road, Richmond, Surrey TW9 2QA'}
                </div>
              </div>
            </div>

            <form
              id="f"
              className="rvl"
              suppressHydrationWarning
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
                    <select id="s" suppressHydrationWarning>
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
                      <input id="n" placeholder="Your name" autoComplete="name" suppressHydrationWarning />
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
                        suppressHydrationWarning
                      />
                    </div>
                  </div>
                  <div className="two">
                    <div>
                      <label htmlFor="a">Postcode</label>
                      <input id="a" placeholder="e.g. TW9 2QA" autoComplete="postal-code" suppressHydrationWarning />
                    </div>
                    <div>
                      <label htmlFor="bd">Budget</label>
                      <select id="bd" defaultValue="" suppressHydrationWarning>
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
                  <button className="btn p" type="submit" style={{ justifyContent: 'center' }} suppressHydrationWarning>
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
        <button className="x" aria-label="Close" onClick={() => setLightboxIdx(null)} suppressHydrationWarning>×</button>
        <button
          className="pv2"
          aria-label="Previous"
          onClick={(e) => {
            e.stopPropagation();
            setLightboxIdx((lightboxIdx - 1 + PORTFOLIO_PROJECTS.length) % PORTFOLIO_PROJECTS.length);
          }}
          suppressHydrationWarning
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
          suppressHydrationWarning
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
              suppressHydrationWarning
            ></button>
          ))}
        </span>
      </div>
    </main>
  );
}

export default Home;
