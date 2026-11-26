'use client';
import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { usePageStyle } from '@/hooks/usePageStyle';
import { useReveal } from '@/hooks/useReveal';
import { SERVICES, BRANDS } from '@/data/servicesData';

export function ServiceDetail({ slug: propSlug }) {
  const params = useParams();
  const serviceSlug = propSlug || params?.slug || params?.serviceSlug;
  const cleanSlug = (serviceSlug || 'interior-painting').replace('.html', '');

  const svc = SERVICES.find((s) => s.slug === cleanSlug || (cleanSlug === 'spray-refinishing' && s.slug === 'cabinet-refinishing')) || SERVICES[0];

  usePageStyle(`/assets/css/${svc.slug}.css`);
  useReveal([svc.slug]);

  // Set CSS tint on root
  useEffect(() => {
    document.documentElement.style.setProperty('--tint', svc.tint);
  }, [svc.tint]);

  // Hero carousel state
  const [heroIdx, setHeroIdx] = useState(0);
  const [userStopped, setUserStopped] = useState(false);
  const timerRef = useRef(null);

  // Gallery filter & lightbox state
  const [activeWorkCat, setActiveWorkCat] = useState('All spaces');
  const [lightboxIdx, setLightboxIdx] = useState(null);

  // Form submission state
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [phoneVal, setPhoneVal] = useState('');

  // Hero carousel auto-play
  useEffect(() => {
    setHeroIdx(0);
    setUserStopped(false);
    setActiveWorkCat('All spaces');
  }, [svc.slug]);

  useEffect(() => {
    clearTimeout(timerRef.current);
    const RM = window.matchMedia('(prefers-reduced-motion:reduce)').matches;
    if (!userStopped && !RM) {
      timerRef.current = setTimeout(() => {
        setHeroIdx((prev) => (prev + 1) % svc.photos.length);
      }, 4200);
    }
    return () => clearTimeout(timerRef.current);
  }, [heroIdx, userStopped, svc.photos.length]);

  const stepHero = (delta) => {
    setUserStopped(true);
    setHeroIdx((prev) => (prev + delta + svc.photos.length) % svc.photos.length);
  };

  const curHeroPhoto = svc.photos[heroIdx] || svc.photos[0];

  // Gallery categories
  const workCats = ['All spaces', ...Array.from(new Set(svc.photos.map((p) => p[1])))];

  const filteredPhotos = svc.photos
    .map((photo, index) => ({ photo, index }))
    .filter((x) => activeWorkCat === 'All spaces' || x.photo[1] === activeWorkCat);

  // Keyboard navigation for lightbox
  useEffect(() => {
    if (lightboxIdx === null) return;
    function onKeyDown(e) {
      if (e.key === 'Escape') setLightboxIdx(null);
      if (e.key === 'ArrowLeft') {
        setLightboxIdx((prev) => (prev - 1 + svc.photos.length) % svc.photos.length);
      }
      if (e.key === 'ArrowRight') {
        setLightboxIdx((prev) => (prev + 1) % svc.photos.length);
      }
    }
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [lightboxIdx, svc.photos.length]);

  // Related other services
  const otherServices = SERVICES.filter((s) => s.slug !== svc.slug).slice(0, 3);

  return (
    <main>
      <link rel="stylesheet" href={`/assets/css/${svc.slug}.css`} precedence="default" />
      <div className="hero">
        <div className="w">
          <div>
            <div className="crumb">
              <Link href="/">Home</Link>/<Link href="/services">Services</Link>/<b>{svc.title}</b>
            </div>
            <div className="eb">Specialist {svc.title.toLowerCase()}</div>
            <h1>Rooms that feel <em>brand new.</em></h1>
            <p className="lead">{svc.desc}</p>
            <div className="cta">
              <a className="btn p" href="#contact">
                Get a free quote{' '}
                <svg className="i">
                  <use href="#ar" />
                </svg>
              </a>
              <a className="btn o" href="tel:07309092376">Call 07309 092376</a>
            </div>
            <div className="pills">
              <span>
                <svg className="i"><use href="#ck" /></svg>
                Fully insured
              </span>
              <span>
                <svg className="i"><use href="#ck" /></svg>
                Free colour advice
              </span>
              <span>
                <svg className="i"><use href="#ck" /></svg>
                Clean &amp; tidy
              </span>
            </div>
          </div>

          <div className="vw">
            <div
              className="vst"
              id="vst"
              tabIndex={0}
              role="button"
              aria-label="Open photo full size"
              style={{ '--u': `url('${curHeroPhoto[0]}')`, cursor: 'pointer' }}
              onClick={() => setLightboxIdx(heroIdx)}
            >
              <span className="vcap" id="vcap">{curHeroPhoto[1]}</span>
              <img id="vimg" src={curHeroPhoto[0]} alt={`${curHeroPhoto[1]} project photo`} />
              <span className="vzm">⤢ Full size</span>
            </div>
            <div className="vcl">
              <button id="vp" aria-label="Previous photo" onClick={() => stepHero(-1)}>←</button>
              <div className="vd" id="vd">
                {svc.photos.map((_, k) => (
                  <i
                    key={k}
                    className={k === heroIdx ? 'on' : ''}
                    onClick={() => {
                      setUserStopped(true);
                      setHeroIdx(k);
                    }}
                  ></i>
                ))}
              </div>
              <button id="vn" aria-label="Next photo" onClick={() => stepHero(1)}>→</button>
            </div>
          </div>
        </div>
      </div>

      <div className="mq">
        <div className="tr" id="tr">
          {Array(4).fill(svc.marqueeWords).flat().map((w, i) => (
            <span key={i}>{w}</span>
          ))}
        </div>
      </div>

      <section>
        <div className="w">
          <div className="hd rvl">
            <div>
              <div className="eb">What’s included</div>
              <h2>Everything, handled.</h2>
            </div>
            <p className="lead">{svc.title} from our certified team, from first look to final walk-through.</p>
          </div>
          <div className="inc">
            {svc.included.map((item, i) => (
              <div key={i} className="ic">
                <h3>{item.title}</h3>
                <p>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Our work */}
      <section className="work-showcase" id="our-work" aria-labelledby="work-heading">
        <div className="w">
          <div className="work-intro rvl">
            <div className="work-headline">
              <div className="eb">Our work</div>
              <h2 id="work-heading">The difference<br /><em>is in the details.</em></h2>
            </div>
            <div className="work-summary">
              <p>Real spaces, real transformations. Explore our portfolio of finished projects, from the first coat to the final detail.</p>
              <Link className="work-all" href="/portfolio">Explore our full portfolio <span aria-hidden="true">↗</span></Link>
            </div>
          </div>

          <div className="work-toolbar rvl">
            <div className="work-filters" id="work-filters" aria-label="Filter by space">
              {workCats.map((c) => (
                <button
                  key={c}
                  type="button"
                  className={c === activeWorkCat ? 'active' : ''}
                  aria-pressed={c === activeWorkCat}
                  onClick={() => setActiveWorkCat(c)}
                >
                  {c}
                </button>
              ))}
            </div>
            <span className="work-tip">Select an image for the full view <span aria-hidden="true">↗</span></span>
          </div>

          <div className="work-grid rvl" id="gal" aria-live="polite">
            {filteredPhotos.map((x) => (
              <figure
                key={x.index}
                className="pc work-card"
                tabIndex={0}
                role="button"
                aria-label={`View ${x.photo[1]} project photo in full size`}
                onClick={() => setLightboxIdx(x.index)}
              >
                <div className="work-photo">
                  <img src={x.photo[0]} alt={`${x.photo[1]} decorating project`} loading="lazy" />
                  <span className="work-open" aria-hidden="true">↗</span>
                </div>
                <figcaption>
                  <span>{x.photo[1]}</span>
                  <small>Full view <span aria-hidden="true">↗</span></small>
                </figcaption>
              </figure>
            ))}
          </div>

          <div className="work-foot rvl">
            <span>Thoughtful preparation. A beautiful finish.</span>
            <Link href="/portfolio">See more of our work <span aria-hidden="true">↗</span></Link>
          </div>
        </div>
      </section>

      {/* Proven process */}
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

      {/* Made for every space & FAQs */}
      <section>
        <div className="w two">
          <div className="rvl">
            <div className="eb">Perfect for</div>
            <h2>Made for every space.</h2>
            <div className="chp">
              {svc.spaces.map((sp, i) => (
                <span key={i}>{sp}</span>
              ))}
            </div>
          </div>
          <div className="rvl">
            <div className="eb">FAQs</div>
            {svc.faqs.map((faq, i) => (
              <details key={i} open={i === 0}>
                <summary>{faq.q}</summary>
                <p>{faq.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Trusted Brands */}
      <section>
        <div className="w">
          <div className="hd rvl">
            <div>
              <div className="eb">Trusted brands</div>
              <h2>Brands we use.</h2>
            </div>
            <p className="lead">We partner with industry-leading manufacturers for premium quality, exceptional durability and a flawless finish.</p>
          </div>
          <div className="brands rvl">
            {BRANDS.map((brand, i) => (
              <span key={i}>{brand}</span>
            ))}
          </div>
        </div>
      </section>

      {/* More services */}
      <section className="band">
        <div className="w">
          <div className="hd rvl">
            <div>
              <div className="eb">More services</div>
              <h2>Keep exploring.</h2>
            </div>
          </div>
          <div className="rel rvl">
            {otherServices.map((os) => {
              const linkUrl = os.slug === 'limewash-specialist' ? '/services/limewash-specialist' : `/services/${os.slug}`;
              return (
                <Link key={os.slug} className="rc" href={linkUrl} style={{ '--tt': os.tint }}>
                  <h3>{os.title}</h3>
                  <span>
                    Explore{' '}
                    <svg className="i">
                      <use href="#ar" />
                    </svg>
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Free quote form */}
      <section className="dk service-quote-grey" id="contact" style={{ background: '#B0BBC0', color: '#111111' }}>
        <div className="w">
          <div className="qt">
            <div className="rvl">
              <div className="eb" style={{ color: '#8F6A00' }}>Free quote</div>
              <h2 style={{ color: '#111111' }}>Let’s talk <em style={{ color: '#8F6A00', fontStyle: 'normal' }}>{cleanSlug.split('-')[0]}.</em></h2>
              <p className="lead" style={{ color: '#222222' }}>
                No job is too small or too big. Tell us your idea and we’ll reply with expert advice and a fair quote within 24 hours.
              </p>
              <div className="ct" style={{ color: '#111111' }}>
                <div><svg className="i" style={{ color: '#111111' }}><use href="#ph" /></svg>07309 092376 / 02034 880652</div>
                <div><svg className="i" style={{ color: '#111111' }}><use href="#ml" /></svg>contact@ar-mattandgloss-decorators.com</div>
                <div><svg className="i" style={{ color: '#111111' }}><use href="#mp" /></svg>23 Church Road, Richmond, Surrey TW9 2QA</div>
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

                const s = document.getElementById('s')?.value || svc.title;
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
                    source: `Service Page (${svc.title})`,
                  }),
                }).catch((err) => console.error('Error submitting query:', err));

                setFormSubmitted(true);
              }}
            >
              {!formSubmitted ? (
                <div id="fb" style={{ display: 'grid', gap: '16px' }}>
                  <div>
                    <label htmlFor="s">Service</label>
                    <select id="s" defaultValue={svc.title}>
                      {SERVICES.map((s) => (
                        <option key={s.slug}>{s.title}</option>
                      ))}
                      <option>Other / not sure</option>
                    </select>
                  </div>
                  <div className="f2c">
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
                  <div className="f2c">
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
            setLightboxIdx((lightboxIdx - 1 + svc.photos.length) % svc.photos.length);
          }}
        >‹</button>
        {lightboxIdx !== null && (
          <>
            <img src={svc.photos[lightboxIdx][0]} alt="" />
            <div className="cap">
              {svc.photos[lightboxIdx][1]}
              <small>Browse with the arrows</small>
            </div>
          </>
        )}
        <button
          className="nx"
          aria-label="Next"
          onClick={(e) => {
            e.stopPropagation();
            setLightboxIdx((lightboxIdx + 1) % svc.photos.length);
          }}
        >›</button>
      </div>
    </main>
  );
}

export default ServiceDetail;
