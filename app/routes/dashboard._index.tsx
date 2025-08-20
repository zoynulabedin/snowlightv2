import { LoaderFunctionArgs, redirect, json } from "@remix-run/node";
import { useLoaderData, Link, useSearchParams } from "@remix-run/react";
import {
  Music,
  Disc,
  Users,
  UserCheck,
  Eye,
  Settings,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
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

    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get("page") || "1");
    const limit = 7; // items per page
    const skip = (page - 1) * limit;

    // Get total count for pagination
    const totalSongs = await db.song.count();
    const totalPages = Math.ceil(totalSongs / limit);

    // Get paginated songs
    const recentSongs = await db.song.findMany({
      skip,
      take: limit,
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

    return json({
      user,
      stats: {
        totalSongs,
        totalAlbums: await db.album.count(),
        totalArtists: await db.artist.count(),
        totalUsers: await db.user.count(),
      },
      pagination: {
        currentPage: page,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
      recentSongs: recentSongs.map((song) => ({
        ...song,
        artist: song.artists[0]?.artist,
      })),
    });
  } catch (error) {
    console.error("Dashboard loader error:", error);
    return redirect("/login");
  }
}

export default function Dashboard() {
  const data = useLoaderData<typeof loader>();
  const [searchParams, setSearchParams] = useSearchParams();
  const currentPage = parseInt(searchParams.get("page") || "1", 10);

  const handlePageChange = (newPage: number) => {
    setSearchParams({ page: newPage.toString() });
  };

  return (
    <>
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

            <div className="overflow-x-auto ">
              <table className="w-full min-w-7xl">
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
                            <div className="text-sm truncate font-medium text-gray-900 max-w-32">
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

            {/* Pagination Controls */}
            <div className="px-6 py-4 border-t border-gray-200">
              <div className="flex items-center justify-center">
                <div className="flex-1 flex justify-between sm:hidden">
                  {/* Mobile pagination */}
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={!data.pagination.hasPrevPage}
                    className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft className="w-4 h-4 mr-2" />
                    Previous
                  </button>
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={!data.pagination.hasNextPage}
                    className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                    <ChevronRight className="w-4 h-4 ml-2" />
                  </button>
                </div>
                <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm text-gray-700">
                      Showing page{" "}
                      <span className="font-medium">{currentPage}</span> of{" "}
                      <span className="font-medium">
                        {data.pagination.totalPages}
                      </span>
                    </p>
                  </div>
                  <div>
                    <nav
                      className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px"
                      aria-label="Pagination"
                    >
                      <button
                        onClick={() => handlePageChange(1)}
                        disabled={currentPage === 1}
                        className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <span className="sr-only">First</span>
                        <span>First</span>
                      </button>
                      <button
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={!data.pagination.hasPrevPage}
                        className="relative inline-flex items-center px-2 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <span className="sr-only">Previous</span>
                        <ChevronLeft className="w-4 h-4" />
                      </button>
                      <span className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-gray-100 text-sm font-medium text-gray-700">
                        {currentPage}
                      </span>
                      <button
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={!data.pagination.hasNextPage}
                        className="relative inline-flex items-center px-2 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <span className="sr-only">Next</span>
                        <ChevronRight className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() =>
                          handlePageChange(data.pagination.totalPages)
                        }
                        disabled={currentPage === data.pagination.totalPages}
                        className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <span className="sr-only">Last</span>
                        <span>Last</span>
                      </button>
                    </nav>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}
