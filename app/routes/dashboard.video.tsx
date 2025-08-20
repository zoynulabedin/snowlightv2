import {
  LoaderFunctionArgs,
  ActionFunctionArgs,
  redirect,
} from "@remix-run/node";
import {
  useLoaderData,
  useActionData,
  Form,
  Link,
  useNavigate,
} from "@remix-run/react";
import { useState } from "react";
import { X, Upload } from "lucide-react";
import { db } from "~/lib/db";
import { validateSession } from "~/lib/auth";
import DashboardSidebar from "~/components/DashboardSidebar";

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

export async function action({ request }: ActionFunctionArgs) {
  try {
    const cookieHeader = request.headers.get("Cookie");
    const token = cookieHeader
      ?.split(";")
      .find((c) => c.trim().startsWith("auth-token="))
      ?.split("=")[1];

    if (!token) {
      return { error: "Unauthorized" };
    }

    const user = await validateSession(token);

    if (
      !user ||
      (!user.isAdmin &&
        !["ADMIN", "SUPER_ADMIN", "MODERATOR"].includes(user.role))
    ) {
      return { error: "Unauthorized" };
    }

    const formData = await request.formData();
    const intent = formData.get("intent") as string;
    const videoId = formData.get("videoId") as string;

    if (!videoId) {
      return { error: "Video ID is required" };
    }

    switch (intent) {
      case "toggle-publish": {
        const video = await db.video.findUnique({
          where: { id: videoId },
          select: { isPublished: true },
        });

        if (!video) {
          return { error: "Video not found" };
        }

        await db.video.update({
          where: { id: videoId },
          data: { isPublished: !video.isPublished },
        });

        return { success: "Video status updated successfully" };
      }

      case "delete": {
        await db.video.delete({
          where: { id: videoId },
        });

        return { success: "Video deleted successfully" };
      }

      default:
        return { error: "Invalid action" };
    }
  } catch (error) {
    console.error("Video dashboard action error:", error);
    return { error: "An error occurred while processing your request" };
  }
}

export default function VideoDashboard() {
  const loaderData = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<{
    success?: string;
    error?: string;
  }>({});
  const [uploadForm, setUploadForm] = useState({
    title: "",
    artistId: "",
    songId: "",
    genre: "POP",
    description: "",
    videoFile: null as File | null,
    thumbnailFile: null as File | null,
    videoPreviewUrl: "",
    thumbnailPreviewUrl: "",
  });
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Close modal and refresh data after successful upload
  const handleUploadComplete = (result: {
    file?: {
      title?: string;
      id?: string;
      url?: string;
      databaseId?: string;
    };
    cloudinary?: {
      secure_url?: string;
      public_id?: string;
      resource_type?: string;
    };
    success?: boolean;
  }) => {
    const videoTitle = result.file?.title || "video";

    // Clean up object URLs to prevent memory leaks
    if (uploadForm.videoPreviewUrl) {
      URL.revokeObjectURL(uploadForm.videoPreviewUrl);
    }

    if (uploadForm.thumbnailPreviewUrl) {
      URL.revokeObjectURL(uploadForm.thumbnailPreviewUrl);
    }

    setUploadStatus({
      success: `Successfully uploaded "${videoTitle}" to Cloudinary and saved to database!`,
    });

    // Close modal after a short delay to show success message
    setTimeout(() => {
      setIsModalOpen(false);
      resetForm();
      // Refresh the page to show new upload
      navigate(".", { replace: true });
    }, 2000);
  };

  // Show error in modal
  const handleUploadError = (error: string) => {
    console.error("Upload error:", error);
    setUploadStatus({
      error: error || "An unknown error occurred during upload",
    });
    setIsUploading(false);

    // Automatically clear error message after 10 seconds
    setTimeout(() => {
      if (setUploadStatus) {
        setUploadStatus((prev) => {
          if (prev.error === error) {
            return {}; // Only clear if it's still the same error
          }
          return prev;
        });
      }
    }, 10000);
  };

  // Reset status when closing modal
  const closeModal = () => {
    setIsModalOpen(false);
    resetForm();
  };

  // Reset form fields
  const resetForm = () => {
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
    setUploadProgress(0);
    setIsUploading(false);
  };

  // Handle input changes
  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    setUploadForm((prev) => ({ ...prev, [name]: value }));
  };

  // Handle video file selection
  const handleVideoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];

      if (!file.type.startsWith("video/")) {
        handleUploadError("Please select a video file");
        return;
      }

      setUploadForm((prev) => ({
        ...prev,
        videoFile: file,
        videoPreviewUrl: URL.createObjectURL(file),
      }));
    }
  };

  // Handle thumbnail file selection
  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];

      if (!file.type.startsWith("image/")) {
        handleUploadError("Please select an image file for the thumbnail");
        return;
      }

      setUploadForm((prev) => ({
        ...prev,
        thumbnailFile: file,
        thumbnailPreviewUrl: URL.createObjectURL(file),
      }));
    }
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!uploadForm.title.trim()) {
      handleUploadError("Please enter a title");
      return;
    }

    if (!uploadForm.artistId) {
      handleUploadError("Please select an artist");
      return;
    }

    if (!uploadForm.videoFile) {
      handleUploadError("Please select a video file");
      return;
    }

    // Check file type
    if (!uploadForm.videoFile.type.startsWith("video/")) {
      handleUploadError("Please select a valid video file");
      return;
    }

    // Check file size (500MB limit for videos)
    const MAX_VIDEO_SIZE = 500 * 1024 * 1024; // 500MB
    if (uploadForm.videoFile.size > MAX_VIDEO_SIZE) {
      handleUploadError("Video file is too large. Maximum size is 500MB.");
      return;
    }

    // Check thumbnail if provided
    if (uploadForm.thumbnailFile) {
      if (!uploadForm.thumbnailFile.type.startsWith("image/")) {
        handleUploadError("Please select a valid image file for thumbnail");
        return;
      }

      const MAX_THUMBNAIL_SIZE = 5 * 1024 * 1024; // 5MB
      if (uploadForm.thumbnailFile.size > MAX_THUMBNAIL_SIZE) {
        handleUploadError("Thumbnail image is too large. Maximum size is 5MB.");
        return;
      }
    }

    setIsUploading(true);
    setUploadStatus({});

    try {
      const formData = new FormData();
      formData.append("file", uploadForm.videoFile);
      formData.append("title", uploadForm.title);
      formData.append("artist", uploadForm.artistId);
      formData.append("song", uploadForm.songId || "");
      formData.append("genre", uploadForm.genre);
      formData.append("description", uploadForm.description || "");

      if (uploadForm.thumbnailFile) {
        formData.append("thumbnail", uploadForm.thumbnailFile);
      }

      const xhr = new XMLHttpRequest();

      // Track upload progress
      xhr.upload.addEventListener("progress", (event) => {
        if (event.lengthComputable) {
          const progress = Math.round((event.loaded / event.total) * 100);
          setUploadProgress(progress);
        }
      });

      // Handle completion
      xhr.addEventListener("load", () => {
        if (xhr.status === 200) {
          try {
            const result = JSON.parse(xhr.responseText);
            console.log("Upload successful:", result);
            handleUploadComplete(result);
          } catch (error) {
            console.error("Error parsing response:", error);
            handleUploadError("Error processing server response");
          }
        } else {
          let errorMessage = "Upload failed";

          try {
            const response = JSON.parse(xhr.responseText);
            errorMessage = response.error || errorMessage;
          } catch (e) {
            // If parsing fails, use the raw response text or default message
            errorMessage = xhr.responseText || errorMessage;
          }

          handleUploadError(errorMessage);
        }
      });

      // Handle network errors
      xhr.addEventListener("error", () => {
        handleUploadError(
          "Network error during upload. Please check your connection and try again."
        );
      });

      // Handle timeouts
      xhr.addEventListener("timeout", () => {
        handleUploadError(
          "Upload timed out. Please try again with a smaller file or better connection."
        );
      });

      // Set a timeout for large files
      xhr.timeout = 600000; // 10 minutes for video uploads

      // Send the request to the API upload endpoint
      xhr.open("POST", "/api/upload");
      xhr.send(formData);

      console.log("Upload started for:", uploadForm.title);
    } catch (error) {
      console.error("Upload error:", error);
      handleUploadError("Failed to initiate upload process");
      setIsUploading(false);
    }
  };

  // Handle case where loader data is null
  if (!loaderData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Loading...</h1>
          <p className="text-gray-600">
            Please wait while we load your dashboard.
          </p>
        </div>
      </div>
    );
  }

  const { user, videos, artists, songs } = loaderData;

  const filteredVideos = videos.filter(
    (video) =>
      video.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      video.artists.some((artistRel) =>
        (artistRel.artist.stageName || artistRel.artist.name)
          .toLowerCase()
          .includes(searchTerm.toLowerCase())
      ) ||
      (video.description || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

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
              <div className="flex-1 max-w-md">
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
              </div>
              <div className="ml-4 text-sm text-gray-500">
                {filteredVideos.length} of {videos.length} videos
              </div>
            </div>
          </div>

          {/* Status Messages */}
          {actionData?.success && (
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
                <p className="ml-3 text-green-800">{actionData.success}</p>
              </div>
            </div>
          )}

          {actionData?.error && (
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
                <p className="ml-3 text-red-800">{actionData.error}</p>
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
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredVideos.length === 0 ? (
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
                    filteredVideos.map((video) => (
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
                              <div className="text-sm font-medium text-gray-900">
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
                          <div className="text-sm text-gray-900">
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
                              href={video.videoUrl}
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

                            {/* Edit Button */}
                            <Link
                              to={`/dashboard/video/${video.id}`}
                              className="text-indigo-600 hover:text-indigo-900 inline-flex items-center px-2 py-1 text-xs rounded transition-colors"
                              title="Edit Video"
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
                                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                                />
                              </svg>
                            </Link>

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
                                type="submit"
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
            </div>
          </div>

          {/* Table Stats */}
          {videos.length > 0 && (
            <div className="mt-4 flex items-center justify-between text-sm text-gray-500">
              <div>
                Showing {filteredVideos.length} of {videos.length} videos
              </div>
              <div className="flex items-center space-x-4">
                <span>
                  Published: {videos.filter((v) => v.isPublished).length}
                </span>
                <span>
                  Draft: {videos.filter((v) => !v.isPublished).length}
                </span>
              </div>
            </div>
          )}
        </main>

        {/* Footer */}
        <footer className="bg-white border-t mt-8">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-500">
                © 2024 Music Platform. All rights reserved.
              </div>
              <div className="flex items-center space-x-4 text-sm text-gray-500">
                <span>Total Videos: {videos.length}</span>
                <span>•</span>
                <span>Admin: {user.username}</span>
              </div>
            </div>
          </div>
        </footer>
      </div>

      {/* Upload Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center">
                <Upload className="w-5 h-5 mr-2 text-purple-600" />
                Upload Video
              </h2>
              <button
                onClick={closeModal}
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
              )}

              {/* Custom Upload Form */}
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Title */}
                <div>
                  <label
                    htmlFor="videoTitle"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                  >
                    Video Title *
                  </label>
                  <input
                    id="videoTitle"
                    type="text"
                    name="title"
                    value={uploadForm.title}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    placeholder="Enter video title..."
                  />
                </div>

                {/* Artist and Song Dropdowns - 2 columns */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Artist Dropdown */}
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
                      {artists.map((artist) => (
                        <option key={artist.id} value={artist.id}>
                          {artist.stageName || artist.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Associated Song Dropdown */}
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
                      {songs.map((song) => (
                        <option key={song.id} value={song.id}>
                          {song.title}
                          {song.artists &&
                            song.artists.length > 0 &&
                            ` - ${song.artists[0].artist.name}`}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Genre */}
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
                    <option value="HIPHOP">Hip Hop</option>
                    <option value="ELECTRONIC">Electronic</option>
                    <option value="BALLAD">Ballad</option>
                    <option value="R&B">R&B</option>
                    <option value="INDIE">Indie</option>
                    <option value="FOLK">Folk</option>
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
                  ></textarea>
                </div>

                {/* File Upload Section */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Video File Upload */}
                  <div className="border-2 border-dashed rounded-lg p-4 text-center">
                    <input
                      type="file"
                      id="videoFile"
                      accept="video/*"
                      onChange={handleVideoFileChange}
                      className="hidden"
                    />

                    {!uploadForm.videoFile ? (
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
                            Upload Video File *
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
                          <div className="relative">
                            <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center">
                              <svg
                                className="w-8 h-8 text-purple-600"
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
                          </div>
                        </div>

                        <div className="text-sm text-gray-900 dark:text-white font-medium">
                          {uploadForm.videoFile.name}
                        </div>

                        <div className="flex justify-center space-x-2">
                          <label
                            htmlFor="videoFile"
                            className="text-xs text-purple-600 hover:text-purple-800 cursor-pointer"
                          >
                            Change
                          </label>
                          <button
                            type="button"
                            onClick={() =>
                              setUploadForm((prev) => ({
                                ...prev,
                                videoFile: null,
                                videoPreviewUrl: "",
                              }))
                            }
                            className="text-xs text-red-600 hover:text-red-800"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Thumbnail Upload */}
                  <div className="border-2 border-dashed rounded-lg p-4 text-center">
                    <input
                      type="file"
                      id="thumbnailFile"
                      accept="image/*"
                      onChange={handleThumbnailChange}
                      className="hidden"
                    />

                    {!uploadForm.thumbnailFile ? (
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
                            Upload Thumbnail (Optional)
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
                        {uploadForm.thumbnailPreviewUrl && (
                          <div className="flex items-center justify-center">
                            <img
                              src={uploadForm.thumbnailPreviewUrl}
                              alt="Thumbnail preview"
                              className="w-24 h-24 object-cover rounded-lg"
                            />
                          </div>
                        )}

                        <div className="text-sm text-gray-900 dark:text-white font-medium">
                          {uploadForm.thumbnailFile.name}
                        </div>

                        <div className="flex justify-center space-x-2">
                          <label
                            htmlFor="thumbnailFile"
                            className="text-xs text-blue-600 hover:text-blue-800 cursor-pointer"
                          >
                            Change
                          </label>
                          <button
                            type="button"
                            onClick={() =>
                              setUploadForm((prev) => ({
                                ...prev,
                                thumbnailFile: null,
                                thumbnailPreviewUrl: "",
                              }))
                            }
                            className="text-xs text-red-600 hover:text-red-800"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Progress Bar */}
                {isUploading && (
                  <div className="space-y-2">
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div
                        className="bg-purple-600 h-2.5 rounded-full transition-all duration-300"
                        style={{ width: `${uploadProgress}%` }}
                      ></div>
                    </div>
                    <p className="text-sm text-center text-gray-600 dark:text-gray-400">
                      Uploading... {uploadProgress}%
                    </p>
                  </div>
                )}

                {/* Submit Button */}
                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={
                      isUploading ||
                      !uploadForm.videoFile ||
                      !uploadForm.title ||
                      !uploadForm.artistId
                    }
                    className="px-6 py-2 bg-purple-600 text-white font-medium rounded-lg shadow hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:bg-gray-400 disabled:cursor-not-allowed"
                  >
                    {isUploading ? "Uploading..." : "Upload Video"}
                  </button>
                </div>
              </form>
            </div>

            {/* Modal Footer */}
            <div className="border-t border-gray-200 dark:border-gray-700 px-6 py-4 flex justify-end">
              <button
                onClick={closeModal}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
