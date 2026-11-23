import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import Portfolio from '@/lib/models/Portfolio';
import { getPortfolio, addPortfolio, updatePortfolio, deletePortfolio, savePortfolio } from '@/lib/storage';

// GET /api/portfolio
export async function GET() {
  try {
    const db = await connectToDatabase();
    if (db) {
      let items = await Portfolio.find().sort({ order: 1 }).lean();
      if (!items || items.length === 0) {
        const initial = getPortfolio();
        await Portfolio.insertMany(initial);
        items = await Portfolio.find().sort({ order: 1 }).lean();
      }
      return NextResponse.json({ success: true, source: 'mongodb', portfolio: items });
    }

    const portfolio = getPortfolio();
    return NextResponse.json({ success: true, source: 'local', portfolio });
  } catch (err) {
    console.error('API GET /api/portfolio error:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

// POST /api/portfolio - Add project
export async function POST(request) {
  try {
    const body = await request.json();
    const db = await connectToDatabase();
    if (db) {
      const created = await Portfolio.create(body);
      return NextResponse.json({ success: true, source: 'mongodb', project: created });
    }

    const created = addPortfolio(body);
    return NextResponse.json({ success: true, source: 'local', project: created });
  } catch (err) {
    console.error('API POST /api/portfolio error:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

// PUT /api/portfolio - Update project or reorder
export async function PUT(request) {
  try {
    const body = await request.json();
    const db = await connectToDatabase();

    // Bulk update/reorder
    if (Array.isArray(body.portfolio)) {
      if (db) {
        for (const item of body.portfolio) {
          if (item._id) await Portfolio.findByIdAndUpdate(item._id, item);
        }
        const refreshed = await Portfolio.find().sort({ order: 1 }).lean();
        return NextResponse.json({ success: true, source: 'mongodb', portfolio: refreshed });
      }
      const saved = savePortfolio(body.portfolio);
      return NextResponse.json({ success: true, source: 'local', portfolio: saved });
    }

    const { id, _id, ...updateData } = body;
    const targetId = id || _id;
    if (db) {
      const updated = await Portfolio.findByIdAndUpdate(targetId, updateData, { new: true });
      return NextResponse.json({ success: true, source: 'mongodb', project: updated });
    }

    const updated = updatePortfolio(targetId, updateData);
    return NextResponse.json({ success: true, source: 'local', project: updated });
  } catch (err) {
    console.error('API PUT /api/portfolio error:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

// DELETE /api/portfolio - Delete project
export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    const db = await connectToDatabase();
    if (db) {
      await Portfolio.findByIdAndDelete(id);
      return NextResponse.json({ success: true, source: 'mongodb', deleted: id });
    }

    deletePortfolio(id);
    return NextResponse.json({ success: true, source: 'local', deleted: id });
  } catch (err) {
    console.error('API DELETE /api/portfolio error:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
