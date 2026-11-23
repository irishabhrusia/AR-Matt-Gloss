import mongoose from 'mongoose';

const QuerySchema = new mongoose.Schema(
  {
    id: {
      type: String,
      required: true,
      unique: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      trim: true,
      default: '',
    },
    phone: {
      type: String,
      trim: true,
      default: '',
    },
    postcode: {
      type: String,
      trim: true,
      default: '',
    },
    service: {
      type: String,
      default: 'General Painting',
    },
    budget: {
      type: String,
      default: 'Not specified',
    },
    details: {
      type: String,
      default: '',
    },
    source: {
      type: String,
      default: 'Website Form',
    },
    status: {
      type: String,
      enum: ['New', 'Contacted', 'Quote Sent', 'Booked', 'Closed'],
      default: 'New',
    },
    notes: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

// Prevent re-compilation of model across hot reloads in Next.js
export default mongoose.models.Query || mongoose.model('Query', QuerySchema);
