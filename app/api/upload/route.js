/**
 * POST /api/upload
 * Body: multipart/form-data with field `file`
 *
 * Uploads a file directly to Cloudinary and returns the secure URL.
 * Used by the onboarding wizard (logo/banner) and menu item editor (dish images).
 *
 * Auth: This endpoint can be called from authenticated pages only (no public access).
 * The route itself doesn't enforce auth so the Server Action / client page must ensure
 * only logged-in users can trigger uploads.
 */
import { cloudinary } from '@/lib/cloudinary';

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file');
    const folder = formData.get('folder') || 'menugo';

    if (!file || typeof file === 'string') {
      return Response.json({ error: 'No file provided.' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const result = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder,
          resource_type: 'auto',
          // Auto-optimize: compress + convert to WebP
          transformation: [{ quality: 'auto', fetch_format: 'auto' }],
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
      uploadStream.end(buffer);
    });

    return Response.json({
      success: true,
      url: result.secure_url,
      publicId: result.public_id,
      width: result.width,
      height: result.height,
    });
  } catch (error) {
    console.error('[Upload] Cloudinary error:', error);
    return Response.json(
      { error: 'Upload failed. Check Cloudinary credentials.' },
      { status: 500 }
    );
  }
}
