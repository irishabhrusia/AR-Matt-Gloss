import fs from 'fs';
import path from 'path';

const DATA_DIR = path.join(process.cwd(), 'data');
const QUERIES_FILE = path.join(DATA_DIR, 'queries.json');
const SETTINGS_FILE = path.join(DATA_DIR, 'settings.json');
const SERVICES_FILE = path.join(DATA_DIR, 'services.json');
const PORTFOLIO_FILE = path.join(DATA_DIR, 'portfolio.json');
const REVIEWS_FILE = path.join(DATA_DIR, 'reviews.json');

function ensureDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

// 1. Initial Seed Queries
const SEED_QUERIES = [
  {
    id: 'LEAD-1042',
    name: 'Sarah Jenkins',
    email: 'sarah.jenkins@example.co.uk',
    phone: '07700 900123',
    postcode: 'TW9 2QA',
    service: 'Limewash Specialist',
    budget: '£2,500 – £5,000',
    details: 'Looking for a textured limewash finish in our master bedroom, guest room and high-ceiling hallway. Would love advice on warm sand or sage tones.',
    source: 'Contact Page (/contact)',
    status: 'New',
    createdAt: new Date().toISOString(),
    notes: 'Urgent enquiry. Wants site visit before Friday.',
  },
  {
    id: 'LEAD-1041',
    name: 'David Miller',
    email: 'david.m@btinternet.com',
    phone: '07890 123456',
    postcode: 'KT1 2BA',
    service: 'Cabinet Refinishing',
    budget: '£1,000 – £2,500',
    details: 'Complete kitchen cabinets spray refinishing from dark oak to modern matt off-white.',
    source: 'Homepage Quick Quote (/)',
    status: 'Contacted',
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    notes: 'Spoke on phone. Customer sent photos on WhatsApp. Preparing estimate.',
  },
  {
    id: 'LEAD-1040',
    name: 'Victoria Thorne',
    email: 'v.thorne@kensingtonlaw.com',
    phone: '07911 234567',
    postcode: 'SW19 4RF',
    service: 'Exterior Painting',
    budget: '£5,000+',
    details: 'Full exterior painting for 4-storey Victorian townhouse facade, front porch, and 12 sash windows.',
    source: 'Exterior Service Page',
    status: 'Quote Sent',
    createdAt: new Date(Date.now() - 172800000).toISOString(),
    notes: 'Quote sent for £6,200. Follow-up call scheduled for Wednesday.',
  },
  {
    id: 'LEAD-1039',
    name: 'Marcus Vance',
    email: 'marcus.vance@gmail.com',
    phone: '07455 678901',
    postcode: 'SW15 1AB',
    service: 'Interior Painting',
    budget: '£500 – £1,000',
    details: 'Double reception room ceiling and walls emulsion painting in Richmond.',
    source: 'Homepage Quick Quote (/)',
    status: 'Booked',
    createdAt: new Date(Date.now() - 259200000).toISOString(),
    notes: 'Deposit paid. Job scheduled starting next week.',
  },
];

// 2. Initial Seed Settings
const SEED_SETTINGS = {
  theme: {
    primaryColor: '#c5a880',
    accentColor: '#12b5b0',
    swatches: [
      { hex: '#FFC62E', name: 'Sunshine', active: true },
      { hex: '#E8663D', name: 'Terracotta', active: true },
      { hex: '#2F6B57', name: 'Forest', active: true },
      { hex: '#6C9BD1', name: 'Sky blue', active: true },
      { hex: '#F2A7B8', name: 'Blush', active: true },
      { hex: '#12B5B0', name: 'Teal', active: true },
      { hex: '#8B4DFF', name: 'Violet', active: true },
    ],
  },
  hero: {
    headline: 'Make your walls unforgettable.',
    subheading: 'Grab the roller. Paint this wall.',
    description: '28+ years. 1,247 happy clients. 4.9/5. Professional interior & exterior painting, limewash and spray finishes across London and Surrey. Fully insured, spotlessly tidy.',
    primaryCtaText: 'Get a free quote',
    primaryCtaLink: '#contact',
    secondaryCtaText: 'Browse portfolio',
    secondaryCtaLink: '/portfolio',
    phoneBadge: '07309 092376',
    statsYears: '28+',
    statsClients: '1,247',
    statsRating: '4.9/5',
  },
  about: {
    tagline: 'WHO WE ARE',
    headline: 'Quality you can see.',
    subtitle: 'Passionate painters and decorating specialists dedicated to bringing craftsmanship, care, and clean luxury to every home.',
    bgImage: 'https://images.pexels.com/photos/27522843/pexels-photo-27522843/free-photo-of-studio-with-limewash-textured-walls-and-wood-armchair.jpeg?auto=compress&cs=tinysrgb&w=1350',
    storyTitle: 'Our Story & Heritage',
    storyText: 'Over nearly three decades, AR Matt & Gloss Decorators has grown from a dedicated local family business into London and Surrey’s premier independent decorating company. We combine time-honoured brush skills with the finest modern mineral and spray finishes.',
    stats: [
      { number: '28', suffix: '+', label: 'Years of experience' },
      { number: '1247', suffix: '', label: 'Happy clients' },
      { number: '1500', suffix: '+', label: 'Projects completed' },
      { number: '24/7', suffix: '', label: 'Customer support' },
    ],
    values: [
      { title: 'Spotless Cleanliness', desc: 'Full furniture & floor protection. Tidy every night.', icon: '🧹' },
      { title: 'Licensed & Insured', desc: 'Comprehensive £5M liability cover for total peace of mind.', icon: '🛡️' },
      { title: 'Artisan Preparation', desc: '90% of a lasting finish is in meticulous surface prep.', icon: '🎨' },
      { title: 'Guaranteed Results', desc: 'We only finish when you are 100% delighted.', icon: '⭐' },
    ],
  },
  announcement: {
    enabled: false,
    text: '✨ Free In-Home Colour Consultation with every Spring booking!',
    link: '/contact',
  },
  whatsapp: {
    enabled: true,
    phone: '447309092376',
    message: 'Hello AR Matt & Gloss! I would like to enquire about painting and decorating services.',
    label: 'Chat with Decorators',
  },
  company: {
    name: 'AR Matt & Gloss Decorators',
    phone1: '07309 092376',
    phone2: '02034 880652',
    email: 'contact@ar-mattandgloss-decorators.com',
    address: '23 Church Road, Richmond, Surrey TW9 2QA',
    hours: 'Mon–Sat: 8am – 5pm',
    coverage: 'Richmond, Surrey, Central London, and 30 miles around M25',
  },
  footer: {
    aboutText: 'Professional painters and decorators across Surrey, London and Greater London. We undertake jobs within Greater London areas and up to 30 miles outside M25.',
    logoUrl: 'https://horizons-cdn.hostinger.com/f595585e-4a4f-4dfc-a114-05631f9697b2/1275896739a421cf642ea5e88346c08b.png',
    contactHeading: 'Contact us',
    phone1: '07309 092376',
    phone2: '02034 880652',
    email: 'contact@ar-mattandgloss-decorators.com',
    address: '23 Church Road, Richmond, Surrey TW9 2QA',
    hoursHeading: 'Business hours',
    hoursWeekday: 'Monday to Friday: 8am – 5pm',
    hoursSaturday: 'Saturday: 8am – 5pm',
    hoursSunday: 'Sunday: on request',
    copyright: '© 2026 AR Matt & Gloss Decorators',
  },
};

// 3. Initial Seed Services
const SEED_SERVICES = [
  {
    id: 'SVC-1',
    slug: 'interior-painting',
    title: 'Interior Painting',
    sub: 'Walls, ceilings & woodwork',
    desc: 'Expertly painted interiors, from a single room to a complete home. Carefully prepared, beautifully finished.',
    kicker: 'THE ART OF A FRESH START',
    tint: '#FFF3CF',
    accent: '#F9D870',
    heroImage: 'https://horizons-cdn.hostinger.com/f595585e-4a4f-4dfc-a114-05631f9697b2/bfda9f33af15cb04141cba80a461381f.jpg',
    features: ['Premium paints & finishes', 'Colour advice included', 'Careful preparation'],
    startingPrice: '£450',
    active: true,
    order: 1,
  },
  {
    id: 'SVC-2',
    slug: 'exterior-painting',
    title: 'Exterior Painting',
    sub: 'Beautiful, lasting exteriors',
    desc: 'Weather-resistant masonry paints, sash window restoration, fascia and ironwork painting with high-durability protection.',
    kicker: 'WEATHERPROOF CURB APPEAL',
    tint: '#E4EDCF',
    accent: '#B5D17A',
    heroImage: 'https://horizons-cdn.hostinger.com/f595585e-4a4f-4dfc-a114-05631f9697b2/98172832b84b637c8e72182b631b5d17.jpg',
    features: ['Masonry coatings', 'Sash window restoration', 'Scaffolding optional'],
    startingPrice: '£950',
    active: true,
    order: 2,
  },
  {
    id: 'SVC-3',
    slug: 'limewash-specialist',
    title: 'Limewash Specialist',
    sub: 'Breathable, natural lime finish',
    desc: 'Hand-trowelled and brushed artisanal limewash with textured clouds of subtle tone that change gracefully with natural light.',
    kicker: 'NATURAL MINERAL ELEGANCE',
    tint: '#FCF0E8',
    accent: '#E8A578',
    heroImage: 'https://images.pexels.com/photos/27522843/pexels-photo-27522843/free-photo-of-studio-with-limewash-textured-walls-and-wood-armchair.jpeg?auto=compress&cs=tinysrgb&w=1350',
    features: ['Bauwerk / Roman Clay certified', 'Zero VOC & breathable', 'Cloud effect layering'],
    startingPrice: '£750',
    active: true,
    order: 3,
  },
  {
    id: 'SVC-4',
    slug: 'decorative-finishes',
    title: 'Decorative Finishes',
    sub: 'Venetian plaster & faux effects',
    desc: 'Polished plaster, Marmorino, microcement, and specialty textures creating tactile depth for statement architectural walls.',
    kicker: 'ARCHITECTURAL WALL ART',
    tint: '#F3E8FF',
    accent: '#C084FC',
    heroImage: 'https://horizons-cdn.hostinger.com/f595585e-4a4f-4dfc-a114-05631f9697b2/c5720d1bfe8b0637facfdb8c4598c171.jpg',
    features: ['Venetian plaster', 'Microcement & concrete look', 'Metallic glazes'],
    startingPrice: '£850',
    active: true,
    order: 4,
  },
  {
    id: 'SVC-5',
    slug: 'cabinet-refinishing',
    title: 'Spray Refinishing',
    sub: 'Kitchen units, doors & furniture',
    desc: 'Factory-smooth spray booth finish on existing kitchen cupboards, wardrobes, and bespoke joinery for a brand new kitchen look.',
    kicker: 'LIKE-NEW FACTORY FINISH',
    tint: '#FFE4E6',
    accent: '#FB7185',
    heroImage: 'https://horizons-cdn.hostinger.com/f595585e-4a4f-4dfc-a114-05631f9697b2/8ba755097ae612ca5ca2e1e96f5769fb.jpg',
    features: ['HVLP spray application', 'Catalysed polyurethane lacquer', 'fraction of replacement cost'],
    startingPrice: '£1,200',
    active: true,
    order: 5,
  },
  {
    id: 'SVC-6',
    slug: 'commercial-painting',
    title: 'Commercial Painting',
    sub: 'Offices, boutiques & retail',
    desc: 'Flexible out-of-hours painting and fast-turnaround commercial decorating with zero business downtime and immaculate results.',
    kicker: 'FAST OUT-OF-HOURS TURNAROUND',
    tint: '#E0F2FE',
    accent: '#38BDF8',
    heroImage: 'https://horizons-cdn.hostinger.com/f595585e-4a4f-4dfc-a114-05631f9697b2/b54ea55bc7b8c685428e70abf7dc1d32.jpg',
    features: ['Weekend / night work', 'Health & Safety compliant', 'Durable scrubbable finishes'],
    startingPrice: '£1,500',
    active: true,
    order: 6,
  },
];

// 4. Initial Seed Portfolio
const SEED_PORTFOLIO = [
  {
    id: 'PRJ-1',
    title: 'Living Room Transformation',
    category: 'Interior',
    imgBefore: 'https://horizons-cdn.hostinger.com/f595585e-4a4f-4dfc-a114-05631f9697b2/bfda9f33af15cb04141cba80a461381f.jpg',
    imgAfter: 'https://horizons-cdn.hostinger.com/f595585e-4a4f-4dfc-a114-05631f9697b2/f5ed7b606cf533a77de25540a1017ea4.jpg',
    editorialNote: 'Spaces made to feel like home',
    location: 'Richmond Upon Thames',
    active: true,
    order: 1,
  },
  {
    id: 'PRJ-2',
    title: 'Master Bedroom Suite',
    category: 'Interior',
    imgBefore: 'https://horizons-cdn.hostinger.com/f595585e-4a4f-4dfc-a114-05631f9697b2/527481712b60269a0d4b123030a6b736.jpg',
    imgAfter: 'https://horizons-cdn.hostinger.com/f595585e-4a4f-4dfc-a114-05631f9697b2/c13046f98b8b35e7b31523d0693b3d64.jpg',
    editorialNote: 'Spaces made to feel like home',
    location: 'Kensington, London',
    active: true,
    order: 2,
  },
  {
    id: 'PRJ-3',
    title: 'Kitchen Cabinet Spray Refinish',
    category: 'Interior',
    imgBefore: 'https://horizons-cdn.hostinger.com/f595585e-4a4f-4dfc-a114-05631f9697b2/8ba755097ae612ca5ca2e1e96f5769fb.jpg',
    imgAfter: 'https://horizons-cdn.hostinger.com/f595585e-4a4f-4dfc-a114-05631f9697b2/1a7bf25816b1b58901d555a3686cb44a.jpg',
    editorialNote: 'Spaces made to feel like home',
    location: 'Wimbledon, London',
    active: true,
    order: 3,
  },
  {
    id: 'PRJ-4',
    title: 'Victorian Townhouse Exterior',
    category: 'Exterior',
    imgBefore: 'https://horizons-cdn.hostinger.com/f595585e-4a4f-4dfc-a114-05631f9697b2/98172832b84b637c8e72182b631b5d17.jpg',
    imgAfter: 'https://horizons-cdn.hostinger.com/f595585e-4a4f-4dfc-a114-05631f9697b2/5861761c66ae7248702bfc0bb9ca2b9d.jpg',
    editorialNote: 'A first impression that lasts',
    location: 'Fulham, London',
    active: true,
    order: 4,
  },
  {
    id: 'PRJ-5',
    title: 'Heritage Front Door Painting',
    category: 'Exterior',
    imgBefore: 'https://horizons-cdn.hostinger.com/f595585e-4a4f-4dfc-a114-05631f9697b2/00cdb2fbe0eac1ae22b4ed767006b4d1.jpg',
    imgAfter: 'https://horizons-cdn.hostinger.com/f595585e-4a4f-4dfc-a114-05631f9697b2/d07c58a7b42a0ca28a9c2ff6a88bfa4f.jpg',
    editorialNote: 'A first impression that lasts',
    location: 'Chelsea, London',
    active: true,
    order: 5,
  },
];

// 5. Initial Seed Reviews
const SEED_REVIEWS = [
  {
    id: 'REV-1',
    n: 'Lisa Anderson',
    l: 'Hampstead, London',
    q: 'I can’t thank enough Jimmy and the team who was able to paint exterior of our house and most importantly repair my entire roof soffits and fascia in my four store house without need of putting £4k scaffolding. Incredible top notch work!',
    t: ['Exterior'],
    rating: 5,
    verified: true,
    active: true,
    order: 1,
  },
  {
    id: 'REV-2',
    n: 'Marcus Thompson',
    l: 'Kensington, London',
    q: 'Outstanding work from start to finish. The team was professional, punctual, and the quality of their painting exceeded my expectations. My living room looks absolutely stunning.',
    t: ['Interior'],
    rating: 5,
    verified: true,
    active: true,
    order: 2,
  },
  {
    id: 'REV-3',
    n: 'Priya Sharma',
    l: 'Fulham, London',
    q: 'I hired Jimmy and the team from AR Matt & Gloss for my entire home exterior. They were meticulous with preparation and the finish is flawless. Highly recommend their services.',
    t: ['Exterior'],
    rating: 5,
    verified: true,
    active: true,
    order: 3,
  },
  {
    id: 'REV-4',
    n: 'Elena Rodriguez',
    l: 'Paddington, London',
    q: 'The attention to detail was impressive. They took the time to protect all my furniture and cleaned up thoroughly each day. The color consultation was incredibly helpful.',
    t: ['Interior', 'Colour advice'],
    rating: 5,
    verified: true,
    active: true,
    order: 4,
  },
  {
    id: 'REV-5',
    n: 'James Chen',
    l: 'Putney, London',
    q: 'Professional team that delivered exactly what they promised. The cabinet refinishing transformed my kitchen completely. Great value for the quality of work.',
    t: ['Cabinets'],
    rating: 5,
    verified: true,
    active: true,
    order: 5,
  },
];

// Helper to read JSON
function readJson(file, fallback) {
  ensureDir();
  if (!fs.existsSync(file)) {
    fs.writeFileSync(file, JSON.stringify(fallback, null, 2), 'utf-8');
    return fallback;
  }
  try {
    const raw = fs.readFileSync(file, 'utf-8');
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

// Helper to write JSON
function writeJson(file, data) {
  ensureDir();
  fs.writeFileSync(file, JSON.stringify(data, null, 2), 'utf-8');
}

// Queries Handlers
export function getQueries() {
  return readJson(QUERIES_FILE, SEED_QUERIES);
}

export function saveQueries(queries) {
  writeJson(QUERIES_FILE, queries);
  return queries;
}

export function addQuery(query) {
  const all = getQueries();
  const newLead = {
    id: `LEAD-${1000 + all.length + 1}`,
    createdAt: new Date().toISOString(),
    status: 'New',
    notes: '',
    ...query,
  };
  all.unshift(newLead);
  saveQueries(all);
  return newLead;
}

export function updateQuery(id, updateData) {
  const all = getQueries();
  const idx = all.findIndex((q) => q.id === id || q._id === id);
  if (idx === -1) return null;
  all[idx] = { ...all[idx], ...updateData, updatedAt: new Date().toISOString() };
  saveQueries(all);
  return all[idx];
}

export function deleteQuery(id) {
  const all = getQueries();
  const filtered = all.filter((q) => q.id !== id && q._id !== id);
  saveQueries(filtered);
  return true;
}

// Settings Handlers
export function getSettings() {
  const data = readJson(SETTINGS_FILE, SEED_SETTINGS);
  return {
    ...SEED_SETTINGS,
    ...data,
    theme: { ...SEED_SETTINGS.theme, ...(data.theme || {}) },
    hero: { ...SEED_SETTINGS.hero, ...(data.hero || {}) },
    about: { ...SEED_SETTINGS.about, ...(data.about || {}) },
    announcement: { ...SEED_SETTINGS.announcement, ...(data.announcement || {}) },
    whatsapp: { ...SEED_SETTINGS.whatsapp, ...(data.whatsapp || {}) },
    company: { ...SEED_SETTINGS.company, ...(data.company || {}) },
    footer: { ...SEED_SETTINGS.footer, ...(data.footer || {}) },
  };
}

export function saveSettings(settings) {
  const cur = getSettings();
  const merged = {
    ...cur,
    ...settings,
    theme: { ...cur.theme, ...(settings.theme || {}) },
    hero: { ...cur.hero, ...(settings.hero || {}) },
    about: { ...cur.about, ...(settings.about || {}) },
    announcement: { ...cur.announcement, ...(settings.announcement || {}) },
    whatsapp: { ...cur.whatsapp, ...(settings.whatsapp || {}) },
    company: { ...cur.company, ...(settings.company || {}) },
    footer: { ...cur.footer, ...(settings.footer || {}) },
  };
  writeJson(SETTINGS_FILE, merged);
  return merged;
}

// Services Handlers
export function getServices() {
  return readJson(SERVICES_FILE, SEED_SERVICES);
}

export function saveServices(services) {
  writeJson(SERVICES_FILE, services);
  return services;
}

export function addService(svc) {
  const all = getServices();
  const item = {
    id: `SVC-${Date.now().toString(36)}`,
    active: true,
    order: all.length + 1,
    ...svc,
  };
  all.push(item);
  saveServices(all);
  return item;
}

export function updateService(idOrSlug, updateData) {
  const all = getServices();
  const idx = all.findIndex((s) => s.id === idOrSlug || s.slug === idOrSlug || s._id === idOrSlug);
  if (idx === -1) return null;
  all[idx] = { ...all[idx], ...updateData };
  saveServices(all);
  return all[idx];
}

export function deleteService(idOrSlug) {
  const all = getServices();
  const filtered = all.filter((s) => s.id !== idOrSlug && s.slug !== idOrSlug && s._id !== idOrSlug);
  saveServices(filtered);
  return true;
}

// Portfolio Handlers
export function getPortfolio() {
  return readJson(PORTFOLIO_FILE, SEED_PORTFOLIO);
}

export function savePortfolio(items) {
  writeJson(PORTFOLIO_FILE, items);
  return items;
}

export function addPortfolio(item) {
  const all = getPortfolio();
  const newItem = {
    id: `PRJ-${Date.now().toString(36)}`,
    active: true,
    order: all.length + 1,
    ...item,
  };
  all.push(newItem);
  savePortfolio(all);
  return newItem;
}

export function updatePortfolio(id, updateData) {
  const all = getPortfolio();
  const idx = all.findIndex((p) => p.id === id || p._id === id);
  if (idx === -1) return null;
  all[idx] = { ...all[idx], ...updateData };
  savePortfolio(all);
  return all[idx];
}

export function deletePortfolio(id) {
  const all = getPortfolio();
  const filtered = all.filter((p) => p.id !== id && p._id !== id);
  savePortfolio(filtered);
  return true;
}

// Reviews Handlers
export function getReviews() {
  return readJson(REVIEWS_FILE, SEED_REVIEWS);
}

export function saveReviews(reviews) {
  writeJson(REVIEWS_FILE, reviews);
  return reviews;
}

export function addReview(review) {
  const all = getReviews();
  const item = {
    id: `REV-${Date.now().toString(36)}`,
    active: true,
    verified: true,
    rating: 5,
    order: all.length + 1,
    ...review,
  };
  all.push(item);
  saveReviews(all);
  return item;
}

export function updateReview(id, updateData) {
  const all = getReviews();
  const idx = all.findIndex((r) => r.id === id || r._id === id);
  if (idx === -1) return null;
  all[idx] = { ...all[idx], ...updateData };
  saveReviews(all);
  return all[idx];
}

export function deleteReview(id) {
  const all = getReviews();
  const filtered = all.filter((r) => r.id !== id && r._id !== id);
  saveReviews(filtered);
  return true;
}
