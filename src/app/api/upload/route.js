import { NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';
import { promises as fs } from 'fs';
import path from 'path';
import { getSettings } from '@/lib/storage';

export const dynamic = 'force-dynamic';

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file');

    if (!file) {
      return NextResponse.json({ success: false, error: 'No image file provided' }, { status: 400 });
    }

    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Get Cloudinary configuration from environment or settings
    let settings = null;
    try {
      settings = await getSettings();
    } catch (e) {
      // ignore
    }

    const cloudName = process.env.CLOUDINARY_CLOUD_NAME || settings?.cloudinary?.cloudName;
    const apiKey = process.env.CLOUDINARY_API_KEY || settings?.cloudinary?.apiKey;
    const apiSecret = process.env.CLOUDINARY_API_SECRET || settings?.cloudinary?.apiSecret;
    const cloudinaryUrl = process.env.CLOUDINARY_URL;

    // Check if Cloudinary is configured
    const hasCloudinary = (cloudName && apiKey && apiSecret) || cloudinaryUrl;

    if (hasCloudinary) {
      if (cloudinaryUrl) {
        cloudinary.config({ cloudinary_url: cloudinaryUrl, secure: true });
      } else {
        cloudinary.config({
          cloud_name: cloudName,
          api_key: apiKey,
          api_secret: apiSecret,
          secure: true,
        });
      }

      // Convert buffer to Data URI for Cloudinary upload
      const mimeType = file.type || 'image/jpeg';
      const base64Data = buffer.toString('base64');
      const dataUri = `data:${mimeType};base64,${base64Data}`;

      const uploadResult = await new Promise((resolve, reject) => {
        cloudinary.uploader.upload(
          dataUri,
          {
            folder: 'ar_matt_gloss',
            resource_type: 'image',
          },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        );
      });

      return NextResponse.json({
        success: true,
        url: uploadResult.secure_url,
        provider: 'cloudinary',
        public_id: uploadResult.public_id,
        format: uploadResult.format,
        bytes: uploadResult.bytes,
      });
    }

    // Fallback: Save locally into public/uploads
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
    await fs.mkdir(uploadsDir, { recursive: true });

    const originalName = file.name ? file.name.replace(/[^a-zA-Z0-9._-]/g, '_') : 'image.jpg';
    const timestamp = Date.now();
    const uniqueFileName = `${timestamp}-${originalName}`;
    const filePath = path.join(uploadsDir, uniqueFileName);

    await fs.writeFile(filePath, buffer);
    const localUrl = `/uploads/${uniqueFileName}`;

    return NextResponse.json({
      success: true,
      url: localUrl,
      provider: 'local',
      fileName: uniqueFileName,
      note: 'Saved locally. Add Cloudinary credentials to upload directly to Cloudinary cloud.',
    });
  } catch (error) {
    console.error('Image upload failed:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Image upload failed' },
      { status: 500 }
    );
  }
}
