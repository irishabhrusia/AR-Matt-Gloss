'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePageStyle } from '@/hooks/usePageStyle';
import { useReveal } from '@/hooks/useReveal';

const SERVICES = [
  'Interior Painting',
  'Exterior Painting',
  'Limewash Specialist',
  'Decorative Finishes',
  'Spray Refinishing',
  'Commercial Painting',
  'Other / not sure',
];

const BUDGETS = [
  'Under £500',
  '£500 – £1,000',
  '£1,000 – £2,500',
  '£2,500 – £5,000',
  '£5,000+',
  'Not sure yet',
];

const NEXT_DAY = {
  Mon: 'Tuesday',
  Tue: 'Wednesday',
  Wed: 'Thursday',
  Thu: 'Friday',
  Fri: 'Saturday',
  Sat: 'Monday',
};

function getOpenStatus() {
  try {
    const parts = {};
    new Intl.DateTimeFormat('en-GB', {
      timeZone: 'Europe/London',
      weekday: 'short',
      hour: 'numeric',
      hour12: false,
    })
      .formatToParts(new Date())
      .forEach((x) => {
        parts[x.type] = x.value;
      });

    const day = parts.weekday;
    const hour = (+parts.hour) % 24;

    if (day === 'Sun') {
      return { isOpen: false, text: 'Closed today · Sunday by request' };
    }
    if (hour >= 8 && hour < 17) {
      return { isOpen: true, text: 'We’re open now · until 5pm' };
    }
    if (hour < 8) {
      return { isOpen: false, text: 'Closed now · opens 8am today' };
    }
    return { isOpen: false, text: `Closed now · reopens 8am ${NEXT_DAY[day]}` };
  } catch {
    return { isOpen: true, text: 'Mon–Sat: 8am – 5pm' };
  }
}

export function Contact() {
  usePageStyle('/assets/css/contact.css');
  useReveal();

  const [openStatus, setOpenStatus] = useState({ isOpen: false, text: 'Checking opening hours…' });
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [mailtoUrl, setMailtoUrl] = useState('');
  const [errors, setErrors] = useState({});
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    service: '',
    budget: '',
    details: '',
  });

  const [companyInfo, setCompanyInfo] = useState({
    phone1: '07309 092376',
    phone2: '02034 880652',
    email: 'contact@ar-mattandgloss-decorators.com',
    address: '23 Church Road, Richmond, Surrey TW9 2QA',
  });

  useEffect(() => {
    document.title = 'Contact Us | AR Matt & Gloss Decorators';
    setOpenStatus(getOpenStatus());

    fetch('/api/settings')
      .then((r) => r.json())
      .then((j) => {
        if (j.success && j.settings?.company) {
          setCompanyInfo((prev) => ({ ...prev, ...j.settings.company }));
        }
      })
      .catch((e) => console.error(e));
  }, []);

  const handleChange = (field, val) => {
    setFormData((prev) => ({ ...prev, [field]: val }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: false }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const newErrors = {
      name: !formData.name.trim(),
      email: !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(formData.email.trim()),
      phone: formData.phone.replace(/\D/g, '').length < 7,
      service: !formData.service,
      details: !formData.details.trim(),
    };

    setErrors(newErrors);

    if (Object.values(newErrors).some(Boolean)) return;

    // Send lead to backend API
    fetch('/api/queries', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        service: formData.service,
        budget: formData.budget,
        details: formData.details,
        source: 'Contact Page (/contact)',
      }),
    }).catch((err) => console.error('Error submitting query to backend:', err));

    const body =
      `Name: ${formData.name}\n` +
      `Email: ${formData.email}\n` +
      `Phone: ${formData.phone}\n` +
      `Service: ${formData.service}\n` +
      `Budget: ${formData.budget || 'Not specified'}\n\n` +
      `Project details:\n${formData.details}`;

    const mail =
      `mailto:contact@ar-mattandgloss-decorators.com` +
      `?subject=${encodeURIComponent(`Quote request: ${formData.service}`)}` +
      `&body=${encodeURIComponent(body)}`;

    setMailtoUrl(mail);
    setFormSubmitted(true);
  };

  return (
    <main>
      {/* Hero */}
      <div className="hero">
        <div className="bg" aria-hidden="true">Hi</div>
        <div className="w">
          <div className="crumb">
            <Link href="/">Home</Link>/<b>Contact</b>
          </div>
          <div className="eb">Free consultation and quote</div>
          <h1>
            Get in <span>Touch</span>
          </h1>
          <p className="lead">
            Ready to transform your home or business space? Contact us today for a free consultation and personalised quote.
          </p>
          <div className="open" id="open">
            <i className={openStatus.isOpen ? 'on' : ''}></i>
            <span id="ot">{openStatus.text}</span>
          </div>
        </div>
      </div>

      {/* Info cards + form */}
      <div className="main">
        <div className="w g">
          <div className="info rvl">
            <div className="cd">
              <span className="ic">
                <svg className="i"><use href="#ph" /></svg>
              </span>
              <div>
                <small>Phone</small>
                <h3>Call us</h3>
                <div className="cl">
                  <a href={`tel:${companyInfo.phone1.replace(/\s+/g, '')}`}>{companyInfo.phone1}</a>
                  <a href={`tel:${companyInfo.phone2.replace(/\s+/g, '')}`}>{companyInfo.phone2}</a>
                </div>
              </div>
            </div>

            <a className="cd" href={`mailto:${companyInfo.email}`}>
              <span className="ic">
                <svg className="i"><use href="#ml" /></svg>
              </span>
              <div>
                <small>Email</small>
                <h3>Write to us</h3>
                <p style={{ wordBreak: 'break-word', fontWeight: 600, color: 'var(--ink)', fontSize: '.98rem' }}>
                  {companyInfo.email}
                </p>
              </div>
            </a>

            <a
              className="cd"
              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(companyInfo.address)}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <span className="ic">
                <svg className="i"><use href="#mp" /></svg>
              </span>
              <div>
                <small>Address</small>
                <h3>Visit us</h3>
                <p style={{ fontWeight: 600, color: 'var(--ink)', fontSize: '.98rem' }}>
                  {companyInfo.address}
                </p>
                <p>Open in Google Maps ↗</p>
              </div>
            </a>

            <div className="cd">
              <span className="ic">
                <svg className="i"><use href="#cl" /></svg>
              </span>
              <div>
                <small>Business hours</small>
                <h3>When we’re in</h3>
                <div className="hrs">
                  <b>Monday to Friday</b>
                  <span className="t">08am – 5pm</span>
                  <b>Saturday</b>
                  <span className="t">08am – 5pm</span>
                  <b>Sunday</b>
                  <span>On request</span>
                </div>
              </div>
            </div>
          </div>

          <div className="fm rvl" id="form">
            <h2>Send us a message</h2>
            <p>
              Have questions about our services? Need a quote for your project? We’re here to help. Fill out the form for a prompt response.
            </p>

            <form id="f" noValidate onSubmit={handleSubmit}>
              {!formSubmitted ? (
                <div id="fb" style={{ display: 'grid', gap: '18px' }}>
                  <div className={`fld ${errors.name ? 'bad' : ''}`}>
                    <label htmlFor="n">Full Name <b>*</b></label>
                    <input
                      id="n"
                      autoComplete="name"
                      placeholder="Your full name"
                      value={formData.name}
                      onChange={(e) => handleChange('name', e.target.value)}
                    />
                    <div className="er">Please enter your name.</div>
                  </div>

                  <div className="f2">
                    <div className={`fld ${errors.email ? 'bad' : ''}`}>
                      <label htmlFor="e">Email Address <b>*</b></label>
                      <input
                        id="e"
                        type="email"
                        autoComplete="email"
                        placeholder="you@email.com"
                        value={formData.email}
                        onChange={(e) => handleChange('email', e.target.value)}
                      />
                      <div className="er">Please enter a valid email address.</div>
                    </div>

                    <div className={`fld ${errors.phone ? 'bad' : ''}`}>
                      <label htmlFor="p">Phone Number <b>*</b></label>
                      <input
                        id="p"
                        type="tel"
                        autoComplete="tel"
                        placeholder="07…"
                        value={formData.phone}
                        onChange={(e) => handleChange('phone', e.target.value)}
                      />
                      <div className="er">Please enter your phone number.</div>
                    </div>
                  </div>

                  <div className="f2">
                    <div className={`fld ${errors.service ? 'bad' : ''}`}>
                      <label htmlFor="s">Service Type <b>*</b></label>
                      <select
                        id="s"
                        value={formData.service}
                        onChange={(e) => handleChange('service', e.target.value)}
                      >
                        <option value="">Select a service</option>
                        {SERVICES.map((s) => (
                          <option key={s}>{s}</option>
                        ))}
                      </select>
                      <div className="er">Please choose a service.</div>
                    </div>

                    <div className="fld">
                      <label htmlFor="bd">Budget</label>
                      <select
                        id="bd"
                        value={formData.budget}
                        onChange={(e) => handleChange('budget', e.target.value)}
                      >
                        <option value="">Select a range</option>
                        {BUDGETS.map((b) => (
                          <option key={b}>{b}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className={`fld ${errors.details ? 'bad' : ''}`}>
                    <label htmlFor="d">Project Details <b>*</b></label>
                    <textarea
                      id="d"
                      placeholder="Tell us about your project: rooms or areas, finishes, timing…"
                      value={formData.details}
                      onChange={(e) => handleChange('details', e.target.value)}
                    />
                    <div className="er">Please tell us a little about your project.</div>
                  </div>

                  <button className="btn p" type="submit" style={{ justifyContent: 'center' }}>
                    Send Message{' '}
                    <svg className="i">
                      <use href="#ar" />
                    </svg>
                  </button>
                  <small className="note">We reply within 24 hours. Free, no-obligation quotation.</small>
                </div>
              ) : (
                <div className="ok" id="ok" style={{ display: 'block' }}>
                  <div className="tick">
                    <svg className="i"><use href="#ck" /></svg>
                  </div>
                  <h3>Thank you!</h3>
                  <p>
                    Your email app should open with your message ready to send. If it doesn’t, email us at contact@ar-mattandgloss-decorators.com or call 07309 092376.
                  </p>
                  <a className="btn o" id="re" href={mailtoUrl}>
                    Open email again
                  </a>
                </div>
              )}
            </form>
          </div>
        </div>
      </div>

      {/* Areas */}
      <section className="band">
        <div className="w">
          <div className="eb">Areas we cover</div>
          <h2 style={{ fontSize: 'clamp(2.2rem, 5vw, 4.2rem)' }}>
            Wherever you are, we’ll come to you.
          </h2>
          <p className="lead">
            We undertake jobs within Greater London areas and up to 30 miles outside the M25.
          </p>
          <div className="ar">
            <span>Surrey</span>
            <span>London</span>
            <span>Greater London</span>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="faq">
        <div className="w" style={{ maxWidth: '860px' }}>
          <div className="eb">Before you write</div>
          <h2 style={{ marginBottom: '20px' }}>Quick answers.</h2>

          <details open>
            <summary>Is the quote free?</summary>
            <p>Yes. Contact us to arrange your free, no-obligation quotation and consultation.</p>
          </details>
          <details>
            <summary>How quickly will you reply?</summary>
            <p>We aim to reply within 24 hours. For something urgent, call 07309 092376.</p>
          </details>
          <details>
            <summary>Are you insured?</summary>
            <p>Yes, we are fully insured and licensed, and every job is backed by our satisfaction guarantee.</p>
          </details>
          <details>
            <summary>What can I include in my message?</summary>
            <p>
              Tell us the rooms or areas, the finish you have in mind and your timing. Photos can be sent by email after your first message.
            </p>
          </details>
        </div>
      </section>
    </main>
  );
}

export default Contact;
