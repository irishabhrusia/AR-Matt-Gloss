import mongoose from 'mongoose';

const ServiceSchema = new mongoose.Schema(
  {
    slug: { type: String, required: true, unique: true },
    title: { type: String, required: true },
    sub: { type: String, default: '' },
    desc: { type: String, default: '' },
    kicker: { type: String, default: 'EXPERT CRAFTSMANSHIP' },
    tint: { type: String, default: '#FFF3CF' },
    accent: { type: String, default: '#F9D870' },
    heroImage: { type: String, default: '' },
    features: { type: [String], default: [] },
    discoverImages: { type: [String], default: [] },
    startingPrice: { type: String, default: '£450' },
    active: { type: Boolean, default: true },
    order: { type: Number, default: 1 },
  },
  { timestamps: true }
);

export default mongoose.models.Service || mongoose.model('Service', ServiceSchema);
