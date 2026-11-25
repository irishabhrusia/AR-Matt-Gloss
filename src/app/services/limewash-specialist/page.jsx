'use client';
import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePageStyle } from '@/hooks/usePageStyle';
import { useReveal } from '@/hooks/useReveal';
import { HOSTINGER_CDN } from '@/data/servicesData';

const TONES = [
  ['#EDE6D8', 'Chalk'],
  ['#E3D5BD', 'Sand'],
  ['#D5DDC8', 'Sage'],
  ['#E0B49C', 'Clay'],
  ['#EBC7C7', 'Blush'],
  ['#C9CED2', 'Stone'],
  ['#D8987A', 'Terracotta']
];

const LIMEWASH_PROJECTS = [
  { title: 'Living Room', cat: 'Living Room', id: 'a2f43ef3240891d05938cfedf1458688' },
  { title: 'Living Room', cat: 'Living Room', id: 'b78ec449018a4e1363436e56dd17d2ec' },
  { title: 'Living Room', cat: 'Living Room', id: 'd989d73633dd121a1262499747d1209c' },
  { title: 'Dining Room', cat: 'Dining & Kitchen', id: '36d413c2ff0abd9cf6a48a8a2f291a09' },
  { title: 'Bedroom', cat: 'Bedroom', id: '93e80699e3b2e9866d09f66d6f91ac2d' },
  { title: 'Bedroom', cat: 'Bedroom', id: '02ac1faab876af6a8c54ab2c80c6e43a' },
  { title: 'Staircase and Hallway', cat: 'Hallways & Stairs', id: 'ea6b95ffcf9ee5c24f080e8de878cc91' },
  { title: 'Kitchen', cat: 'Dining & Kitchen', id: 'f0296861a850877108abc71c7fa50ecc' },
  { title: 'Hallway', cat: 'Hallways & Stairs', id: '81da4bd1b28e3c115815e26fe187cbbd' },
  { title: 'Hallway', cat: 'Hallways & Stairs', id: 'b5aa80d009bcab882a484d583cf34f97' }
];

const GALLERY_CATS = ['All', 'Living Room', 'Bedroom', 'Hallways & Stairs', 'Dining & Kitchen'];

const SPACES = [
  ['Living rooms', 'Create a warm, sophisticated and welcoming atmosphere.'],
  ['Reception rooms', 'Make a lasting impression with elegant decorative finishes.'],
  ['Bedrooms', 'Introduce soft, calming tones and beautiful natural wall textures.'],
  ['Dining rooms', 'Create an attractive backdrop for contemporary or traditional interiors.'],
  ['Kitchens', 'Bring warmth and character to the heart of your home.'],
  ['Hallways and corridors', 'Bring character and individuality to transitional spaces.'],
  ['Bathrooms', 'Create a calming space with natural texture and subtle tonal variation. Ask us about suitable finishes for areas exposed to moisture.'],
  ['Feature walls', 'Add depth and visual interest to selected walls.'],
  ['Commercial interiors', 'Enhance offices, boutiques, restaurants, salons and hospitality spaces.']
];

function hexToRgb(c) {
  return [parseInt(c.substr(1, 2), 16), parseInt(c.substr(3, 2), 16), parseInt(c.substr(5, 2), 16)];
}

function clampByte(v) {
  return Math.max(0, Math.min(255, v | 0));
}

export function LimewashSpecialist() {
  usePageStyle('/assets/css/limewash-specialist.css');
  useReveal();

  // Canvas Limewash brush state
  const [activeToneIdx, setActiveToneIdx] = useState(0);
  const activeToneIdxRef = useRef(0);
  const canvasRef = useRef(null);
  const heroRef = useRef(null);
  const ringRef = useRef(null);
  const animRef = useRef(null);

  // Gallery viewer state
  const [curGalleryCat, setCurGalleryCat] = useState('All');
  const [viewerIdx, setViewerIdx] = useState(0);
  const [lightboxIdx, setLightboxIdx] = useState(null);

  // Room focus state
  const [selectedRoom, setSelectedRoom] = useState(0);
  const [spaceSelectVal, setSpaceSelectVal] = useState(SPACES[0][0]);

  // Form state
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [phoneVal, setPhoneVal] = useState('');

  // 1. Hero Canvas Brush & Limewash physics
  useEffect(() => {
    const cv = canvasRef.current;
    const hero = heroRef.current;
    const ring = ringRef.current;
    if (!cv || !hero || !ring) return;

    const cx = cv.getContext('2d');
    let W = 0, H = 0;
    let lx = null, ly = null;
    let auto = false;
    let pts = [], pi = 0, px = 0, py = 0;
    const RM = window.matchMedia('(prefers-reduced-motion:reduce)').matches;

    function sz() {
      const r = hero.getBoundingClientRect();
      if (cv.width > 0 && cv.height > 0 && (cv.width !== r.width || cv.height !== r.height)) {
        const temp = document.createElement('canvas');
        temp.width = cv.width;
        temp.height = cv.height;
        const tempCtx = temp.getContext('2d');
        tempCtx.drawImage(cv, 0, 0);

        W = cv.width = r.width;
        H = cv.height = r.height;
        cx.drawImage(temp, 0, 0);
      } else if (cv.width === 0 || cv.height === 0) {
        W = cv.width = r.width;
        H = cv.height = r.height;
      }
    }

    function blob(x, y) {
      const toneRGB = hexToRgb(TONES[activeToneIdxRef.current][0]);
      const n = 5;
      const R = W < 700 ? 55 : 75;
      for (let i = 0; i < n; i++) {
        const r = R * (0.65 + Math.random() * 0.3);
        const ox = (Math.random() - 0.5) * 12;
        const oy = (Math.random() - 0.5) * 12;
        const v = (Math.random() - 0.5) * 26;
        const g = cx.createRadialGradient(x + ox, y + oy, 0, x + ox, y + oy, r);
        const c = `rgba(${clampByte(toneRGB[0] + v)},${clampByte(toneRGB[1] + v * 0.9)},${clampByte(toneRGB[2] + v * 0.8)},`;
        g.addColorStop(0, c + (0.18 + Math.random() * 0.18) + ')');
        g.addColorStop(0.55, c + (0.10 + Math.random() * 0.08) + ')');
        g.addColorStop(1, c + '0)');
        cx.fillStyle = g;
        cx.fillRect(x + ox - r, y + oy - r, r * 2, r * 2);
      }
    }

    function stroke(x, y) {
      if (lx === null) {
        lx = x;
        ly = y;
      }
      const d = Math.hypot(x - lx, y - ly);
      const n = Math.max(1, Math.ceil(d / 16));
      for (let i = 1; i <= n; i++) {
        blob(lx + (x - lx) * i / n, ly + (y - ly) * i / n);
      }
      lx = x;
      ly = y;
    }

    function sweep() {
      cancelAnimationFrame(animRef.current);
      if (RM) {
        for (let yy = 0; yy < H + 60; yy += 50) {
          for (let xx = 0; xx < W + 60; xx += 60) {
            blob(xx, yy);
          }
        }
        return;
      }
      auto = true;
      lx = null;
      pts = [];
      const rows = Math.ceil(H / (W < 700 ? 75 : 95)) + 1;
      let d = 1;
      for (let r = 0; r < rows; r++) {
        const y = -20 + r * (H + 40) / (rows - 1);
        pts.push([d ? -60 : W + 60, y], [d ? W + 60 : -60, y + ((r % 2) ? 18 : -18)]);
        d = !d;
      }
      pi = 0;
      px = pts[0][0];
      py = pts[0][1];

      function f() {
        if (!auto) return;
        const sp = Math.max(18, Math.min(28, W / 50));
        const t = pts[pi];
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
        ring.style.opacity = '1';
        ring.style.transform = `translate3d(${px}px,${py}px,0)`;
        stroke(px, py);
        if (pi >= pts.length) {
          auto = false;
          lx = null;
          ring.style.opacity = '0';
          return;
        }
        animRef.current = requestAnimationFrame(f);
      }
      f();
    }

    hero._sweep = sweep;
    hero._clear = () => cx.clearRect(0, 0, W, H);

    function onPointerMove(e) {
      if (e.target.closest('.hbar, .rs')) return;
      if (e.pointerType === 'touch' || e.pointerType === 'pen') return;
      auto = false;
      cancelAnimationFrame(animRef.current);
      const r = hero.getBoundingClientRect();
      const x = e.clientX - r.left;
      const y = e.clientY - r.top;
      ring.style.opacity = '1';
      ring.style.transform = `translate3d(${x}px,${y}px,0)`;
      stroke(x, y);
    }

    function onPointerLeave() {
      lx = null;
      ring.style.opacity = '0';
    }

    sz();
    window.addEventListener('resize', sz);
    hero.addEventListener('pointermove', onPointerMove);
    hero.addEventListener('pointerleave', onPointerLeave);

    const timer = setTimeout(() => sweep(), 500);

    return () => {
      cancelAnimationFrame(animRef.current);
      clearTimeout(timer);
      window.removeEventListener('resize', sz);
      hero.removeEventListener('pointermove', onPointerMove);
      hero.removeEventListener('pointerleave', onPointerLeave);
    };
  }, []);

  const handleToneChange = (idx) => {
    activeToneIdxRef.current = idx;
    setActiveToneIdx(idx);
    document.documentElement.style.setProperty('--wash', TONES[idx][0]);
    if (heroRef.current && heroRef.current._sweep) {
      heroRef.current._sweep();
    }
  };

  const handleRepaint = () => {
    if (heroRef.current && heroRef.current._clear && heroRef.current._sweep) {
      heroRef.current._clear();
      heroRef.current._sweep();
    }
  };

  // 2. Filtered list for gallery
  const filteredIndices = LIMEWASH_PROJECTS
    .map((p, i) => i)
    .filter((i) => curGalleryCat === 'All' || LIMEWASH_PROJECTS[i].cat === curGalleryCat);

  const curProject = LIMEWASH_PROJECTS[viewerIdx] || LIMEWASH_PROJECTS[0];
  const curProjectImg = `${HOSTINGER_CDN}${curProject.id}.jpg`;

  const stepViewer = (delta) => {
    const list = filteredIndices;
    const curPos = list.indexOf(viewerIdx);
    const nextPos = (curPos + delta + list.length) % list.length;
    setViewerIdx(list[nextPos]);
  };

  // Keyboard navigation for viewer & lightbox
  useEffect(() => {
    function onKeyDown(e) {
      if (lightboxIdx !== null) {
        if (e.key === 'Escape') setLightboxIdx(null);
        if (e.key === 'ArrowLeft') {
          setLightboxIdx((prev) => (prev - 1 + LIMEWASH_PROJECTS.length) % LIMEWASH_PROJECTS.length);
        }
        if (e.key === 'ArrowRight') {
          setLightboxIdx((prev) => (prev + 1) % LIMEWASH_PROJECTS.length);
        }
      }
    }
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [lightboxIdx]);

  const pickRoom = (idx) => {
    setSelectedRoom(idx);
    setSpaceSelectVal(SPACES[idx][0]);
  };

  return (
    <main>
      {/* Hero */}
      <div className="hero" id="hero" ref={heroRef}>
        <canvas id="wall" ref={canvasRef}></canvas>
        <h1>Limewash Specialist</h1>
        <div className="hint">Grab the brush. Limewash this wall.</div>
        <button className="rs" id="rs" onClick={handleRepaint}>↻ Bare wall</button>
        <div id="ring" ref={ringRef}></div>
        <div className="hbar" style={{ zIndex: 10, visibility: 'visible' }}>
          <div>
            <b>Limewash Specialist in Surrey, London and Greater London</b>
            <p>Professional limewash painting and decorative limewash finishes for beautiful, timeless interiors.</p>
          </div>
          <div className="tones" id="tn" style={{ display: 'flex', alignItems: 'center', gap: '8px', visibility: 'visible' }}>
            {TONES.map(([hex, label], i) => (
              <button
                key={i}
                className={`tn ${i === activeToneIdx ? 'on' : ''}`}
                style={{ background: hex }}
                title={label}
                aria-label={label}
                onClick={() => handleToneChange(i)}
              ></button>
            ))}
            <span className="tnn" id="tnn">{TONES[activeToneIdx][1]}</span>
          </div>
          <div className="cta">
            <a className="btn p" href="#contact">
              Free quote{' '}
              <svg className="i">
                <use href="#ar" />
              </svg>
            </a>
            <a className="btn o" href="#story">The story</a>
          </div>
        </div>
      </div>

      {/* Marquee */}
      <div className="mq">
        <div className="tr" id="tr">
          {Array(4).fill(['Limewash', 'Natural tonal variation', 'Subtle movement', 'Distinctive texture', 'Character', 'Timeless']).flat().map((w, i) => (
            <span key={i}>{w}</span>
          ))}
        </div>
      </div>

      {/* Editorial Section */}
      <section className="lw-editorial" id="story" aria-labelledby="lw-editorial-title">
        <div className="w">
          <div className="lw-ed-top">
            <span className="lw-eyebrow"><span></span> THE ART BEHIND THE FINISH</span>
            <span className="lw-ed-topright">AR MATT &amp; GLOSS · LIMEWASH SPECIALISTS</span>
          </div>
          <div className="lw-ed-layout">
            <div className="lw-ed-intro">
              <h2 id="lw-editorial-title">Beautifully subtle.<br /><em>Never ordinary.</em></h2>
              <p>
                There’s something special about a wall that doesn’t look manufactured. Limewash brings soft movement and natural character to a space — and the way it’s applied makes all the difference.
              </p>
              <a className="lw-text-link" href="#transformations">
                See the finished work <span aria-hidden="true">↗</span>
              </a>
              <div className="lw-ed-signature">
                <span className="lw-ed-line" aria-hidden="true"></span>
                <span>Thoughtful preparation.<br />Careful application.<br />Beautifully individual walls.</span>
              </div>
            </div>
            <div className="lw-ed-accordions" aria-label="Our approach to limewash">
              <span className="lw-ed-accordions-head">WHAT MAKES THE DIFFERENCE</span>
              <details className="lw-ed-item" open>
                <summary>
                  <span className="lw-ed-itemname">A feel for your space</span>
                  <span className="lw-ed-toggle" aria-hidden="true"></span>
                </summary>
                <p>We consider the natural light, surrounding materials and the atmosphere you want to create before recommending a finish.</p>
              </details>
              <details className="lw-ed-item">
                <summary>
                  <span className="lw-ed-itemname">Preparation that matters</span>
                  <span className="lw-ed-toggle" aria-hidden="true"></span>
                </summary>
                <p>The right surface preparation is essential to an even, lasting decorative finish. We take care of the details before the first brushstroke.</p>
              </details>
              <details className="lw-ed-item">
                <summary>
                  <span className="lw-ed-itemname">Applied with intention</span>
                  <span className="lw-ed-toggle" aria-hidden="true"></span>
                </summary>
                <p>Our hand-applied technique creates the layered movement and understated texture that give limewash its distinctive character.</p>
              </details>
              <details className="lw-ed-item">
                <summary>
                  <span className="lw-ed-itemname">Made to feel like yours</span>
                  <span className="lw-ed-toggle" aria-hidden="true"></span>
                </summary>
                <p>Every room is different. We work with you to choose a colour and finish that complements the architecture and your personal style.</p>
              </details>
              <div className="lw-ed-aside">
                <span className="lw-ed-aside-symbol" aria-hidden="true">✳</span>
                <p>Quiet luxury is found in the details.</p>
                <span className="lw-ed-aside-bottom">THE BEAUTY OF LIMEWASH</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="lw-values-strip" aria-label="Our limewash approach">
        <div className="w">
          <span>Natural tonal movement</span>
          <i aria-hidden="true"></i>
          <span>Soft, distinctive texture</span>
          <i aria-hidden="true"></i>
          <span>Made with care</span>
        </div>
      </section>

      {/* Transformations Gallery */}
      <section className="band" id="transformations">
        <div className="w">
          <div className="hd rvl">
            <div>
              <div className="eb">Limewash transformations</div>
              <h2>See the difference a natural finish can make.</h2>
            </div>
            <p className="lead">
              Original before and after photos from our limewash projects, shown large. Use the arrows or thumbnails, or click the photo for full size.
            </p>
          </div>

          <div className="chips rvl" id="chips">
            {GALLERY_CATS.map((cat) => {
              const count = LIMEWASH_PROJECTS.filter((p) => cat === 'All' || p.cat === cat).length;
              return (
                <button
                  key={cat}
                  className={cat === curGalleryCat ? 'on' : ''}
                  onClick={() => {
                    setCurGalleryCat(cat);
                    const firstMatch = LIMEWASH_PROJECTS.findIndex((p) => cat === 'All' || p.cat === cat);
                    if (firstMatch !== -1) setViewerIdx(firstMatch);
                  }}
                >
                  {cat}
                  <small>{count}</small>
                </button>
              );
            })}
          </div>

          <div
            className="vst rvl"
            id="vst"
            tabIndex={0}
            role="button"
            aria-label="Open photo full size"
            style={{ '--u': `url('${curProjectImg}')`, cursor: 'pointer' }}
            onClick={() => setLightboxIdx(viewerIdx)}
          >
            <span className="vcap" id="vcap">{curProject.title}</span>
            <button
              className="vnav l"
              id="pv"
              aria-label="Previous"
              onClick={(e) => {
                e.stopPropagation();
                stepViewer(-1);
              }}
            >←</button>
            <img id="vimg" src={curProjectImg} alt={`${curProject.title} before and after limewash painting`} />
            <button
              className="vnav r"
              id="nx"
              aria-label="Next"
              onClick={(e) => {
                e.stopPropagation();
                stepViewer(1);
              }}
            >→</button>
            <span className="vzm">⤢ Full size</span>
          </div>

          <div className="thumbs" id="thumbs">
            {filteredIndices.map((idx) => {
              const p = LIMEWASH_PROJECTS[idx];
              const u = `${HOSTINGER_CDN}${p.id}.jpg`;
              return (
                <button
                  key={idx}
                  className={`thb ${idx === viewerIdx ? 'on' : ''}`}
                  aria-label={p.title}
                  onClick={() => setViewerIdx(idx)}
                >
                  <img src={u} alt="" loading="lazy" />
                </button>
              );
            })}
          </div>

          <div className="vmeta">
            <div>
              <h3 id="vt">{curProject.title}</h3>
              <small id="vs">Before and after limewash</small>
            </div>
          </div>
        </div>
      </section>

      {/* Room Directory */}
      <section className="lw-spaces-new" id="spaces" aria-labelledby="lw-spaces-title">
        <div className="w">
          <div className="lw-spaces-heading">
            <div>
              <div className="lw-eyebrow"><span></span> OUR LIMEWASH PAINTING SERVICES</div>
              <h2 id="lw-spaces-title">A natural fit for<br /><em>every space.</em></h2>
            </div>
            <p>From quiet corners to statement rooms, limewash adds depth without overpowering a space. Explore where it can work beautifully.</p>
          </div>

          <div className="lw-room-collections">
            <article className="lw-room-collection">
              <div className="lw-room-header">
                <div className="lw-room-symbol" aria-hidden="true">
                  <svg viewBox="0 0 54 54" fill="none" stroke="currentColor" strokeWidth="1.35">
                    <path d="M8 35v-9a5 5 0 0 1 5-5h28a5 5 0 0 1 5 5v9M8 35h38v6H8zM13 21v-5h28v5M13 41v5m28-5v5" />
                    <path d="M19 20v-8m16 8v-8" />
                  </svg>
                </div>
                <span className="lw-room-collection-tag">GATHER &amp; CONNECT</span>
              </div>
              <h3>Living spaces<span className="lw-room-dot">.</span></h3>
              <p>The rooms you live, gather and entertain in.</p>
              <div className="lw-room-list">
                <button type="button" className={`lw-room-choice ${selectedRoom === 0 ? 'on' : ''}`} aria-pressed={selectedRoom === 0} onClick={() => pickRoom(0)}>Living rooms <span aria-hidden="true">↗</span></button>
                <button type="button" className={`lw-room-choice ${selectedRoom === 1 ? 'on' : ''}`} aria-pressed={selectedRoom === 1} onClick={() => pickRoom(1)}>Reception rooms <span aria-hidden="true">↗</span></button>
                <button type="button" className={`lw-room-choice ${selectedRoom === 3 ? 'on' : ''}`} aria-pressed={selectedRoom === 3} onClick={() => pickRoom(3)}>Dining rooms <span aria-hidden="true">↗</span></button>
                <button type="button" className={`lw-room-choice ${selectedRoom === 4 ? 'on' : ''}`} aria-pressed={selectedRoom === 4} onClick={() => pickRoom(4)}>Kitchens <span aria-hidden="true">↗</span></button>
              </div>
            </article>

            <article className="lw-room-collection">
              <div className="lw-room-header">
                <div className="lw-room-symbol" aria-hidden="true">
                  <svg viewBox="0 0 54 54" fill="none" stroke="currentColor" strokeWidth="1.35">
                    <path d="M10 36V20h34v16H10zM15 20v-6h24v6M10 36v6h34v-6M15 42v4m24-4v4" />
                    <path d="M19 25h16M19 30h16" />
                  </svg>
                </div>
                <span className="lw-room-collection-tag">REST &amp; UNWIND</span>
              </div>
              <h3>Quiet spaces<span className="lw-room-dot">.</span></h3>
              <p>Soft, soothing finishes for everyday calm.</p>
              <div className="lw-room-list">
                <button type="button" className={`lw-room-choice ${selectedRoom === 2 ? 'on' : ''}`} aria-pressed={selectedRoom === 2} onClick={() => pickRoom(2)}>Bedrooms <span aria-hidden="true">↗</span></button>
                <button type="button" className={`lw-room-choice ${selectedRoom === 6 ? 'on' : ''}`} aria-pressed={selectedRoom === 6} onClick={() => pickRoom(6)}>Bathrooms <span aria-hidden="true">↗</span></button>
                <button type="button" className={`lw-room-choice ${selectedRoom === 5 ? 'on' : ''}`} aria-pressed={selectedRoom === 5} onClick={() => pickRoom(5)}>Hallways &amp; corridors <span aria-hidden="true">↗</span></button>
              </div>
            </article>

            <article className="lw-room-collection">
              <div className="lw-room-header">
                <div className="lw-room-symbol" aria-hidden="true">
                  <svg viewBox="0 0 54 54" fill="none" stroke="currentColor" strokeWidth="1.35">
                    <path d="M13 10h28v34H13zM20 16v22M28 16v22M35 16v22M12 44h30" />
                    <path d="M8 13v28M46 13v28" />
                  </svg>
                </div>
                <span className="lw-room-collection-tag">MAKE AN IMPRESSION</span>
              </div>
              <h3>Signature spaces<span className="lw-room-dot">.</span></h3>
              <p>A little more character, right where it counts.</p>
              <div className="lw-room-list">
                <button type="button" className={`lw-room-choice ${selectedRoom === 7 ? 'on' : ''}`} aria-pressed={selectedRoom === 7} onClick={() => pickRoom(7)}>Feature walls <span aria-hidden="true">↗</span></button>
                <button type="button" className={`lw-room-choice ${selectedRoom === 8 ? 'on' : ''}`} aria-pressed={selectedRoom === 8} onClick={() => pickRoom(8)}>Commercial interiors <span aria-hidden="true">↗</span></button>
              </div>
            </article>
          </div>

          <div className="lw-space-focus" id="lw-space-focus" aria-live="polite">
            <div className="lw-space-focus-mark">
              <span className="lw-space-focus-kicker">IN FOCUS</span>
              <span className="lw-space-focus-rule"></span>
              <span className="lw-space-focus-ornament" aria-hidden="true">✳</span>
            </div>
            <div className="lw-space-focus-text">
              <h3 id="lw-space-selected">{SPACES[selectedRoom][0]}</h3>
              <p id="lw-space-description">{SPACES[selectedRoom][1]}</p>
            </div>
            <a
              href="#contact"
              id="lw-space-quote"
              className="lw-space-focus-link"
              onClick={() => setSpaceSelectVal(SPACES[selectedRoom][0])}
            >
              Discuss your space <span aria-hidden="true">↗</span>
            </a>
          </div>
          <p className="lw-spaces-smallprint">Every project is approached individually to complement the character, light and style of the property.</p>
        </div>
      </section>

      {/* Our process */}
      <section className="dk service-process-grey" style={{ background: '#B0BBC0', color: '#111111' }}>
        <div className="w">
          <div className="hd rvl">
            <div>
              <div className="eb" style={{ color: '#8F6A00' }}>How it works</div>
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

      {/* Free quote form */}
      <section className="cs" id="contact">
        <div className="w">
          <div className="qt">
            <div className="rvl">
              <div className="eb">Free, no-obligation quotation</div>
              <h2>Ready to bring <span style={{ color: 'transparent', WebkitTextStroke: '2px var(--ink)' }}>limewash</span> to your space?</h2>
              <p className="lead" style={{ color: '#3E4C45' }}>
                Contact us today to discuss your limewash painting project and arrange your free, no-obligation quotation.
              </p>
              <div className="ct">
                <div><svg className="i"><use href="#ph" /></svg>07309 092376 / 02034 880652</div>
                <div><svg className="i"><use href="#ml" /></svg>contact@ar-mattandgloss-decorators.com</div>
                <div><svg className="i"><use href="#mp" /></svg>23 Church Road, Richmond, Surrey TW9 2QA</div>
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
                    service: `Limewash Specialist (${spaceSelectVal})`,
                    budget: bd,
                    source: 'Limewash Specialist Page',
                  }),
                }).catch((err) => console.error('Error submitting query:', err));

                setFormSubmitted(true);
              }}
            >
              {!formSubmitted ? (
                <div id="fb" style={{ display: 'grid', gap: '16px' }}>
                  <div>
                    <label htmlFor="s">Space to limewash</label>
                    <select
                      id="s"
                      value={spaceSelectVal}
                      onChange={(e) => setSpaceSelectVal(e.target.value)}
                    >
                      {SPACES.map((sp, i) => (
                        <option key={i}>{sp[0]}</option>
                      ))}
                      <option>Other / not sure</option>
                    </select>
                  </div>
                  <div className="f2">
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
                  <div className="f2">
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
                    Get a free quote{' '}
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
        </div>
      </section>

      {/* Lightbox */}
      <div
        className={`lb ${lightboxIdx !== null ? 'o' : ''}`}
        id="lb"
        onClick={(e) => {
          if (e.target.id === 'lb' || e.target.closest('.x')) {
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
            setLightboxIdx((lightboxIdx - 1 + LIMEWASH_PROJECTS.length) % LIMEWASH_PROJECTS.length);
          }}
        >‹</button>
        {lightboxIdx !== null && (
          <>
            <img src={`${HOSTINGER_CDN}${LIMEWASH_PROJECTS[lightboxIdx].id}.jpg`} alt="" />
            <div className="cap">
              {LIMEWASH_PROJECTS[lightboxIdx].title} · limewash before and after
              <small>{lightboxIdx + 1} / {LIMEWASH_PROJECTS.length}</small>
            </div>
          </>
        )}
        <button
          className="nx"
          aria-label="Next"
          onClick={(e) => {
            e.stopPropagation();
            setLightboxIdx((lightboxIdx + 1) % LIMEWASH_PROJECTS.length);
          }}
        >›</button>
      </div>
    </main>
  );
}

export default LimewashSpecialist;
