import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import Query from '@/lib/models/Query';
import { getQueries, saveQueries } from '@/lib/storage';

// GET /api/queries - Fetch customer queries from MongoDB (or fallback)
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const search = searchParams.get('search');

    const db = await connectToDatabase();

    if (db) {
      const filter = {};
      if (status && status !== 'All') {
        filter.status = status;
      }
      if (search) {
        const regex = new RegExp(search, 'i');
        filter.$or = [
          { name: regex },
          { phone: regex },
          { postcode: regex },
          { email: regex },
          { service: regex },
        ];
      }

      const queries = await Query.find(filter).sort({ createdAt: -1 }).lean();
      return NextResponse.json({ success: true, source: 'mongodb', queries });
    }

    // Fallback if no MONGODB_URI is provided
    let queries = getQueries();
    if (status && status !== 'All') {
      queries = queries.filter((q) => q.status.toLowerCase() === status.toLowerCase());
    }
    if (search) {
      const s = search.toLowerCase();
      queries = queries.filter(
        (q) =>
          q.name?.toLowerCase().includes(s) ||
          q.phone?.includes(s) ||
          q.postcode?.toLowerCase().includes(s) ||
          q.email?.toLowerCase().includes(s) ||
          q.service?.toLowerCase().includes(s)
      );
    }
    queries.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
    return NextResponse.json({ success: true, source: 'local', queries });
  } catch (err) {
    console.error('API GET /api/queries error:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

// POST /api/queries - Save new customer query into MongoDB (or fallback)
export async function POST(request) {
  try {
    const body = await request.json();
    const { name, email, phone, service, budget, details, postcode, source } = body;

    if (!name && !phone) {
      return NextResponse.json(
        { success: false, error: 'Name or phone is required' },
        { status: 400 }
      );
    }

    const queryData = {
      id: `LEAD-${Math.floor(1000 + Math.random() * 9000)}`,
      name: name?.trim() || 'Anonymous Customer',
      email: email?.trim() || '',
      phone: phone?.trim() || '',
      postcode: postcode?.trim() || '',
      service: service || 'General Painting',
      budget: budget || 'Not specified',
      details: details?.trim() || 'No additional details provided.',
      source: source || 'Website Form',
      status: 'New',
      notes: '',
    };

    const db = await connectToDatabase();

    if (db) {
      const created = await Query.create(queryData);
      return NextResponse.json({ success: true, source: 'mongodb', query: created }, { status: 201 });
    }

    // Fallback if no MONGODB_URI is provided
    const queries = getQueries();
    queryData.createdAt = new Date().toISOString();
    queries.unshift(queryData);
    saveQueries(queries);

    return NextResponse.json({ success: true, source: 'local', query: queryData }, { status: 201 });
  } catch (err) {
    console.error('API POST /api/queries error:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

// PATCH /api/queries - Update status or notes in MongoDB (or fallback)
export async function PATCH(request) {
  try {
    const body = await request.json();
    const { id, status, notes } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: 'Query ID is required' }, { status: 400 });
    }

    const db = await connectToDatabase();

    if (db) {
      const update = {};
      if (status !== undefined) update.status = status;
      if (notes !== undefined) update.notes = notes;

      const updated = await Query.findOneAndUpdate({ id }, { $set: update }, { new: true }).lean();
      if (!updated) {
        return NextResponse.json({ success: false, error: 'Query not found' }, { status: 404 });
      }
      return NextResponse.json({ success: true, source: 'mongodb', query: updated });
    }

    // Fallback if no MONGODB_URI is provided
    const queries = getQueries();
    const index = queries.findIndex((q) => q.id === id);
    if (index === -1) {
      return NextResponse.json({ success: false, error: 'Query not found' }, { status: 404 });
    }
    if (status !== undefined) queries[index].status = status;
    if (notes !== undefined) queries[index].notes = notes;
    saveQueries(queries);

    return NextResponse.json({ success: true, source: 'local', query: queries[index] });
  } catch (err) {
    console.error('API PATCH /api/queries error:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

// DELETE /api/queries - Remove lead from MongoDB (or fallback)
export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, error: 'Query ID is required' }, { status: 400 });
    }

    const db = await connectToDatabase();

    if (db) {
      await Query.findOneAndDelete({ id });
      return NextResponse.json({ success: true, source: 'mongodb', message: 'Query deleted' });
    }

    // Fallback if no MONGODB_URI is provided
    let queries = getQueries();
    queries = queries.filter((q) => q.id !== id);
    saveQueries(queries);

    return NextResponse.json({ success: true, source: 'local', message: 'Query deleted' });
  } catch (err) {
    console.error('API DELETE /api/queries error:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
