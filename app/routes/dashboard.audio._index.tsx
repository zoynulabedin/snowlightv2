import {
  LoaderFunctionArgs,
  ActionFunctionArgs,
  redirect,
  json,
} from "@remix-run/node";
import {
  Link,
  useLoaderData,
  useSearchParams,
  Form,
  useActionData,
} from "@remix-run/react";
import { db } from "~/lib/db";
import { validateSession } from "~/lib/auth";
import { useEffect, useState } from "react";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { Prisma } from "@prisma/client";
import {
  deleteFromCloudinary,
  getPublicIdFromUrl,
  uploadToCloudinary,
} from "../lib/cloudinary";

export async function loader({ request }: LoaderFunctionArgs) {
  const cookieHeader = request.headers.get("Cookie");
  const token =
    cookieHeader
      ?.split(";")
      .find((c) => c.trim().startsWith("auth-token="))
      ?.split("=")[1] ?? "";
  const user = await validateSession(token);
  if (!user) return redirect("/login");
  // Get page and search from URL
  const url = new URL(request.url);
  const page = parseInt(url.searchParams.get("page") || "1", 10);
  const search = url.searchParams.get("search") || "";
  const limit = 7;
  const skip = (page - 1) * limit;

  const whereClause = search
    ? {
        OR: [
          { title: { contains: search, mode: Prisma.QueryMode.insensitive } },
          {
            artists: {
              some: {
                artist: {
                  name: {
                    contains: search,
                    mode: Prisma.QueryMode.insensitive,
                  },
                },
              },
            },
          },
        ],
      }
    : {};

  // Get total count for pagination with search
  const totalSongs = await db.song.count({ where: whereClause });
  const totalPages = Math.ceil(totalSongs / limit);

  // Validate page number
  if (page < 1 || page > totalPages) {
    return redirect("/dashboard/audio?page=1");
  }
  const songs = await db.song.findMany({
    where: whereClause,
    skip,
    take: limit,
    select: {
      id: true,
      title: true,
      duration: true,
      genre: true,
      audioUrl: true,
      isPublished: true,
      isApproved: true,
      isFeatured: true,
      createdAt: true,
      coverImage: true,
      uploadedBy: {
        select: {
          id: true,
          username: true,
          email: true,
        },
      },
      album: {
        select: {
          id: true,
          title: true,
        },
      },
      artists: {
        select: {
          artist: {
            select: {
              id: true,
              name: true,
              stageName: true,
            },
          },
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  // Fetch albums and artists for the upload modal
  const albums = await db.album.findMany({
    select: {
      id: true,
      title: true,
    },
  });

  const artists = await db.artist.findMany({
    select: {
      id: true,
      name: true,
      stageName: true,
    },
  });
  return json({
    user,
    songs,
    albums,
    artists,
    totalPages,
    pagination: {
      currentPage: page,
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    },
  });
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
    const songId = formData.get("songId") as string;

    switch (intent) {
      // In your action function, update both cases:

      case "upload": {
        const title = formData.get("title") as string;
        const artistId = formData.get("artistId") as string;
        const albumId = (formData.get("albumId") as string) || null;
        const duration = formData.get("duration") as string;
        const genre = formData.get("genre") as string;
        const lyrics = formData.get("lyrics") as string;
        const audioFile = formData.get("audioFile") as File;
        const coverImage = formData.get("thumbnail") as File;

        if (!title || !artistId || !audioFile) {
          return { error: "Title, artist and audio file are required" };
        }

        try {
          // Upload audio file
          const audioResult = await uploadToCloudinary(audioFile, {
            resource_type: "video",
            folder: "audio",
          });

          // Upload cover image if provided
          let coverImageResult = null;
          if (coverImage) {
            coverImageResult = await uploadToCloudinary(coverImage, {
              resource_type: "image",
              folder: "covers",
            });
          }

          // Create song record
          // In your action function, update the upload case:
          const songData = {
            title,
            duration: duration ? parseInt(duration) : null,
            genre: genre || null,
            lyrics: lyrics || null,
            audioUrl: audioResult.secure_url,
            coverImage: coverImageResult?.secure_url || null,
            uploadedBy: {
              connect: { id: user.id }, // Changed from uploadedById to proper relation syntax
            },
            artists: {
              create: [{ artist: { connect: { id: artistId } } }],
            },
            album: albumId
              ? {
                  connect: { id: albumId },
                }
              : undefined,
          };

          if (albumId) {
            songData.album = { connect: { id: albumId } };
          }
          const newSong = await db.song.create({
            data: songData,
          });

          return { success: "Song uploaded successfully", songId: newSong.id };
        } catch (error) {
          console.error("Upload error:", error);
          return { error: "Failed to upload song" };
        }
      }

      case "edit-song": {
        const songId = formData.get("songId") as string;
        const title = formData.get("title") as string;
        const artistId = formData.get("artistId") as string;
        const albumId = (formData.get("albumId") as string) || null;
        const duration = formData.get("duration") as string;
        const genre = formData.get("genre") as string;
        const lyrics = formData.get("lyrics") as string;
        const audioFile = formData.get("audioFile") as File;
        const coverImage = formData.get("coverImage") as File;

        if (!songId || !title || !artistId) {
          return { error: "Required fields are missing" };
        }

        try {
          // Upload new audio file if provided
          let audioUpdate = {};
          if (audioFile && audioFile.size > 0) {
            const audioResult = await uploadToCloudinary(audioFile, {
              resource_type: "video",
              folder: "audio",
            });
            audioUpdate = {
              audioUrl: audioResult.secure_url,
            };
          }

          // Upload new cover image if provided
          let imageUpdate = {};
          if (coverImage && coverImage.size > 0) {
            const imageResult = await uploadToCloudinary(coverImage, {
              resource_type: "image",
              folder: "covers",
            });
            imageUpdate = {
              coverImage: imageResult.secure_url,
            };
          }

          // Update song record
          await db.song.update({
            where: { id: songId },
            data: {
              title,
              duration: duration ? parseInt(duration) : null,
              genre: genre || null,
              lyrics: lyrics || null,
              album: albumId
                ? { connect: { id: albumId } }
                : { disconnect: true },
              ...audioUpdate,
              ...imageUpdate,
              artists: {
                deleteMany: {},
                create: [{ artist: { connect: { id: artistId } } }],
              },
            },
          });

          return { success: "Song updated successfully" };
        } catch (error) {
          console.error("Edit error:", error);
          return { error: "Failed to update song" };
        }
      }

      case "toggle-publish": {
        if (!songId) {
          return { error: "Song ID is required" };
        }

        const song = await db.song.findUnique({
          where: { id: songId },
          select: { isPublished: true },
        });

        if (!song) {
          return { error: "Song not found" };
        }

        await db.song.update({
          where: { id: songId },
          data: { isPublished: !song.isPublished },
        });

        return { success: "Song status updated successfully" };
      }

      case "delete": {
        if (!songId) {
          return { error: "Song ID is required" };
        }
        await db.song.delete({
          where: { id: songId },
        });

        return { success: "Song deleted successfully" };
      }
      // Add to the switch statement in the action function
      case "update-status": {
        const songId = formData.get("songId") as string;
        const field = formData.get("field") as "isApproved" | "isFeatured";
        // Parse the value string to boolean
        const currentValue = formData.get("value") === "true";

        if (!songId || !field) {
          return { error: "Invalid request" };
        }

        // Use currentValue directly in the update
        await db.song.update({
          where: { id: songId },
          data: { [field]: currentValue },
        });

        const status = field === "isApproved" ? "approval" : "featured";
        return {
          success: `Song ${status} status ${
            currentValue ? "enabled" : "disabled"
          } successfully`,
        };
      }

      // Update the delete-audio case in your action function
      case "delete-audio": {
        if (!songId) return { error: "Song ID is required" };

        try {
          // First get the song to get the audioUrl
          const song = await db.song.findUnique({
            where: { id: songId },
            select: { audioUrl: true },
          });

          if (!song) {
            return { error: "Song not found" };
          }

          if (song.audioUrl) {
            const publicId = getPublicIdFromUrl(song.audioUrl);
            if (publicId) {
              await deleteFromCloudinary(publicId);
            }
          }

          // Then update database
          await db.song.update({
            where: { id: songId },
            data: {
              audioUrl: null,
            },
          });

          return { success: "Audio file removed successfully" };
        } catch (error) {
          console.error("Error deleting audio:", error);
          return { error: "Failed to remove audio file" };
        }
      }

      // Update the delete-image case
      case "delete-image": {
        if (!songId) return { error: "Song ID is required" };

        try {
          // First get the song to get the coverImage
          const song = await db.song.findUnique({
            where: { id: songId },
            select: { coverImage: true },
          });

          if (!song) {
            return { error: "Song not found" };
          }

          if (song.coverImage) {
            const publicId = getPublicIdFromUrl(song.coverImage);
            if (publicId) {
              await deleteFromCloudinary(publicId);
            }
          }

          // Then update database
          await db.song.update({
            where: { id: songId },
            data: { coverImage: null },
          });

          return { success: "Cover image removed successfully" };
        } catch (error) {
          console.error("Error deleting image:", error);
          return { error: "Failed to remove cover image" };
        }
      }
      default:
        return { error: "Invalid action" };
    }
  } catch (error) {
    console.error("Audio dashboard action error:", error);
    return { error: "An error occurred while processing your request" };
  }
}

export default function AudioDashboard() {
  const loaderData = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  // Add these state declarations at the top of the component with other states
  const [confirmationModal, setConfirmationModal] = useState<{
    isOpen: boolean;
    songId: string;
    action: string;
    field: "isFeatured" | "isApproved";
    currentValue: boolean;
  } | null>(null);
  const [uploadFormData, setUploadFormData] = useState({
    title: "",
    artistId: "",
    albumId: "",
    duration: "",
    genre: "",
    lyrics: "",
  });
  const [isEditing, setIsEditing] = useState(false);

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isDeletingMedia, setIsDeletingMedia] = useState<
    "audio" | "image" | null
  >(null);
  type SongType = {
    id: string;
    title: string;
    artists: {
      artist: { id: string; name: string; stageName: string | null };
    }[];
    albumId?: string | null;
    album?: { id: string; title: string } | null;
    duration?: number | null;
    genre?: string | null;
    lyrics?: string | null;
    isApproved: boolean;
    isFeatured: boolean;
    coverImage?: string | null;
    audioUrl?: string | null;
    uploadedBy?: { id: string; username: string; email: string } | null;
    createdAt: string | Date;
    isPublished: boolean;
  };
  const [showDeleteMediaConfirm, setShowDeleteMediaConfirm] = useState<
    "audio" | "image" | null
  >(null);
  const [newAudioFile, setNewAudioFile] = useState<File | null>(null);
  const [newImageFile, setNewImageFile] = useState<File | null>(null);
  const [editingSong, setEditingSong] = useState<SongType | null>(null);
  const [editFormData, setEditFormData] = useState({
    title: "",
    artistId: "",
    albumId: "",
    duration: "",
    genre: "",
    lyrics: "",
    isApproved: false,
    isFeatured: false,
    audioUrl: "",
  });
  const [searchParams, setSearchParams] = useSearchParams();
  const currentPage = parseInt(searchParams.get("page") || "1", 10);
  const { songs, albums, artists, totalPages } = loaderData;

  // Update the useEffect hook to handle both success and error cases
  useEffect(() => {
    if (actionData?.success || actionData?.error) {
      // Reset editing state regardless of success or error
      setIsEditing(false);
      setIsUploading(false);
      setIsDeletingMedia(null);

      // If it's a deletion action, update the editing song state
      if (actionData.success?.includes("Cover image removed")) {
        setEditingSong((prev) => (prev ? { ...prev, coverImage: null } : null));
      } else if (actionData.success?.includes("Audio file removed")) {
        setEditingSong((prev) => (prev ? { ...prev, audioUrl: null } : null));
      }

      // Reset the delete confirmation modal
      setShowDeleteMediaConfirm(null);

      // If it's a regular edit success, reset all edit-related states
      if (actionData.success) {
        setIsEditModalOpen(false);
        setEditingSong(null);
        setEditFormData({
          title: "",
          artistId: "",
          albumId: "",
          duration: "",
          genre: "",
          lyrics: "",
          isApproved: false,
          isFeatured: false,
          audioUrl: "",
        });
      }
    }
  }, [actionData]);

  // Update the handleEditClick function to properly set initial state
  const handleEditClick = (song: SongType) => {
    setEditingSong(song);
    console.log(song);
    setEditFormData({
      title: song.title,
      artistId: song.artists[0]?.artist.id || "",
      albumId: song.albumId || "",
      duration: song.duration?.toString() || "",
      genre: song.genre || "",
      lyrics: song.lyrics || "",
      isApproved: song.isApproved,
      isFeatured: song.isFeatured,
      audioUrl: song.audioUrl || "",
    });
    setIsEditModalOpen(true);
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

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newSearchParams = new URLSearchParams(searchParams);
    if (e.target.value) {
      newSearchParams.set("search", e.target.value);
    } else {
      newSearchParams.delete("search");
    }
    newSearchParams.set("page", "1"); // Reset to first page when searching
    setSearchParams(newSearchParams);
  };

  // Add these state declarations after existing useState hooks

  return (
    <>
      {/* Main Content */}
      <>
        {/* Header */}
        <header className="bg-white shadow-sm border-b">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Audio Management
                </h1>
                <p className="text-gray-600 mt-1">
                  Manage your audio files and tracks
                </p>
              </div>
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => setIsUploadModalOpen(true)}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
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
                  Upload Audio
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
                    placeholder="Search songs, artists, or uploaders..."
                    value={searchParams.get("search") || ""}
                    onChange={handleSearchChange}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                {songs.length} songs
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

          {/* Audio Table */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            {/* Table container with always-visible horizontal scrollbar */}
            <div
              className="overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100"
              style={{
                WebkitOverflowScrolling: "touch",
                overflowX: "auto",
              }}
            >
              <table className="min-w-full divide-y divide-gray-200 hidden md:table">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Song Details
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Artist
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Album
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Uploaded By
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
                  {songs.length === 0 ? (
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
                              d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"
                            />
                          </svg>
                          <h3 className="mt-2 text-sm font-medium text-gray-900">
                            No songs found
                          </h3>
                          <p className="mt-1 text-sm text-gray-500">
                            {searchParams.get("search")
                              ? "No songs match your search criteria."
                              : "Get started by uploading your first song."}
                          </p>
                          <div className="mt-6">
                            <Link
                              to="/upload"
                              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
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
                              Upload Song
                            </Link>
                          </div>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    songs.map((song) => (
                      <tr key={song.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            {song.coverImage ? (
                              <img
                                src={song.coverImage}
                                alt={song.title}
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
                                    d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"
                                  />
                                </svg>
                              </div>
                            )}
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {song.title}
                              </div>
                              <div className="text-sm text-gray-500">
                                {song.genre} • Duration:{" "}
                                {song.duration || "Unknown"}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {song.artists.length > 0
                              ? song.artists
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
                            {song.album?.id ? (
                              albums.find(
                                (album) => album.id === song.album?.id
                              )?.title
                            ) : (
                              <span className="text-gray-400 italic">
                                No Album
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {song.uploadedBy?.username || "Unknown"}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              song.isPublished
                                ? "bg-green-100 text-green-800"
                                : "bg-yellow-100 text-yellow-800"
                            }`}
                          >
                            {song.isPublished ? "Published" : "Draft"}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(song.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex items-center justify-end space-x-2">
                            {/* View Button */}
                            <Link
                              to={`/song/${song.id}`}
                              className="text-blue-600 hover:text-blue-900 inline-flex items-center px-2 py-1 text-xs rounded transition-colors"
                              title="View Song"
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
                            </Link>

                            {/* Edit Button */}
                            <button
                              onClick={() => handleEditClick(song)}
                              className="text-indigo-600 hover:text-indigo-900 inline-flex items-center px-2 py-1 text-xs rounded transition-colors"
                              title="Edit Song"
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
                            </button>
                            <Form method="post" className="inline">
                              <input
                                type="hidden"
                                name="songId"
                                value={song.id}
                              />
                              <input
                                type="hidden"
                                name="intent"
                                value="update-status"
                              />
                              <input
                                type="hidden"
                                name="field"
                                value="isApproved"
                              />
                              <input
                                type="hidden"
                                name="value"
                                value={(!song.isApproved).toString()}
                              />
                              <button
                                type="submit"
                                // Update the isApproved button's onClick handler
                                onClick={(e) => {
                                  e.preventDefault();
                                  setConfirmationModal({
                                    isOpen: true,
                                    songId: song.id,
                                    action: song.isApproved
                                      ? "unapprove"
                                      : "approve",
                                    field: "isApproved",
                                    currentValue: song.isApproved,
                                  });
                                }}
                                className={`inline-flex items-center px-2 py-1 text-xs rounded transition-colors ${
                                  song.isApproved
                                    ? "text-green-600"
                                    : "text-gray-600"
                                }`}
                                title={
                                  song.isApproved ? "Approved" : "Not Approved"
                                }
                              >
                                <svg
                                  className="w-4 h-4"
                                  fill={
                                    song.isApproved ? "currentColor" : "none"
                                  }
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
                              </button>
                            </Form>

                            <Form method="post" className="inline">
                              <input
                                type="hidden"
                                name="songId"
                                value={song.id}
                              />
                              <input
                                type="hidden"
                                name="intent"
                                value="update-status"
                              />
                              <input
                                type="hidden"
                                name="field"
                                value="isFeatured"
                              />
                              <input
                                type="hidden"
                                name="value"
                                value={(!song.isFeatured).toString()}
                              />
                              <button
                                type="submit"
                                // Replace the onClick handler
                                onClick={(e) => {
                                  e.preventDefault();
                                  setConfirmationModal({
                                    isOpen: true,
                                    songId: song.id,
                                    action: song.isFeatured
                                      ? "unfeature"
                                      : "feature",
                                    field: "isFeatured",
                                    currentValue: song.isFeatured,
                                  });
                                }}
                                className={`inline-flex items-center px-2 py-1 text-xs rounded transition-colors ${
                                  song.isFeatured
                                    ? "text-yellow-600"
                                    : "text-gray-600"
                                }`}
                                title={
                                  song.isFeatured ? "Featured" : "Not Featured"
                                }
                              >
                                <svg
                                  className="w-4 h-4"
                                  fill={
                                    song.isFeatured ? "currentColor" : "none"
                                  }
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                                  />
                                </svg>
                              </button>
                            </Form>
                            {/* Toggle Publish Button */}
                            <Form method="post" className="inline">
                              <input
                                type="hidden"
                                name="songId"
                                value={song.id}
                              />
                              <input
                                type="hidden"
                                name="intent"
                                value="toggle-publish"
                              />
                              <button
                                type="submit"
                                className={`inline-flex items-center px-2 py-1 text-xs rounded transition-colors ${
                                  song.isPublished
                                    ? "text-yellow-600 hover:text-yellow-900"
                                    : "text-green-600 hover:text-green-900"
                                }`}
                                title={
                                  song.isPublished ? "Unpublish" : "Publish"
                                }
                              >
                                {song.isPublished ? (
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
                                    `Are you sure you want to delete "${song.title}"? This action cannot be undone.`
                                  )
                                ) {
                                  e.preventDefault();
                                }
                              }}
                            >
                              <input
                                type="hidden"
                                name="songId"
                                value={song.id}
                              />
                              <input
                                type="hidden"
                                name="intent"
                                value="delete"
                              />
                              <button
                                type="submit"
                                className="text-red-600 hover:text-red-900 inline-flex items-center px-2 py-1 text-xs rounded transition-colors"
                                title="Delete Song"
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
              {/* Custom horizontal scrollbar for bottom */}
              <div
                className="w-full h-4 overflow-x-scroll mt-[-4px] scrollbar-thin scrollbar-thumb-blue-400 scrollbar-track-gray-100"
                style={{ WebkitOverflowScrolling: "touch" }}
              >
                <div style={{ width: "1200px", height: "1px" }}></div>
              </div>
              {/* Pagination Controls */}
              <div className="flex justify-center items-center gap-2 py-4 md:py-6">
                <button
                  className="px-3 py-1 rounded bg-gray-100 text-gray-700 disabled:opacity-50"
                  onClick={() =>
                    setSearchParams({ page: (currentPage - 1).toString() })
                  }
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <span className="text-sm text-gray-600">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  className="px-3 py-1 rounded bg-gray-100 text-gray-700 disabled:opacity-50"
                  onClick={() =>
                    setSearchParams({ page: (currentPage + 1).toString() })
                  }
                  disabled={currentPage === totalPages}
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
              {/* Mobile Card Layout */}
              <div className="md:hidden">
                {songs.map((song) => (
                  <div
                    key={song.id}
                    className="bg-white rounded-lg shadow p-4 mb-4"
                  >
                    <div className="flex items-center mb-2">
                      {song.coverImage ? (
                        <img
                          src={song.coverImage}
                          alt={song.title}
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
                              d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"
                            />
                          </svg>
                        </div>
                      )}
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {song.title}
                        </div>
                        <div className="text-sm text-gray-500">
                          {song.genre} • Duration: {song.duration || "Unknown"}
                        </div>
                      </div>
                    </div>
                    <div className="text-sm text-gray-900 mb-1">
                      Artist:{" "}
                      {song.artists.length > 0
                        ? song.artists
                            .map((a) => a.artist.stageName || a.artist.name)
                            .join(", ")
                        : "No Artist"}
                    </div>
                    <div className="text-sm text-gray-900 mb-1">
                      Album:{" "}
                      {song.album?.title || (
                        <span className="text-gray-400 italic">No Album</span>
                      )}
                    </div>
                    <div className="text-sm text-gray-900 mb-1">
                      Uploaded By: {song.uploadedBy?.username || "Unknown"}
                    </div>
                    <div className="flex flex-wrap gap-2 mb-2">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          song.isPublished
                            ? "bg-green-100 text-green-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {song.isPublished ? "Published" : "Draft"}
                      </span>
                    </div>
                    <div className="text-xs text-gray-500 mb-2">
                      Created: {new Date(song.createdAt).toLocaleDateString()}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Link
                        to={`/song/${song.id}`}
                        className="text-blue-600 hover:text-blue-900 inline-flex items-center px-2 py-1 text-xs rounded transition-colors"
                        title="View Song"
                      >
                        View
                      </Link>
                      <Link
                        to={`/dashboard/audio/${song.id}`}
                        className="text-indigo-600 hover:text-indigo-900 inline-flex items-center px-2 py-1 text-xs rounded transition-colors"
                        title="Edit Song"
                      >
                        Edit
                      </Link>
                      <Form method="post" className="inline">
                        <input type="hidden" name="songId" value={song.id} />
                        <input
                          type="hidden"
                          name="intent"
                          value="toggle-publish"
                        />
                        <button
                          type="submit"
                          className={`inline-flex items-center px-2 py-1 text-xs rounded transition-colors ${
                            song.isPublished
                              ? "text-yellow-600 hover:text-yellow-900"
                              : "text-green-600 hover:text-green-900"
                          }`}
                          title={song.isPublished ? "Unpublish" : "Publish"}
                        >
                          {song.isPublished ? "Unpublish" : "Publish"}
                        </button>
                      </Form>
                      <Form
                        method="post"
                        className="inline"
                        onSubmit={(e) => {
                          if (
                            !confirm(
                              `Are you sure you want to delete "${song.title}"? This action cannot be undone.`
                            )
                          ) {
                            e.preventDefault();
                          }
                        }}
                      >
                        <input type="hidden" name="songId" value={song.id} />
                        <input type="hidden" name="intent" value="delete" />
                        <button
                          type="submit"
                          className="text-red-600 hover:text-red-900 inline-flex items-center px-2 py-1 text-xs rounded transition-colors"
                          title="Delete Song"
                        >
                          Delete
                        </button>
                      </Form>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Table Stats */}
          {songs.length > 0 && (
            <div className="mt-4 flex items-center justify-between text-sm text-gray-500">
              <div>Showing {songs.length} songs</div>
              <div className="flex items-center space-x-4">
                <span>
                  Published: {songs.filter((s) => s.isPublished).length}
                </span>
                <span>Draft: {songs.filter((s) => !s.isPublished).length}</span>
              </div>
            </div>
          )}
        </main>
      </>

      {/* Upload Modal */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-xl font-semibold text-gray-900">
                Upload Audio
              </h2>
              <button
                onClick={() => setIsUploadModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <Form
              method="post"
              encType="multipart/form-data"
              className="p-6"
              onSubmit={() => setIsUploading(true)}
            >
              <input type="hidden" name="intent" value="upload" />

              <div className="space-y-6">
                {/* Song Name */}
                <div>
                  <label
                    htmlFor="title"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Song Name *
                  </label>
                  <input
                    type="text"
                    id="title"
                    name="title"
                    value={uploadFormData.title}
                    onChange={(e) =>
                      setUploadFormData((prev) => ({
                        ...prev,
                        title: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter song title"
                    required
                  />
                </div>

                {/* Singer Selection */}
                <div>
                  <label
                    htmlFor="artistId"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Singer/Artist *
                  </label>
                  <select
                    id="artistId"
                    name="artistId"
                    value={uploadFormData.artistId}
                    onChange={(e) =>
                      setUploadFormData((prev) => ({
                        ...prev,
                        artistId: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  >
                    <option value="">Select an artist</option>
                    {artists.map((artist) => (
                      <option key={artist.id} value={artist.id}>
                        {artist.stageName || artist.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Album Selection */}
                <div>
                  <label
                    htmlFor="albumId"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Album (Optional)
                  </label>
                  <select
                    id="albumId"
                    name="albumId"
                    value={uploadFormData.albumId}
                    onChange={(e) =>
                      setUploadFormData((prev) => ({
                        ...prev,
                        albumId: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">No album / Single</option>
                    {albums.map((album) => (
                      <option key={album.id} value={album.id}>
                        {album.title}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Audio File Upload */}
                <div>
                  <label
                    htmlFor="audioFile"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Audio File *
                  </label>
                  <input
                    type="file"
                    id="audioFile"
                    name="audioFile"
                    accept="audio/*"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Supported formats: MP3, WAV, FLAC
                  </p>
                </div>

                {/* Song Thumbnail */}
                <div>
                  <label
                    htmlFor="thumbnail"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Song Thumbnail
                  </label>
                  <input
                    type="file"
                    id="thumbnail"
                    name="thumbnail"
                    accept="image/*"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Upload cover art for the song (JPG, PNG)
                  </p>
                </div>

                {/* Duration */}
                <div>
                  <label
                    htmlFor="duration"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Duration (seconds)
                  </label>
                  <input
                    type="number"
                    id="duration"
                    name="duration"
                    value={uploadFormData.duration}
                    onChange={(e) =>
                      setUploadFormData((prev) => ({
                        ...prev,
                        duration: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., 180"
                  />
                </div>

                {/* Genre */}
                <div>
                  <label
                    htmlFor="genre"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Genre
                  </label>
                  <select
                    id="genre"
                    name="genre"
                    value={uploadFormData.genre}
                    onChange={(e) =>
                      setUploadFormData((prev) => ({
                        ...prev,
                        genre: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select genre</option>
                    <option value="K-Pop">K-Pop</option>
                    <option value="Hip Hop">Hip Hop</option>
                    <option value="R&B">R&B</option>
                    <option value="Pop">Pop</option>
                    <option value="Rock">Rock</option>
                    <option value="Ballad">Ballad</option>
                    <option value="Electronic">Electronic</option>
                    <option value="Jazz">Jazz</option>
                    <option value="Classical">Classical</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                {/* Lyrics */}
                <div>
                  <label
                    htmlFor="lyrics"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Lyrics (Optional)
                  </label>
                  <textarea
                    id="lyrics"
                    name="lyrics"
                    value={uploadFormData.lyrics}
                    onChange={(e) =>
                      setUploadFormData((prev) => ({
                        ...prev,
                        lyrics: e.target.value,
                      }))
                    }
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter song lyrics..."
                  />
                </div>
              </div>

              {/* Error/Success Messages */}
              {actionData?.error && (
                <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-600">{actionData.error}</p>
                </div>
              )}

              {actionData?.success && (
                <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-sm text-green-600">{actionData.success}</p>
                </div>
              )}

              {/* Modal Actions */}
              <div className="flex items-center justify-end space-x-4 mt-8 pt-6 border-t">
                <button
                  type="button"
                  onClick={() => {
                    setIsUploadModalOpen(false), setIsEditing(false);
                  }}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-200 transition-colors"
                  disabled={isUploading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                  disabled={isUploading}
                >
                  {isUploading ? (
                    <>
                      <svg
                        className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
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
                      <span>Uploading...</span>
                    </>
                  ) : (
                    "Upload Song"
                  )}
                </button>
              </div>
            </Form>
          </div>
        </div>
      )}
      {/* Confirmation Modal */}
      {/* Confirmation Modal */}
      {confirmationModal && confirmationModal.isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Confirm Action
              </h3>
              <p className="text-gray-600 mb-6">
                Are you sure you want to {confirmationModal.action} this song?
              </p>
              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => setConfirmationModal(null)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <Form
                  method="post"
                  onSubmit={() => {
                    // Close modal after form submission
                    setTimeout(() => setConfirmationModal(null), 100);
                  }}
                >
                  <input
                    type="hidden"
                    name="songId"
                    value={confirmationModal.songId}
                  />
                  <input type="hidden" name="intent" value="update-status" />
                  <input
                    type="hidden"
                    name="field"
                    value={confirmationModal.field}
                  />
                  <input
                    type="hidden"
                    name="value"
                    value={(!confirmationModal.currentValue).toString()}
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Confirm
                  </button>
                </Form>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Edit Modal */}

      {isEditModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-xl font-semibold text-gray-900">
                Edit Song: {editingSong?.title}
              </h2>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <Form
              onSubmit={() => setIsEditing(true)}
              method="post"
              encType="multipart/form-data"
              className="p-6"
            >
              <input type="hidden" name="intent" value="edit-song" />
              <input type="hidden" name="songId" value={editingSong?.id} />

              <div className="space-y-6">
                {/* Title */}
                <div>
                  <label
                    htmlFor="edit-title"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Song Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="edit-title"
                    name="title"
                    value={editFormData.title}
                    onChange={(e) =>
                      setEditFormData((prev) => ({
                        ...prev,
                        title: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                    placeholder="Enter song title"
                  />
                </div>

                {/* Artist Selection */}
                <div>
                  <label
                    htmlFor="edit-artistId"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Artist <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="edit-artistId"
                    name="artistId"
                    value={editFormData.artistId}
                    onChange={(e) =>
                      setEditFormData((prev) => ({
                        ...prev,
                        artistId: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  >
                    <option value="">Select an artist</option>
                    {artists.map((artist) => (
                      <option key={artist.id} value={artist.id}>
                        {artist.stageName || artist.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Album Selection */}
                <div>
                  <label
                    htmlFor="edit-albumId"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Album
                  </label>
                  <select
                    id="edit-albumId"
                    name="albumId"
                    value={editFormData.albumId}
                    onChange={(e) =>
                      setEditFormData((prev) => ({
                        ...prev,
                        albumId: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Single Release (No Album)</option>
                    {albums.map((album) => (
                      <option key={album.id} value={album.id}>
                        {album.title}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Audio File Management */}
                <div className="space-y-2">
                  <label
                    htmlFor="edit-audio"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Audio File
                  </label>
                  {editingSong?.audioUrl ? (
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <svg
                          className="w-5 h-5 text-gray-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"
                          />
                        </svg>
                        <span className="text-sm text-gray-600">
                          Current audio file
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setShowDeleteMediaConfirm("audio")}
                        className="text-red-600 hover:text-red-700 text-sm"
                      >
                        Remove
                      </button>
                    </div>
                  ) : null}
                  <input
                    type="file"
                    id="edit-audio"
                    name="audioFile"
                    accept="audio/*"
                    onChange={(e) =>
                      setNewAudioFile(e.target.files?.[0] || null)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <p className="text-xs text-gray-500">
                    Supported formats: MP3, WAV, FLAC
                  </p>
                </div>

                {/* Cover Image Management */}
                <div className="space-y-2">
                  <label
                    htmlFor="edit-image"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Cover Image
                  </label>
                  {editingSong?.coverImage ? (
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <img
                          src={editingSong.coverImage}
                          alt="Current cover"
                          className="w-10 h-10 rounded object-cover"
                        />
                        <span className="text-sm text-gray-600">
                          Current cover image
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setShowDeleteMediaConfirm("image")}
                        className="text-red-600 hover:text-red-700 text-sm"
                      >
                        Remove
                      </button>
                    </div>
                  ) : null}
                  <input
                    type="file"
                    id="edit-image"
                    name="coverImage"
                    accept="image/*"
                    onChange={(e) =>
                      setNewImageFile(e.target.files?.[0] || null)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <p className="text-xs text-gray-500">
                    Upload cover art (JPG, PNG)
                  </p>
                </div>

                {/* Duration */}
                <div>
                  <label
                    htmlFor="edit-duration"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Duration (seconds)
                  </label>
                  <input
                    type="number"
                    id="edit-duration"
                    name="duration"
                    value={editFormData.duration}
                    onChange={(e) =>
                      setEditFormData((prev) => ({
                        ...prev,
                        duration: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter duration in seconds (e.g., 180 for 3 minutes)"
                    min="0"
                  />
                </div>

                {/* Genre */}
                <div>
                  <label
                    htmlFor="edit-genre"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Genre
                  </label>
                  <select
                    id="edit-genre"
                    name="genre"
                    value={editFormData.genre}
                    onChange={(e) =>
                      setEditFormData((prev) => ({
                        ...prev,
                        genre: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select genre</option>
                    <option value="K-Pop">K-Pop</option>
                    <option value="Hip Hop">Hip Hop</option>
                    <option value="R&B">R&B</option>
                    <option value="Pop">Pop</option>
                    <option value="Rock">Rock</option>
                    <option value="Ballad">Ballad</option>
                    <option value="Electronic">Electronic</option>
                    <option value="Jazz">Jazz</option>
                    <option value="Classical">Classical</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                {/* Lyrics */}
                <div>
                  <label
                    htmlFor="edit-lyrics"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Lyrics
                  </label>
                  <textarea
                    id="edit-lyrics"
                    name="lyrics"
                    value={editFormData.lyrics}
                    onChange={(e) =>
                      setEditFormData((prev) => ({
                        ...prev,
                        lyrics: e.target.value,
                      }))
                    }
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter song lyrics..."
                  />
                </div>
              </div>

              {/* Form Actions */}
              <div className="flex items-center justify-end space-x-4 mt-8 pt-6 border-t">
                <button
                  type="button"
                  disabled={isEditing}
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                  disabled={isEditing}
                >
                  {isEditing ? (
                    <>
                      <svg
                        className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
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
                      <span>Saving...</span>
                    </>
                  ) : (
                    "Save Changes"
                  )}
                </button>
              </div>
            </Form>
          </div>
        </div>
      )}

      {/* Delete Media Confirmation Modal */}
      {/* Delete Media Confirmation Modal */}
      {showDeleteMediaConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Delete {showDeleteMediaConfirm === "audio" ? "Song" : "Image"}
              </h3>
              <p className="text-gray-600 mb-6">
                Are you sure you want to delete this{" "}
                {showDeleteMediaConfirm === "audio" ? "song" : "image"}? This
                action cannot be undone.
              </p>
              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowDeleteMediaConfirm(null);
                    setIsDeletingMedia(null);
                  }}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-200 transition-colors"
                  disabled={!!isDeletingMedia}
                >
                  Cancel
                </button>
                <Form
                  method="post"
                  onSubmit={() =>
                    setIsDeletingMedia(
                      showDeleteMediaConfirm as "audio" | "image"
                    )
                  }
                >
                  <input
                    type="hidden"
                    name="intent"
                    value={`delete-${showDeleteMediaConfirm}`}
                  />
                  <input type="hidden" name="songId" value={editingSong?.id} />
                  <button
                    type="submit"
                    disabled={isDeletingMedia === showDeleteMediaConfirm}
                    className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                  >
                    {isDeletingMedia === showDeleteMediaConfirm ? (
                      <>
                        <svg
                          className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
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
                          />
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          />
                        </svg>
                        <span>Deleting...</span>
                      </>
                    ) : (
                      "Delete"
                    )}
                  </button>
                </Form>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
