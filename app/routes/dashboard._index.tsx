import { LoaderFunctionArgs, redirect } from "@remix-run/node";
import { useLoaderData, Link } from "@remix-run/react";
import { Music, Disc, Users, UserCheck, Eye, Settings } from "lucide-react";
import { validateSession } from "~/lib/auth";
import { db } from "~/lib/db";
import DashboardSidebar from "~/components/DashboardSidebar";

export async function loader({ request }: LoaderFunctionArgs) {
  try {
    // Get token from cookie
    const cookieHeader = request.headers.get("Cookie");
    const token = cookieHeader
      ?.split(";")
      .find((c) => c.trim().startsWith("auth-token="))
      ?.split("=")[1];

    if (!token) {
      return redirect("/login");
    }

    // Validate session
    const user = await validateSession(token);
    if (
      !user ||
      (!user.isAdmin &&
        !["ADMIN", "SUPER_ADMIN", "MODERATOR"].includes(user.role))
    ) {
      console.log("User not authorized:", {
        isAdmin: user?.isAdmin,
        role: user?.role,
      });
      return redirect("/login");
    }

    // Get statistics
    const stats = await Promise.all([
      db.song.count(),
      db.album.count(),
      db.artist.count(),
      db.user.count(),
    ]);

    // Get recent songs
    const recentSongs = await db.song.findMany({
      take: 10,
      orderBy: { createdAt: "desc" },
      include: {
        uploadedBy: {
          select: { username: true },
        },
        artists: {
          include: { artist: true },
        },
        album: {
          select: { title: true },
        },
      },
    });

    return {
      user,
      stats: {
        totalSongs: stats[0],
        totalAlbums: stats[1],
        totalArtists: stats[2],
        totalUsers: stats[3],
      },
      recentSongs: recentSongs.map((song) => ({
        ...song,
        artist: song.artists[0]?.artist,
      })),
    };
  } catch (error) {
    console.error("Dashboard loader error:", error);
    return redirect("/login");
  }
}

export default function Dashboard() {
  const data = useLoaderData<typeof loader>();

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <DashboardSidebar user={data.user} />
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
          <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
        </header>

        {/* Content */}
        <main className="flex-1 p-6">
          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Total Songs
                  </p>
                  <p className="text-3xl font-bold text-blue-600">
                    {data.stats.totalSongs}
                  </p>
                </div>
                <Music className="h-12 w-12 text-blue-500" />
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Total Albums
                  </p>
                  <p className="text-3xl font-bold text-green-600">
                    {data.stats.totalAlbums}
                  </p>
                </div>
                <Disc className="h-12 w-12 text-green-500" />
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Total Artists
                  </p>
                  <p className="text-3xl font-bold text-purple-600">
                    {data.stats.totalArtists}
                  </p>
                </div>
                <Users className="h-12 w-12 text-purple-500" />
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Total Users
                  </p>
                  <p className="text-3xl font-bold text-orange-600">
                    {data.stats.totalUsers}
                  </p>
                </div>
                <UserCheck className="h-12 w-12 text-orange-500" />
              </div>
            </div>
          </div>

          {/* Table Section - Exactly as shown in wireframe */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-800">Table</h2>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Title
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Artist
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Album
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Duration
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {data.recentSongs.map((song) => (
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
                                <Music className="h-5 w-5 text-gray-400" />
                              </div>
                            )}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {song.title}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {song.artist?.name || "Unknown Artist"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {song.album?.title || "No Album"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {song.duration || "Unknown"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <Link
                            to={`/song/${song.id}`}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            <Eye className="h-4 w-4" />
                          </Link>
                          <Link
                            to={`/dashboard/audio/edit/${song.id}`}
                            className="text-green-600 hover:text-green-900"
                          >
                            <Settings className="h-4 w-4" />
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
