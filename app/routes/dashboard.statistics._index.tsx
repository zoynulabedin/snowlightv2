import { LoaderFunctionArgs, redirect } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { db } from "~/lib/db";
import { validateSession } from "~/lib/auth";

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

    // Fetch comprehensive statistics
    const [
      totalUsers,
      totalSongs,
      totalAlbums,
      totalArtists,
      totalPlays,
      totalFavorites,
      recentUsers,
      topSongs,
      topArtists,
      recentActivity,
      usersByRole,
      songsByGenre,
    ] = await Promise.all([
      // Basic counts
      db.user.count(),
      db.song.count(),
      db.album.count(),
      db.artist.count(),

      // Aggregated stats
      db.song.aggregate({
        _sum: { plays: true },
      }),
      db.favorite.count(),

      // Recent users (last 30 days)
      db.user.count({
        where: {
          createdAt: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
          },
        },
      }),

      // Top 10 most played songs
      db.song.findMany({
        take: 10,
        orderBy: { plays: "desc" },
        include: {
          artists: {
            include: {
              artist: {
                select: { name: true, stageName: true },
              },
            },
          },
        },
      }),

      // Top 10 artists by followers
      db.artist.findMany({
        take: 10,
        orderBy: { followers: "desc" },
        select: {
          id: true,
          name: true,
          stageName: true,
          followers: true,
          isVerified: true,
          songArtists: {
            select: { song: { select: { plays: true } } },
          },
        },
      }),

      // Recent activity (last 50 songs uploaded)
      db.song.findMany({
        take: 50,
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
        },
      }),

      // Users by role distribution
      db.user.groupBy({
        by: ["role"],
        _count: { role: true },
      }),

      // Songs by genre distribution
      db.song.groupBy({
        by: ["genre"],
        _count: { genre: true },
        where: {
          genre: { not: null },
        },
      }),
    ]);

    // Calculate growth percentages (mock data for now)
    const stats = {
      totalUsers,
      totalSongs,
      totalAlbums,
      totalArtists,
      totalPlays: totalPlays._sum.plays || 0,
      totalFavorites,
      recentUsers,

      // Growth percentages (you can implement actual calculation based on historical data)
      userGrowth: "+12%",
      songGrowth: "+8%",
      albumGrowth: "+15%",
      artistGrowth: "+5%",

      topSongs,
      topArtists,
      recentActivity,
      usersByRole,
      songsByGenre,
    };

    return { user, stats };
  } catch (error) {
    console.error("Statistics loader error:", error);
    return redirect("/login");
  }
}

export default function Statistics() {
  const { stats } = useLoaderData<typeof loader>();

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Analytics & Statistics
          </h1>
          <p className="text-gray-600 mt-2">
            Platform performance and insights
          </p>
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-blue-500 rounded-md flex items-center justify-center">
                    <svg
                      className="w-5 h-5 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
                      />
                    </svg>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Total Users
                    </dt>
                    <dd className="flex items-baseline">
                      <div className="text-2xl font-semibold text-gray-900">
                        {formatNumber(stats.totalUsers)}
                      </div>
                      <div className="ml-2 flex items-baseline text-sm font-semibold text-green-600">
                        {stats.userGrowth}
                      </div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-green-500 rounded-md flex items-center justify-center">
                    <svg
                      className="w-5 h-5 text-white"
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
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Total Songs
                    </dt>
                    <dd className="flex items-baseline">
                      <div className="text-2xl font-semibold text-gray-900">
                        {formatNumber(stats.totalSongs)}
                      </div>
                      <div className="ml-2 flex items-baseline text-sm font-semibold text-green-600">
                        {stats.songGrowth}
                      </div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-purple-500 rounded-md flex items-center justify-center">
                    <svg
                      className="w-5 h-5 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                      />
                    </svg>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Total Albums
                    </dt>
                    <dd className="flex items-baseline">
                      <div className="text-2xl font-semibold text-gray-900">
                        {formatNumber(stats.totalAlbums)}
                      </div>
                      <div className="ml-2 flex items-baseline text-sm font-semibold text-green-600">
                        {stats.albumGrowth}
                      </div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-orange-500 rounded-md flex items-center justify-center">
                    <svg
                      className="w-5 h-5 text-white"
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
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Total Artists
                    </dt>
                    <dd className="flex items-baseline">
                      <div className="text-2xl font-semibold text-gray-900">
                        {formatNumber(stats.totalArtists)}
                      </div>
                      <div className="ml-2 flex items-baseline text-sm font-semibold text-green-600">
                        {stats.artistGrowth}
                      </div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Secondary Stats */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-3 mb-8">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">
                  Total Plays
                </dt>
                <dd className="mt-1 text-3xl font-semibold text-gray-900">
                  {formatNumber(stats.totalPlays)}
                </dd>
              </dl>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">
                  Total Favorites
                </dt>
                <dd className="mt-1 text-3xl font-semibold text-gray-900">
                  {formatNumber(stats.totalFavorites)}
                </dd>
              </dl>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">
                  New Users (30 days)
                </dt>
                <dd className="mt-1 text-3xl font-semibold text-gray-900">
                  {formatNumber(stats.recentUsers)}
                </dd>
              </dl>
            </div>
          </div>
        </div>

        {/* Charts and Data */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          {/* Top Songs */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Top Songs by Plays
              </h3>
              <div className="space-y-3">
                {stats.topSongs.map((song, index) => (
                  <div
                    key={song.id}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center">
                      <span className="w-6 h-6 bg-blue-100 text-blue-800 rounded-full flex items-center justify-center text-xs font-medium mr-3">
                        {index + 1}
                      </span>
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {song.title}
                        </p>
                        <p className="text-xs text-gray-500">
                          {song.artists
                            .map((sa) => sa.artist.stageName || sa.artist.name)
                            .join(", ")}
                        </p>
                      </div>
                    </div>
                    <span className="text-sm text-gray-500">
                      {formatNumber(song.plays)} plays
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Top Artists */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Top Artists by Followers
              </h3>
              <div className="space-y-3">
                {stats.topArtists.map((artist, index) => (
                  <div
                    key={artist.id}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center">
                      <span className="w-6 h-6 bg-purple-100 text-purple-800 rounded-full flex items-center justify-center text-xs font-medium mr-3">
                        {index + 1}
                      </span>
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {artist.stageName || artist.name}
                          {artist.isVerified && (
                            <svg
                              className="w-4 h-4 text-blue-500 inline ml-1"
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
                        </p>
                        <p className="text-xs text-gray-500">
                          {artist.songArtists.reduce(
                            (total, sa) => total + (sa.song.plays || 0),
                            0
                          )}{" "}
                          total plays
                        </p>
                      </div>
                    </div>
                    <span className="text-sm text-gray-500">
                      {formatNumber(artist.followers)} followers
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* User Distribution */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                User Distribution by Role
              </h3>
              <div className="space-y-3">
                {stats.usersByRole.map((roleData) => (
                  <div
                    key={roleData.role}
                    className="flex items-center justify-between"
                  >
                    <span className="text-sm font-medium text-gray-900">
                      {roleData.role.replace("_", " ")}
                    </span>
                    <div className="flex items-center">
                      <div className="w-32 bg-gray-200 rounded-full h-2 mr-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full"
                          style={{
                            width: `${
                              (roleData._count.role / stats.totalUsers) * 100
                            }%`,
                          }}
                        ></div>
                      </div>
                      <span className="text-sm text-gray-500">
                        {roleData._count.role}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Recent Activity
              </h3>
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {stats.recentActivity.slice(0, 10).map((song) => (
                  <div
                    key={song.id}
                    className="flex items-center justify-between"
                  >
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {song.title}
                      </p>
                      <p className="text-xs text-gray-500">
                        by{" "}
                        {song.artists
                          .map((sa) => sa.artist.stageName || sa.artist.name)
                          .join(", ")}{" "}
                        • uploaded by @{song.uploadedBy?.username}
                      </p>
                    </div>
                    <span className="text-xs text-gray-500">
                      {new Date(song.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
