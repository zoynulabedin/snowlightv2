import {
  json,
  LoaderFunctionArgs,
  ActionFunctionArgs,
  redirect,
} from "@remix-run/node";
import {
  Form,
  useLoaderData,
  useActionData,
  useNavigate,
} from "@remix-run/react";
import { useState } from "react";
import {
  Video,
  Upload,
  ArrowLeft,
  Save,
  Eye,
  EyeOff,
  CheckCircle,
  Clock,
  Play,
} from "lucide-react";
import { validateSession } from "~/lib/auth";
import { db } from "~/lib/db";

export async function loader({ request, params }: LoaderFunctionArgs) {
  const cookieHeader = request.headers.get("Cookie");
  const token = cookieHeader
    ?.split(";")
    .find((c) => c.trim().startsWith("auth-token="))
    ?.split("=")[1];

  if (!token) {
    return redirect("/login");
  }

  const user = await validateSession(token);
  if (!user) {
    return redirect("/login");
  }

  // If editing existing video
  if (params.id && params.id !== "new") {
    const video = await db.video.findUnique({
      where: { id: params.id },
      include: {
        artists: {
          include: {
            artist: true,
          },
        },
      },
    });

    if (!video) {
      throw new Response("Video not found", { status: 404 });
    }

    return json({ video, user, isEditing: true });
  }

  // For new video
  const artists = await db.artist.findMany({
    orderBy: { name: "asc" },
  });

  return json({ video: null, user, isEditing: false, artists });
}

export async function action({ request, params }: ActionFunctionArgs) {
  const cookieHeader = request.headers.get("Cookie");
  const token = cookieHeader
    ?.split(";")
    .find((c) => c.trim().startsWith("auth-token="))
    ?.split("=")[1];

  if (!token) {
    return redirect("/login");
  }

  const user = await validateSession(token);
  if (!user) {
    return redirect("/login");
  }

  const formData = await request.formData();
  const title = formData.get("title") as string;
  const description = formData.get("description") as string;
  const genre = formData.get("genre") as string;
  const language = formData.get("language") as string;
  const ageRating = formData.get("ageRating") as string;
  const artistIds = formData.getAll("artistIds") as string[];
  const isPublished = formData.get("isPublished") === "true";
  const isFeatured = formData.get("isFeatured") === "true";

  if (!title) {
    return json({ error: "Title is required" }, { status: 400 });
  }

  try {
    const isEditing = params.id && params.id !== "new";

    if (isEditing) {
      // Update existing video
      const video = await db.video.update({
        where: { id: params.id },
        data: {
          title,
          description,
          genre,
          language,
          ageRating,
          isPublished,
          isFeatured,
          // Update artists relationship
          artists: {
            deleteMany: {},
            create: artistIds.map((artistId) => ({
              artistId,
              role: "MAIN" as const,
            })),
          },
        },
        include: {
          artists: {
            include: {
              artist: true,
            },
          },
        },
      });

      return json({ success: "Video updated successfully", video });
    } else {
      // For new videos, we need video file upload
      return json(
        {
          error:
            "Video file upload not implemented in this form. Use the main upload page.",
        },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error("Action error:", error);
    return json({ error: "Failed to save video" }, { status: 500 });
  }
}

export default function VideoForm() {
  const loaderData = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const navigate = useNavigate();

  const video = "video" in loaderData ? loaderData.video : null;
  const isEditing = "isEditing" in loaderData ? loaderData.isEditing : false;
  const artists = "artists" in loaderData ? loaderData.artists : [];

  const [formData, setFormData] = useState({
    title: video?.title || "",
    description: video?.description || "",
    genre: video?.genre || "",
    language: video?.language || "KO",
    ageRating: video?.ageRating || "",
    isPublished: video?.isPublished || false,
    isFeatured: video?.isFeatured || false,
    selectedArtists: video?.artists?.map((va) => va.artistId) || [],
  });

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleArtistToggle = (artistId: string) => {
    setFormData((prev) => ({
      ...prev,
      selectedArtists: prev.selectedArtists.includes(artistId)
        ? prev.selectedArtists.filter((id) => id !== artistId)
        : [...prev.selectedArtists, artistId],
    }));
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => navigate("/dashboard/video")}
            className="p-2 rounded-lg bg-gray-800 hover:bg-gray-700 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <Video className="w-8 h-8 text-red-500" />
              {isEditing ? "Edit Video" : "Upload Video"}
            </h1>
            <p className="text-gray-400 mt-2">
              {isEditing
                ? "Update video information and settings"
                : "Upload and configure your video"}
            </p>
          </div>
        </div>

        {/* Success/Error Messages */}
        {actionData && "success" in actionData && (
          <div className="bg-green-900/20 border border-green-500 text-green-400 px-4 py-3 rounded-lg mb-6">
            {actionData.success}
          </div>
        )}
        {actionData && "error" in actionData && (
          <div className="bg-red-900/20 border border-red-500 text-red-400 px-4 py-3 rounded-lg mb-6">
            {actionData.error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Form */}
          <div className="lg:col-span-2">
            <Form method="post" className="space-y-6">
              {/* Video Preview */}
              {video?.videoUrl && (
                <div className="bg-gray-800 rounded-lg p-6">
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Play className="w-5 h-5" />
                    Video Preview
                  </h3>
                  <div className="aspect-video bg-black rounded-lg overflow-hidden">
                    <video
                      src={video.videoUrl}
                      controls
                      className="w-full h-full"
                      poster={video.thumbnailUrl || undefined}
                    />
                  </div>
                </div>
              )}

              {/* Basic Information */}
              <div className="bg-gray-800 rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-4">
                  Basic Information
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Title *
                    </label>
                    <input
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={(e) =>
                        handleInputChange("title", e.target.value)
                      }
                      className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500"
                      placeholder="Enter video title..."
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Description
                    </label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={(e) =>
                        handleInputChange("description", e.target.value)
                      }
                      rows={4}
                      className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500"
                      placeholder="Describe your video..."
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Genre
                      </label>
                      <select
                        name="genre"
                        value={formData.genre}
                        onChange={(e) =>
                          handleInputChange("genre", e.target.value)
                        }
                        className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                      >
                        <option value="">Select Genre</option>
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

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Language
                      </label>
                      <select
                        name="language"
                        value={formData.language}
                        onChange={(e) =>
                          handleInputChange("language", e.target.value)
                        }
                        className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                      >
                        <option value="KO">Korean</option>
                        <option value="EN">English</option>
                        <option value="JP">Japanese</option>
                        <option value="CN">Chinese</option>
                        <option value="OTHER">Other</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Age Rating
                    </label>
                    <select
                      name="ageRating"
                      value={formData.ageRating}
                      onChange={(e) =>
                        handleInputChange("ageRating", e.target.value)
                      }
                      className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                    >
                      <option value="">Select Age Rating</option>
                      <option value="전체 관람가">
                        전체 관람가 (All Ages)
                      </option>
                      <option value="12세 이상">12세 이상 (12+)</option>
                      <option value="15세 이상">15세 이상 (15+)</option>
                      <option value="19세 이상">19세 이상 (19+)</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Artists Selection */}
              {isEditing && artists && (
                <div className="bg-gray-800 rounded-lg p-6">
                  <h3 className="text-lg font-semibold mb-4">Artists</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-60 overflow-y-auto">
                    {artists.map((artist) => (
                      <label
                        key={artist.id}
                        className="flex items-center gap-3 p-3 rounded-lg bg-gray-700 hover:bg-gray-600 cursor-pointer transition-colors"
                      >
                        <input
                          type="checkbox"
                          name="artistIds"
                          value={artist.id}
                          checked={formData.selectedArtists.includes(artist.id)}
                          onChange={() => handleArtistToggle(artist.id)}
                          className="rounded border-gray-600 text-red-600 focus:ring-red-500 focus:ring-offset-gray-800"
                        />
                        <span className="text-white">
                          {artist.stageName || artist.name}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-4">
                <button
                  type="submit"
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white py-3 px-6 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                >
                  <Save className="w-5 h-5" />
                  {isEditing ? "Update Video" : "Save Video"}
                </button>

                <button
                  type="button"
                  onClick={() => navigate("/dashboard/video")}
                  className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
                >
                  Cancel
                </button>
              </div>
            </Form>
          </div>

          {/* Settings Sidebar */}
          <div className="space-y-6">
            {/* Publishing Settings */}
            <div className="bg-gray-800 rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-4">Publishing</h3>
              <div className="space-y-4">
                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    name="isPublished"
                    checked={formData.isPublished}
                    onChange={(e) =>
                      handleInputChange("isPublished", e.target.checked)
                    }
                    className="rounded border-gray-600 text-red-600 focus:ring-red-500 focus:ring-offset-gray-800"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      {formData.isPublished ? (
                        <Eye className="w-4 h-4 text-green-500" />
                      ) : (
                        <EyeOff className="w-4 h-4 text-gray-500" />
                      )}
                      <span className="font-medium">Published</span>
                    </div>
                    <p className="text-sm text-gray-400">
                      {formData.isPublished
                        ? "Video is visible to public"
                        : "Video is private"}
                    </p>
                  </div>
                </label>

                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    name="isFeatured"
                    checked={formData.isFeatured}
                    onChange={(e) =>
                      handleInputChange("isFeatured", e.target.checked)
                    }
                    className="rounded border-gray-600 text-red-600 focus:ring-red-500 focus:ring-offset-gray-800"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      {formData.isFeatured ? (
                        <CheckCircle className="w-4 h-4 text-yellow-500" />
                      ) : (
                        <Clock className="w-4 h-4 text-gray-500" />
                      )}
                      <span className="font-medium">Featured</span>
                    </div>
                    <p className="text-sm text-gray-400">
                      {formData.isFeatured
                        ? "Video appears in featured section"
                        : "Regular video"}
                    </p>
                  </div>
                </label>
              </div>
            </div>

            {/* Video Stats (if editing) */}
            {isEditing && video && (
              <div className="bg-gray-800 rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-4">Statistics</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Views</span>
                    <span className="font-medium">
                      {video.views.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Likes</span>
                    <span className="font-medium">
                      {video.likes.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Duration</span>
                    <span className="font-medium">
                      {video.duration
                        ? `${Math.floor(video.duration / 60)}:${(
                            video.duration % 60
                          )
                            .toString()
                            .padStart(2, "0")}`
                        : "N/A"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Created</span>
                    <span className="font-medium">
                      {new Date(video.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Upload New Video (if not editing) */}
            {!isEditing && (
              <div className="bg-gray-800 rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-4">Upload Video</h3>
                <p className="text-gray-400 mb-4">
                  To upload a new video file, please use the main upload page.
                </p>
                <button
                  type="button"
                  onClick={() => navigate("/upload")}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  <Upload className="w-5 h-5" />
                  Go to Upload Page
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
