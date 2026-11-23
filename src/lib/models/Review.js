import mongoose from 'mongoose';

const ReviewSchema = new mongoose.Schema(
  {
    n: { type: String, required: true }, // Customer name
    l: { type: String, default: 'London' }, // Location
    q: { type: String, required: true }, // Testimonial quote
    t: { type: [String], default: ['Interior'] }, // Service categories/tags
    rating: { type: Number, default: 5 },
    verified: { type: Boolean, default: true },
    active: { type: Boolean, default: true },
    order: { type: Number, default: 1 },
  },
  { timestamps: true }
);

export default mongoose.models.Review || mongoose.model('Review', ReviewSchema);
