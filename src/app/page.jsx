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

const HOME_SERVICE_CARDS = [
  {
    slug: 'interior-painting',
    title: 'Interior Painting',
    popular: true,
    bg: '#FFF3CF',
    iconColor: '#B45309',
    desc: 'Transform your indoor spaces with our expert interior painting services. We handle everything from single rooms to entire homes with precision and care.',
    icon: 'home',
    bullets: [
      'Premium quality paints and finishes',
      'Color consultation included',
      'Furniture protection and room preparation',
      'Clean and efficient work process',
      'Smooth, flawless finish guaranteed',
    ],
  },
  {
    slug: 'exterior-painting',
    title: 'Exterior Painting',
    popular: false,
    bg: '#DCEAF2',
    iconColor: '#0369A1',
    desc: 'Protect and beautify your property with professional exterior painting. Weather-resistant finishes that stand the test of time.',
    icon: 'roller',
    bullets: [
      'Weather-resistant coatings',
      'Surface preparation and repair',
      'Power washing included',
      'Multi-year durability guarantee',
      'Curb appeal enhancement',
    ],
  },
  {
    slug: 'limewash-specialist',
    title: 'Limewash Specialist',
    popular: false,
    bg: '#E4EDCF',
    iconColor: '#4D7C0F',
    desc: 'Give a unique natural decorative finish with soft textures, subtle colour variations, depth and timeless elegance.',
    icon: 'palette',
    bullets: [
      'Unique natural appearance',
      'Timeless elegance',
      'Beautiful texture and depth',
      'A distinctive decorative finish',
      'Wide choice of colours',
    ],
  },
  {
    slug: 'decorative-finishes',
    title: 'Decorative Finishes',
    popular: false,
    bg: '#F7DEE6',
    iconColor: '#BE185D',
    desc: 'Add character and style with specialty finishes including faux painting, textured walls, and custom decorative techniques.',
    icon: 'brush',
    bullets: [
      'Unique custom finishes',
      'Faux painting techniques',
      'Textured wall treatments',
      'Accent wall designs',
      'Personalized color schemes',
    ],
  },
  {
    slug: 'cabinet-refinishing',
    title: 'Cabinet Refinishing',
    popular: false,
    bg: '#FBEEC2',
    iconColor: '#C2410C',
    desc: 'Give your kitchen or bathroom a fresh new look with professional cabinet painting and refinishing services.',
    icon: 'sparkle',
    bullets: [
      'Kitchen and bathroom cabinets',
      'Professional spray finish',
      'Hardware removal and reinstallation',
      'Durable, long-lasting results',
      'Cost-effective renovation option',
    ],
  },
  {
    slug: 'commercial-painting',
    title: 'Commercial Painting',
    popular: false,
    bg: '#E3EBE7',
    iconColor: '#0F766E',
    desc: 'Professional painting services for offices, retail spaces, and commercial properties with minimal disruption to your business.',
    icon: 'shield',
    bullets: [
      'Flexible scheduling options',
      'Large-scale project expertise',
      'Minimal business disruption',
      'Commercial-grade materials',
      'Professional project management',
    ],
  },
];

const HOME_PROJECT_CARDS = [
  {
    title: 'Living Room Transformation',
    category: 'Interior',
    popular: true,
    badgeText: 'Featured Project',
    bg: '#FFF3CF',
    iconColor: '#B45309',
    desc: 'Complete living room refurbishment featuring crisp woodwork detailing, velvety emulsion walls, and flawless ceiling plastering.',
    icon: 'home',
    bullets: [
      'Full wall & ceiling preparation and repair',
      'Designer colour palette advice included',
      'Crisp woodwork, door & skirting detailing',
      'Clean, dust-controlled daily workspace',
      'Smooth, streak-free uniform finish',
    ],
  },
  {
    title: 'Victorian Townhouse Exterior',
    category: 'Exterior',
    popular: false,
    badgeText: 'Exterior Restoration',
    bg: '#DCEAF2',
    iconColor: '#0369A1',
    desc: 'Heritage exterior masonry restoration with weather-shield microporous paints, sash window detailing, and structural weatherproofing.',
    icon: 'roller',
    bullets: [
      'High-pressure masonry wash & lime mortar prep',
      'Weather-resistant exterior paint system',
      'Sash window frames & stone sill detailing',
      'Multi-year weatherproofing guarantee',
      'Instant curb appeal transformation',
    ],
  },
  {
    title: 'Kitchen Cabinet Spray Refinish',
    category: 'Cabinet Spraying',
    popular: false,
    badgeText: 'Factory Spray',
    bg: '#FBEEC2',
    iconColor: '#C2410C',
    desc: 'High-precision factory-grade spray coating giving tired kitchen cabinets and islands an immaculate, durable modern look.',
    icon: 'sparkle',
    bullets: [
      'Factory-smooth polyurethane spray finish',
      'Hardware removal, cleaning & re-fitting',
      'Heat, grease & moisture resistant coating',
      'Fraction of kitchen replacement cost',
      'Rapid 3-to-4 day turnaround time',
    ],
  },
  {
    title: 'Heritage Front Door Painting',
    category: 'Exterior Specialist',
    popular: false,
    badgeText: 'Architectural Finish',
    bg: '#E4EDCF',
    iconColor: '#4D7C0F',
    desc: 'High-gloss architectural enamel hand-finishing for entrance doors, delivering deep colour depth and long-lasting protection.',
    icon: 'palette',
    bullets: [
      'Complete stripping, wood filling & sanding',
      'Microporous primer & flexible undercoat',
      'Mirror-like ultra-gloss exterior enamel',
      'Brass hardware polished & re-fitted',
      'Unmatched weather and UV resistance',
    ],
  },
  {
    title: 'Master Bedroom Suite',
    category: 'Interior',
    popular: false,
    badgeText: 'Interior Suite',
    bg: '#F7DEE6',
    iconColor: '#BE185D',
    desc: 'Restful bedroom retreat with light-diffusing matte wall finishes, feature headboard accenting, and precision trim lines.',
    icon: 'brush',
    bullets: [
      'Plaster skimming & hairline crack repairs',
      'Soft light-diffusing matt wall emulsion',
      'Refined feature accent wall styling',
      'Odourless, eco-friendly low-VOC paints',
      'Complete furniture & floor protection',
    ],
  },
  {
    title: 'Commercial Space Refurbishment',
    category: 'Commercial',
    popular: false,
    badgeText: 'Commercial Spec',
    bg: '#E3EBE7',
    iconColor: '#0F766E',
    desc: 'Heavy-duty commercial painting for high-footfall offices, retail boutiques, and studios with out-of-hours scheduling.',
    icon: 'shield',
    bullets: [
      'Flexible evening & weekend scheduling',
      'Heavy-duty scrubbable commercial paints',
      'Full health, safety & insurance compliance',
      'Zero disruption to business operations',
      'Dedicated project manager on site',
    ],
  },
];

export function Home() {
  usePageStyle('/assets/css/home.css?v=2');
  useReveal();

  // Color picker state & canvas
  const [activeColor, setActiveColor] = useState(COLORS[0][0]);
  const activeColorRef = useRef(COLORS[0][0]);
  const canvasRef = useRef(null);
  const heroRef = useRef(null);
  const rollerRef = useRef(null);
  const animRef = useRef(null);
  const initialTimerRef = useRef(null);

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
      return !!(target && target.closest('.dock, button, a'));
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

  // Recent projects
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
        <h1>{heroData.headline || 'Make your walls unforgettable.'}</h1>
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

        {/* Paint Color Picker Dock - Anchored inside Hero Banner */}
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
      </div>

      {/* Marquee */}
      <div className="mq">
        <div className="tr" id="tr">
          {Array(4).fill(homeData.marquee && homeData.marquee.length ? homeData.marquee : ['Interior', 'Exterior', 'Limewash', 'Wallpaper', 'Feature walls', 'Spray painting']).flat().map((w, i) => (
            <span key={i}>{w}</span>
          ))}
        </div>
      </div>

      {/* Services Section - Clean Modern Service Cards */}
      <section id="services" className="home-services-section">
        <div className="w">
          <div className="home-services-header rvl">
            <div className="eb" style={{ color: '#8F6A00', fontSize: '1.05rem', fontWeight: 700, letterSpacing: '0.12em' }}>
              {homeData.servicesIntro?.eyebrow || 'Services · What We Do Best'}
            </div>
            <h2>{homeData.servicesIntro?.headline || 'Decorating, done properly.'}</h2>
            <p className="home-services-subtitle">
              {homeData.servicesIntro?.subtitle || 'Every home has a story. Choose what you’d like to transform and explore the finishes we do best.'}
            </p>
          </div>

          <div className="home-services-grid rvl">
            {HOME_SERVICE_CARDS.map((svc) => (
              <Link
                key={svc.slug}
                href={svc.slug === 'limewash-specialist' ? '/services/limewash-specialist' : `/services/${svc.slug}`}
                className={`home-service-card ${svc.popular ? 'is-popular' : ''}`}
                style={{ background: svc.bg }}
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
            ))}
          </div>

          <div className="home-services-footer rvl">
            <span>Good walls. Good feelings. Great spaces.</span>
            <Link href="/services" className="home-services-all-link">
              See all our services <span aria-hidden="true">↗</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Portfolio Showcase - Clean Modern Project Cards */}
      <section id="portfolio" className="home-projects-section">
        <div className="w">
          <div className="home-projects-header rvl">
            <div className="eb" style={{ color: '#8F6A00', fontSize: '1.05rem', fontWeight: 700, letterSpacing: '0.12em' }}>
              {homeData.portfolioIntro?.eyebrow || 'Recent projects'}
            </div>
            <h2>{homeData.portfolioIntro?.headline || 'The finish is everything.'}</h2>
            <p className="home-projects-subtitle">
              {homeData.portfolioIntro?.lead || 'A curated look at completed projects. Browse our recent finishes below, or visit our full portfolio for before-and-after stories.'}
            </p>
          </div>

          <div className="home-projects-grid rvl">
            {HOME_PROJECT_CARDS.map((proj, idx) => (
              <Link
                key={idx}
                href="/portfolio"
                className={`home-project-card ${proj.popular ? 'is-popular' : ''}`}
                style={{ background: proj.bg }}
              >
                <div className="service-card-top">
                  <div className="service-card-icon" style={{ color: proj.iconColor, background: 'rgba(255, 255, 255, 0.75)' }}>
                    {proj.icon === 'home' && (
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                        <polyline points="9 22 9 12 15 12 15 22" />
                      </svg>
                    )}
                    {proj.icon === 'roller' && (
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="2" y="3" width="16" height="6" rx="2" />
                        <path d="M18 6h3a1 1 0 0 1 1 1v4a1 1 0 0 1-1 1h-8v3" />
                        <rect x="11" y="15" width="2" height="6" rx="1" />
                      </svg>
                    )}
                    {proj.icon === 'sparkle' && (
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
                        <path d="M5 3v4" />
                        <path d="M19 17v4" />
                      </svg>
                    )}
                    {proj.icon === 'palette' && (
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="13.5" cy="6.5" r=".5" fill="currentColor" />
                        <circle cx="17.5" cy="10.5" r=".5" fill="currentColor" />
                        <circle cx="8.5" cy="7.5" r=".5" fill="currentColor" />
                        <circle cx="6.5" cy="12.5" r=".5" fill="currentColor" />
                        <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z" />
                      </svg>
                    )}
                    {proj.icon === 'brush' && (
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M18.37 2.63 14 7l-1.59-1.59a2 2 0 0 0-2.82 0L8 7l9 9 1.59-1.59a2 2 0 0 0 0-2.82L17 10l4.37-4.37a2.12 2.12 0 1 0-3-3Z" />
                        <path d="M9 8c-2 3-4 3.5-7 4l8 8c.5-3 1-5 4-7" />
                        <path d="M14.5 17.5 4.5 7.5" />
                      </svg>
                    )}
                    {proj.icon === 'shield' && (
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                      </svg>
                    )}
                  </div>
                  <span className="service-card-badge">{proj.badgeText}</span>
                </div>

                <h3 className="service-card-title">{proj.title}</h3>
                <p className="service-card-desc">{proj.desc}</p>

                <ul className="service-card-bullets">
                  {proj.bullets.map((bullet, bi) => (
                    <li key={bi}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#111111" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="bullet-check">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                      <span>{bullet}</span>
                    </li>
                  ))}
                </ul>
              </Link>
            ))}
          </div>

          <div className="home-projects-footer rvl">
            <span>Spaces transformed. Details perfected. Guaranteed.</span>
            <Link href="/portfolio" className="home-projects-all-link">
              View all project transformations <span aria-hidden="true">↗</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Limewash feature */}
      <section className="dk lw lw-home-feature" id="limewash" style={{ background: '#B0BBC0', color: '#111111' }}>
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
            <div style={{ background: '#D6AF85', color: '#111111' }}>
              <b style={{ color: '#111111' }} data-n={homeData.why?.statsYears ? homeData.why.statsYears.replace(/\D/g, '') || '28' : '28'} data-s="+">{homeData.why?.statsYears || '28+'}</b>
              <span style={{ color: '#111111', fontWeight: 600, opacity: 1 }}>Years of experience</span>
            </div>
            <div style={{ background: '#E58E70', color: '#111111' }}>
              <b style={{ color: '#111111' }} data-n={homeData.why?.statsClients ? homeData.why.statsClients.replace(/\D/g, '') || '1247' : '1247'}>{homeData.why?.statsClients || '1,247'}</b>
              <span style={{ color: '#111111', fontWeight: 600, opacity: 1 }}>Happy clients</span>
            </div>
            <div style={{ background: '#F0BA30', color: '#111111' }}>
              <b style={{ color: '#111111' }} data-n={homeData.why?.statsProjects ? homeData.why.statsProjects.replace(/\D/g, '') || '1500' : '1500'} data-s="+">{homeData.why?.statsProjects || '1500+'}</b>
              <span style={{ color: '#111111', fontWeight: 600, opacity: 1 }}>Projects completed</span>
            </div>
            <div style={{ background: '#6EAED6', color: '#111111' }}>
              <b style={{ color: '#111111' }}>{homeData.why?.statsSupport || '24/7'}</b>
              <span style={{ color: '#111111', fontWeight: 600, opacity: 1 }}>Support available</span>
            </div>
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
                c: '#F6CA4B',
              },
              {
                q: 'I hired Jimmy and the team from AR Matt & Gloss for my entire home exterior. They were meticulous with preparation and the finish is flawless.',
                n: 'Priya Sharma',
                l: 'Fulham, London',
                c: '#94C8E8',
              },
              {
                q: 'The attention to detail was impressive. They took the time to protect all my furniture and cleaned up thoroughly each day.',
                n: 'Elena Rodriguez',
                l: 'Paddington, London',
                c: '#F2AE97',
              },
            ]).map((rev, i) => {
              const bg = (rev.c && rev.c !== '#E4EDCF') ? rev.c : (i % 3 === 0 ? 'var(--butter)' : i % 3 === 1 ? 'var(--mist)' : 'var(--peach)');
              return (
                <figure key={i} className="tc rvl" style={{ background: bg }}>
                  <div className="ts">★★★★★</div>
                  <blockquote>“{rev.q}”</blockquote>
                  <figcaption>
                    <span className="av">{(rev.n || 'C').split(' ').map((x) => x[0]).join('')}</span>
                    <span><b>{rev.n}</b><small>{rev.l}</small></span>
                  </figcaption>
                </figure>
              );
            })}
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
      <section className="dk" id="contact" style={{ background: '#B0BBC0', color: '#111111' }}>
        <div className="w">
          <div className="qt">
            <div className="rvl">
              <div className="eb" style={{ color: '#8F6A00' }}>{homeData.contactIntro?.eyebrow || 'Contact'}</div>
              <h2 style={{ color: '#111111' }}>{homeData.contactIntro?.headline || 'Let’s make it unforgettable.'}</h2>
              <p className="lead" style={{ color: '#222222' }}>
                {homeData.contactIntro?.lead || 'No job is too small or too big. Tell us your idea and we’ll reply with expert advice and a fair quote within 24 hours.'}
              </p>
              <div className="ct" style={{ color: '#111111' }}>
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
              style={{ background: '#B0BBC0', color: '#111111', boxShadow: '0 16px 40px rgba(0, 0, 0, 0.08)' }}
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

          <div style={{ maxWidth: '820px', marginTop: '80px', color: '#111111' }}>
            <div className="eb" style={{ color: '#8F6A00' }}>FAQs</div>
            <details style={{ borderBottomColor: 'rgba(0, 0, 0, 0.18)' }}>
              <summary style={{ color: '#111111' }}>Which areas do you cover?</summary>
              <p style={{ color: '#222222' }}>Greater London, West London and Surrey, plus up to 30 miles outside the M25.</p>
            </details>
            <details style={{ borderBottomColor: 'rgba(0, 0, 0, 0.18)' }}>
              <summary style={{ color: '#111111' }}>Are you insured and licensed?</summary>
              <p style={{ color: '#222222' }}>Yes, fully insured and licensed, with a satisfaction guarantee on every job.</p>
            </details>
            <details style={{ borderBottomColor: 'rgba(0, 0, 0, 0.18)' }}>
              <summary style={{ color: '#111111' }}>Do you offer colour advice?</summary>
              <p style={{ color: '#222222' }}>Yes. Free colour consultations come with every quote.</p>
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
    </main>
  );
}

export default Home;
