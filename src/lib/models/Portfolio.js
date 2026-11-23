import mongoose from 'mongoose';

const PortfolioSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    category: { type: String, default: 'Interior' },
    imgBefore: { type: String, default: '' },
    imgAfter: { type: String, required: true },
    editorialNote: { type: String, default: 'Spaces made to feel like home' },
    location: { type: String, default: 'Surrey & London' },
    active: { type: Boolean, default: true },
    order: { type: Number, default: 1 },
  },
  { timestamps: true }
);

export default mongoose.models.Portfolio || mongoose.model('Portfolio', PortfolioSchema);
