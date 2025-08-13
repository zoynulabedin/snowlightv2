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

    // Fetch artists with related data
    const artists = await db.artist.findMany({
      include: {
        songArtists: {
          select: {
            song: {
              select: {
                id: true,
                title: true,
              },
            },
          },
        },
        albumArtists: {
          select: {
            album: {
              select: {
                id: true,
                title: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return { user, artists };
  } catch (error) {
    console.error("Artist dashboard loader error:", error);
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
        const name = formData.get("name") as string;
        const stageName = formData.get("stageName") as string;
        const bio = formData.get("bio") as string;
        const genre = formData.get("genre") as string;
        const country = formData.get("country") as string;

        if (!name) {
          return { error: "Artist name is required" };
        }

        const newArtist = await db.artist.create({
          data: {
            name,
            stageName: stageName || null,
            bio: bio || null,
            genre: genre || null,
            country: country || null,
          },
        });

        return {
          success: "Artist created successfully",
          artistId: newArtist.id,
        };
      }

      case "delete": {
        const artistId = formData.get("artistId") as string;
        if (!artistId) {
          return { error: "Artist ID is required" };
        }

        await db.artist.delete({
          where: { id: artistId },
        });

        return { success: "Artist deleted successfully" };
      }

      case "toggle-verified": {
        const artistId = formData.get("artistId") as string;
        if (!artistId) {
          return { error: "Artist ID is required" };
        }

        const artist = await db.artist.findUnique({
          where: { id: artistId },
          select: { isVerified: true },
        });

        if (!artist) {
          return { error: "Artist not found" };
        }

        await db.artist.update({
          where: { id: artistId },
          data: { isVerified: !artist.isVerified },
        });

        return { success: "Artist verification status updated successfully" };
      }

      default:
        return { error: "Invalid action" };
    }
  } catch (error) {
    console.error("Artist action error:", error);
    return { error: "Failed to process request" };
  }
}

export default function ArtistManagement() {
  const { artists, user } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const [searchTerm, setSearchTerm] = useState("");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const filteredArtists = artists.filter(
    (artist) =>
      artist.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (artist.stageName || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      (artist.genre || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <DashboardSidebar user={user} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">
                Artist Management
              </h1>
              <p className="text-gray-600 mt-1">
                Manage music artists and performers
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
              Add Artist
            </button>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 p-6 overflow-auto">
          {/* Search */}
          <div className="mb-6">
            <input
              type="text"
              placeholder="Search artists..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full max-w-md px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Artists Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredArtists.map((artist) => (
              <div
                key={artist.id}
                className="bg-white rounded-lg shadow-md p-6"
              >
                <div className="flex items-center mb-4">
                  <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mr-4">
                    {artist.avatar ? (
                      <img
                        src={artist.avatar}
                        alt={artist.name}
                        className="w-16 h-16 rounded-full object-cover"
                      />
                    ) : (
                      <svg
                        className="w-8 h-8 text-gray-400"
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
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">
                      {artist.stageName || artist.name}
                    </h3>
                    {artist.stageName && artist.name !== artist.stageName && (
                      <p className="text-gray-600 text-sm">
                        Real Name: {artist.name}
                      </p>
                    )}
                    {artist.isVerified && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 mt-1">
                        <svg
                          className="w-3 h-3 mr-1"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                            clipRule="evenodd"
                          />
                        </svg>
                        Verified
                      </span>
                    )}
                  </div>
                </div>

                {artist.genre && (
                  <p className="text-gray-600 text-sm mb-2">
                    Genre: {artist.genre}
                  </p>
                )}
                {artist.country && (
                  <p className="text-gray-600 text-sm mb-2">
                    Country: {artist.country}
                  </p>
                )}
                <p className="text-gray-600 text-sm mb-2">
                  Songs: {artist.songArtists.length}
                </p>
                <p className="text-gray-600 text-sm mb-4">
                  Albums: {artist.albumArtists.length}
                </p>

                <div className="flex space-x-2">
                  <Form method="post" className="inline">
                    <input
                      type="hidden"
                      name="intent"
                      value="toggle-verified"
                    />
                    <input type="hidden" name="artistId" value={artist.id} />
                    <button
                      type="submit"
                      className={`px-3 py-1 rounded text-sm ${
                        artist.isVerified
                          ? "bg-blue-100 text-blue-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {artist.isVerified ? "Verified" : "Unverified"}
                    </button>
                  </Form>

                  <Form method="post" className="inline">
                    <input type="hidden" name="intent" value="delete" />
                    <input type="hidden" name="artistId" value={artist.id} />
                    <button
                      type="submit"
                      className="px-3 py-1 bg-red-100 text-red-800 rounded text-sm hover:bg-red-200"
                      onClick={(e) => {
                        if (
                          !confirm(
                            "Are you sure you want to delete this artist?"
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

          {/* Create Artist Modal */}
          {isCreateModalOpen && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold">Add New Artist</h2>
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
                      htmlFor="name"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Real Name *
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="stageName"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Stage Name
                    </label>
                    <input
                      type="text"
                      id="stageName"
                      name="stageName"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="genre"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Genre
                    </label>
                    <input
                      type="text"
                      id="genre"
                      name="genre"
                      placeholder="e.g., K-Pop, Hip Hop, Rock"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="country"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Country
                    </label>
                    <input
                      type="text"
                      id="country"
                      name="country"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

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
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div className="flex space-x-3 pt-4">
                    <button
                      type="submit"
                      className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
                    >
                      Add Artist
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
    </div>
  );
}
