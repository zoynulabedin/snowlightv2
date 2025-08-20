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

    // Fetch videos with related data
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

    // Fetch artists for upload modal
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

    return { user, videos, artists };
  } catch (error) {
    console.error("Video dashboard loader error:", error);
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
      case "upload": {
        const title = formData.get("title") as string;
        const artistId = formData.get("artistId") as string;
        const videoUrl = formData.get("videoUrl") as string;
        const description = formData.get("description") as string;
        const genre = formData.get("genre") as string;

        if (!title || !artistId || !videoUrl) {
          return { error: "Title, artist, and video URL are required" };
        }

        const newVideo = await db.video.create({
          data: {
            title,
            videoUrl,
            description: description || null,
            genre: genre || null,
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

        return { success: "Video uploaded successfully", videoId: newVideo.id };
      }

      case "delete": {
        const videoId = formData.get("videoId") as string;
        if (!videoId) {
          return { error: "Video ID is required" };
        }

        await db.video.delete({
          where: { id: videoId },
        });

        return { success: "Video deleted successfully" };
      }

      case "toggle-publish": {
        const videoId = formData.get("videoId") as string;
        if (!videoId) {
          return { error: "Video ID is required" };
        }

        const video = await db.song.findUnique({
          where: { id: videoId },
          select: { isPublished: true },
        });

        if (!video) {
          return { error: "Video not found" };
        }

        await db.song.update({
          where: { id: videoId },
          data: { isPublished: !video.isPublished },
        });

        return { success: "Video status updated successfully" };
      }

      default:
        return { error: "Invalid action" };
    }
  } catch (error) {
    console.error("Video action error:", error);
    return { error: "Failed to process request" };
  }
}

export default function VideoManagement() {
  const { videos, artists, user } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const [searchTerm, setSearchTerm] = useState("");
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  const filteredVideos = videos.filter(
    (video) =>
      video.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      video.artists.some((artistRel) =>
        (artistRel.artist.stageName || artistRel.artist.name)
          .toLowerCase()
          .includes(searchTerm.toLowerCase())
      )
  );

  return (
    <>
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">
                Video Management
              </h1>
              <p className="text-gray-600 mt-1">Manage videos and content</p>
            </div>
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
              Upload Video
            </button>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 p-6 overflow-auto">
          {/* Search */}
          <div className="mb-6">
            <input
              type="text"
              placeholder="Search videos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full max-w-md px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Videos Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredVideos.map((video) => (
              <div key={video.id} className="bg-white rounded-lg shadow-md p-6">
                <div className="aspect-video bg-gray-200 rounded-lg mb-4 flex items-center justify-center">
                  {video.videoUrl ? (
                    <video
                      src={video.videoUrl}
                      className="w-full h-full object-cover rounded-lg"
                      controls
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
                        d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1.01M15 10h1.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  )}
                </div>

                <h3 className="font-semibold text-lg mb-2">{video.title}</h3>
                <p className="text-gray-600 text-sm mb-2">
                  Artist:{" "}
                  {video.artists
                    .map((a) => a.artist.stageName || a.artist.name)
                    .join(", ")}
                </p>
                {video.song && (
                  <p className="text-gray-600 text-sm mb-2">
                    Related Song: {video.song.title}
                  </p>
                )}

                <div className="flex space-x-2 mt-4">
                  <Form method="post" className="inline">
                    <input type="hidden" name="intent" value="toggle-publish" />
                    <input type="hidden" name="videoId" value={video.id} />
                    <button
                      type="submit"
                      className={`px-3 py-1 rounded text-sm ${
                        video.isPublished
                          ? "bg-green-100 text-green-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {video.isPublished ? "Published" : "Draft"}
                    </button>
                  </Form>

                  <Form method="post" className="inline">
                    <input type="hidden" name="intent" value="delete" />
                    <input type="hidden" name="videoId" value={video.id} />
                    <button
                      type="submit"
                      className="px-3 py-1 bg-red-100 text-red-800 rounded text-sm hover:bg-red-200"
                      onClick={(e) => {
                        if (
                          !confirm(
                            "Are you sure you want to delete this video?"
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

          {/* Upload Modal */}
          {isUploadModalOpen && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold">Upload Video</h2>
                  <button
                    onClick={() => setIsUploadModalOpen(false)}
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
                  <input type="hidden" name="intent" value="upload" />

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Video Title *
                    </label>
                    <input
                      type="text"
                      name="title"
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Artist *
                    </label>
                    <select
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
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Genre
                    </label>
                    <input
                      type="text"
                      name="genre"
                      placeholder="e.g., K-Pop, Hip Hop, Rock"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Video URL *
                    </label>
                    <input
                      type="url"
                      name="videoUrl"
                      required
                      placeholder="https://..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description
                    </label>
                    <textarea
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
                      Upload Video
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsUploadModalOpen(false)}
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
