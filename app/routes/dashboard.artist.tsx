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
import DashboardSidebar from "~/components/DashboardSidebar";

export async function loader({ request }: LoaderFunctionArgs) {
  const user = await requireAdmin(request);

  const artists = await db.artist.findMany({
    include: {
      user: {
        select: {
          id: true,
          username: true,
          email: true,
        },
      },
      albumArtists: {
        include: {
          album: {
            select: {
              id: true,
              title: true,
              isPublished: true,
            },
          },
        },
      },
      songArtists: {
        include: {
          song: {
            select: {
              id: true,
              title: true,
              isPublished: true,
            },
          },
        },
      },
      videoArtists: {
        include: {
          video: {
            select: {
              id: true,
              title: true,
              isPublished: true,
            },
          },
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  console.log("Artists fetched:", artists.length);
  return { user, artists };
}

export async function action({ request }: ActionFunctionArgs) {
  try {
    await requireAdmin(request);

    const formData = await request.formData();
    const action = formData.get("action") as string;
    const artistId = formData.get("artistId") as string;

    switch (action) {
      case "create": {
        const name = formData.get("name") as string;
        const stageName = formData.get("stageName") as string;
        const genre = formData.get("genre") as string;
        const country = formData.get("country") as string;
        const bio = formData.get("bio") as string;
        const debutYear = formData.get("debutYear") as string;
        const avatar = formData.get("avatar") as string;
        const coverImage = formData.get("coverImage") as string;

        // Validation
        if (!name) {
          return { error: "Artist name is required" };
        }

        // Check if artist already exists
        const existingArtist = await db.artist.findFirst({
          where: {
            OR: [{ name: name }, { stageName: stageName || undefined }],
          },
        });

        if (existingArtist) {
          return { error: "Artist with this name already exists" };
        }

        // Create new artist
        const newArtist = await db.artist.create({
          data: {
            name,
            stageName: stageName || null,
            genre: genre || null,
            country: country || null,
            bio: bio || null,
            debutYear: debutYear ? parseInt(debutYear) : null,
            avatar: avatar || null,
            coverImage: coverImage || null,
          },
        });

        return {
          success: "Artist created successfully",
          artistId: newArtist.id,
        };
      }

      case "delete": {
        if (!artistId) {
          return { error: "Artist ID is required" };
        }

        // Check if artist has songs, albums, or videos
        const artistWithContent = await db.artist.findUnique({
          where: { id: artistId },
          include: {
            songArtists: true,
            albumArtists: true,
            videoArtists: true,
          },
        });

        if (
          (artistWithContent?.songArtists &&
            artistWithContent.songArtists.length > 0) ||
          (artistWithContent?.albumArtists &&
            artistWithContent.albumArtists.length > 0) ||
          (artistWithContent?.videoArtists &&
            artistWithContent.videoArtists.length > 0)
        ) {
          return {
            error:
              "Cannot delete artist with associated content. Remove content first.",
          };
        }

        await db.artist.delete({
          where: { id: artistId },
        });

        return { success: "Artist deleted successfully" };
      }

      case "update": {
        if (!artistId) {
          return { error: "Artist ID is required" };
        }

        const name = formData.get("name") as string;
        const genre = formData.get("genre") as string;
        const country = formData.get("country") as string;
        const bio = formData.get("bio") as string;
        const debutYear = formData.get("debutYear") as string;
        const avatar = formData.get("avatar") as string;
        const coverImage = formData.get("coverImage") as string;

        // Validation
        if (!name) {
          return { error: "Artist name is required" };
        }

        // Check if another artist with the same name exists (excluding current artist)
        const existingArtist = await db.artist.findFirst({
          where: {
            AND: [{ name: name }, { id: { not: artistId } }],
          },
        });

        if (existingArtist) {
          return { error: "Another artist with this name already exists" };
        }

        // Update artist
        await db.artist.update({
          where: { id: artistId },
          data: {
            name,
            genre: genre || null,
            country: country || null,
            bio: bio || null,
            debutYear: debutYear ? parseInt(debutYear) : null,
            avatar: avatar || null,
            coverImage: coverImage || null,
          },
        });

        return { success: "Artist updated successfully" };
      }

      case "toggle-verification": {
        if (!artistId) {
          return { error: "Artist ID is required" };
        }

        const currentArtist = await db.artist.findUnique({
          where: { id: artistId },
        });

        if (!currentArtist) {
          return { error: "Artist not found" };
        }

        await db.artist.update({
          where: { id: artistId },
          data: { isVerified: !currentArtist.isVerified },
        });

        return {
          success: `Artist ${
            !currentArtist.isVerified ? "verified" : "unverified"
          } successfully`,
        };
      }

      default:
        return { error: "Invalid action" };
    }
  } catch (error) {
    console.error("Artist action error:", error);
    return { error: "An error occurred while processing your request" };
  }
}

export default function ArtistManagement() {
  const { user, artists: initialArtists } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const fetcher = useFetcher<typeof action>();
  const [searchTerm, setSearchTerm] = useState("");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editArtist, setEditArtist] = useState<
    (typeof initialArtists)[0] | null
  >(null);

  // Local state to manage artists list for real-time updates
  const [artists, setArtists] = useState(initialArtists);

  // Update local artists list when new data is loaded
  useEffect(() => {
    setArtists(initialArtists);
  }, [initialArtists]);

  // Handle successful operations from fetcher
  useEffect(() => {
    if (fetcher.data?.success && fetcher.formData) {
      const formData = fetcher.formData;
      const action = formData.get("action") as string;

      if (action === "create" && fetcher.data.artistId && isCreateModalOpen) {
        // Close modal immediately
        setIsCreateModalOpen(false);

        // Create optimistic update with form data
        const newArtist = {
          id: fetcher.data.artistId,
          userId: null,
          name: formData.get("name") as string,
          stageName: null,
          genre: (formData.get("genre") as string) || null,
          country: (formData.get("country") as string) || null,
          bio: (formData.get("bio") as string) || null,
          debutYear: formData.get("debutYear")
            ? parseInt(formData.get("debutYear") as string)
            : null,
          avatar: (formData.get("avatar") as string) || null,
          coverImage: (formData.get("coverImage") as string) || null,
          isVerified: false,
          followers: 0,
          monthlyListeners: 0,
          user: null,
          albumArtists: [],
          songArtists: [],
          videoArtists: [],
          createdAt: new Date(),
          updatedAt: new Date(),
        } as (typeof initialArtists)[0];

        // Add the new artist to the top of the list
        setArtists((prevArtists) => [newArtist, ...prevArtists]);
      } else if (action === "update" && editArtist) {
        // Close edit modal immediately
        setEditArtist(null);

        // Update the artist in local state
        const artistId = formData.get("artistId") as string;
        setArtists((prevArtists) =>
          prevArtists.map((artist) =>
            artist.id === artistId
              ? {
                  ...artist,
                  name: formData.get("name") as string,
                  genre: (formData.get("genre") as string) || null,
                  country: (formData.get("country") as string) || null,
                  bio: (formData.get("bio") as string) || null,
                  debutYear: formData.get("debutYear")
                    ? parseInt(formData.get("debutYear") as string)
                    : null,
                  avatar: (formData.get("avatar") as string) || null,
                  coverImage: (formData.get("coverImage") as string) || null,
                  updatedAt: new Date(),
                }
              : artist
          )
        );
      }
    }
  }, [fetcher.data, fetcher.formData, isCreateModalOpen, editArtist]);

  // Handle successful operations from regular form submission
  useEffect(() => {
    if (actionData?.success) {
      if (actionData.success.includes("deleted")) {
        // Find and remove the deleted artist from local state
        const deletedArtistId = new URLSearchParams(window.location.search).get(
          "artistId"
        );
        if (deletedArtistId) {
          setArtists((prevArtists) =>
            prevArtists.filter((artist) => artist.id !== deletedArtistId)
          );
        }
      } else if (actionData.success.includes("updated")) {
        // For update operations, we might want to refresh the data
        // or handle optimistic updates here as well
      }

      setIsCreateModalOpen(false);
      setEditArtist(null);
    }
  }, [actionData, isCreateModalOpen, editArtist]);

  // Filter artists based on search term
  const filteredArtists = artists.filter((artist) => {
    if (!searchTerm) return true;
    const searchLower = searchTerm.toLowerCase();
    return (
      artist.name.toLowerCase().includes(searchLower) ||
      artist.stageName?.toLowerCase().includes(searchLower) ||
      artist.genre?.toLowerCase().includes(searchLower) ||
      artist.country?.toLowerCase().includes(searchLower) ||
      artist.user?.username?.toLowerCase().includes(searchLower)
    );
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        {/* Sidebar */}
        <DashboardSidebar user={user} />

        {/* Main Content */}
        <div className="flex-1 ml-10">
          {/* Header */}
          <header className="bg-white shadow-sm border-b border-gray-200">
            <div className="px-6 py-4">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    Artist Management
                  </h1>
                  <p className="text-gray-600 mt-1">
                    Manage artists, verification status, and profiles
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
                    Add Artist
                  </button>
                </div>
              </div>
            </div>
          </header>

          {/* Success/Error Messages */}
          {actionData?.success && (
            <div className="mx-6 mt-4 mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex">
                <svg
                  className="w-5 h-5 text-green-400"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                <p className="ml-3 text-sm font-medium text-green-800">
                  {actionData.success}
                </p>
              </div>
            </div>
          )}

          {actionData?.error && (
            <div className="mx-6 mt-4 mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex">
                <svg
                  className="w-5 h-5 text-red-400"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
                <p className="ml-3 text-sm font-medium text-red-800">
                  {actionData.error}
                </p>
              </div>
            </div>
          )}

          {/* Main Content Area */}
          <main className="p-6">
            {/* Search and Filters */}
            <div className="mb-6">
              <div className="flex items-center justify-between">
                <div className="flex-1 max-w-md">
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Search artists, stage names, or genres..."
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
                  {filteredArtists.length} of {artists.length} artists
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

            {/* Artists Table */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Artist
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Genre/Country
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Content
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Social Stats
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        User Account
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Verification
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
                    {filteredArtists.length === 0 ? (
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
                                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                              />
                            </svg>
                            <p className="text-lg font-medium mb-1">
                              No artists found
                            </p>
                            <p className="text-sm">
                              {searchTerm
                                ? "Try adjusting your search criteria"
                                : "Start by adding your first artist"}
                            </p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      filteredArtists.map((artist) => (
                        <tr key={artist.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              {artist.avatar ? (
                                <img
                                  src={artist.avatar}
                                  alt={artist.name}
                                  className="h-12 w-12 rounded-full object-cover mr-4"
                                />
                              ) : (
                                <div className="h-12 w-12 rounded-full bg-gray-200 flex items-center justify-center mr-4">
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
                                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                                    />
                                  </svg>
                                </div>
                              )}
                              <div>
                                <div className="text-sm font-medium text-gray-900 flex items-center">
                                  {artist.stageName || artist.name}
                                  {artist.isVerified && (
                                    <svg
                                      className="w-4 h-4 text-blue-500 ml-1"
                                      fill="currentColor"
                                      viewBox="0 0 20 20"
                                    >
                                      <path
                                        fillRule="evenodd"
                                        d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                        clipRule="evenodd"
                                      />
                                    </svg>
                                  )}
                                </div>
                                <div className="text-sm text-gray-500">
                                  {artist.stageName &&
                                  artist.stageName !== artist.name
                                    ? artist.name
                                    : ""}
                                  {artist.debutYear && (
                                    <span className="ml-2">
                                      • Debut: {artist.debutYear}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {artist.genre || "No Genre"}
                            </div>
                            <div className="text-sm text-gray-500">
                              {artist.country || "No Country"}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {artist.songArtists.length} songs
                            </div>
                            <div className="text-sm text-gray-500">
                              {artist.albumArtists.length} albums •{" "}
                              {artist.videoArtists.length} videos
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {artist.followers.toLocaleString()} followers
                            </div>
                            <div className="text-sm text-gray-500">
                              {artist.monthlyListeners.toLocaleString()} monthly
                              listeners
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {artist.user ? (
                                <Link
                                  to={`/dashboard/users/${artist.user.id}`}
                                  className="text-blue-600 hover:text-blue-900"
                                >
                                  {artist.user.username}
                                </Link>
                              ) : (
                                <span className="text-gray-400 italic">
                                  No Account
                                </span>
                              )}
                            </div>
                            {artist.user && (
                              <div className="text-xs text-gray-500">
                                {artist.user.email}
                              </div>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                artist.isVerified
                                  ? "bg-blue-100 text-blue-800"
                                  : "bg-gray-100 text-gray-800"
                              }`}
                            >
                              {artist.isVerified ? "Verified" : "Unverified"}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(artist.createdAt).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <div className="flex items-center justify-end space-x-2">
                              {/* View Button */}
                              <Link
                                to={`/artist/${
                                  artist.stageName || artist.name
                                }`}
                                className="text-blue-600 hover:text-blue-900 inline-flex items-center px-2 py-1 text-xs rounded transition-colors"
                                title="View Artist Profile"
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
                                onClick={() => setEditArtist(artist)}
                                className="text-indigo-600 hover:text-indigo-900 inline-flex items-center px-2 py-1 text-xs rounded transition-colors"
                                title="Edit Artist"
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

                              {/* Toggle Verification Button */}
                              <Form method="post" className="inline">
                                <input
                                  type="hidden"
                                  name="action"
                                  value="toggle-verification"
                                />
                                <input
                                  type="hidden"
                                  name="artistId"
                                  value={artist.id}
                                />
                                <button
                                  type="submit"
                                  className={`inline-flex items-center px-2 py-1 text-xs rounded transition-colors ${
                                    artist.isVerified
                                      ? "text-gray-600 hover:text-gray-900"
                                      : "text-blue-600 hover:text-blue-900"
                                  }`}
                                  title={
                                    artist.isVerified
                                      ? "Remove Verification"
                                      : "Verify Artist"
                                  }
                                >
                                  <svg
                                    className="w-4 h-4"
                                    fill={
                                      artist.isVerified
                                        ? "currentColor"
                                        : "none"
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

                              {/* Delete Button */}
                              <Form method="post" className="inline">
                                <input
                                  type="hidden"
                                  name="action"
                                  value="delete"
                                />
                                <input
                                  type="hidden"
                                  name="artistId"
                                  value={artist.id}
                                />
                                <button
                                  type="submit"
                                  className="text-red-600 hover:text-red-900 inline-flex items-center px-2 py-1 text-xs rounded transition-colors"
                                  title="Delete Artist"
                                  onClick={(e) => {
                                    const hasContent =
                                      artist.songArtists.length > 0 ||
                                      artist.albumArtists.length > 0 ||
                                      artist.videoArtists.length > 0;

                                    if (hasContent) {
                                      e.preventDefault();
                                      alert(
                                        "Cannot delete artist with associated content. Remove content first."
                                      );
                                      return;
                                    }
                                    if (
                                      !confirm(
                                        `Are you sure you want to delete artist "${
                                          artist.stageName || artist.name
                                        }"? This action cannot be undone.`
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
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">
                      Total Artists
                    </p>
                    <p className="text-2xl font-semibold text-gray-900">
                      {artists.length}
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
                    <p className="text-sm font-medium text-gray-600">
                      Verified Artists
                    </p>
                    <p className="text-2xl font-semibold text-gray-900">
                      {artists.filter((artist) => artist.isVerified).length}
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
                        d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                      />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">
                      With Accounts
                    </p>
                    <p className="text-2xl font-semibold text-gray-900">
                      {artists.filter((artist) => artist.user).length}
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
                      Total Content
                    </p>
                    <p className="text-2xl font-semibold text-gray-900">
                      {artists.reduce(
                        (total, artist) =>
                          total +
                          artist.songArtists.length +
                          artist.albumArtists.length +
                          artist.videoArtists.length,
                        0
                      )}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>

      {/* Add Artist Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Add New Artist
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

              {/* Artist Name */}
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Artist Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter artist's real name"
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

              {/* Country */}
              <div>
                <label
                  htmlFor="country"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Country
                </label>
                <select
                  id="country"
                  name="country"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select Country</option>
                  <option value="South Korea">South Korea</option>
                  <option value="North Korea">North Korea</option>
                  <option value="United States">United States</option>
                  <option value="Japan">Japan</option>
                  <option value="China">China</option>
                  <option value="Thailand">Thailand</option>
                  <option value="Philippines">Philippines</option>
                  <option value="Indonesia">Indonesia</option>
                  <option value="Malaysia">Malaysia</option>
                  <option value="Singapore">Singapore</option>
                  <option value="Vietnam">Vietnam</option>
                  <option value="India">India</option>
                  <option value="Australia">Australia</option>
                  <option value="Canada">Canada</option>
                  <option value="United Kingdom">United Kingdom</option>
                  <option value="Germany">Germany</option>
                  <option value="France">France</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              {/* Debut Year */}
              <div>
                <label
                  htmlFor="debutYear"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Debut Year
                </label>
                <input
                  type="number"
                  id="debutYear"
                  name="debutYear"
                  min="1950"
                  max={new Date().getFullYear()}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., 2023"
                />
              </div>

              {/* Bio */}
              <div>
                <label
                  htmlFor="bio"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Biography
                </label>
                <textarea
                  id="bio"
                  name="bio"
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Brief description about the artist..."
                />
              </div>

              {/* Avatar URL */}
              <div>
                <label
                  htmlFor="avatar"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Avatar Image URL
                </label>
                <input
                  type="url"
                  id="avatar"
                  name="avatar"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="https://example.com/avatar.jpg"
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
                    "Create Artist"
                  )}
                </button>
              </div>
            </fetcher.Form>
          </div>
        </div>
      )}

      {/* Edit Artist Modal */}
      {editArtist && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Edit Artist
              </h3>
              <button
                onClick={() => setEditArtist(null)}
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
              <input type="hidden" name="artistId" value={editArtist.id} />

              {/* Artist Name */}
              <div>
                <label
                  htmlFor="edit-name"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Artist Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="edit-name"
                  name="name"
                  required
                  defaultValue={editArtist.name}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter artist's real name"
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
                  defaultValue={editArtist.genre || ""}
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

              {/* Country */}
              <div>
                <label
                  htmlFor="edit-country"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Country
                </label>
                <select
                  id="edit-country"
                  name="country"
                  defaultValue={editArtist.country || ""}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select Country</option>
                  <option value="South Korea">South Korea</option>
                  <option value="North Korea">North Korea</option>
                  <option value="United States">United States</option>
                  <option value="Japan">Japan</option>
                  <option value="China">China</option>
                  <option value="Thailand">Thailand</option>
                  <option value="Philippines">Philippines</option>
                  <option value="Indonesia">Indonesia</option>
                  <option value="Malaysia">Malaysia</option>
                  <option value="Singapore">Singapore</option>
                  <option value="Vietnam">Vietnam</option>
                  <option value="India">India</option>
                  <option value="Australia">Australia</option>
                  <option value="Canada">Canada</option>
                  <option value="United Kingdom">United Kingdom</option>
                  <option value="Germany">Germany</option>
                  <option value="France">France</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              {/* Debut Year */}
              <div>
                <label
                  htmlFor="edit-debutYear"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Debut Year
                </label>
                <input
                  type="number"
                  id="edit-debutYear"
                  name="debutYear"
                  min="1950"
                  max={new Date().getFullYear()}
                  defaultValue={editArtist.debutYear || ""}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., 2023"
                />
              </div>

              {/* Bio */}
              <div>
                <label
                  htmlFor="edit-bio"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Biography
                </label>
                <textarea
                  id="edit-bio"
                  name="bio"
                  rows={3}
                  defaultValue={editArtist.bio || ""}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Brief description about the artist..."
                />
              </div>

              {/* Avatar URL */}
              <div>
                <label
                  htmlFor="edit-avatar"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Avatar Image URL
                </label>
                <input
                  type="url"
                  id="edit-avatar"
                  name="avatar"
                  defaultValue={editArtist.avatar || ""}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="https://example.com/avatar.jpg"
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
                  defaultValue={editArtist.coverImage || ""}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="https://example.com/cover.jpg"
                />
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setEditArtist(null)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  Update Artist
                </button>
              </div>
            </fetcher.Form>
          </div>
        </div>
      )}
    </div>
  );
}
