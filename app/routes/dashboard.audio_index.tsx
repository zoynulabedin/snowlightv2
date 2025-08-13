import {
  LoaderFunctionArgs,
  ActionFunctionArgs,
  redirect,
} from "@remix-run/node";
import { useLoaderData, useActionData, Form, Link } from "@remix-run/react";
import { useState, useRef } from "react";
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

    const songs = await db.song.findMany({
      include: {
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
        title: "asc",
      },
    });

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

    console.log("Songs fetched:", songs.length);
    return { user, songs, albums, artists };
  } catch (error) {
    console.error("Audio dashboard loader error:", error);

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
    const songId = formData.get("songId") as string;

    switch (intent) {
      case "upload": {
        const title = formData.get("title") as string;
        const artistId = formData.get("artistId") as string;
        const albumId = formData.get("albumId") as string;
        const audioFile = formData.get("audioFile") as File;
        const thumbnail = formData.get("thumbnail") as File;
        const duration = formData.get("duration") as string;
        const genre = formData.get("genre") as string;
        const lyrics = formData.get("lyrics") as string;

        if (!title || !artistId) {
          return { error: "Title and artist are required" };
        }

        // Here you would typically upload files to Cloudinary
        // For now, we'll create the song record without file URLs
        const newSong = await db.song.create({
          data: {
            title,
            duration: duration ? parseInt(duration) : null,
            genre: genre || null,
            lyrics: lyrics || null,
            albumId: albumId || null,
            uploadedById: user.id,
            artists: {
              create: [
                {
                  artist: {
                    connect: { id: artistId },
                  },
                },
              ],
            },
          },
        });

        return { success: "Song uploaded successfully", songId: newSong.id };
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
  const [searchTerm, setSearchTerm] = useState("");
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [uploadFormData, setUploadFormData] = useState({
    title: "",
    artistId: "",
    albumId: "",
    duration: "",
    genre: "",
    lyrics: "",
  });

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

  const { user, songs, albums, artists } = loaderData;

  const filteredSongs = songs.filter(
    (song) =>
      song.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      song.artists.some((artistRel) =>
        (artistRel.artist.stageName || artistRel.artist.name)
          .toLowerCase()
          .includes(searchTerm.toLowerCase())
      ) ||
      (song.uploadedBy?.username?.toLowerCase() || "").includes(
        searchTerm.toLowerCase()
      )
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Left Sidebar */}
      <div className="flex">
        <DashboardSidebar user={user} />

        {/* Main Content */}
        <div className="ml-10 w-full">
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
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
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
                  {filteredSongs.length} of {songs.length} songs
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
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
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
                    {filteredSongs.length === 0 ? (
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
                              {searchTerm
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
                      filteredSongs.map((song) => (
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
                              {song.album?.title || (
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
                              <Link
                                to={`/dashboard/audio/${song.id}`}
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
                              </Link>

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
              </div>
            </div>

            {/* Table Stats */}
            {songs.length > 0 && (
              <div className="mt-4 flex items-center justify-between text-sm text-gray-500">
                <div>
                  Showing {filteredSongs.length} of {songs.length} songs
                </div>
                <div className="flex items-center space-x-4">
                  <span>
                    Published: {songs.filter((s) => s.isPublished).length}
                  </span>
                  <span>
                    Draft: {songs.filter((s) => !s.isPublished).length}
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
                  <span>Total Songs: {songs.length}</span>
                  <span>•</span>
                  <span>Admin: {user.username}</span>
                </div>
              </div>
            </div>
          </footer>
        </div>
      </div>

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

            <Form method="post" encType="multipart/form-data" className="p-6">
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
                  onClick={() => setIsUploadModalOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Upload Song
                </button>
              </div>
            </Form>
          </div>
        </div>
      )}
    </div>
  );
}
