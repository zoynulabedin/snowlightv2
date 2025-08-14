import { v2 as cloudinary } from "cloudinary";

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || "dsp05t7kx",
  api_key: process.env.CLOUDINARY_API_KEY || "139216956463782",
  api_secret:
    process.env.CLOUDINARY_API_SECRET || "CjJtN4dGhbh1qwpLLC00Zu_S3Tw",
});

export interface UploadResult {
  public_id: string;
  secure_url: string;
  resource_type: string;
  format: string;
  bytes: number;
  duration?: number;
  width?: number;
  height?: number;
  created_at: string;
}

export interface UploadOptions {
  resource_type: "auto" | "image" | "video" | "raw";
  folder?: string;
  public_id?: string;
  tags?: string[];
  transformation?: any;
}

export async function uploadToCloudinary(
  file: File | Buffer | string,
  options: UploadOptions = { resource_type: "auto" }
): Promise<UploadResult> {
  try {
    const result = await cloudinary.uploader.upload(file as string, {
      ...options,
      folder: options.folder || "Snowlight-music",
    });

    return {
      public_id: result.public_id,
      secure_url: result.secure_url,
      resource_type: result.resource_type,
      format: result.format,
      bytes: result.bytes,
      duration: result.duration,
      width: result.width,
      height: result.height,
      created_at: result.created_at,
    };
  } catch (error) {
    console.error("Cloudinary upload error:", error);
    throw new Error("Failed to upload file to Cloudinary");
  }
}

export async function deleteFromCloudinary(publicId: string): Promise<void> {
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    console.error("Cloudinary delete error:", error);
    throw new Error("Failed to delete file from Cloudinary");
  }
}

export function getCloudinaryUrl(
  publicId: string,
  options: {
    width?: number;
    height?: number;
    crop?: string;
    quality?: string;
    format?: string;
  } = {}
): string {
  return cloudinary.url(publicId, {
    ...options,
    secure: true,
  });
}

export function getAudioStreamUrl(publicId: string): string {
  return cloudinary.url(publicId, {
    resource_type: "video",
    secure: true,
  });
}

export function getVideoStreamUrl(
  publicId: string,
  quality: string = "auto"
): string {
  return cloudinary.url(publicId, {
    resource_type: "video",
    quality,
    secure: true,
  });
}

export default cloudinary;
