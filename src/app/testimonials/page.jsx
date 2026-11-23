'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePageStyle } from '@/hooks/usePageStyle';
import { useReveal } from '@/hooks/useReveal';
import {
  TESTIMONIALS,
  TESTIMONIAL_LOCATIONS,
  TESTIMONIAL_PHRASES
} from '@/data/testimonialsData';

const REVIEW_CATEGORIES = ['All', 'Interior', 'Exterior', 'Cabinets', 'Commercial', 'Colour advice'];

export function Testimonials() {
  usePageStyle('/assets/css/testimonials.css');
  useReveal();

  const [reviewsList, setReviewsList] = useState(TESTIMONIALS);
  const [curCategory, setCurCategory] = useState('All');
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [phoneVal, setPhoneVal] = useState('');

  useEffect(() => {
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

  const featured = reviewsList[0] || TESTIMONIALS[0];
  const wallReviews = reviewsList.slice(1);

  const getCategoryCount = (t) => {
    if (t === 'All') return wallReviews.length;
    return wallReviews.filter((r) => r.t && r.t.includes(t)).length;
  };

  const getInitials = (name) => (name || 'C').split(' ').map((x) => x[0]).join('');

  return (
    <main>
      <div className="hero">
        <div className="bq" aria-hidden="true">“</div>
        <div className="w">
          <div className="crumb">
            <Link href="/">Home</Link>/<b>Testimonials</b>
          </div>
          <div className="eb">Kind words, real people</div>
          <h1>What our <span>clients</span> say</h1>
          <p className="lead">
            Don’t just take our word for it. Here’s what our satisfied clients have to say about their experience with AR Matt &amp; Gloss Decorators.
          </p>
          <div className="stats rvl" id="stats">
            <div className="sc">
              <div className="ring">
                <svg viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="44" fill="none" stroke="#E1E7E3" strokeWidth="9" />
                  <circle
                    className="v"
                    cx="50"
                    cy="50"
                    r="44"
                    fill="none"
                    stroke="#12251F"
                    strokeWidth="9"
                    strokeLinecap="round"
                    strokeDasharray="276.5"
                    strokeDashoffset="276.5"
                    style={{ '--o': '5.5' }}
                    transform="rotate(-90 50 50)"
                  />
                </svg>
              </div>
              <div>
                <span className="stx">★★★★★</span>
                <b>4.9/5</b>
                <span>Average Rating</span>
              </div>
            </div>

            <div className="sc">
              <div className="ring">
                <svg viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="44" fill="none" stroke="#E1E7E3" strokeWidth="9" />
                  <circle
                    className="v"
                    cx="50"
                    cy="50"
                    r="44"
                    fill="none"
                    stroke="#FFC62E"
                    strokeWidth="9"
                    strokeLinecap="round"
                    strokeDasharray="276.5"
                    strokeDashoffset="276.5"
                    style={{ '--o': '30' }}
                    transform="rotate(-90 50 50)"
                  />
                </svg>
              </div>
              <div>
                <b data-n="847">0</b>
                <span>Happy Clients</span>
              </div>
            </div>

            <div className="sc">
              <div className="ring">
                <svg viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="44" fill="none" stroke="#E1E7E3" strokeWidth="9" />
                  <circle
                    className="v"
                    cx="50"
                    cy="50"
                    r="44"
                    fill="none"
                    stroke="#12251F"
                    strokeWidth="9"
                    strokeLinecap="round"
                    strokeDasharray="276.5"
                    strokeDashoffset="276.5"
                    style={{ '--o': '8.3' }}
                    transform="rotate(-90 50 50)"
                  />
                </svg>
              </div>
              <div>
                <b data-n="97" data-s="%">0</b>
                <span>Would Recommend</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mq">
        <div className="tr" id="tr">
          {Array(4).fill(TESTIMONIAL_PHRASES).flat().map((ph, i) => (
            <span key={i}>{ph}</span>
          ))}
        </div>
      </div>

      <section>
        <div className="w">
          <div className="ft rvl" id="ft">
            <div className="qm">“</div>
            <div>
              <div className="st">★★★★★</div>
              <blockquote>{featured.q}</blockquote>
              <div className="who">
                <span className="av">{getInitials(featured.n)}</span>
                <span>
                  <b>{featured.n}</b>
                  <small>{featured.l}</small>
                </span>
              </div>
              <span className="tag">Featured review</span>
            </div>
          </div>
        </div>
      </section>

      <section className="band" style={{ paddingTop: '90px' }}>
        <div className="w">
          <div className="hd rvl">
            <div>
              <div className="eb">Review wall</div>
              <h2>Every review, every project.</h2>
            </div>
            <p className="lead">Filter by the kind of work to see what clients say about it.</p>
          </div>

          <div className="chips rvl" id="chips">
            {REVIEW_CATEGORIES.map((cat) => (
              <button
                key={cat}
                className={cat === curCategory ? 'on' : ''}
                onClick={() => setCurCategory(cat)}
              >
                {cat}
                <small>{getCategoryCount(cat)}</small>
              </button>
            ))}
          </div>

          <div className="wall" id="wall">
            {wallReviews.map((r, i) => {
              const isHidden = !(curCategory === 'All' || r.t.includes(curCategory));
              if (isHidden) return null;
              return (
                <figure
                  key={i}
                  className="tc rvl in"
                  data-t={r.t.join('|')}
                  style={{ background: r.c }}
                >
                  <span className="qq">“</span>
                  <div className="st">★★★★★</div>
                  <blockquote>“{r.q}”</blockquote>
                  <div className="who">
                    <span className="av">{getInitials(r.n)}</span>
                    <span>
                      <b>{r.n}</b>
                      <small>{r.l}</small>
                    </span>
                  </div>
                </figure>
              );
            })}
          </div>
        </div>
      </section>

      <section>
        <div className="w">
          <div className="hd rvl">
            <div>
              <div className="eb">Where our clients are</div>
              <h2>Trusted across London and Surrey.</h2>
            </div>
            <p className="lead">
              Our clients span some of London’s best-known neighbourhoods. We work within Greater London and up to 30 miles outside the M25.
            </p>
          </div>
          <div className="ar rvl" id="ar">
            {TESTIMONIAL_LOCATIONS.map((loc, i) => (
              <span key={i}>{loc}</span>
            ))}
          </div>
        </div>
      </section>

      <section className="dk" id="contact">
        <div className="w">
          <div className="qt">
            <div className="rvl">
              <div className="eb">Free quote</div>
              <h2>Join our <em>happy clients.</em></h2>
              <p className="lead">
                Tell us about your project and we’ll reply with expert advice and a fair, no-obligation quote within 24 hours.
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
                setFormSubmitted(true);
              }}
            >
              {!formSubmitted ? (
                <div id="fb" style={{ display: 'grid', gap: '16px' }}>
                  <div>
                    <label htmlFor="s">Service</label>
                    <select id="s">
                      <option>Interior Painting</option>
                      <option>Exterior Painting</option>
                      <option>Limewash Specialist</option>
                      <option>Decorative Finishes</option>
                      <option>Spray Refinishing</option>
                      <option>Commercial Painting</option>
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
    </main>
  );
}

export default Testimonials;
