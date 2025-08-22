import { LoaderFunctionArgs, ActionFunctionArgs } from "@remix-run/node";
import {
  useLoaderData,
  useActionData,
  Form,
  Link,
  useFetcher,
} from "@remix-run/react";
import { useState, useEffect } from "react";
import { db } from "~/lib/db";
import { requireAdmin } from "~/lib/auth";

export async function loader({ request }: LoaderFunctionArgs) {
  const user = await requireAdmin(request);

  const albums = await db.album.findMany({
    include: {
      songs: {
        select: {
          id: true,
          title: true,
          isPublished: true,
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

  // Fetch all artists for the dropdown
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

  return { user, albums, artists };
}

export async function action({ request }: ActionFunctionArgs) {
  try {
    await requireAdmin(request);

    const formData = await request.formData();
    const action = formData.get("action") as string;
    const albumId = formData.get("albumId") as string;

    switch (action) {
      case "create": {
        const title = formData.get("title") as string;
        const description = formData.get("description") as string;
        const releaseDate = formData.get("releaseDate") as string;
        const genre = formData.get("genre") as string;
        const coverImage = formData.get("coverImage") as string;
        const artistIds = formData.getAll("artistIds") as string[];

        // Validation
        if (!title) {
          return { error: "Album title is required" };
        }

        // Check if album already exists
        const existingAlbum = await db.album.findFirst({
          where: { title: title },
        });

        if (existingAlbum) {
          return { error: "Album with this title already exists" };
        }

        // Create new album
        const newAlbum = await db.album.create({
          data: {
            title,
            description: description || null,
            releaseDate: releaseDate ? new Date(releaseDate) : null,
            genre: genre || null,
            type: "ALBUM", // Default to ALBUM since we removed the type field
            coverImage: coverImage || null,
          },
        });

        // Add artist associations if provided
        if (artistIds.length > 0) {
          await db.albumArtist.createMany({
            data: artistIds.map((artistId) => ({
              albumId: newAlbum.id,
              artistId: artistId,
              role: "PRIMARY",
            })),
          });
        }

        return {
          success: "Album created successfully",
          albumId: newAlbum.id,
        };
      }

      case "update": {
        if (!albumId) {
          return { error: "Album ID is required" };
        }

        const title = formData.get("title") as string;
        const description = formData.get("description") as string;
        const releaseDate = formData.get("releaseDate") as string;
        const genre = formData.get("genre") as string;
        const coverImage = formData.get("coverImage") as string;
        const artistIds = formData.getAll("artistIds") as string[];

        // Validation
        if (!title) {
          return { error: "Album title is required" };
        }

        // Check if another album with the same title exists (excluding current album)
        const existingAlbum = await db.album.findFirst({
          where: {
            AND: [{ title: title }, { id: { not: albumId } }],
          },
        });

        if (existingAlbum) {
          return { error: "Another album with this title already exists" };
        }

        // Update album
        await db.album.update({
          where: { id: albumId },
          data: {
            title,
            description: description || null,
            releaseDate: releaseDate ? new Date(releaseDate) : null,
            genre: genre || null,
            // Keep the existing album type or use ALBUM as default
            coverImage: coverImage || null,
          },
        });

        // Update artist associations if provided
        if (artistIds.length > 0) {
          // First, remove existing artist associations
          await db.albumArtist.deleteMany({
            where: { albumId },
          });

          // Then add new artist associations
          await db.albumArtist.createMany({
            data: artistIds.map((artistId) => ({
              albumId,
              artistId,
              role: "PRIMARY",
            })),
          });
        }

        return { success: "Album updated successfully" };
      }

      case "delete": {
        if (!albumId) {
          return { error: "Album ID is required" };
        }

        // Check if album has songs
        const albumWithSongs = await db.album.findUnique({
          where: { id: albumId },
          include: { songs: true },
        });

        if (albumWithSongs?.songs && albumWithSongs.songs.length > 0) {
          return {
            error: "Cannot delete album with songs. Remove songs first.",
          };
        }

        await db.album.delete({
          where: { id: albumId },
        });

        return { success: "Album deleted successfully" };
      }

      case "toggle-publish": {
        if (!albumId) {
          return { error: "Album ID is required" };
        }

        const currentAlbum = await db.album.findUnique({
          where: { id: albumId },
        });

        if (!currentAlbum) {
          return { error: "Album not found" };
        }

        await db.album.update({
          where: { id: albumId },
          data: { isPublished: !currentAlbum.isPublished },
        });

        return {
          success: `Album ${
            !currentAlbum.isPublished ? "published" : "unpublished"
          } successfully`,
        };
      }

      case "feature": {
        if (!albumId) {
          return { error: "Album ID is required" };
        }

        const albumToFeature = await db.album.findUnique({
          where: { id: albumId },
        });

        if (!albumToFeature) {
          return { error: "Album not found" };
        }

        await db.album.update({
          where: { id: albumId },
          data: { isFeatured: !albumToFeature.isFeatured },
        });

        return {
          success: `Album ${
            !albumToFeature.isFeatured ? "featured" : "unfeatured"
          } successfully`,
        };
      }

      default:
        return { error: "Invalid action" };
    }
  } catch (error) {
    console.error("Album action error:", error);
    return { error: "An error occurred while processing your request" };
  }
}

export default function AlbumManagement() {
  const {
    user,
    albums: initialAlbums,
    artists,
  } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const fetcher = useFetcher<typeof action>();
  const [searchTerm, setSearchTerm] = useState("");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editAlbum, setEditAlbum] = useState<(typeof initialAlbums)[0] | null>(
    null
  );

  // Local state to manage albums list for real-time updates
  const [albums, setAlbums] = useState(initialAlbums);

  // Update local albums list when new data is loaded
  useEffect(() => {
    setAlbums(initialAlbums);
  }, [initialAlbums]);

  // Handle successful operations from fetcher
  useEffect(() => {
    if (fetcher.data?.success && fetcher.formData) {
      const formData = fetcher.formData;
      const action = formData.get("action") as string;

      if (action === "create" && fetcher.data.albumId && isCreateModalOpen) {
        // Close modal immediately
        setIsCreateModalOpen(false);

        // Create optimistic update with form data
        const newAlbum = {
          id: fetcher.data.albumId,
          title: formData.get("title") as string,
          description: (formData.get("description") as string) || null,
          releaseDate: formData.get("releaseDate")
            ? new Date(formData.get("releaseDate") as string)
            : null,
          genre: (formData.get("genre") as string) || null,
          type:
            (formData.get("type") as
              | "SINGLE"
              | "EP"
              | "ALBUM"
              | "COMPILATION"
              | "SOUNDTRACK") || "ALBUM",
          coverImage: (formData.get("coverImage") as string) || null,
          plays: 0,
          likes: 0,
          isPublished: false,
          isFeatured: false,
          isApproved: false,
          isKorean: false, // Add this property, or set based on your logic
          createdAt: new Date(),
          updatedAt: new Date(),
          songs: [],
          artists: [],
        } as (typeof initialAlbums)[0];

        // Add the new album to the top of the list
        setAlbums((prevAlbums) => [newAlbum, ...prevAlbums]);
      } else if (action === "update" && editAlbum) {
        // Close edit modal immediately
        setEditAlbum(null);

        // Update the album in local state
        const albumId = formData.get("albumId") as string;
        setAlbums((prevAlbums) =>
          prevAlbums.map((album) =>
            album.id === albumId
              ? {
                  ...album,
                  title: formData.get("title") as string,
                  description: (formData.get("description") as string) || null,
                  releaseDate: formData.get("releaseDate")
                    ? new Date(formData.get("releaseDate") as string)
                    : null,
                  genre: (formData.get("genre") as string) || null,
                  type:
                    (formData.get("type") as
                      | "SINGLE"
                      | "EP"
                      | "ALBUM"
                      | "COMPILATION"
                      | "SOUNDTRACK") || "ALBUM",
                  coverImage: (formData.get("coverImage") as string) || null,
                  updatedAt: new Date(),
                }
              : album
          )
        );
      }
    }
  }, [fetcher.data, fetcher.formData, isCreateModalOpen, editAlbum]);

  // Handle successful operations from regular form submission
  useEffect(() => {
    if (actionData?.success && (isCreateModalOpen || editAlbum)) {
      setIsCreateModalOpen(false);
      setEditAlbum(null);
    }
  }, [actionData, isCreateModalOpen, editAlbum]);

  // Filter albums based on search term
  const filteredAlbums = albums.filter((album) => {
    if (!searchTerm) return true;
    const searchLower = searchTerm.toLowerCase();
    return (
      album.title.toLowerCase().includes(searchLower) ||
      album.genre?.toLowerCase().includes(searchLower) ||
      album.artists.some(
        (artistRel) =>
          artistRel.artist.name.toLowerCase().includes(searchLower) ||
          artistRel.artist.stageName?.toLowerCase().includes(searchLower)
      )
    );
  });
  // ...existing state declarations...
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(7);

  // Calculate pagination values
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredAlbums.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredAlbums.length / itemsPerPage);
  return (
    <>
      {/* Main Content */}
      <div className="flex-1 ml-10">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Album Management
                </h1>
                <p className="text-gray-600 mt-1">
                  Manage your music albums and collections
                </p>
              </div>
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => setIsCreateModalOpen(true)}
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
                  Create Album
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
                    placeholder="Search albums, artists, or creators..."
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
                {filteredAlbums.length} of {albums.length} albums
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
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.864-.833-2.634 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                  />
                </svg>
                <p className="ml-3 text-red-800">{actionData.error}</p>
              </div>
            </div>
          )}

          {/* Albums Table */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Album
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Artists
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Songs
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Featured
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
                  {filteredAlbums.length === 0 ? (
                    <tr>
                      <td
                        colSpan={8}
                        className="px-6 py-12 text-center text-gray-500"
                      >
                        <div className="flex flex-col items-center">
                          <svg
                            className="w-12 h-12 text-gray-400 mb-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                            />
                          </svg>
                          <p className="text-lg font-medium mb-1">
                            No albums found
                          </p>
                          <p className="text-sm">
                            {searchTerm
                              ? "Try adjusting your search criteria"
                              : "Start by creating your first album"}
                          </p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    currentItems?.map((album) => (
                      <tr key={album.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            {album.coverImage ? (
                              <img
                                src={album.coverImage}
                                alt={album.title}
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
                                    d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                                  />
                                </svg>
                              </div>
                            )}
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {album.title}
                              </div>
                              <div className="text-sm text-gray-500">
                                {album.genre || "Unknown Genre"} •{" "}
                                {album.releaseDate
                                  ? new Date(album.releaseDate).getFullYear()
                                  : "No Year"}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {album.artists.length > 0
                              ? album.artists
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
                            {album.songs.length} songs
                          </div>
                          <div className="text-xs text-gray-500">
                            {
                              album.songs.filter((song) => song.isPublished)
                                .length
                            }{" "}
                            published
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {album.type}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              album.isPublished
                                ? "bg-green-100 text-green-800"
                                : "bg-yellow-100 text-yellow-800"
                            }`}
                          >
                            {album.isPublished ? "Published" : "Draft"}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              album.isFeatured
                                ? "bg-purple-100 text-purple-800"
                                : "bg-gray-100 text-gray-800"
                            }`}
                          >
                            {album.isFeatured ? "Featured" : "Normal"}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(album.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex items-center justify-end space-x-2">
                            {/* View Button */}
                            <Link
                              to={`/album/${album.id}`}
                              className="text-blue-600 hover:text-blue-900 inline-flex items-center px-2 py-1 text-xs rounded transition-colors"
                              title="View Album"
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
                              onClick={() => setEditAlbum(album)}
                              className="text-indigo-600 hover:text-indigo-900 inline-flex items-center px-2 py-1 text-xs rounded transition-colors"
                              title="Edit Album"
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

                            {/* Toggle Publish Button */}
                            <Form method="post" className="inline">
                              <input
                                type="hidden"
                                name="action"
                                value="toggle-publish"
                              />
                              <input
                                type="hidden"
                                name="albumId"
                                value={album.id}
                              />
                              <button
                                type="submit"
                                className={`inline-flex items-center px-2 py-1 text-xs rounded transition-colors ${
                                  album.isPublished
                                    ? "text-yellow-600 hover:text-yellow-900"
                                    : "text-green-600 hover:text-green-900"
                                }`}
                                title={
                                  album.isPublished
                                    ? "Unpublish Album"
                                    : "Publish Album"
                                }
                              >
                                {album.isPublished ? (
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
                                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                                    />
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                                    />
                                  </svg>
                                )}
                              </button>
                            </Form>

                            {/* Toggle Feature Button */}
                            <Form method="post" className="inline">
                              <input
                                type="hidden"
                                name="action"
                                value="feature"
                              />
                              <input
                                type="hidden"
                                name="albumId"
                                value={album.id}
                              />
                              <button
                                type="submit"
                                className={`inline-flex items-center px-2 py-1 text-xs rounded transition-colors ${
                                  album.isFeatured
                                    ? "text-purple-600 hover:text-purple-900"
                                    : "text-gray-600 hover:text-gray-900"
                                }`}
                                title={
                                  album.isFeatured
                                    ? "Unfeature Album"
                                    : "Feature Album"
                                }
                              >
                                <svg
                                  className="w-4 h-4"
                                  fill={
                                    album.isFeatured ? "currentColor" : "none"
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

                            {/* Delete Button */}
                            <Form method="post" className="inline">
                              <input
                                type="hidden"
                                name="action"
                                value="delete"
                              />
                              <input
                                type="hidden"
                                name="albumId"
                                value={album.id}
                              />
                              <button
                                type="submit"
                                className="text-red-600 hover:text-red-900 inline-flex items-center px-2 py-1 text-xs rounded transition-colors"
                                title="Delete Album"
                                onClick={(e) => {
                                  if (album.songs.length > 0) {
                                    e.preventDefault();
                                    alert(
                                      "Cannot delete album with songs. Remove songs first."
                                    );
                                    return;
                                  }
                                  if (
                                    !confirm(
                                      `Are you sure you want to delete "${album.title}"? This action cannot be undone.`
                                    )
                                  ) {
                                    e.preventDefault();
                                  }
                                }}
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
              {/* Pagination */}
              <div className="mt-4 flex items-center justify-between px-4 py-3 sm:px-6">
                <div className="flex flex-1 justify-between sm:hidden">
                  <button
                    onClick={() =>
                      setCurrentPage((prev) => Math.max(prev - 1, 1))
                    }
                    disabled={currentPage === 1}
                    className="relative inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() =>
                      setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                    }
                    disabled={currentPage === totalPages}
                    className="relative ml-3 inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>

                <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm text-gray-700">
                      Showing{" "}
                      <span className="font-medium">
                        {indexOfFirstItem + 1}
                      </span>{" "}
                      to{" "}
                      <span className="font-medium">
                        {Math.min(indexOfLastItem, filteredAlbums.length)}
                      </span>{" "}
                      of{" "}
                      <span className="font-medium">
                        {filteredAlbums.length}
                      </span>{" "}
                      results
                    </p>
                  </div>

                  <div className="flex gap-x-2">
                    {/* First Page */}
                    <button
                      onClick={() => setCurrentPage(1)}
                      disabled={currentPage === 1}
                      className="relative inline-flex items-center px-2 py-2 text-gray-400 rounded-md hover:bg-gray-50 disabled:opacity-50"
                      title="First Page"
                    >
                      <span className="sr-only">First Page</span>
                      <svg
                        className="h-5 w-5"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M15.707 15.707a1 1 0 01-1.414 0l-5-5a1 1 0 010-1.414l5-5a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 010 1.414zm-6 0a1 1 0 01-1.414 0l-5-5a1 1 0 010-1.414l5-5a1 1 0 011.414 1.414L5.414 10l4.293 4.293a1 1 0 010 1.414z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </button>

                    {/* Previous */}
                    <button
                      onClick={() => setCurrentPage((prev) => prev - 1)}
                      disabled={currentPage === 1}
                      className="relative inline-flex items-center px-2 py-2 text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                    >
                      Previous
                    </button>

                    {/* Page Numbers */}
                    <nav
                      className="isolate inline-flex -space-x-px rounded-md shadow-sm"
                      aria-label="Pagination"
                    >
                      {[...Array(totalPages)].map((_, index) => (
                        <button
                          key={index + 1}
                          onClick={() => setCurrentPage(index + 1)}
                          className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold ${
                            currentPage === index + 1
                              ? "z-10 bg-blue-600 text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
                              : "text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
                          }`}
                        >
                          {index + 1}
                        </button>
                      ))}
                    </nav>

                    {/* Next */}
                    <button
                      onClick={() => setCurrentPage((prev) => prev + 1)}
                      disabled={currentPage === totalPages}
                      className="relative inline-flex items-center px-2 py-2 text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                    >
                      Next
                    </button>

                    {/* Last Page */}
                    <button
                      onClick={() => setCurrentPage(totalPages)}
                      disabled={currentPage === totalPages}
                      className="relative inline-flex items-center px-2 py-2 text-gray-400 rounded-md hover:bg-gray-50 disabled:opacity-50"
                      title="Last Page"
                    >
                      <span className="sr-only">Last Page</span>
                      <svg
                        className="h-5 w-5"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M4.293 15.707a1 1 0 001.414 0l5-5a1 1 0 000-1.414l-5-5a1 1 0 00-1.414 1.414L8.586 10 4.293 14.293a1 1 0 000 1.414zm6 0a1 1 0 001.414 0l5-5a1 1 0 000-1.414l-5-5a1 1 0 00-1.414 1.414L14.586 10l-4.293 4.293a1 1 0 000 1.414z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Summary Statistics */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white rounded-lg p-6 shadow">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
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
                      d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                    />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">
                    Total Albums
                  </p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {albums.length}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg p-6 shadow">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <svg
                    className="w-6 h-6 text-green-600"
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
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Published</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {albums.filter((album) => album.isPublished).length}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg p-6 shadow">
              <div className="flex items-center">
                <div className="p-2 bg-purple-100 rounded-lg">
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
                      d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                    />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Featured</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {albums.filter((album) => album.isFeatured).length}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg p-6 shadow">
              <div className="flex items-center">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <svg
                    className="w-6 h-6 text-orange-600"
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
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">
                    Total Songs
                  </p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {albums.reduce(
                      (total, album) => total + album.songs.length,
                      0
                    )}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Create Album Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Create New Album
              </h3>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="text-gray-400 hover:text-gray-600"
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

            <fetcher.Form method="post" className="space-y-4">
              <input type="hidden" name="action" value="create" />

              {/* Album Title */}
              <div>
                <label
                  htmlFor="title"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Album Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter album title"
                />
              </div>

              {/* Description */}
              <div>
                <label
                  htmlFor="description"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Description
                </label>
                <textarea
                  id="description"
                  name="description"
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Brief description about the album..."
                />
              </div>

              {/* Genre */}
              <div>
                <label
                  htmlFor="genre"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Genre
                </label>
                <select
                  id="genre"
                  name="genre"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select Genre</option>
                  <option value="K-Pop">K-Pop</option>
                  <option value="K-Rock">K-Rock</option>
                  <option value="K-Hip Hop">K-Hip Hop</option>
                  <option value="K-R&B">K-R&B</option>
                  <option value="K-Indie">K-Indie</option>
                  <option value="Trot">Trot</option>
                  <option value="Ballad">Ballad</option>
                  <option value="Electronic">Electronic</option>
                  <option value="Folk">Folk</option>
                  <option value="Jazz">Jazz</option>
                  <option value="Classical">Classical</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              {/* Select Artist */}
              <div>
                <label
                  htmlFor="artistIds"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Select Artist
                </label>
                <select
                  id="artistIds"
                  name="artistIds"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select an artist</option>
                  {artists &&
                    artists.map((artist) => (
                      <option key={artist.id} value={artist.id}>
                        {artist.stageName || artist.name}
                      </option>
                    ))}
                </select>
              </div>

              {/* Release Date */}
              <div>
                <label
                  htmlFor="releaseDate"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Release Date
                </label>
                <input
                  type="date"
                  id="releaseDate"
                  name="releaseDate"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Cover Image URL */}
              <div>
                <label
                  htmlFor="coverImage"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Cover Image URL
                </label>
                <input
                  type="url"
                  id="coverImage"
                  name="coverImage"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="https://example.com/cover.jpg"
                />
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={fetcher.state === "submitting"}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                >
                  {fetcher.state === "submitting" ? (
                    <>
                      <svg
                        className="w-4 h-4 mr-2 animate-spin"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                      </svg>
                      Creating...
                    </>
                  ) : (
                    "Create Album"
                  )}
                </button>
              </div>
            </fetcher.Form>
          </div>
        </div>
      )}

      {/* Edit Album Modal */}
      {editAlbum && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Edit Album
              </h3>
              <button
                onClick={() => setEditAlbum(null)}
                className="text-gray-400 hover:text-gray-600"
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

            <fetcher.Form method="post" className="space-y-4">
              <input type="hidden" name="action" value="update" />
              <input type="hidden" name="albumId" value={editAlbum.id} />

              {/* Album Title */}
              <div>
                <label
                  htmlFor="edit-title"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Album Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="edit-title"
                  name="title"
                  required
                  defaultValue={editAlbum.title}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter album title"
                />
              </div>

              {/* Description */}
              <div>
                <label
                  htmlFor="edit-description"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Description
                </label>
                <textarea
                  id="edit-description"
                  name="description"
                  rows={3}
                  defaultValue={editAlbum.description || ""}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Brief description about the album..."
                />
              </div>

              {/* Genre */}
              <div>
                <label
                  htmlFor="edit-genre"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Genre
                </label>
                <select
                  id="edit-genre"
                  name="genre"
                  defaultValue={editAlbum.genre || ""}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select Genre</option>
                  <option value="K-Pop">K-Pop</option>
                  <option value="K-Rock">K-Rock</option>
                  <option value="K-Hip Hop">K-Hip Hop</option>
                  <option value="K-R&B">K-R&B</option>
                  <option value="K-Indie">K-Indie</option>
                  <option value="Trot">Trot</option>
                  <option value="Ballad">Ballad</option>
                  <option value="Electronic">Electronic</option>
                  <option value="Folk">Folk</option>
                  <option value="Jazz">Jazz</option>
                  <option value="Classical">Classical</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              {/* Select Artist */}
              <div>
                <label
                  htmlFor="edit-artistIds"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Select Artist
                </label>
                <select
                  id="edit-artistIds"
                  name="artistIds"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select an artist</option>
                  {artists &&
                    artists.map((artist) => (
                      <option key={artist.id} value={artist.id}>
                        {artist.stageName || artist.name}
                      </option>
                    ))}
                </select>
              </div>

              {/* Release Date */}
              <div>
                <label
                  htmlFor="edit-releaseDate"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Release Date
                </label>
                <input
                  type="date"
                  id="edit-releaseDate"
                  name="releaseDate"
                  defaultValue={
                    editAlbum.releaseDate
                      ? new Date(editAlbum.releaseDate)
                          .toISOString()
                          .split("T")[0]
                      : ""
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Cover Image URL */}
              <div>
                <label
                  htmlFor="edit-coverImage"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Cover Image URL
                </label>
                <input
                  type="url"
                  id="edit-coverImage"
                  name="coverImage"
                  defaultValue={editAlbum.coverImage || ""}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="https://example.com/cover.jpg"
                />
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setEditAlbum(null)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={fetcher.state === "submitting"}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                >
                  {fetcher.state === "submitting" ? (
                    <>
                      <svg
                        className="w-4 h-4 mr-2 animate-spin"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                      </svg>
                      Updating...
                    </>
                  ) : (
                    "Update Album"
                  )}
                </button>
              </div>
            </fetcher.Form>
          </div>
        </div>
      )}
    </>
  );
}
