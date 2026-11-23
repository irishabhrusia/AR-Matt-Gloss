'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePageStyle } from '@/hooks/usePageStyle';
import { useReveal } from '@/hooks/useReveal';
import { PORTFOLIO_PROJECTS, getImageUrl } from '@/data/portfolioData';

const CATEGORIES = ['All', 'Interior', 'Exterior', 'Roofline'];

export function Portfolio() {
  usePageStyle('/assets/css/portfolio.css');

  const [projectsList, setProjectsList] = useState(PORTFOLIO_PROJECTS);
  const [curCategory, setCurCategory] = useState('All');
  const [activeCaseIdx, setActiveCaseIdx] = useState(0);
  const [lightboxIdx, setLightboxIdx] = useState(null);
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [phoneVal, setPhoneVal] = useState('');

  useReveal([curCategory]);

  useEffect(() => {
    fetch('/api/portfolio')
      .then((r) => r.json())
      .then((j) => {
        if (j.success && j.portfolio?.length) {
          const activeOnly = j.portfolio.filter((p) => p.active !== false);
          if (activeOnly.length) {
            setProjectsList(activeOnly);
          }
        }
      })
      .catch((e) => console.error(e));
  }, []);

  // Page title (HTML <title> ke hisaab se)
  useEffect(() => {
    document.title = 'Portfolio | AR Matt & Gloss Decorators';
  }, []);

  // Lightbox ke liye saari photos (before + after)
  const allPhotos = [];
  projectsList.forEach((p) => {
    allPhotos.push(
      { url: getImageUrl(p.imgBefore), caption: `${p.title} (Before / In progress)` },
      { url: getImageUrl(p.imgAfter), caption: `${p.title} (Completed finish)` }
    );
  });

  const getFilteredCount = (g) => {
    if (g === 'All') return projectsList.length;
    return projectsList.filter((p) => p.category === g).length;
  };

  // Lightbox keyboard navigation
  useEffect(() => {
    if (lightboxIdx === null) return;
    function onKeyDown(e) {
      if (e.key === 'Escape') setLightboxIdx(null);
      if (e.key === 'ArrowLeft') {
        setLightboxIdx((prev) => (prev - 1 + allPhotos.length) % allPhotos.length);
      }
      if (e.key === 'ArrowRight') {
        setLightboxIdx((prev) => (prev + 1) % allPhotos.length);
      }
    }
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [lightboxIdx, allPhotos.length]);

  // Scroll par active case track karna (floating index ke liye)
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const idx = +entry.target.dataset.i;
            setActiveCaseIdx(idx);
          }
        });
      },
      { rootMargin: '-45% 0px -45% 0px' }
    );

    const caseElements = document.querySelectorAll('.case');
    caseElements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, [curCategory]);

  const activeProjectsCount = getFilteredCount(curCategory);

  // Seamless marquee array builder: generates 2 identical halves with at least 18 items per half
  const createSeamlessList = (items, minHalfCount = 18) => {
    if (!items || items.length === 0) return [];
    let singleHalf = [];
    while (singleHalf.length < minHalfCount) {
      singleHalf = singleHalf.concat(items);
    }
    return [...singleHalf, ...singleHalf];
  };

  const row1List = createSeamlessList(projectsList.map((p) => ({
    url: getImageUrl(p.imgAfter),
    title: p.title || 'Completed Finish'
  })));

  const row2List = createSeamlessList([...projectsList].reverse().map((p) => ({
    url: getImageUrl(p.imgBefore),
    title: p.title || 'In-Progress Project'
  })));

  return (
    <main>
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes marqueeScrollLeft {
          0% { transform: translate3d(0, 0, 0); }
          100% { transform: translate3d(-50%, 0, 0); }
        }
        @keyframes marqueeScrollRight {
          0% { transform: translate3d(-50%, 0, 0); }
          100% { transform: translate3d(0, 0, 0); }
        }
        .rw-scroll-left {
          display: flex !important;
          gap: 14px !important;
          width: max-content !important;
          will-change: transform !important;
          animation: marqueeScrollLeft 48s linear infinite !important;
        }
        .rw-scroll-right {
          display: flex !important;
          gap: 14px !important;
          width: max-content !important;
          will-change: transform !important;
          animation: marqueeScrollRight 52s linear infinite !important;
        }
        .rows .rw img {
          flex-shrink: 0 !important;
          user-select: none !important;
          width: 210px !important;
          height: 250px !important;
          object-fit: cover !important;
          border-radius: 22px !important;
          border: 2px solid var(--ink) !important;
          background: var(--paper2) !important;
        }
        @media (max-width: 980px) {
          .rows .rw img {
            width: 150px !important;
            height: 190px !important;
          }
        }
      `}} />

      {/* Hero */}
      <div className="hero">
        <div className="w">
          <div className="crumb">
            <Link href="/">Home</Link>/<b>Portfolio</b>
          </div>
          <div className="eb">Portfolio</div>
          <h1>
            Trans<em>forma</em>tions
          </h1>
          <div className="hh">
            <p className="lead">
              Witness the difference professional painting makes. Browse our gallery of recent projects to see how we breathe new life into homes and businesses.
            </p>
            <div className="hs stats rvl">
              <div><b data-n="12">0</b><span>Project types</span></div>
              <div><b data-n="24">0</b><span>Real photos</span></div>
              <div><b data-n="28">0</b><span>Years of experience</span></div>
            </div>
          </div>
        </div>

        {/* Tilted marquee rows (Dual infinite continuous runners) */}
        <div className="rows" aria-hidden="true" style={{ overflow: 'hidden' }}>
          <div className="rw rw-scroll-left" id="r1">
            {row1List.map((item, i) => (
              <img
                key={`r1-${i}`}
                src={item.url}
                alt={item.title}
                loading="eager"
                decoding="async"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
            ))}
          </div>
          <div className="rw rv rw-scroll-right" id="r2">
            {row2List.map((item, i) => (
              <img
                key={`r2-${i}`}
                src={item.url}
                alt={item.title}
                loading="eager"
                decoding="async"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Sticky filter bar */}
      <div className="fb" id="fb">
        <div className="w">
          {CATEGORIES.map((g) => (
            <button
              key={g}
              type="button"
              className={g === curCategory ? 'on' : ''}
              onClick={() => setCurCategory(g)}
            >
              {g}
              <small>{getFilteredCount(g)}</small>
            </button>
          ))}
          <span className="cnt" id="ct">
            {activeProjectsCount * 2} photos · {activeProjectsCount} projects
          </span>
        </div>
      </div>

      {/* Floating side index (desktop) */}
      <aside className="ix" id="ix" aria-label="Projects">
        {projectsList.map((p, i) => {
          const isGone = !(curCategory === 'All' || p.category === curCategory);
          return (
            <a
              key={i}
              href={`#c${i}`}
              className={`${i === activeCaseIdx ? 'on' : ''} ${isGone ? 'gone' : ''}`}
              onClick={(e) => {
                e.preventDefault();
                document.getElementById(`c${i}`)?.scrollIntoView({ behavior: 'smooth' });
              }}
            >
              <span className="ix-tip">{p.title}</span>
              <span className="ix-num">{i + 1}</span>
            </a>
          );
        })}
      </aside>

      {/* Project cases */}
      <div className="w">
        <section className="cases" id="cases" aria-label="Project case studies">
          {projectsList.map((p, i) => {
            const isHidden = !(curCategory === 'All' || p.category === curCategory);
            if (isHidden) return null;

            return (
              <article
                key={i}
                className={`case rvl in ${i % 2 ? 'rev' : ''}`}
                id={`c${i}`}
                data-g={p.category}
                data-i={i}
              >
                <div className="row">
                  <div className="info">
                    <div>
                      <span className="tag">{p.category}</span>
                      <h2>{p.title}</h2>
                      <p>Original project photos from our portfolio. Click a photo to view it full size.</p>
                    </div>
                    <a className="btn p" href="#quote">
                      Get a similar finish{' '}
                      <svg className="i">
                        <use href="#ar" />
                      </svg>
                    </a>
                  </div>

                  <figure
                    className="fr"
                    tabIndex={0}
                    role="button"
                    aria-label={`Enlarge ${p.title} photo 1`}
                    style={{ '--u': `url('${getImageUrl(p.imgBefore)}')`, cursor: 'pointer' }}
                    onClick={() => setLightboxIdx(i * 2)}
                    onKeyDown={(e) => { if (e.key === 'Enter') setLightboxIdx(i * 2); }}
                  >
                    <img src={getImageUrl(p.imgBefore)} alt={`${p.title} photo 1`} loading="lazy" />
                    <span className="en">⤢ Enlarge</span>
                  </figure>

                  <figure
                    className="fr"
                    tabIndex={0}
                    role="button"
                    aria-label={`Enlarge ${p.title} photo 2`}
                    style={{ '--u': `url('${getImageUrl(p.imgAfter)}')`, cursor: 'pointer' }}
                    onClick={() => setLightboxIdx(i * 2 + 1)}
                    onKeyDown={(e) => { if (e.key === 'Enter') setLightboxIdx(i * 2 + 1); }}
                  >
                    <img src={getImageUrl(p.imgAfter)} alt={`${p.title} photo 2`} loading="lazy" />
                    <span className="en">⤢ Enlarge</span>
                  </figure>
                </div>
              </article>
            );
          })}
        </section>
      </div>

      {/* Quote section */}
      <section className="dk" id="quote">
        <div className="w">
          <div className="qt">
            <div className="rvl in">
              <div className="eb">Free quote</div>
              <h2>
                Ready for your own <em>transformation?</em>
              </h2>
              <p className="lead">
                Let us bring your vision to life with the same quality and attention to detail you see in our portfolio. Contact us today for a free consultation.
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
              className="rvl in"
              onSubmit={(e) => {
                e.preventDefault();
                if (!phoneVal.trim()) {
                  document.getElementById('p')?.focus();
                  return;
                }
                setFormSubmitted(true);
              }}
            >
              {!formSubmitted ? (
                <div id="fb2" style={{ display: 'grid', gap: '16px' }}>
                  <div>
                    <label htmlFor="s">Project type</label>
                    <select id="s">
                      {PORTFOLIO_PROJECTS.map((p, i) => (
                        <option key={i}>{p.title}</option>
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
          className="pv"
          aria-label="Previous"
          onClick={(e) => {
            e.stopPropagation();
            setLightboxIdx((lightboxIdx - 1 + allPhotos.length) % allPhotos.length);
          }}
        >
          ‹
        </button>
        {lightboxIdx !== null && (
          <>
            <img src={allPhotos[lightboxIdx].url} alt="" />
            <div className="cap">{allPhotos[lightboxIdx].caption}</div>
          </>
        )}
        <button
          className="nx"
          aria-label="Next"
          onClick={(e) => {
            e.stopPropagation();
            setLightboxIdx((lightboxIdx + 1) % allPhotos.length);
          }}
        >
          ›
        </button>
      </div>
    </main>
  );
}

export default Portfolio;
