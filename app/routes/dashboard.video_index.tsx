import {
  json,
  LoaderFunctionArgs,
  ActionFunctionArgs,
  redirect,
} from "@remix-run/node";
import { Form, Link, useLoaderData, useActionData } from "@remix-run/react";
import { useState } from "react";
import {
  Video,
  Plus,
  Search,
  Filter,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  Clock,
  CheckCircle,
  Play,
  Users,
} from "lucide-react";
import { validateSession } from "~/lib/auth";
import { db } from "~/lib/db";

export async function loader({ request }: LoaderFunctionArgs) {
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

  const url = new URL(request.url);
  const search = url.searchParams.get("search") || "";
  const status = url.searchParams.get("status") || "";
  const page = parseInt(url.searchParams.get("page") || "1");
  const limit = 10;
  const offset = (page - 1) * limit;

  const where = {
    ...(search && {
      OR: [
        { title: { contains: search, mode: "insensitive" as const } },
        { description: { contains: search, mode: "insensitive" as const } },
      ],
    }),
    ...(status === "published" && { isPublished: true }),
    ...(status === "unpublished" && { isPublished: false }),
    ...(status === "approved" && { isApproved: true }),
    ...(status === "pending" && { isApproved: false }),
  };

  const [videos, totalCount] = await Promise.all([
    db.video.findMany({
      where,
      include: {
        artists: {
          include: {
            artist: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      skip: offset,
      take: limit,
    }),
    db.video.count({ where }),
  ]);

  const totalPages = Math.ceil(totalCount / limit);

  return json({
    videos,
    totalCount,
    currentPage: page,
    totalPages,
    search,
    status,
    user,
  });
}

export async function action({ request }: ActionFunctionArgs) {
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
  const action = formData.get("action") as string;
  const videoId = formData.get("videoId") as string;

  try {
    switch (action) {
      case "delete": {
        await db.video.delete({
          where: { id: videoId },
        });
        return json({ success: "Video deleted successfully" });
      }

      case "togglePublish": {
        const video = await db.video.findUnique({
          where: { id: videoId },
          select: { isPublished: true },
        });

        await db.video.update({
          where: { id: videoId },
          data: { isPublished: !video?.isPublished },
        });
        return json({ success: "Video status updated" });
      }

      case "toggleApproval": {
        if (!["ADMIN", "SUPER_ADMIN"].includes(user.role)) {
          return json({ error: "Insufficient permissions" }, { status: 403 });
        }

        const videoToApprove = await db.video.findUnique({
          where: { id: videoId },
          select: { isApproved: true },
        });

        await db.video.update({
          where: { id: videoId },
          data: { isApproved: !videoToApprove?.isApproved },
        });
        return json({ success: "Video approval status updated" });
      }

      default:
        return json({ error: "Invalid action" }, { status: 400 });
    }
  } catch (error) {
    console.error("Action error:", error);
    return json({ error: "Failed to perform action" }, { status: 500 });
  }
}

export default function DashboardVideos() {
  const { videos, totalCount, currentPage, totalPages, search, status, user } =
    useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const [searchQuery, setSearchQuery] = useState(search);

  const formatDuration = (seconds: number | null) => {
    if (!seconds) return "0:00";
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  const formatViews = (views: number) => {
    if (views >= 1000000) {
      return `${(views / 1000000).toFixed(1)}M`;
    } else if (views >= 1000) {
      return `${(views / 1000).toFixed(1)}K`;
    }
    return views.toString();
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <Video className="w-8 h-8 text-red-500" />
              Video Management
            </h1>
            <p className="text-gray-400 mt-2">
              Manage your video content • {totalCount} total videos
            </p>
          </div>
          <Link
            to="/dashboard/video/new"
            className="bg-red-600 hover:bg-red-700 px-6 py-3 rounded-lg flex items-center gap-2 transition-colors"
          >
            <Plus className="w-5 h-5" />
            Upload Video
          </Link>
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

        {/* Search and Filters */}
        <div className="bg-gray-800 rounded-lg p-6 mb-8">
          <Form method="get" className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  name="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search videos by title or description..."
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg pl-10 pr-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>
            </div>
            <div className="flex gap-4">
              <select
                name="status"
                defaultValue={status}
                className="bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                <option value="">All Status</option>
                <option value="published">Published</option>
                <option value="unpublished">Unpublished</option>
                <option value="approved">Approved</option>
                <option value="pending">Pending Approval</option>
              </select>
              <button
                type="submit"
                className="bg-red-600 hover:bg-red-700 px-6 py-3 rounded-lg flex items-center gap-2 transition-colors"
              >
                <Filter className="w-5 h-5" />
                Filter
              </button>
            </div>
          </Form>
        </div>

        {/* Videos Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {videos.map((video) => (
            <div
              key={video.id}
              className="bg-gray-800 rounded-lg overflow-hidden"
            >
              {/* Video Thumbnail */}
              <div className="relative aspect-video bg-gray-700">
                {video.thumbnailUrl ? (
                  <img
                    src={video.thumbnailUrl}
                    alt={video.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Video className="w-12 h-12 text-gray-500" />
                  </div>
                )}

                {/* Play Button Overlay */}
                <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                  <div className="bg-white/20 backdrop-blur-sm rounded-full p-4">
                    <Play className="w-8 h-8 text-white fill-current" />
                  </div>
                </div>

                {/* Duration Badge */}
                {video.duration && (
                  <div className="absolute bottom-2 right-2 bg-black/70 text-white text-sm px-2 py-1 rounded">
                    {formatDuration(video.duration)}
                  </div>
                )}

                {/* Status Badges */}
                <div className="absolute top-2 left-2 flex gap-2">
                  {video.isPublished ? (
                    <span className="bg-green-600 text-white text-xs px-2 py-1 rounded flex items-center gap-1">
                      <Eye className="w-3 h-3" />
                      Published
                    </span>
                  ) : (
                    <span className="bg-gray-600 text-white text-xs px-2 py-1 rounded flex items-center gap-1">
                      <EyeOff className="w-3 h-3" />
                      Draft
                    </span>
                  )}

                  {video.isApproved ? (
                    <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded flex items-center gap-1">
                      <CheckCircle className="w-3 h-3" />
                      Approved
                    </span>
                  ) : (
                    <span className="bg-orange-600 text-white text-xs px-2 py-1 rounded flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      Pending
                    </span>
                  )}
                </div>
              </div>

              {/* Video Info */}
              <div className="p-4">
                <h3 className="font-semibold text-lg mb-2 line-clamp-2">
                  {video.title}
                </h3>

                {/* Artists */}
                {video.artists.length > 0 && (
                  <div className="flex items-center gap-2 text-gray-400 text-sm mb-2">
                    <Users className="w-4 h-4" />
                    {video.artists
                      .map((va) => va.artist.stageName || va.artist.name)
                      .join(", ")}
                  </div>
                )}

                {/* Stats */}
                <div className="flex items-center gap-4 text-gray-400 text-sm mb-4">
                  <span>{formatViews(video.views)} views</span>
                  <span>{video.likes} likes</span>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2">
                  <Link
                    to={`/dashboard/video/${video.id}`}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-center py-2 px-4 rounded text-sm transition-colors flex items-center justify-center gap-2"
                  >
                    <Edit className="w-4 h-4" />
                    Edit
                  </Link>

                  <Form method="post" className="flex gap-2">
                    <input type="hidden" name="videoId" value={video.id} />

                    <button
                      type="submit"
                      name="action"
                      value="togglePublish"
                      className={`px-3 py-2 rounded text-sm transition-colors ${
                        video.isPublished
                          ? "bg-gray-600 hover:bg-gray-700 text-white"
                          : "bg-green-600 hover:bg-green-700 text-white"
                      }`}
                      title={video.isPublished ? "Unpublish" : "Publish"}
                    >
                      {video.isPublished ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>

                    {["ADMIN", "SUPER_ADMIN"].includes(user.role) && (
                      <button
                        type="submit"
                        name="action"
                        value="toggleApproval"
                        className={`px-3 py-2 rounded text-sm transition-colors ${
                          video.isApproved
                            ? "bg-orange-600 hover:bg-orange-700 text-white"
                            : "bg-blue-600 hover:bg-blue-700 text-white"
                        }`}
                        title={video.isApproved ? "Unapprove" : "Approve"}
                      >
                        {video.isApproved ? (
                          <Clock className="w-4 h-4" />
                        ) : (
                          <CheckCircle className="w-4 h-4" />
                        )}
                      </button>
                    )}

                    <button
                      type="submit"
                      name="action"
                      value="delete"
                      className="bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded text-sm transition-colors"
                      onClick={(e) => {
                        if (
                          !confirm(
                            "Are you sure you want to delete this video?"
                          )
                        ) {
                          e.preventDefault();
                        }
                      }}
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </Form>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {videos.length === 0 && (
          <div className="text-center py-12">
            <Video className="w-16 h-16 text-gray-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-400 mb-2">
              No videos found
            </h3>
            <p className="text-gray-500 mb-6">
              {search || status
                ? "Try adjusting your search or filters"
                : "Upload your first video to get started"}
            </p>
            <Link
              to="/dashboard/video/new"
              className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg transition-colors"
            >
              <Plus className="w-5 h-5" />
              Upload Video
            </Link>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-2">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <Link
                key={page}
                to={`?page=${page}${search ? `&search=${search}` : ""}${
                  status ? `&status=${status}` : ""
                }`}
                className={`px-4 py-2 rounded transition-colors ${
                  currentPage === page
                    ? "bg-red-600 text-white"
                    : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                }`}
              >
                {page}
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
