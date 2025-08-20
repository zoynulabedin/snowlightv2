import {
  LoaderFunctionArgs,
  ActionFunctionArgs,
  redirect,
} from "@remix-run/node";
import { useLoaderData, useActionData, Form } from "@remix-run/react";
import { useState } from "react";
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
      return redirect("/login");
    }

    const user = await validateSession(token);
    if (
      !user ||
      (!user.isAdmin &&
        !["ADMIN", "SUPER_ADMIN", "MODERATOR"].includes(user.role))
    ) {
      return redirect("/login");
    }

    // Fetch albums with related data
    const albums = await db.album.findMany({
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
        songs: {
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

    // Fetch artists for album creation
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
  } catch (error) {
    console.error("Album dashboard loader error:", error);
    return redirect("/login");
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

    switch (intent) {
      case "create": {
        const title = formData.get("title") as string;
        const artistId = formData.get("artistId") as string;
        const description = formData.get("description") as string;
        const releaseDate = formData.get("releaseDate") as string;

        if (!title || !artistId) {
          return { error: "Title and artist are required" };
        }

        const newAlbum = await db.album.create({
          data: {
            title,
            description,
            releaseDate: releaseDate ? new Date(releaseDate) : null,
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

        return { success: "Album created successfully", albumId: newAlbum.id };
      }

      case "delete": {
        const albumId = formData.get("albumId") as string;
        if (!albumId) {
          return { error: "Album ID is required" };
        }

        await db.album.delete({
          where: { id: albumId },
        });

        return { success: "Album deleted successfully" };
      }

      case "toggle-publish": {
        const albumId = formData.get("albumId") as string;
        if (!albumId) {
          return { error: "Album ID is required" };
        }

        const album = await db.album.findUnique({
          where: { id: albumId },
          select: { isPublished: true },
        });

        if (!album) {
          return { error: "Album not found" };
        }

        await db.album.update({
          where: { id: albumId },
          data: { isPublished: !album.isPublished },
        });

        return { success: "Album status updated successfully" };
      }

      default:
        return { error: "Invalid action" };
    }
  } catch (error) {
    console.error("Album action error:", error);
    return { error: "Failed to process request" };
  }
}

export default function AlbumManagement() {
  const { albums, artists, user } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const [searchTerm, setSearchTerm] = useState("");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const filteredAlbums = albums.filter(
    (album) =>
      album.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      album.artists.some((artistRel) =>
        (artistRel.artist.stageName || artistRel.artist.name)
          .toLowerCase()
          .includes(searchTerm.toLowerCase())
      )
  );

  return (
    <>
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">
                Album Management
              </h1>
              <p className="text-gray-600 mt-1">
                Create and manage music albums
              </p>
            </div>
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
              Add Album
            </button>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 p-6 overflow-auto">
          {/* Search */}
          <div className="mb-6">
            <input
              type="text"
              placeholder="Search albums..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full max-w-md px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Albums Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAlbums.map((album) => (
              <div key={album.id} className="bg-white rounded-lg shadow-md p-6">
                <div className="aspect-square bg-gray-200 rounded-lg mb-4 flex items-center justify-center">
                  {album.coverImage ? (
                    <img
                      src={album.coverImage}
                      alt={album.title}
                      className="w-full h-full object-cover rounded-lg"
                    />
                  ) : (
                    <svg
                      className="w-12 h-12 text-gray-400"
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
                  )}
                </div>

                <h3 className="font-semibold text-lg mb-2">{album.title}</h3>
                <p className="text-gray-600 text-sm mb-2">
                  Artist:{" "}
                  {album.artists
                    .map((a) => a.artist.stageName || a.artist.name)
                    .join(", ")}
                </p>
                <p className="text-gray-600 text-sm mb-2">
                  Songs: {album.songs.length}
                </p>
                {album.releaseDate && (
                  <p className="text-gray-600 text-sm mb-2">
                    Released: {new Date(album.releaseDate).toLocaleDateString()}
                  </p>
                )}

                <div className="flex space-x-2 mt-4">
                  <Form method="post" className="inline">
                    <input type="hidden" name="intent" value="toggle-publish" />
                    <input type="hidden" name="albumId" value={album.id} />
                    <button
                      type="submit"
                      className={`px-3 py-1 rounded text-sm ${
                        album.isPublished
                          ? "bg-green-100 text-green-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {album.isPublished ? "Published" : "Draft"}
                    </button>
                  </Form>

                  <Form method="post" className="inline">
                    <input type="hidden" name="intent" value="delete" />
                    <input type="hidden" name="albumId" value={album.id} />
                    <button
                      type="submit"
                      className="px-3 py-1 bg-red-100 text-red-800 rounded text-sm hover:bg-red-200"
                      onClick={(e) => {
                        if (
                          !confirm(
                            "Are you sure you want to delete this album?"
                          )
                        ) {
                          e.preventDefault();
                        }
                      }}
                    >
                      Delete
                    </button>
                  </Form>
                </div>
              </div>
            ))}
          </div>

          {/* Create Album Modal */}
          {isCreateModalOpen && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold">Create Album</h2>
                  <button
                    onClick={() => setIsCreateModalOpen(false)}
                    className="text-gray-500 hover:text-gray-700"
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

                <Form method="post" className="space-y-4">
                  <input type="hidden" name="intent" value="create" />

                  <div>
                    <label
                      htmlFor="title"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Album Title *
                    </label>
                    <input
                      type="text"
                      id="title"
                      name="title"
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="artistId"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Artist *
                    </label>
                    <select
                      id="artistId"
                      name="artistId"
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Select Artist</option>
                      {artists.map((artist) => (
                        <option key={artist.id} value={artist.id}>
                          {artist.stageName || artist.name}
                        </option>
                      ))}
                    </select>
                  </div>

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
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

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
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div className="flex space-x-3 pt-4">
                    <button
                      type="submit"
                      className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
                    >
                      Create Album
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsCreateModalOpen(false)}
                      className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </Form>
              </div>
            </div>
          )}

          {/* Action Messages */}
          {actionData?.error && (
            <div className="fixed bottom-4 right-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              {actionData.error}
            </div>
          )}
          {actionData?.success && (
            <div className="fixed bottom-4 right-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
              {actionData.success}
            </div>
          )}
        </main>
      </div>
    </>
  );
}
