import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import Service from '@/lib/models/Service';
import { getServices, addService, updateService, deleteService, saveServices } from '@/lib/storage';

// GET /api/services
export async function GET() {
  try {
    const db = await connectToDatabase();
    if (db) {
      let services = await Service.find().sort({ order: 1 }).lean();
      if (!services || services.length === 0) {
        const initial = getServices();
        await Service.insertMany(initial);
        services = await Service.find().sort({ order: 1 }).lean();
      }
      return NextResponse.json({ success: true, source: 'mongodb', services });
    }

    const services = getServices();
    return NextResponse.json({ success: true, source: 'local', services });
  } catch (err) {
    console.error('API GET /api/services error:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

// POST /api/services - Add a new service
export async function POST(request) {
  try {
    const body = await request.json();
    const db = await connectToDatabase();
    if (db) {
      const created = await Service.create(body);
      return NextResponse.json({ success: true, source: 'mongodb', service: created });
    }

    const created = addService(body);
    return NextResponse.json({ success: true, source: 'local', service: created });
  } catch (err) {
    console.error('API POST /api/services error:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

// PUT /api/services - Update a service or reorder all
export async function PUT(request) {
  try {
    const body = await request.json();
    const db = await connectToDatabase();

    // If bulk update/reorder
    if (Array.isArray(body.services)) {
      if (db) {
        for (const item of body.services) {
          if (item._id) {
            await Service.findByIdAndUpdate(item._id, item);
          }
        }
        const refreshed = await Service.find().sort({ order: 1 }).lean();
        return NextResponse.json({ success: true, source: 'mongodb', services: refreshed });
      }
      const saved = saveServices(body.services);
      return NextResponse.json({ success: true, source: 'local', services: saved });
    }

    // Single item update
    const { id, slug, ...updateData } = body;
    if (db) {
      let updated;
      if (id) {
        updated = await Service.findByIdAndUpdate(id, updateData, { new: true });
      } else if (slug) {
        updated = await Service.findOneAndUpdate({ slug }, updateData, { new: true });
      }
      return NextResponse.json({ success: true, source: 'mongodb', service: updated });
    }

    const updated = updateService(id || slug, updateData);
    return NextResponse.json({ success: true, source: 'local', service: updated });
  } catch (err) {
    console.error('API PUT /api/services error:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

// DELETE /api/services - Delete a service
export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const slug = searchParams.get('slug');

    const db = await connectToDatabase();
    if (db) {
      if (id) await Service.findByIdAndDelete(id);
      else if (slug) await Service.findOneAndDelete({ slug });
      return NextResponse.json({ success: true, source: 'mongodb', deleted: id || slug });
    }

    deleteService(id || slug);
    return NextResponse.json({ success: true, source: 'local', deleted: id || slug });
  } catch (err) {
    console.error('API DELETE /api/services error:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
