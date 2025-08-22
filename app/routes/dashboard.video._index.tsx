import {
  type ActionFunctionArgs,
  type LoaderFunctionArgs,
} from "@remix-run/node";
import { useLoaderData, useActionData, Form } from "@remix-run/react";
import { redirect, json } from "@remix-run/node";
import { useEffect, useState } from "react";
import { Edit, Upload, X } from "lucide-react";
import {
  deleteFromCloudinary,
  getPublicIdFromUrl,
  uploadToCloudinary,
} from "~/lib/cloudinary";
import {
  createVideo,
  updateVideo,
  toggleVideoPublish,
  deleteVideo,
} from "~/lib/server";
import { db } from "~/lib/db";
import { validateSession } from "~/lib/auth";

interface Video {
  id: string;
  title: string;
  description: string | null;
  videoUrl: string | null;
  thumbnailUrl: string | null;
  duration: number | null;
  genre: string | null;
  isPublished: boolean;
  views: number;
  likes: number;
  createdAt: string | Date;
  artists: Array<{
    artist: {
      id: string;
      name: string;
      stageName: string | null;
    };
  }>;
  song: {
    id: string;
    title: string;
  } | null;
}

interface Artist {
  id: string;
  name: string;
  stageName: string | null;
}

interface Song {
  id: string;
  title: string;
  artists: Array<{
    artist: {
      name: string;
    };
  }>;
}

export async function loader({ request }: LoaderFunctionArgs) {
  try {
    const cookieHeader = request.headers.get("Cookie");
    const token = cookieHeader
      ?.split(";")
      .find((c) => c.trim().startsWith("auth-token="))
      ?.split("=")[1];

    if (!token) {
      console.log("No token found, redirecting to login");
      throw redirect("/login");
    }

    const user = await validateSession(token);
    console.log("User validation result:", user);

    if (
      !user ||
      (!user.isAdmin &&
        !["ADMIN", "SUPER_ADMIN", "MODERATOR"].includes(user.role))
    ) {
      console.log("User not authorized:", {
        isAdmin: user?.isAdmin,
        role: user?.role,
      });
      throw redirect("/login");
    }

    // Get videos with relationships
    const videos = await db.video.findMany({
      include: {
        artists: {
          include: {
            artist: {
              select: {
                id: true,
                name: true,
                stageName: true,
              },
            },
          },
        },
        song: {
          select: {
            id: true,
            title: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Get all artists for dropdown
    const artists = await db.artist.findMany({
      select: {
        id: true,
        name: true,
        stageName: true,
      },
      orderBy: {
        name: "asc",
      },
    });

    // Get all songs for dropdown (for associating videos with songs)
    const songs = await db.song.findMany({
      select: {
        id: true,
        title: true,
        artists: {
          include: {
            artist: {
              select: {
                name: true,
              },
            },
          },
        },
      },
      orderBy: {
        title: "asc",
      },
    });

    console.log("Videos fetched:", videos.length);
    return { user, videos, artists, songs };
  } catch (error) {
    console.error("Video dashboard loader error:", error);

    // If it's a redirect, let it through
    if (error instanceof Response) {
      throw error;
    }

    // For other errors, redirect to login
    throw redirect("/login");
  }
}

type ActionResponse =
  | { success: string; error?: never }
  | { error: string; success?: never };

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const intent = formData.get("intent") as string;
  const videoId = formData.get("videoId") as string;
  console.log(intent);
  // For create and edit, we don't require videoId
  if (intent !== "create" && intent !== "upload" && !videoId) {
    return json<ActionResponse>(
      { error: "Video ID is required" },
      { status: 400 }
    );
  }

  switch (intent) {
    case "upload": {
      const videoFile = formData.get("videoFile") as File;
      const thumbnailFile = formData.get("thumbnailFile") as File;
      const oldVideoUrl = formData.get("oldVideoUrl") as string;
      const oldThumbnailUrl = formData.get("oldThumbnailUrl") as string;

      try {
        // Delete old files from Cloudinary if they exist
        if (oldVideoUrl) {
          const videoId = getPublicIdFromUrl(oldVideoUrl);
          if (videoId) {
            await deleteFromCloudinary(videoId);
          }
        }

        if (oldThumbnailUrl) {
          const thumbnailId = getPublicIdFromUrl(oldThumbnailUrl);
          if (thumbnailId) {
            await deleteFromCloudinary(thumbnailId);
          }
        }

        // Upload new files to Cloudinary
        let videoUrl: string | undefined;
        let thumbnailUrl: string | undefined;

        if (videoFile) {
          const videoResult = await uploadToCloudinary(videoFile, {
            resource_type: "video",
            folder: "videos",
          });
          videoUrl = videoResult.secure_url;
        }

        if (thumbnailFile) {
          const thumbnailResult = await uploadToCloudinary(thumbnailFile, {
            resource_type: "image",
            folder: "thumbnails",
          });
          thumbnailUrl = thumbnailResult.secure_url;
        }

        return json({
          success: "Files uploaded successfully",
          urls: { videoUrl, thumbnailUrl },
        });
      } catch (error) {
        console.error("Error handling file upload:", error);
        return json<ActionResponse>(
          { error: "Failed to upload files" },
          { status: 500 }
        );
      }
    }

    // In the action function, modify the create and edit cases:

    case "create": {
      try {
        // Get form data
        const title = formData.get("title") as string;
        const artistId = formData.get("artistId") as string;
        const songId = (formData.get("songId") as string) || undefined;
        const genre = (formData.get("genre") as string) || undefined;
        const description =
          (formData.get("description") as string) || undefined;

        // Get files from formData
        const videoFile = formData.get("videoFile");
        const thumbnailFile = formData.get("thumbnailFile");

        // Validate required fields
        if (!title || !artistId) {
          return json<ActionResponse>(
            { error: "Title and artist are required" },
            { status: 400 }
          );
        }

        // Validate files exist and are File objects
        if (
          !videoFile ||
          !(videoFile instanceof File) ||
          videoFile.size === 0
        ) {
          return json<ActionResponse>(
            { error: "Video file is required" },
            { status: 400 }
          );
        }

        if (
          !thumbnailFile ||
          !(thumbnailFile instanceof File) ||
          thumbnailFile.size === 0
        ) {
          return json<ActionResponse>(
            { error: "Thumbnail file is required" },
            { status: 400 }
          );
        }

        // Validate file types
        const videoType = videoFile.type;
        const thumbnailType = thumbnailFile.type;

        if (!videoType || !videoType.startsWith("video/")) {
          return json<ActionResponse>(
            { error: "Invalid video file type" },
            { status: 400 }
          );
        }

        if (!thumbnailType || !thumbnailType.startsWith("image/")) {
          return json<ActionResponse>(
            { error: "Invalid thumbnail file type" },
            { status: 400 }
          );
        }

        // Upload video file
        const videoResult = await uploadToCloudinary(videoFile, {
          resource_type: "video",
          folder: "videos",
        });

        // Upload thumbnail file
        const thumbnailResult = await uploadToCloudinary(thumbnailFile, {
          resource_type: "image",
          folder: "thumbnails",
        });

        // Create video record
        const result = await createVideo({
          title,
          description,
          videoUrl: videoResult.secure_url,
          thumbnailUrl: thumbnailResult.secure_url,
          genre,
          artistId,
          songId: songId ?? "",
        });

        if ("error" in result) {
          return json<ActionResponse>(
            { error: result.error ?? "Failed to create video" },
            { status: 500 }
          );
        }

        return json<ActionResponse>({
          success: "Video created successfully",
        });
      } catch (error) {
        console.error("Error creating video:", error);
        return json<ActionResponse>(
          { error: "Failed to create video" },
          { status: 500 }
        );
      }
    }

    case "edit": {
      try {
        const videoId = formData.get("videoId") as string;
        if (!videoId) {
          return json<ActionResponse>(
            { error: "Video ID is required" },
            { status: 400 }
          );
        }

        // Get form data
        const title = formData.get("title") as string;
        const artistId = formData.get("artistId") as string;
        const songId = (formData.get("songId") as string) || undefined;
        const genre = (formData.get("genre") as string) || undefined;
        const description =
          (formData.get("description") as string) || undefined;

        // Get file data
        const videoFile = formData.get("videoFile") as File | null;
        const thumbnailFile = formData.get("thumbnailFile") as File | null;
        const oldVideoUrl = formData.get("oldVideoUrl") as string;
        const oldThumbnailUrl = formData.get("oldThumbnailUrl") as string;
        console.log(
          oldVideoUrl,
          oldThumbnailUrl,
          videoFile,
          thumbnailFile,
          description,
          genre,
          songId,
          title
        );
        // Validate required fields
        if (!title || !artistId) {
          return json<ActionResponse>(
            { error: "Title and artist are required" },
            { status: 400 }
          );
        }

        let videoUrl = oldVideoUrl;
        let thumbnailUrl = oldThumbnailUrl;

        // Handle video file if provided
        if (videoFile && videoFile instanceof File && videoFile.size > 0) {
          if (!videoFile.type || !videoFile.type.startsWith("video/")) {
            return json<ActionResponse>(
              { error: "Invalid video file type" },
              { status: 400 }
            );
          }

          // Delete old video if exists
          if (oldVideoUrl) {
            const oldVideoId = getPublicIdFromUrl(oldVideoUrl);
            if (oldVideoId) {
              await deleteFromCloudinary(oldVideoId);
            }
          }

          const videoResult = await uploadToCloudinary(videoFile, {
            resource_type: "video",
            folder: "videos",
          });
          videoUrl = videoResult.secure_url;
        }

        // Handle thumbnail file if provided
        if (
          thumbnailFile &&
          thumbnailFile instanceof File &&
          thumbnailFile.size > 0
        ) {
          if (!thumbnailFile.type || !thumbnailFile.type.startsWith("image/")) {
            return json<ActionResponse>(
              { error: "Invalid thumbnail file type" },
              { status: 400 }
            );
          }

          // Delete old thumbnail if exists
          if (oldThumbnailUrl) {
            const oldThumbnailId = getPublicIdFromUrl(oldThumbnailUrl);
            if (oldThumbnailId) {
              await deleteFromCloudinary(oldThumbnailId);
            }
          }

          const thumbnailResult = await uploadToCloudinary(thumbnailFile, {
            resource_type: "image",
            folder: "thumbnails",
          });
          thumbnailUrl = thumbnailResult.secure_url;
        }

        // Update video record
        const result = await updateVideo({
          id: videoId,
          title,
          description,
          videoUrl,
          thumbnailUrl,
          genre,
          artistId,
          songId: songId ?? "",
        });

        if ("error" in result) {
          return json<ActionResponse>(
            { error: result.error ?? "Failed to update video" },
            { status: 500 }
          );
        }

        return json<ActionResponse>({
          success: "Video updated successfully",
        });
      } catch (error) {
        console.error("Error updating video:", error);
        return json<ActionResponse>(
          { error: "Failed to update video" },
          { status: 500 }
        );
      }
    }

    case "toggle-publish": {
      const result = await toggleVideoPublish(videoId);

      if ("error" in result) {
        return json<ActionResponse>(
          { error: result.error ?? "Unknown error" },
          { status: 404 }
        );
      }

      return json<ActionResponse>({
        success: "Video status updated successfully",
      });
    }

    case "delete-video": {
      try {
        const videoUrl = formData.get("videoUrl") as string;
        const videoId = formData.get("videoId") as string;
        console.log(videoUrl, videoId);
        if (!videoUrl || !videoId) {
          return json<ActionResponse>(
            { error: "Video URL and ID are required" },
            { status: 400 }
          );
        }

        // Get the public ID from the video URL
        const publicId = getPublicIdFromUrl(videoUrl);
        if (!publicId) {
          return json<ActionResponse>(
            { error: "Invalid video URL" },
            { status: 400 }
          );
        }

        // Delete from Cloudinary
        await deleteFromCloudinary(publicId);

        // Update video record to remove video URL
        await db.video.update({
          where: { id: videoId },
          data: { videoUrl: "" },
        });

        return json<ActionResponse>({
          success: "Video removed successfully",
        });
      } catch (error) {
        console.error("Error deleting video:", error);
        return json<ActionResponse>(
          { error: "Failed to remove video" },
          { status: 500 }
        );
      }
    }
    // Add this case in your action function switch statement
    case "delete-thumbnail": {
      try {
        const thumbnailUrl = formData.get("thumbnailUrl") as string;
        const videoId = formData.get("videoId") as string;

        if (!thumbnailUrl || !videoId) {
          return json<ActionResponse>(
            { error: "Thumbnail URL and Video ID are required" },
            { status: 400 }
          );
        }

        const publicId = getPublicIdFromUrl(thumbnailUrl);
        if (!publicId) {
          return json<ActionResponse>(
            { error: "Invalid thumbnail URL" },
            { status: 400 }
          );
        }

        // Delete from Cloudinary
        await deleteFromCloudinary(publicId);

        // Update video record
        await db.video.update({
          where: { id: videoId },
          data: { thumbnailUrl: null },
        });

        return json<ActionResponse>({
          success: "Thumbnail removed successfully",
        });
      } catch (error) {
        console.error("Error deleting thumbnail:", error);
        return json<ActionResponse>(
          { error: "Failed to remove thumbnail" },
          { status: 500 }
        );
      }
    }
    // Add this case to the switch statement in the action function:
    case "delete": {
      try {
        const videoId = formData.get("videoId") as string;

        if (!videoId) {
          return json<ActionResponse>(
            { error: "Video ID is required" },
            { status: 400 }
          );
        }

        // First get the video details to get both URLs
        const video = await db.video.findUnique({
          where: { id: videoId },
          select: {
            videoUrl: true,
            thumbnailUrl: true,
          },
        });

        if (!video) {
          return json<ActionResponse>(
            { error: "Video not found" },
            { status: 404 }
          );
        }

        // Delete video file from Cloudinary if exists
        if (video.videoUrl) {
          const videoPublicId = getPublicIdFromUrl(video.videoUrl);
          if (videoPublicId) {
            await deleteFromCloudinary(videoPublicId);
          }
        }

        // Delete thumbnail from Cloudinary if exists
        if (video.thumbnailUrl) {
          const thumbnailPublicId = getPublicIdFromUrl(video.thumbnailUrl);
          if (thumbnailPublicId) {
            await deleteFromCloudinary(thumbnailPublicId);
          }
        }

        // Delete video record using server function
        const result = await deleteVideo(videoId);

        if ("error" in result) {
          return json<ActionResponse>(
            { error: result.error ?? "Failed to delete video" },
            { status: 500 }
          );
        }

        return json<ActionResponse>({
          success: "Video and associated files deleted successfully",
        });
      } catch (error) {
        console.error("Error deleting video:", error);
        return json<ActionResponse>(
          { error: "Failed to delete video" },
          { status: 500 }
        );
      }
    }
    default:
      return json<ActionResponse>({ error: "Invalid intent" }, { status: 400 });
  }
}

export default function VideoDashboard() {
  const loaderData = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [videoToDelete, setVideoToDelete] = useState<Video | null>(null);

  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [deleteIntent, setDeleteIntent] = useState<{
    type: "video" | "thumbnail";
    id: string;
    url: string;
  } | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 7;
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
  const [uploadStatus, setUploadStatus] = useState<{
    success?: string;
    error?: string;
  }>({});
  const [uploadForm, setUploadForm] = useState<{
    title: string;
    artistId: string;
    songId: string;
    genre: string;
    description: string;
    videoFile: File | null;
    thumbnailFile: File | null;
    videoPreviewUrl: string;
    thumbnailPreviewUrl: string;
  }>({
    title: "",
    artistId: "",
    songId: "",
    genre: "POP",
    description: "",
    videoFile: null,
    thumbnailFile: null,
    videoPreviewUrl: "",
    thumbnailPreviewUrl: "",
  });
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleteType, setDeleteType] = useState<"video" | "thumbnail" | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("");

  const { videos, artists, songs } = loaderData;

  const handleEditVideo = (video: Video) => {
    setSelectedVideo(video);
    setIsEditMode(true);
    setUploadForm({
      title: video.title,
      artistId: video.artists[0]?.artist.id || "",
      songId: video.song?.id || "",
      genre: video.genre ?? "",
      description: video.description || "",
      videoFile: null,
      thumbnailFile: null,
      videoPreviewUrl: video.videoUrl || "",
      thumbnailPreviewUrl: video.thumbnailUrl || "",
    });
    setIsModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!selectedVideo || !deleteType) return;
    setIsLoading(true);
    setLoadingMessage(`Deleting ${deleteType}...`);

    const formData = new FormData();
    formData.append("videoId", selectedVideo.id);
    formData.append("intent", `delete-${deleteType}`);

    try {
      const result = await fetch("/dashboard/video", {
        method: "POST",
        body: formData,
      });
      const response = await result.json();

      if (response.success) {
        setUploadStatus({ success: response.success });
        // Close all modals
        closeModals();
      } else {
        setUploadStatus({ error: response.error || "Failed to delete" });
      }
    } catch (error) {
      setUploadStatus({ error: "Failed to process delete request" });
    } finally {
      setIsLoading(false);
      setLoadingMessage("");
      setShowDeleteDialog(false);
      setDeleteType(null);
    }
  };

  const closeModals = () => {
    setIsModalOpen(false);
    setShowDeleteDialog(false);
    setIsEditMode(false);
    setSelectedVideo(null);
    setUploadForm({
      title: "",
      artistId: "",
      songId: "",
      genre: "POP",
      description: "",
      videoFile: null,
      thumbnailFile: null,
      videoPreviewUrl: "",
      thumbnailPreviewUrl: "",
    });
    setUploadStatus({});
    setIsLoading(false);
    setLoadingMessage("");
  };

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    setUploadForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleVideoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) {
      setUploadStatus({ error: "Video file is required" });
      return;
    }

    if (!file.type.startsWith("video/")) {
      setUploadStatus({ error: "Please select a valid video file" });
      return;
    }

    const MAX_SIZE = 500 * 1024 * 1024; // 500MB
    if (file.size > MAX_SIZE) {
      setUploadStatus({ error: "Video file is too large (max 500MB)" });
      return;
    }

    const url = URL.createObjectURL(file);
    setUploadForm((prev) => ({
      ...prev,
      videoFile: file,
      videoPreviewUrl: url,
    }));
    setUploadStatus({});
  };

  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setUploadStatus({ error: "Please select an image file" });
      return;
    }

    const MAX_SIZE = 5 * 1024 * 1024; // 5MB
    if (file.size > MAX_SIZE) {
      setUploadStatus({ error: "Image file is too large (max 5MB)" });
      return;
    }

    const url = URL.createObjectURL(file);
    setUploadForm((prev) => ({
      ...prev,
      thumbnailFile: file,
      thumbnailPreviewUrl: url,
    }));
  };

  const normalizedVideos: Video[] = videos.map((video: Video) => ({
    ...video,
    createdAt:
      typeof video.createdAt === "string"
        ? video.createdAt
        : video.createdAt instanceof Date
        ? video.createdAt.toISOString()
        : String(video.createdAt),
  }));

  const filteredVideos = normalizedVideos.filter(
    (video: Video) =>
      video.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      video.artists.some((artistRel) =>
        (artistRel.artist.stageName || artistRel.artist.name)
          .toLowerCase()
          .includes(searchTerm.toLowerCase())
      ) ||
      (video.description || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Pagination calculations
  const totalPages = Math.ceil(filteredVideos.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentVideos = filteredVideos.slice(startIndex, endIndex);

  const goToFirstPage = () => setCurrentPage(1);
  const goToLastPage = () => setCurrentPage(totalPages);
  const goToNextPage = () =>
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  const goPrevPage = () => setCurrentPage((prev) => Math.max(prev - 1, 1));

  useEffect(() => {
    // Cleanup URLs when component unmounts
    return () => {
      if (
        uploadForm.videoPreviewUrl &&
        !uploadForm.videoPreviewUrl.startsWith("http")
      ) {
        URL.revokeObjectURL(uploadForm.videoPreviewUrl);
      }
      if (
        uploadForm.thumbnailPreviewUrl &&
        !uploadForm.thumbnailPreviewUrl.startsWith("http")
      ) {
        URL.revokeObjectURL(uploadForm.thumbnailPreviewUrl);
      }
    };
  }, [uploadForm.videoPreviewUrl, uploadForm.thumbnailPreviewUrl]);

  // Modify the useEffect that handles action responses
  useEffect(() => {
    if (actionData && ("success" in actionData || "error" in actionData)) {
      // Reset loading states
      setIsSubmitting(false);
      setIsLoading(false);
      setLoadingMessage("");

      if ("success" in actionData) {
        // Only close specific modals based on the action
        if (
          actionData.success.includes("Video created") ||
          actionData.success.includes("Video updated")
        ) {
          // Close all modals for create/update
          setIsModalOpen(false);
          setShowDeleteDialog(false);
          setShowConfirmModal(false);
          setIsEditMode(false);
          setSelectedVideo(null);
          // Reset form
          setUploadForm({
            title: "",
            artistId: "",
            songId: "",
            genre: "POP",
            description: "",
            videoFile: null,
            thumbnailFile: null,
            videoPreviewUrl: "",
            thumbnailPreviewUrl: "",
          });
        } else if (actionData.success.includes("removed")) {
          // Only close the confirm modal for removals
          setShowConfirmModal(false);
          setDeleteIntent(null);

          // Update the form state if needed
          if (actionData.success.includes("Video removed")) {
            setUploadForm((prev) => ({
              ...prev,
              videoFile: null,
              videoPreviewUrl: "",
            }));
          } else if (actionData.success.includes("Thumbnail removed")) {
            setUploadForm((prev) => ({
              ...prev,
              thumbnailFile: null,
              thumbnailPreviewUrl: "",
            }));
          }
        }

        // Reset upload status
        setUploadStatus({});
      }

      // Clean up object URLs
      if ("success" in actionData) {
        if (
          actionData.success.includes("Video removed") &&
          uploadForm.videoPreviewUrl &&
          !uploadForm.videoPreviewUrl.startsWith("http")
        ) {
          URL.revokeObjectURL(uploadForm.videoPreviewUrl);
        } else if (
          actionData.success.includes("Thumbnail removed") &&
          uploadForm.thumbnailPreviewUrl &&
          !uploadForm.thumbnailPreviewUrl.startsWith("http")
        ) {
          URL.revokeObjectURL(uploadForm.thumbnailPreviewUrl);
        }
      }
    }
  }, [actionData]);
  return (
    <>
      {/* Main Content */}
      <div className="ml-10 w-full">
        {/* Header */}
        <header className="bg-white shadow-sm border-b">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Video Management
                </h1>
                <p className="text-gray-600 mt-1">Manage your video content</p>
              </div>
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors flex items-center"
                >
                  <svg
                    className="w-4 h-4 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 4v16m8-8H4"
                    />
                  </svg>
                  Upload Video
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="p-6">
          {/* Search and Filters */}
          <div className="mb-6">
            <div className="flex items-center justify-between">
              <div className="flex-1 max-w-md relative">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search videos, artists..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                  <svg
                    className="absolute left-3 top-2.5 h-5 w-5 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                </div>
                <div className="mt-2">
                  <span className="text-gray-500">
                    {filteredVideos.length} of {videos.length} videos
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Status Messages */}
          {actionData &&
            "success" in actionData &&
            typeof actionData.success === "string" && (
              <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex">
                  <svg
                    className="h-5 w-5 text-green-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <p className="ml-3 text-green-800">
                    {(actionData as { success: string }).success}
                  </p>
                </div>
              </div>
            )}

          {actionData &&
            "error" in actionData &&
            typeof (actionData as { error?: string }).error === "string" && (
              <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex">
                  <svg
                    className="h-5 w-5 text-red-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <p className="ml-3 text-red-800">
                    {(actionData as { error: string }).error}
                  </p>
                </div>
              </div>
            )}

          {/* Video Table */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Video Details
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Artist
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Associated Song
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Views
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Created
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>{" "}
                <tbody className="bg-white divide-y divide-gray-200">
                  {currentVideos.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-12 text-center">
                        <div className="flex flex-col items-center">
                          <svg
                            className="mx-auto h-12 w-12 text-gray-400"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                            />
                          </svg>
                          <h3 className="mt-2 text-sm font-medium text-gray-900">
                            No videos found
                          </h3>
                          <p className="mt-1 text-sm text-gray-500">
                            {searchTerm
                              ? "No videos match your search criteria."
                              : "Get started by uploading your first video."}
                          </p>
                          <div className="mt-6">
                            <button
                              onClick={() => setIsModalOpen(true)}
                              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700"
                            >
                              <svg
                                className="w-4 h-4 mr-2"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M12 4v16m8-8H4"
                                />
                              </svg>
                              Upload Video
                            </button>
                          </div>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredVideos
                      .slice(startIndex, endIndex)
                      .map((video: Video) => (
                        <tr key={video.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              {video.thumbnailUrl ? (
                                <img
                                  src={video.thumbnailUrl}
                                  alt={video.title}
                                  className="h-12 w-12 rounded-lg object-cover mr-4"
                                />
                              ) : (
                                <div className="h-12 w-12 rounded-lg bg-gray-200 flex items-center justify-center mr-4">
                                  <svg
                                    className="h-6 w-6 text-gray-400"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                                    />
                                  </svg>
                                </div>
                              )}
                              <div>
                                <div className="text-sm w-32 truncate font-medium text-gray-900">
                                  {video.title}
                                </div>
                                <div className="text-sm text-gray-500">
                                  {video.genre ? `${video.genre} • ` : ""}
                                  Duration:{" "}
                                  {video.duration
                                    ? `${Math.floor(
                                        video.duration / 60
                                      )}:${String(video.duration % 60).padStart(
                                        2,
                                        "0"
                                      )}`
                                    : "Unknown"}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm w-32 truncate text-gray-900">
                              {video.artists.length > 0
                                ? video.artists
                                    .map(
                                      (artistRel) =>
                                        artistRel.artist.stageName ||
                                        artistRel.artist.name
                                    )
                                    .join(", ")
                                : "No Artist"}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {video.song?.title || (
                                <span className="text-gray-400 italic">
                                  No Song
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {video.views.toLocaleString()}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                video.isPublished
                                  ? "bg-green-100 text-green-800"
                                  : "bg-yellow-100 text-yellow-800"
                              }`}
                            >
                              {video.isPublished ? "Published" : "Draft"}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(video.createdAt).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <div className="flex items-center justify-end space-x-2">
                              {/* View Button */}
                              <a
                                href={video.videoUrl ?? undefined}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:text-blue-900 inline-flex items-center px-2 py-1 text-xs rounded transition-colors"
                                title="View Video"
                              >
                                <svg
                                  className="w-4 h-4"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                                  />
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                                  />
                                </svg>
                              </a>

                              <button
                                onClick={() => handleEditVideo(video)}
                                className="px-3 flex justify-center items-center py-1 text-blue-800 rounded text-sm "
                              >
                                <Edit className="w-4 h-4" />
                              </button>

                              {/* Toggle Publish Button */}
                              <Form method="post" className="inline">
                                <input
                                  type="hidden"
                                  name="videoId"
                                  value={video.id}
                                />
                                <input
                                  type="hidden"
                                  name="intent"
                                  value="toggle-publish"
                                />
                                <button
                                  type="submit"
                                  className={`inline-flex items-center px-2 py-1 text-xs rounded transition-colors ${
                                    video.isPublished
                                      ? "text-yellow-600 hover:text-yellow-900"
                                      : "text-green-600 hover:text-green-900"
                                  }`}
                                  title={
                                    video.isPublished ? "Unpublish" : "Publish"
                                  }
                                >
                                  {video.isPublished ? (
                                    <svg
                                      className="w-4 h-4"
                                      fill="none"
                                      stroke="currentColor"
                                      viewBox="0 0 24 24"
                                    >
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21"
                                      />
                                    </svg>
                                  ) : (
                                    <svg
                                      className="w-4 h-4"
                                      fill="none"
                                      stroke="currentColor"
                                      viewBox="0 0 24 24"
                                    >
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                                      />
                                    </svg>
                                  )}
                                </button>
                              </Form>
                              {/* Delete Button */}
                              <Form
                                method="post"
                                className="inline"
                                onSubmit={(e) => {
                                  if (
                                    !confirm(
                                      `Are you sure you want to delete "${video.title}"? This action cannot be undone.`
                                    )
                                  ) {
                                    e.preventDefault();
                                  }
                                }}
                              >
                                <input
                                  type="hidden"
                                  name="videoId"
                                  value={video.id}
                                />
                                <input
                                  type="hidden"
                                  name="intent"
                                  value="delete"
                                />
                                <button
                                  onClick={() => setVideoToDelete(video)}
                                  className="text-red-600 hover:text-red-900 inline-flex items-center px-2 py-1 text-xs rounded transition-colors"
                                  title="Delete Video"
                                >
                                  <svg
                                    className="w-4 h-4"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                    />
                                  </svg>
                                </button>
                              </Form>
                            </div>
                          </td>
                        </tr>
                      ))
                  )}
                </tbody>
              </table>

              {/* Pagination Controls */}
              {filteredVideos.length > itemsPerPage && (
                <div className="mt-4 flex items-center justify-between bg-white px-4 py-3 border-t border-gray-200">
                  <div className="flex space-x-2">
                    <button
                      onClick={goToFirstPage}
                      disabled={currentPage === 1}
                      className="px-3 py-1 rounded bg-purple-500 text-white disabled:opacity-50 hover:bg-purple-600 transition-colors"
                    >
                      First
                    </button>
                    <button
                      onClick={goPrevPage}
                      disabled={currentPage === 1}
                      className="px-3 py-1 rounded bg-purple-500 text-white disabled:opacity-50 hover:bg-purple-600 transition-colors"
                    >
                      Previous
                    </button>
                  </div>
                  <span className="text-sm text-gray-600">
                    Page {currentPage} of {totalPages} ({startIndex + 1}-
                    {Math.min(endIndex, filteredVideos.length)} of{" "}
                    {filteredVideos.length} videos)
                  </span>
                  <div className="flex space-x-2">
                    <button
                      onClick={goToNextPage}
                      disabled={currentPage === totalPages}
                      className="px-3 py-1 rounded bg-purple-500 text-white disabled:opacity-50 hover:bg-purple-600 transition-colors"
                    >
                      Next
                    </button>
                    <button
                      onClick={goToLastPage}
                      disabled={currentPage === totalPages}
                      className="px-3 py-1 rounded bg-purple-500 text-white disabled:opacity-50 hover:bg-purple-600 transition-colors"
                    >
                      Last
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>

      {/* Upload Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center">
                <Upload className="w-5 h-5 mr-2 text-purple-600" />
                {isEditMode ? "Edit Video" : "Upload Video"}
              </h2>
              <button
                onClick={closeModals}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 focus:outline-none"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="px-6 py-4">
              {/* Status Messages */}
              {uploadStatus.success && (
                <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex">
                    <svg
                      className="h-5 w-5 text-green-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <p className="ml-3 text-green-800">
                      {uploadStatus.success}
                    </p>
                  </div>
                </div>
              )}
              {uploadStatus.error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex">
                    <svg
                      className="h-5 w-5 text-red-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <p className="ml-3 text-red-800">{uploadStatus.error}</p>
                  </div>
                </div>
              )}{" "}
              {/* Form */}
              <Form
                method="post"
                encType="multipart/form-data"
                className="space-y-6"
                onSubmit={() => {
                  setIsSubmitting(true);
                  setLoadingMessage(
                    isEditMode ? "Saving changes..." : "Uploading video..."
                  );
                }}
              >
                <input
                  type="hidden"
                  name="intent"
                  value={isEditMode ? "edit" : "create"}
                />

                {isEditMode && (
                  <>
                    <input
                      type="hidden"
                      name="videoId"
                      value={selectedVideo?.id}
                    />
                    <input
                      type="hidden"
                      name="oldVideoUrl"
                      value={selectedVideo?.videoUrl || ""}
                    />
                    <input
                      type="hidden"
                      name="oldThumbnailUrl"
                      value={selectedVideo?.thumbnailUrl || ""}
                    />
                  </>
                )}
                {/* Form Fields */}
                <div>
                  <label
                    htmlFor="videoTitle"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                  >
                    Title *
                  </label>
                  <input
                    id="videoTitle"
                    name="title"
                    type="text"
                    value={uploadForm.title}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    placeholder="Enter video title..."
                  />
                </div>
                {/* Artist Select */}
                <div>
                  <label
                    htmlFor="artistSelect"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                  >
                    Artist *
                  </label>
                  <select
                    id="artistSelect"
                    name="artistId"
                    value={uploadForm.artistId}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  >
                    <option value="">Select Artist</option>
                    {artists.map((artist: Artist) => (
                      <option key={artist.id} value={artist.id}>
                        {artist.stageName || artist.name}
                      </option>
                    ))}
                  </select>
                </div>
                {/* Song Select */}
                <div>
                  <label
                    htmlFor="songSelect"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                  >
                    Associated Song (Optional)
                  </label>
                  <select
                    id="songSelect"
                    name="songId"
                    value={uploadForm.songId}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  >
                    <option value="">No Associated Song</option>
                    {songs.map((song: Song) => (
                      <option key={song.id} value={song.id}>
                        {song.title}
                        {song.artists &&
                          song.artists.length > 0 &&
                          ` - ${song.artists[0].artist.name}`}
                      </option>
                    ))}
                  </select>
                </div>
                {/* Genre Select */}
                <div>
                  <label
                    htmlFor="genreSelect"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                  >
                    Genre
                  </label>
                  <select
                    id="genreSelect"
                    name="genre"
                    value={uploadForm.genre}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  >
                    <option value="POP">Pop</option>
                    <option value="ROCK">Rock</option>
                    <option value="HIP_HOP">Hip Hop</option>
                    <option value="RNB">R&B</option>
                    <option value="JAZZ">Jazz</option>
                    <option value="CLASSICAL">Classical</option>
                    <option value="OTHER">Other</option>
                  </select>
                </div>
                {/* Description */}
                <div>
                  <label
                    htmlFor="videoDescription"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                  >
                    Description
                  </label>
                  <textarea
                    id="videoDescription"
                    name="description"
                    value={uploadForm.description}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    placeholder="Enter description..."
                  />
                </div>
                {/* File Upload Section */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                  {/* Video File Upload */}
                  <div className="border-2 border-dashed rounded-lg p-4 text-center">
                    <input
                      type="file"
                      id="videoFile"
                      accept="video/*"
                      name="videoFile"
                      onChange={handleVideoFileChange}
                      className="hidden"
                    />

                    {!uploadForm.videoFile && !uploadForm.videoPreviewUrl ? (
                      <div className="space-y-3">
                        <div className="mx-auto w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center">
                          <svg
                            className="w-6 h-6 text-purple-600"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                            />
                          </svg>
                        </div>
                        <div>
                          <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                            {isEditMode
                              ? "Change Video File"
                              : "Upload Video File *"}
                          </h3>

                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            MP4, WebM, MOV (max 500MB)
                          </p>
                        </div>
                        <label
                          htmlFor="videoFile"
                          className="inline-flex items-center px-3 py-2 bg-purple-600 text-white text-sm font-medium rounded-md hover:bg-purple-700 cursor-pointer"
                        >
                          <Upload className="w-4 h-4 mr-2" />
                          Select Video
                        </label>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <div className="flex items-center justify-center">
                          <video
                            src={
                              uploadForm.videoPreviewUrl ||
                              (uploadForm.videoFile
                                ? URL.createObjectURL(uploadForm.videoFile)
                                : undefined)
                            }
                            className="max-h-40 rounded"
                            controls
                          >
                            <track
                              kind="captions"
                              src=""
                              srcLang="en"
                              label="English captions"
                              default
                            />
                          </video>
                        </div>
                        <div className="text-sm text-gray-900 dark:text-white font-medium">
                          {uploadForm.videoFile
                            ? uploadForm.videoFile.name
                            : "Current Video"}
                        </div>
                        <div className="flex justify-center space-x-2">
                          <label
                            htmlFor="videoFile"
                            className="text-xs text-purple-600 hover:text-purple-800 cursor-pointer"
                          >
                            Change
                          </label>
                          {isEditMode && selectedVideo?.videoUrl && (
                            <button
                              type="button"
                              onClick={() => {
                                setDeleteIntent({
                                  type: "video",
                                  id: selectedVideo.id,
                                  url: selectedVideo.videoUrl || "",
                                });
                                setShowConfirmModal(true);
                              }}
                              className="text-xs text-red-600 hover:text-red-800"
                            >
                              Remove
                            </button>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Thumbnail Upload */}
                  <div className="border-2 border-dashed rounded-lg p-4 text-center">
                    <input
                      type="file"
                      id="thumbnailFile"
                      name="thumbnailFile"
                      accept="image/*"
                      onChange={handleThumbnailChange}
                      className="hidden"
                    />

                    {!uploadForm.thumbnailFile &&
                    !uploadForm.thumbnailPreviewUrl ? (
                      <div className="space-y-3">
                        <div className="mx-auto w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                          <svg
                            className="w-6 h-6 text-blue-600"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                            />
                          </svg>
                        </div>
                        <div>
                          <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                            {isEditMode
                              ? "Change Thumbnail"
                              : "Upload Thumbnail"}
                          </h3>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            JPG, PNG, GIF (max 5MB)
                          </p>
                        </div>
                        <label
                          htmlFor="thumbnailFile"
                          className="inline-flex items-center px-3 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 cursor-pointer"
                        >
                          <Upload className="w-4 h-4 mr-2" />
                          Select Image
                        </label>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {(uploadForm.thumbnailPreviewUrl ||
                          uploadForm.thumbnailFile) && (
                          <>
                            <div className="flex items-center justify-center">
                              <img
                                src={
                                  uploadForm.thumbnailPreviewUrl ||
                                  (uploadForm.thumbnailFile
                                    ? URL.createObjectURL(
                                        uploadForm.thumbnailFile
                                      )
                                    : "")
                                }
                                alt="Thumbnail preview"
                                className="max-h-40 rounded object-cover"
                              />
                            </div>
                            <div className="text-sm text-gray-900 dark:text-white font-medium">
                              {uploadForm.thumbnailFile
                                ? uploadForm.thumbnailFile.name
                                : "Current Thumbnail"}
                            </div>
                            <div className="flex justify-center space-x-2">
                              <label
                                htmlFor="thumbnailFile"
                                className="text-xs text-blue-600 hover:text-blue-800 cursor-pointer"
                              >
                                Change
                              </label>
                              {isEditMode && uploadForm.thumbnailPreviewUrl && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    setDeleteIntent({
                                      type: "thumbnail",
                                      id: selectedVideo?.id || "",
                                      url: selectedVideo?.thumbnailUrl || "",
                                    });
                                    setShowConfirmModal(true);
                                  }}
                                  className="text-xs text-red-600 hover:text-red-800"
                                >
                                  Remove
                                </button>
                              )}
                            </div>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {isSubmitting && (
                  <div className="mt-4 text-center">
                    <div className="inline-flex items-center">
                      <svg
                        className="animate-spin -ml-1 mr-3 h-5 w-5 text-purple-600"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      <span className="text-sm text-gray-600">
                        {loadingMessage}
                      </span>
                    </div>
                  </div>
                )}
                {/* Submit Button */}
                <div className="flex justify-end mt-6">
                  <button
                    type="submit"
                    disabled={
                      isSubmitting ||
                      (!isEditMode && !uploadForm.videoFile) ||
                      !uploadForm.title ||
                      !uploadForm.artistId
                    }
                    className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 inline-flex items-center"
                  >
                    {isSubmitting ? (
                      <>
                        <svg
                          className="animate-spin -ml-1 mr-2 h-5 w-5 text-white"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                        {isEditMode ? "Saving..." : "Uploading..."}
                      </>
                    ) : isEditMode ? (
                      "Save Changes"
                    ) : (
                      "Upload Video"
                    )}
                  </button>
                </div>
              </Form>
            </div>
          </div>
        </div>
      )}
      {videoToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Confirm Delete
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Are you sure you want to delete "{videoToDelete.title}"? This
              action cannot be undone.
            </p>
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setVideoToDelete(null)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <Form method="post" className="inline">
                <input type="hidden" name="videoId" value={videoToDelete.id} />
                <input type="hidden" name="intent" value="delete" />
                <button
                  type="submit"
                  onClick={() => setVideoToDelete(null)}
                  className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                >
                  Delete
                </button>
              </Form>
            </div>
          </div>
        </div>
      )}
      {/* Delete Confirmation Dialog */}
      {showDeleteDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Confirm Delete
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Are you sure you want to delete this {deleteType}? This action
              cannot be undone.
            </p>
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setShowDeleteDialog(false)}
                disabled={isLoading}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                disabled={isLoading}
                className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Deleting...
                  </>
                ) : (
                  "Delete"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Loading Overlay */}
      {isLoading && !showDeleteDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 max-w-sm w-full">
            <div className="flex items-center justify-center space-x-3">
              <svg
                className="animate-spin h-8 w-8 text-purple-600"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              <span className="text-lg font-medium text-gray-900 dark:text-white">
                {loadingMessage || "Loading..."}
              </span>
            </div>
          </div>
        </div>
      )}
      {showConfirmModal && deleteIntent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Confirm Remove
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Are you sure you want to remove this {deleteIntent.type}? This
              action cannot be undone.
            </p>
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <Form
                method="post"
                onSubmit={() => {
                  setIsLoading(true);
                  setLoadingMessage(`Removing ${deleteIntent.type}...`);
                }}
              >
                <input
                  type="hidden"
                  name="intent"
                  value={`delete-${deleteIntent.type}`}
                />
                <input type="hidden" name="videoId" value={deleteIntent.id} />
                {deleteIntent.type === "thumbnail" ? (
                  <input
                    type="hidden"
                    name="thumbnailUrl"
                    value={deleteIntent.url}
                  />
                ) : (
                  <input
                    type="hidden"
                    name="videoUrl"
                    value={deleteIntent.url}
                  />
                )}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50 inline-flex items-center"
                >
                  {isLoading ? (
                    <>
                      <svg
                        className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Removing...
                    </>
                  ) : (
                    "Remove"
                  )}
                </button>
              </Form>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
