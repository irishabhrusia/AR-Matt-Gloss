import mongoose from 'mongoose';

const SwatchSchema = new mongoose.Schema({
  hex: { type: String, required: true },
  name: { type: String, required: true },
  active: { type: Boolean, default: true },
});

const SettingSchema = new mongoose.Schema(
  {
    theme: {
      primaryColor: { type: String, default: '#c5a880' },
      accentColor: { type: String, default: '#12b5b0' },
      swatches: { type: [SwatchSchema], default: [] },
    },
    hero: {
      headline: { type: String, default: 'Make your walls unforgettable.' },
      subheading: { type: String, default: 'Grab the roller. Paint this wall.' },
      description: {
        type: String,
        default: '28+ years. 1,247 happy clients. 4.9/5. Professional interior & exterior painting, limewash and spray finishes across London and Surrey. Fully insured, spotlessly tidy.',
      },
      primaryCtaText: { type: String, default: 'Get a free quote' },
      primaryCtaLink: { type: String, default: '#contact' },
      secondaryCtaText: { type: String, default: 'Browse portfolio' },
      secondaryCtaLink: { type: String, default: '/portfolio' },
      phoneBadge: { type: String, default: '07309 092376' },
      statsYears: { type: String, default: '28+' },
      statsClients: { type: String, default: '1,247' },
      statsRating: { type: String, default: '4.9/5' },
    },
    about: {
      tagline: { type: String, default: 'WHO WE ARE' },
      headline: { type: String, default: 'Quality you can see.' },
      subtitle: {
        type: String,
        default: 'Passionate painters and decorating specialists dedicated to bringing craftsmanship, care, and clean luxury to every home.',
      },
      bgImage: {
        type: String,
        default: 'https://images.pexels.com/photos/27522843/pexels-photo-27522843/free-photo-of-studio-with-limewash-textured-walls-and-wood-armchair.jpeg?auto=compress&cs=tinysrgb&w=1350',
      },
      storyTitle: { type: String, default: 'Our Story & Heritage' },
      storyText: {
        type: String,
        default: 'Over nearly three decades, AR Matt & Gloss Decorators has grown from a dedicated local family business into London and Surrey’s premier independent decorating company. We combine time-honoured brush skills with the finest modern mineral and spray finishes.',
      },
      stats: {
        type: [
          {
            number: String,
            suffix: String,
            label: String,
          },
        ],
        default: [
          { number: '28', suffix: '+', label: 'Years of experience' },
          { number: '1247', suffix: '', label: 'Happy clients' },
          { number: '1500', suffix: '+', label: 'Projects completed' },
          { number: '24/7', suffix: '', label: 'Customer support' },
        ],
      },
      values: {
        type: [
          {
            title: String,
            desc: String,
            icon: String,
          },
        ],
        default: [
          { title: 'Spotless Cleanliness', desc: 'Full furniture & floor protection. Tidy every night.', icon: '🧹' },
          { title: 'Licensed & Insured', desc: 'Comprehensive £5M liability cover for total peace of mind.', icon: '🛡️' },
          { title: 'Artisan Preparation', desc: '90% of a lasting finish is in meticulous surface prep.', icon: '🎨' },
          { title: 'Guaranteed Results', desc: 'We only finish when you are 100% delighted.', icon: '⭐' },
        ],
      },
    },
    announcement: {
      enabled: { type: Boolean, default: false },
      text: { type: String, default: '✨ Free In-Home Colour Consultation with every Spring booking!' },
      link: { type: String, default: '/contact' },
    },
    whatsapp: {
      enabled: { type: Boolean, default: true },
      phone: { type: String, default: '447309092376' },
      message: { type: String, default: 'Hello AR Matt & Gloss! I would like to enquire about painting and decorating services.' },
      label: { type: String, default: 'Chat with Decorators' },
    },
    company: {
      name: { type: String, default: 'AR Matt & Gloss Decorators' },
      phone1: { type: String, default: '07309 092376' },
      phone2: { type: String, default: '02034 880652' },
      email: { type: String, default: 'contact@ar-mattandgloss-decorators.com' },
      address: { type: String, default: '23 Church Road, Richmond, Surrey TW9 2QA' },
      hours: { type: String, default: 'Mon–Sat: 8am – 5pm' },
      coverage: { type: String, default: 'Richmond, Surrey, Central London, and 30 miles around M25' },
    },
    cloudinary: {
      cloudName: { type: String, default: '' },
      apiKey: { type: String, default: '' },
      apiSecret: { type: String, default: '' },
    },
    footer: {
      aboutText: {
        type: String,
        default: 'Professional painters and decorators across Surrey, London and Greater London. We undertake jobs within Greater London areas and up to 30 miles outside M25.',
      },
      logoUrl: {
        type: String,
        default: 'https://horizons-cdn.hostinger.com/f595585e-4a4f-4dfc-a114-05631f9697b2/1275896739a421cf642ea5e88346c08b.png',
      },
      contactHeading: { type: String, default: 'Contact us' },
      phone1: { type: String, default: '07309 092376' },
      phone2: { type: String, default: '02034 880652' },
      email: { type: String, default: 'contact@ar-mattandgloss-decorators.com' },
      address: { type: String, default: '23 Church Road, Richmond, Surrey TW9 2QA' },
      hoursHeading: { type: String, default: 'Business hours' },
      hoursWeekday: { type: String, default: 'Monday to Friday: 8am – 5pm' },
      hoursSaturday: { type: String, default: 'Saturday: 8am – 5pm' },
      hoursSunday: { type: String, default: 'Sunday: on request' },
      copyright: { type: String, default: '© 2026 AR Matt & Gloss Decorators' },
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.Setting || mongoose.model('Setting', SettingSchema);
