import { json, type ActionFunctionArgs } from "@remix-run/node";
import { uploadToCloudinary } from "~/lib/cloudinary";
import { db } from "~/lib/db";
import { validateSession } from "~/lib/auth";
import {
  generateAudioThumbnail,
  generateVideoThumbnail,
} from "~/lib/audioThumbnail";

export async function action({ request }: ActionFunctionArgs) {
  if (request.method !== "POST") {
    return json({ error: "Method not allowed" }, { status: 405 });
  }

  // Check authentication
  const cookieHeader = request.headers.get("Cookie");
  const token = cookieHeader
    ?.split(";")
    .find((c) => c.trim().startsWith("auth-token="))
    ?.split("=")[1];

  if (!token) {
    return json({ error: "Authentication required" }, { status: 401 });
  }

  const user = await validateSession(token);
  if (!user) {
    return json({ error: "Invalid session" }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const thumbnailFile = formData.get("thumbnail") as File | null;
    const title = formData.get("title") as string;
    const artistName = formData.get("artist") as string;
    const album = formData.get("album") as string;
    const genre = formData.get("genre") as string;
    const description = formData.get("description") as string;

    if (!file) {
      return json({ error: "No file provided" }, { status: 400 });
    }

    // Validate file type
    const isAudio = file.type.startsWith("audio/");
    const isVideo = file.type.startsWith("video/");

    if (!isAudio && !isVideo) {
      return json(
        { error: "Invalid file type. Only audio and video files are allowed." },
        { status: 400 }
      );
    }

    // Validate file size (100MB for audio, 500MB for video)
    const maxSize = isAudio ? 100 * 1024 * 1024 : 500 * 1024 * 1024;
    if (file.size > maxSize) {
      return json(
        {
          error: `File too large. Maximum size is ${
            isAudio ? "100MB" : "500MB"
          }.`,
        },
        { status: 400 }
      );
    }

    // Convert file to base64 for Cloudinary upload
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const base64 = `data:${file.type};base64,${buffer.toString("base64")}`;

    // Upload main file to Cloudinary
    const uploadResult = await uploadToCloudinary(base64, {
      resource_type: isVideo ? "video" : "auto",
      folder: isAudio ? "bugs-music/audio" : "bugs-music/video",
      tags: [genre || "untagged", isAudio ? "audio" : "video"],
      public_id: `${Date.now()}_${file.name.replace(/\.[^/.]+$/, "")}`,
    });

    // Handle thumbnail upload if provided
    let thumbnailUrl = null;

    if (thumbnailFile && thumbnailFile.size > 0) {
      // Check if it's a valid image file
      if (!thumbnailFile.type.startsWith("image/")) {
        return json(
          { error: "Invalid thumbnail file type. Only images are allowed." },
          { status: 400 }
        );
      }

      // Upload thumbnail to Cloudinary
      try {
        const thumbArrayBuffer = await thumbnailFile.arrayBuffer();
        const thumbBuffer = Buffer.from(thumbArrayBuffer);
        const thumbBase64 = `data:${
          thumbnailFile.type
        };base64,${thumbBuffer.toString("base64")}`;

        const thumbnailResult = await uploadToCloudinary(thumbBase64, {
          resource_type: "image",
          folder: "bugs-music/thumbnails",
          tags: ["thumbnail", isAudio ? "audio" : "video"],
          public_id: `thumb_${Date.now()}_${thumbnailFile.name.replace(
            /\.[^/.]+$/,
            ""
          )}`,
        });

        thumbnailUrl = thumbnailResult.secure_url;
      } catch (thumbError) {
        console.error("Thumbnail upload error:", thumbError);
        // Continue with default thumbnail if thumbnail upload fails
      }
    }

    // Save to database
    let savedRecord;

    if (isAudio) {
      // Create or find artist
      let artistRecord = await db.artist.findFirst({
        where: { name: artistName || "Unknown Artist" },
      });

      if (!artistRecord) {
        artistRecord = await db.artist.create({
          data: {
            name: artistName || "Unknown Artist",
            stageName: artistName || "Unknown Artist",
            bio: `Artist: ${artistName || "Unknown Artist"}`,
            isVerified: false,
          },
        });
      }

      // Create song
      const defaultThumbnailUrl = generateAudioThumbnail(
        uploadResult.secure_url,
        title || file.name,
        artistName || "Unknown Artist"
      );

      // Use custom thumbnail if uploaded, otherwise use generated one
      const finalThumbnailUrl = thumbnailUrl || defaultThumbnailUrl;

      savedRecord = await db.song.create({
        data: {
          title: title || file.name.replace(/\.[^/.]+$/, ""),
          duration: Math.floor(uploadResult.duration || 180), // Default 3 minutes if no duration
          genre: genre || "POP",
          language: "KO",
          audioUrl: uploadResult.secure_url,
          coverImage: finalThumbnailUrl, // Use custom thumbnail or generated one
          description: description || "",
          isPublished: true,
          isApproved: true,
          isFeatured: true,
          plays: 0,
          likes: 0,
          uploadedById: user.id, // Associate with authenticated user
          artists: {
            create: {
              artistId: artistRecord.id,
              role: "MAIN",
            },
          },
        },
        include: {
          artists: {
            include: { artist: true },
          },
        },
      });
    } else {
      // Create or find artist for video
      let artistRecord = await db.artist.findFirst({
        where: { name: artistName || "Unknown Artist" },
      });

      if (!artistRecord) {
        artistRecord = await db.artist.create({
          data: {
            name: artistName || "Unknown Artist",
            stageName: artistName || "Unknown Artist",
            bio: `Artist: ${artistName || "Unknown Artist"}`,
            isVerified: false,
          },
        });
      }

      // Create video
      const defaultThumbnailUrl = generateVideoThumbnail(
        uploadResult.secure_url,
        title || file.name,
        artistName || "Unknown Artist"
      );

      // Use custom thumbnail if uploaded, otherwise use generated one
      const finalThumbnailUrl = thumbnailUrl || defaultThumbnailUrl;

      savedRecord = await db.video.create({
        data: {
          title: title || file.name.replace(/\.[^/.]+$/, ""),
          duration: Math.floor(uploadResult.duration || 180),
          videoUrl: uploadResult.secure_url,
          thumbnailUrl: finalThumbnailUrl, // Use custom thumbnail or generated one
          description: description || "",
          isPublished: true,
          isApproved: true,
          views: 0,
          likes: 0,
          artists: {
            create: {
              artistId: artistRecord.id,
              role: "MAIN",
            },
          },
        },
        include: {
          artists: {
            include: { artist: true },
          },
        },
      });
    }

    // Store metadata with safer property access
    const metadata = {
      id: uploadResult.public_id,
      title: title || file.name,
      artist: artistName || "Unknown Artist",
      album: album || "Unknown Album",
      genre: genre || "Unknown",
      description: description || "",
      fileType: isAudio ? "audio" : "video",
      originalName: file.name,
      size: file.size,
      duration: uploadResult.duration,
      url: uploadResult.secure_url,
      thumbnailUrl: thumbnailUrl, // Use the custom thumbnail URL if available
      uploadedAt: new Date().toISOString(),
      databaseId: savedRecord.id,
      hasCustomThumbnail: !!thumbnailUrl,
    };

    return json({
      success: true,
      file: metadata,
      cloudinary: uploadResult,
    });
  } catch (error) {
    console.error("Upload error:", error);
    return json(
      {
        error: error instanceof Error ? error.message : "Upload failed",
      },
      { status: 500 }
    );
  }
}
