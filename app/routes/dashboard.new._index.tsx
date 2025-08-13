import { LoaderFunctionArgs, redirect } from "@remix-run/node";
import { useLoaderData, Link } from "@remix-run/react";
import {
  Music,
  Video,
  Disc,
  Users,
  UserCheck,
  BarChart3,
  Eye,
  Settings,
} from "lucide-react";
import { validateSession } from "~/lib/auth";
import { db } from "~/lib/db";

export async function loader({ request }: LoaderFunctionArgs) {
  try {
    const cookieHeader = request.headers.get("Cookie");
    const token = cookieHeader
      ?.split(";")
      .find((c) => c.trim().startsWith("auth-token="))
      ?.split("=")[1];

    if (!token) {
      throw redirect("/login");
    }

    const user = await validateSession(token);

    if (!user || !["ADMIN", "SUPER_ADMIN", "MODERATOR"].includes(user.role)) {
      throw redirect("/login");
    }

    // Get dashboard statistics
    const [songCount, albumCount, artistCount, userCount] = await Promise.all([
      db.song.count(),
      db.album.count(),
      db.artist.count(),
      db.user.count(),
    ]);

    // Get recent songs for the table
    const recentSongs = await db.song.findMany({
      take: 10,
      orderBy: { createdAt: "desc" },
      include: {
        uploadedBy: {
          select: { username: true },
        },
        artists: {
          include: {
            artist: {
              select: { name: true, stageName: true },
            },
          },
        },
        album: {
          select: { title: true },
        },
      },
    });

    return {
      user,
      stats: {
        songs: songCount,
        albums: albumCount,
        artists: artistCount,
        users: userCount,
      },
      recentSongs,
    };
  } catch (error) {
    console.error("Dashboard loader error:", error);
    if (error instanceof Response) {
      throw error;
    }
    throw redirect("/login");
  }
}

export default function DashboardPage() {
  const { user, stats, recentSongs } = useLoaderData<typeof loader>();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Left Sidebar */}
      <div className="fixed inset-y-0 left-0 z-50 w-80 bg-white shadow-lg">
        <div className="flex h-full flex-col">
          {/* Administrator Header */}
          <div className="bg-blue-600 text-white px-6 py-6">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center border-2 border-blue-300">
                {user.avatar ? (
                  <img
                    src={user.avatar}
                    alt="Administrator"
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  <span className="text-2xl font-bold text-white">
                    {user.username?.charAt(0).toUpperCase() || "A"}
                  </span>
                )}
              </div>
              <div>
                <h2 className="text-xl font-bold">Administrator Name</h2>
                <p className="text-blue-200">{user.username}</p>
                <p className="text-blue-300 text-sm capitalize">
                  {user.role.toLowerCase()}
                </p>
              </div>
            </div>
          </div>

          {/* Navigation Menu */}
          <nav className="flex-1 p-6 space-y-2">
            <Link
              to="/dashboard/audio"
              className="flex items-center px-4 py-3 text-gray-700 rounded-lg hover:bg-blue-50 hover:text-blue-600 transition-colors group"
            >
              <Music className="w-6 h-6 mr-4 group-hover:text-blue-600" />
              <span className="font-medium">Audio</span>
            </Link>

            <Link
              to="/dashboard/video"
              className="flex items-center px-4 py-3 text-gray-700 rounded-lg hover:bg-blue-50 hover:text-blue-600 transition-colors group"
            >
              <Video className="w-6 h-6 mr-4 group-hover:text-blue-600" />
              <span className="font-medium">Video</span>
            </Link>

            <Link
              to="/dashboard/albums"
              className="flex items-center px-4 py-3 text-gray-700 rounded-lg hover:bg-blue-50 hover:text-blue-600 transition-colors group"
            >
              <Disc className="w-6 h-6 mr-4 group-hover:text-blue-600" />
              <span className="font-medium">Album</span>
            </Link>

            <Link
              to="/dashboard/artists"
              className="flex items-center px-4 py-3 text-gray-700 rounded-lg hover:bg-blue-50 hover:text-blue-600 transition-colors group"
            >
              <Users className="w-6 h-6 mr-4 group-hover:text-blue-600" />
              <span className="font-medium">Artist</span>
            </Link>

            {user.role === "SUPER_ADMIN" && (
              <Link
                to="/dashboard/roles"
                className="flex items-center px-4 py-3 text-gray-700 rounded-lg hover:bg-blue-50 hover:text-blue-600 transition-colors group"
              >
                <UserCheck className="w-6 h-6 mr-4 group-hover:text-blue-600" />
                <span className="font-medium">User Role</span>
              </Link>
            )}

            <Link
              to="/dashboard/stats"
              className="flex items-center px-4 py-3 text-gray-700 rounded-lg hover:bg-blue-50 hover:text-blue-600 transition-colors group"
            >
              <BarChart3 className="w-6 h-6 mr-4 group-hover:text-blue-600" />
              <span className="font-medium">Statistics</span>
            </Link>

            <div className="border-t pt-4 mt-4">
              <Link
                to="/dashboard/settings"
                className="flex items-center px-4 py-3 text-gray-700 rounded-lg hover:bg-blue-50 hover:text-blue-600 transition-colors group"
              >
                <Settings className="w-6 h-6 mr-4 group-hover:text-blue-600" />
                <span className="font-medium">Settings</span>
              </Link>
            </div>
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="ml-80">
        {/* Header */}
        <header className="bg-white shadow-sm border-b px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Dashboard Overview
              </h1>
              <p className="text-gray-600">Manage your music platform</p>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                to="/upload"
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
              >
                <Music className="w-4 h-4 mr-2" />
                Upload Content
              </Link>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="p-6">
          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Total Songs
                  </p>
                  <p className="text-3xl font-bold text-gray-900">
                    {stats.songs}
                  </p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Music className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Total Albums
                  </p>
                  <p className="text-3xl font-bold text-gray-900">
                    {stats.albums}
                  </p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <Disc className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Total Artists
                  </p>
                  <p className="text-3xl font-bold text-gray-900">
                    {stats.artists}
                  </p>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Users className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Total Users
                  </p>
                  <p className="text-3xl font-bold text-gray-900">
                    {stats.users}
                  </p>
                </div>
                <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <UserCheck className="w-6 h-6 text-yellow-600" />
                </div>
              </div>
            </div>
          </div>

          {/* Recent Content Table */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b">
              <h2 className="text-lg font-semibold text-gray-900">Table</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
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
                      Uploaded By
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {recentSongs.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-12 text-center">
                        <Music className="mx-auto h-12 w-12 text-gray-400" />
                        <h3 className="mt-2 text-sm font-medium text-gray-900">
                          No songs yet
                        </h3>
                        <p className="mt-1 text-sm text-gray-500">
                          Get started by uploading your first song.
                        </p>
                      </td>
                    </tr>
                  ) : (
                    recentSongs.map((song) => (
                      <tr key={song.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            {song.coverImage ? (
                              <img
                                src={song.coverImage}
                                alt={song.title}
                                className="h-10 w-10 rounded object-cover mr-3"
                              />
                            ) : (
                              <div className="h-10 w-10 rounded bg-gray-200 flex items-center justify-center mr-3">
                                <Music className="h-5 w-5 text-gray-400" />
                              </div>
                            )}
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {song.title}
                              </div>
                              <div className="text-sm text-gray-500">
                                {song.genre}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {song.artists.length > 0
                            ? song.artists
                                .map((a) => a.artist.stageName || a.artist.name)
                                .join(", ")
                            : "Unknown Artist"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {song.album?.title || "No Album"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {song.uploadedBy?.username || "Unknown"}
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
                            <Link
                              to={`/song/${song.id}`}
                              className="text-blue-600 hover:text-blue-900"
                              title="View"
                            >
                              <Eye className="w-4 h-4" />
                            </Link>
                            <Link
                              to={`/dashboard/audio/${song.id}`}
                              className="text-indigo-600 hover:text-indigo-900"
                              title="Edit"
                            >
                              <Settings className="w-4 h-4" />
                            </Link>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
