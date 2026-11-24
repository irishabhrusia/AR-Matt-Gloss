import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import Setting from '@/lib/models/Setting';
import { getSettings, saveSettings } from '@/lib/storage';

// GET /api/settings - Fetch all global site settings
export async function GET() {
  try {
    const db = await connectToDatabase();

    if (db) {
      let setting = await Setting.findOne().lean();
      if (!setting) {
        const initial = getSettings();
        setting = await Setting.create(initial);
      }
      return NextResponse.json({ success: true, source: 'mongodb', settings: setting });
    }

    const settings = getSettings();
    return NextResponse.json({ success: true, source: 'local', settings });
  } catch (err) {
    console.error('API GET /api/settings error:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

// PUT /api/settings - Update global site settings
export async function PUT(request) {
  try {
    const body = await request.json();
    const db = await connectToDatabase();

    if (db) {
      let setting = await Setting.findOne();
      if (!setting) {
        setting = await Setting.create(body);
      } else {
        if (body.theme) setting.theme = { ...setting.theme, ...body.theme };
        if (body.hero) setting.hero = { ...setting.hero, ...body.hero };
        if (body.home) setting.home = { ...(setting.home || {}), ...body.home };
        if (body.about) setting.about = { ...setting.about, ...body.about };
        if (body.announcement) setting.announcement = { ...setting.announcement, ...body.announcement };
        if (body.whatsapp) setting.whatsapp = { ...setting.whatsapp, ...body.whatsapp };
        if (body.company) setting.company = { ...setting.company, ...body.company };
        if (body.footer) setting.footer = { ...setting.footer, ...body.footer };
        if (body.cloudinary) setting.cloudinary = { ...(setting.cloudinary || {}), ...body.cloudinary };
        await setting.save();
      }
      return NextResponse.json({ success: true, source: 'mongodb', settings: setting });
    }

    // Fallback if no MONGODB_URI is configured
    const updated = saveSettings(body);
    return NextResponse.json({ success: true, source: 'local', settings: updated });
  } catch (err) {
    console.error('API PUT /api/settings error:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
