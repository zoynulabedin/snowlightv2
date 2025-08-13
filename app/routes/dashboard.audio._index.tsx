import {
  LoaderFunctionArgs,
  ActionFunctionArgs,
  redirect,
} from "@remix-run/node";
import { useLoaderData, useActionData, Form, Link } from "@remix-run/react";
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
            name: true,
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
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return { songs, user };
  } catch (error) {
    console.error("Audio dashboard loader error:", error);
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

    if (!songId) {
      return { error: "Song ID is required" };
    }

    switch (intent) {
      case "toggle-publish": {
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

        return { success: "Song publish status updated" };
      }

      case "toggle-approve": {
        const song = await db.song.findUnique({
          where: { id: songId },
          select: { isApproved: true },
        });

        if (!song) {
          return { error: "Song not found" };
        }

        await db.song.update({
          where: { id: songId },
          data: { isApproved: !song.isApproved },
        });

        return { success: "Song approval status updated" };
      }

      case "toggle-feature": {
        const song = await db.song.findUnique({
          where: { id: songId },
          select: { isFeatured: true },
        });

        if (!song) {
          return { error: "Song not found" };
        }

        await db.song.update({
          where: { id: songId },
          data: { isFeatured: !song.isFeatured },
        });

        return { success: "Song featured status updated" };
      }

      case "delete": {
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
    return { error: "Something went wrong" };
  }
}

export default function AudioDashboard() {
  const { songs, user } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const [searchTerm, setSearchTerm] = useState("");
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  const filteredSongs = songs.filter(
    (song) =>
      song.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      song.artists.some((artistRel) =>
        artistRel.artist.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
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
                Audio Management
              </h1>
              <p className="text-gray-600 mt-1">
                Manage all audio tracks, uploads, and permissions
              </p>
            </div>
            <button
              onClick={() => setIsUploadModalOpen(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center"
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
        </header>

        {/* Content */}
        <main className="flex-1 p-6 overflow-auto">
          {/* Action Messages */}
          {actionData?.error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
              {actionData.error}
            </div>
          )}
          {actionData?.success && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-6">
              {actionData.success}
            </div>
          )}

          {/* Search */}
          <div className="mb-6">
            <input
              type="text"
              placeholder="Search songs or artists..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Songs Table */}
          <div className="bg-white shadow-md rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full table-auto">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Song
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Artist
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Album
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Stats
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredSongs.map((song) => (
                    <tr key={song.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            {song.coverImage ? (
                              <img
                                className="h-10 w-10 rounded object-cover"
                                src={song.coverImage}
                                alt={song.title}
                              />
                            ) : (
                              <div className="h-10 w-10 rounded bg-gray-200 flex items-center justify-center">
                                <span className="text-gray-500 text-xs">
                                  No Image
                                </span>
                              </div>
                            )}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {song.title}
                            </div>
                            <div className="text-sm text-gray-500">
                              {song.genre || "No Genre"}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {song.artists.length > 0
                            ? song.artists.map((a) => a.artist.name).join(", ")
                            : "No Artist"}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {song.album?.title || "No Album"}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-col space-y-1">
                          <span
                            className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              song.isPublished
                                ? "bg-green-100 text-green-800"
                                : "bg-red-100 text-red-800"
                            }`}
                          >
                            {song.isPublished ? "Published" : "Draft"}
                          </span>
                          <span
                            className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              song.isApproved
                                ? "bg-blue-100 text-blue-800"
                                : "bg-yellow-100 text-yellow-800"
                            }`}
                          >
                            {song.isApproved ? "Approved" : "Pending"}
                          </span>
                          {song.isFeatured && (
                            <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-purple-100 text-purple-800">
                              Featured
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="space-y-1">
                          <div>Views: {song.views}</div>
                          <div>Plays: {song.plays}</div>
                          <div>Likes: {song.likes}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-y-2">
                        <div className="flex flex-col space-y-2">
                          {/* Toggle Actions */}
                          <div className="flex space-x-2">
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
                                className={`px-3 py-1 text-xs rounded ${
                                  song.isPublished
                                    ? "bg-red-100 text-red-700 hover:bg-red-200"
                                    : "bg-green-100 text-green-700 hover:bg-green-200"
                                }`}
                              >
                                {song.isPublished ? "Unpublish" : "Publish"}
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
                                value="toggle-approve"
                              />
                              <button
                                type="submit"
                                className={`px-3 py-1 text-xs rounded ${
                                  song.isApproved
                                    ? "bg-yellow-100 text-yellow-700 hover:bg-yellow-200"
                                    : "bg-blue-100 text-blue-700 hover:bg-blue-200"
                                }`}
                              >
                                {song.isApproved ? "Unapprove" : "Approve"}
                              </button>
                            </Form>
                          </div>

                          <div className="flex space-x-2">
                            <Form method="post" className="inline">
                              <input
                                type="hidden"
                                name="songId"
                                value={song.id}
                              />
                              <input
                                type="hidden"
                                name="intent"
                                value="toggle-feature"
                              />
                              <button
                                type="submit"
                                className={`px-3 py-1 text-xs rounded ${
                                  song.isFeatured
                                    ? "bg-purple-100 text-purple-700 hover:bg-purple-200"
                                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                                }`}
                              >
                                {song.isFeatured ? "Unfeature" : "Feature"}
                              </button>
                            </Form>

                            <Link
                              to={`/song/${song.id}`}
                              className="px-3 py-1 text-xs rounded bg-blue-100 text-blue-700 hover:bg-blue-200"
                            >
                              View
                            </Link>
                          </div>

                          {/* Delete Action */}
                          <Form method="post" className="inline">
                            <input
                              type="hidden"
                              name="songId"
                              value={song.id}
                            />
                            <input type="hidden" name="intent" value="delete" />
                            <button
                              type="submit"
                              className="px-3 py-1 text-xs rounded bg-red-100 text-red-700 hover:bg-red-200"
                              onClick={(e) => {
                                if (
                                  !confirm(
                                    "Are you sure you want to delete this song?"
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
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {filteredSongs.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-500">
                  {searchTerm
                    ? "No songs found matching your search."
                    : "No songs uploaded yet."}
                </p>
              </div>
            )}
          </div>

          {/* Summary Stats */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="text-sm font-medium text-gray-500">
                Total Songs
              </div>
              <div className="text-2xl font-bold text-gray-900">
                {songs.length}
              </div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="text-sm font-medium text-gray-500">Published</div>
              <div className="text-2xl font-bold text-green-600">
                {songs.filter((s) => s.isPublished).length}
              </div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="text-sm font-medium text-gray-500">Approved</div>
              <div className="text-2xl font-bold text-blue-600">
                {songs.filter((s) => s.isApproved).length}
              </div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="text-sm font-medium text-gray-500">Featured</div>
              <div className="text-2xl font-bold text-purple-600">
                {songs.filter((s) => s.isFeatured).length}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
