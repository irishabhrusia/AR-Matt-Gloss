import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import Review from '@/lib/models/Review';
import { getReviews, addReview, updateReview, deleteReview, saveReviews } from '@/lib/storage';

// GET /api/reviews
export async function GET() {
  try {
    const db = await connectToDatabase();
    if (db) {
      let reviews = await Review.find().sort({ order: 1 }).lean();
      if (!reviews || reviews.length === 0) {
        const initial = getReviews();
        await Review.insertMany(initial);
        reviews = await Review.find().sort({ order: 1 }).lean();
      }
      return NextResponse.json({ success: true, source: 'mongodb', reviews });
    }

    const reviews = getReviews();
    return NextResponse.json({ success: true, source: 'local', reviews });
  } catch (err) {
    console.error('API GET /api/reviews error:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

// POST /api/reviews - Add customer review
export async function POST(request) {
  try {
    const body = await request.json();
    const db = await connectToDatabase();
    if (db) {
      const created = await Review.create(body);
      return NextResponse.json({ success: true, source: 'mongodb', review: created });
    }

    const created = addReview(body);
    return NextResponse.json({ success: true, source: 'local', review: created });
  } catch (err) {
    console.error('API POST /api/reviews error:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

// PUT /api/reviews - Update review or reorder
export async function PUT(request) {
  try {
    const body = await request.json();
    const db = await connectToDatabase();

    // Bulk update/reorder
    if (Array.isArray(body.reviews)) {
      if (db) {
        for (const item of body.reviews) {
          if (item._id) await Review.findByIdAndUpdate(item._id, item);
        }
        const refreshed = await Review.find().sort({ order: 1 }).lean();
        return NextResponse.json({ success: true, source: 'mongodb', reviews: refreshed });
      }
      const saved = saveReviews(body.reviews);
      return NextResponse.json({ success: true, source: 'local', reviews: saved });
    }

    const { id, _id, ...updateData } = body;
    const targetId = id || _id;
    if (db) {
      const updated = await Review.findByIdAndUpdate(targetId, updateData, { new: true });
      return NextResponse.json({ success: true, source: 'mongodb', review: updated });
    }

    const updated = updateReview(targetId, updateData);
    return NextResponse.json({ success: true, source: 'local', review: updated });
  } catch (err) {
    console.error('API PUT /api/reviews error:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

// DELETE /api/reviews - Delete review
export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    const db = await connectToDatabase();
    if (db) {
      await Review.findByIdAndDelete(id);
      return NextResponse.json({ success: true, source: 'mongodb', deleted: id });
    }

    deleteReview(id);
    return NextResponse.json({ success: true, source: 'local', deleted: id });
  } catch (err) {
    console.error('API DELETE /api/reviews error:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
