import { v2 as cloudinary } from 'cloudinary';
import { UploadedFile } from 'express-fileupload';

// Configure Cloudinary
if (process.env.CLOUDINARY_CLOUD_NAME && 
    process.env.CLOUDINARY_API_KEY && 
    process.env.CLOUDINARY_API_SECRET) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
}

// Upload receipt to Cloudinary
export async function uploadReceipt(file: UploadedFile): Promise<string> {
  try {
    if (!process.env.CLOUDINARY_CLOUD_NAME) {
      throw new Error('Cloudinary not configured. Please add Cloudinary credentials to environment variables.');
    }

    // Convert buffer to base64
    const base64File = file.data.toString('base64');
    const dataURI = `data:${file.mimetype};base64,${base64File}`;

    // Upload to Cloudinary
    const result = await cloudinary.uploader.upload(dataURI, {
      folder: 'greekledger/receipts',
      resource_type: 'auto',
      public_id: `receipt_${Date.now()}`,
    });

    console.log(`✅ Receipt uploaded to Cloudinary: ${result.secure_url}`);
    return result.secure_url;
  } catch (error: any) {
    console.error('Cloudinary upload error:', error.message);
    throw new Error(`Failed to upload receipt: ${error.message}`);
  }
}

// Upload event image to Cloudinary
export async function uploadEventImage(file: UploadedFile): Promise<string> {
  try {
    if (!process.env.CLOUDINARY_CLOUD_NAME) {
      throw new Error('Cloudinary not configured');
    }

    const base64File = file.data.toString('base64');
    const dataURI = `data:${file.mimetype};base64,${base64File}`;

    const result = await cloudinary.uploader.upload(dataURI, {
      folder: 'greekledger/events',
      resource_type: 'image',
      transformation: [
        { width: 1200, height: 800, crop: 'limit' },
        { quality: 'auto' },
      ],
    });

    console.log(`✅ Event image uploaded to Cloudinary: ${result.secure_url}`);
    return result.secure_url;
  } catch (error: any) {
    console.error('Cloudinary upload error:', error.message);
    throw new Error(`Failed to upload image: ${error.message}`);
  }
}

// Delete file from Cloudinary
export async function deleteFile(publicId: string): Promise<boolean> {
  try {
    if (!process.env.CLOUDINARY_CLOUD_NAME) {
      return false;
    }

    const result = await cloudinary.uploader.destroy(publicId);
    return result.result === 'ok';
  } catch (error: any) {
    console.error('Cloudinary delete error:', error.message);
    return false;
  }
}

// Get optimized URL for display
export function getOptimizedUrl(publicId: string, options?: {
  width?: number;
  height?: number;
  quality?: string;
}): string {
  const { width = 800, height = 600, quality = 'auto' } = options || {};

  return cloudinary.url(publicId, {
    transformation: [
      { width, height, crop: 'limit' },
      { quality },
      { fetch_format: 'auto' },
    ],
  });
}

