import {
  json,
  LoaderFunctionArgs,
  ActionFunctionArgs,
  redirect,
} from "@remix-run/node";
import {
  Form,
  Link,
  useLoaderData,
  useActionData,
  useSubmit,
} from "@remix-run/react";
import { useState } from "react";
import {
  Music,
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
  Pause,
  Download,
  Heart,
  Upload,
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
  const genre = url.searchParams.get("genre") || "";
  const page = parseInt(url.searchParams.get("page") || "1");
  const limit = 15;
  const offset = (page - 1) * limit;

  const where = {
    uploadedById: user.id,
    ...(search && {
      OR: [
        { title: { contains: search, mode: "insensitive" as const } },
        { genre: { contains: search, mode: "insensitive" as const } },
        { description: { contains: search, mode: "insensitive" as const } },
      ],
    }),
    ...(status === "published" && { isPublished: true }),
    ...(status === "unpublished" && { isPublished: false }),
    ...(status === "approved" && { isApproved: true }),
    ...(status === "pending" && { isApproved: false }),
    ...(genre && { genre: genre }),
  };

  const [songs, totalCount] = await Promise.all([
    db.song.findMany({
      where,
      include: {
        album: { select: { id: true, title: true } },
        artists: {
          include: {
            artist: { select: { id: true, name: true, stageName: true } },
          },
        },
        uploadedBy: { select: { id: true, name: true, username: true } },
      },
      orderBy: { createdAt: "desc" },
      skip: offset,
      take: limit,
    }),
    db.song.count({ where }),
  ]);

  const totalPages = Math.ceil(totalCount / limit);

  return json({
    songs,
    totalCount,
    currentPage: page,
    totalPages,
    search,
    status,
    genre,
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
  const songId = formData.get("songId") as string;

  try {
    switch (action) {
      case "togglePublish": {
        const song = await db.song.findUnique({
          where: { id: songId, uploadedById: user.id },
          select: { isPublished: true },
        });

        if (!song) {
          return json({ error: "Song not found" }, { status: 404 });
        }

        await db.song.update({
          where: { id: songId },
          data: { isPublished: !song.isPublished },
        });

        return json({ success: "Song status updated successfully" });
      }

      case "delete": {
        const song = await db.song.findUnique({
          where: { id: songId, uploadedById: user.id },
        });

        if (!song) {
          return json({ error: "Song not found" }, { status: 404 });
        }

        await db.song.delete({
          where: { id: songId },
        });

        return json({ success: "Song deleted successfully" });
      }

      default:
        return json({ error: "Invalid action" }, { status: 400 });
    }
  } catch (error) {
    console.error("Error in dashboard audio action:", error);
    return json(
      { error: "An error occurred while processing your request" },
      { status: 500 }
    );
  }
}

export default function DashboardAudio() {
  const {
    songs,
    totalCount,
    currentPage,
    totalPages,
    search,
    status,
    genre,
    user,
  } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const submit = useSubmit();

  const [searchQuery, setSearchQuery] = useState(search);
  const [selectedSongs, setSelectedSongs] = useState<string[]>([]);

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedSongs(songs.map((song) => song.id));
    } else {
      setSelectedSongs([]);
    }
  };

  const handleSelectSong = (songId: string, checked: boolean) => {
    if (checked) {
      setSelectedSongs((prev) => [...prev, songId]);
    } else {
      setSelectedSongs((prev) => prev.filter((id) => id !== songId));
    }
  };

  const formatDuration = (seconds: number | null) => {
    if (!seconds) return "0:00";
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <Music className="w-8 h-8 text-blue-500" />
              Audio Management
            </h1>
            <p className="text-gray-400 mt-2">
              Manage your audio content • {totalCount} total tracks
            </p>
          </div>
          <div className="flex gap-3">
            <Link
              to="/upload"
              className="bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-lg flex items-center gap-2 transition-colors"
            >
              <Upload className="w-5 h-5" />
              Upload Audio
            </Link>
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

        {/* Search and Filters */}
        <div className="bg-gray-800 rounded-lg p-6 mb-6">
          <Form method="get" className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  name="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by title, genre, or description..."
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg pl-10 pr-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div className="flex gap-4">
              <select
                name="status"
                defaultValue={status}
                className="bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Status</option>
                <option value="published">Published</option>
                <option value="unpublished">Unpublished</option>
              </select>
              <select
                name="genre"
                defaultValue={genre}
                className="bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Genres</option>
                <option value="POP">Pop</option>
                <option value="ROCK">Rock</option>
                <option value="HIPHOP">Hip Hop</option>
                <option value="ELECTRONIC">Electronic</option>
              </select>
              <button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-lg flex items-center gap-2 transition-colors"
              >
                <Filter className="w-5 h-5" />
                Filter
              </button>
            </div>
          </Form>
        </div>

        {/* Songs Table */}
        <div className="bg-gray-800 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-700">
                <tr>
                  <th className="px-4 py-3 text-left">
                    <input
                      type="checkbox"
                      checked={
                        selectedSongs.length === songs.length &&
                        songs.length > 0
                      }
                      onChange={(e) => handleSelectAll(e.target.checked)}
                      className="rounded border-gray-600 text-blue-600 focus:ring-blue-500"
                    />
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">
                    Track
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">
                    Artist
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">
                    Album
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">
                    Genre
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">
                    Duration
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">
                    Date
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {songs.map((song) => (
                  <tr
                    key={song.id}
                    className="hover:bg-gray-700/50 transition-colors"
                  >
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={selectedSongs.includes(song.id)}
                        onChange={(e) =>
                          handleSelectSong(song.id, e.target.checked)
                        }
                        className="rounded border-gray-600 text-blue-600 focus:ring-blue-500"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          {song.coverImage ? (
                            <img
                              src={song.coverImage}
                              alt={song.title}
                              className="w-12 h-12 rounded object-cover"
                            />
                          ) : (
                            <div className="w-12 h-12 bg-gray-600 rounded flex items-center justify-center">
                              <Music className="w-6 h-6 text-gray-400" />
                            </div>
                          )}
                        </div>
                        <div>
                          <h3 className="font-medium text-white truncate max-w-48">
                            {song.title}
                          </h3>
                          {song.description && (
                            <p className="text-sm text-gray-400 truncate max-w-48">
                              {song.description}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-300">
                      {song.artists.length > 0
                        ? song.artists
                            .map((sa) => sa.artist.stageName || sa.artist.name)
                            .join(", ")
                        : "Unknown Artist"}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-300">
                      {song.album?.title || "-"}
                    </td>
                    <td className="px-4 py-3">
                      {song.genre && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-900 text-blue-300">
                          {song.genre}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-300">
                      {formatDuration(song.duration)}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          song.isPublished
                            ? "bg-green-900 text-green-300"
                            : "bg-gray-900 text-gray-300"
                        }`}
                      >
                        {song.isPublished ? "Published" : "Draft"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-300">
                      {formatDate(song.createdAt)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Link
                          to={`/dashboard/audio/${song.id}`}
                          className="p-2 rounded hover:bg-gray-600 transition-colors"
                          title="Edit"
                        >
                          <Edit className="w-4 h-4 text-blue-400" />
                        </Link>

                        <Form method="post" className="inline">
                          <input type="hidden" name="songId" value={song.id} />
                          <button
                            type="submit"
                            name="action"
                            value="togglePublish"
                            className="p-2 rounded hover:bg-gray-600 transition-colors"
                            title={song.isPublished ? "Unpublish" : "Publish"}
                          >
                            {song.isPublished ? (
                              <EyeOff className="w-4 h-4 text-yellow-400" />
                            ) : (
                              <Eye className="w-4 h-4 text-green-400" />
                            )}
                          </button>
                        </Form>

                        <Form method="post" className="inline">
                          <input type="hidden" name="songId" value={song.id} />
                          <button
                            type="submit"
                            name="action"
                            value="delete"
                            className="p-2 rounded hover:bg-gray-600 transition-colors"
                            title="Delete"
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
                            <Trash2 className="w-4 h-4 text-red-400" />
                          </button>
                        </Form>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Empty State */}
        {songs.length === 0 && (
          <div className="text-center py-12">
            <Music className="w-16 h-16 text-gray-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-400 mb-2">
              No audio tracks found
            </h3>
            <p className="text-gray-500 mb-6">
              {search || status || genre
                ? "Try adjusting your search or filters"
                : "Upload your first audio track to get started"}
            </p>
            <Link
              to="/upload"
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors"
            >
              <Upload className="w-5 h-5" />
              Upload Audio
            </Link>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-2 mt-8">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <Link
                key={page}
                to={`?page=${page}${search ? `&search=${search}` : ""}${
                  status ? `&status=${status}` : ""
                }${genre ? `&genre=${genre}` : ""}`}
                className={`px-4 py-2 rounded transition-colors ${
                  currentPage === page
                    ? "bg-blue-600 text-white"
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
