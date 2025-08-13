import { json, LoaderFunctionArgs, redirect } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";
import {
  BarChart3,
  Users,
  Music,
  TrendingUp,
  Eye,
  Heart,
  Calendar,
  Play,
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

  // Get basic statistics
  const [
    totalUsers,
    totalSongs,
    totalArtists,
    totalAlbums,
    totalPlays,
    recentSongs,
    topArtists,
  ] = await Promise.all([
    db.user.count(),
    db.song.count(),
    db.artist.count(),
    db.album.count(),
    db.song.aggregate({ _sum: { plays: true } }),
    db.song.findMany({
      where: user.role === "USER" ? { uploadedById: user.id } : {},
      take: 5,
      orderBy: { createdAt: "desc" },
      include: {
        artists: {
          include: { artist: { select: { name: true, stageName: true } } },
        },
      },
    }),
    db.artist.findMany({
      where: user.role === "USER" ? { userId: user.id } : {},
      take: 5,
      orderBy: { createdAt: "desc" },
    }),
  ]);

  return json({
    user,
    stats: {
      totalUsers,
      totalSongs,
      totalArtists,
      totalAlbums,
      totalPlays: totalPlays._sum.plays || 0,
    },
    recentSongs,
    topArtists,
  });
}

export default function DashboardStats() {
  const { user, stats, recentSongs, topArtists } =
    useLoaderData<typeof loader>();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">통계 및 분석</h1>
              <p className="text-gray-600 mt-1">
                플랫폼 사용 현황과 통계를 확인하세요
              </p>
            </div>
            <Link
              to="/dashboard"
              className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              ← 대시보드로 돌아가기
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">
                  {user.role === "USER" ? "내 계정" : "전체 사용자"}
                </p>
                <p className="text-2xl font-semibold text-gray-900">
                  {user.role === "USER" ? "1" : stats.totalUsers}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <Music className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">
                  {user.role === "USER" ? "내 음악" : "전체 음악"}
                </p>
                <p className="text-2xl font-semibold text-gray-900">
                  {stats.totalSongs}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <TrendingUp className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">
                  {user.role === "USER" ? "내 아티스트" : "전체 아티스트"}
                </p>
                <p className="text-2xl font-semibold text-gray-900">
                  {stats.totalArtists}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <Play className="h-8 w-8 text-red-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">총 재생 수</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {stats.totalPlays.toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Songs */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b">
              <h2 className="text-lg font-semibold text-gray-900">
                {user.role === "USER" ? "내 최신 음악" : "최신 업로드 음악"}
              </h2>
            </div>
            <div className="p-6">
              {recentSongs.length > 0 ? (
                <div className="space-y-4">
                  {recentSongs.map((song) => (
                    <div key={song.id} className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
                        {song.coverImage ? (
                          <img
                            src={song.coverImage}
                            alt={song.title}
                            className="w-full h-full object-cover rounded-lg"
                          />
                        ) : (
                          <Music className="w-6 h-6 text-gray-400" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {song.title}
                        </p>
                        <p className="text-sm text-gray-500">
                          {song.artists
                            .map(
                              (sa: {
                                artist: {
                                  stageName: string | null;
                                  name: string;
                                };
                              }) => sa.artist.stageName || sa.artist.name
                            )
                            .join(", ")}
                        </p>
                        <div className="flex items-center space-x-4 mt-1">
                          <div className="flex items-center text-xs text-gray-500">
                            <Play className="w-3 h-3 mr-1" />
                            {song.plays || 0}
                          </div>
                          <div className="flex items-center text-xs text-gray-500">
                            <Heart className="w-3 h-3 mr-1" />
                            {song.likes || 0}
                          </div>
                          <div className="flex items-center text-xs text-gray-500">
                            <Calendar className="w-3 h-3 mr-1" />
                            {new Date(song.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            song.isPublished
                              ? "bg-green-100 text-green-800"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {song.isPublished ? "공개" : "비공개"}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Music className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">
                    업로드된 음악이 없습니다
                  </h3>
                  <p className="mt-1 text-sm text-gray-500">
                    첫 번째 음악을 업로드해보세요.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Top Artists */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b">
              <h2 className="text-lg font-semibold text-gray-900">
                {user.role === "USER" ? "내 아티스트" : "활발한 아티스트"}
              </h2>
            </div>
            <div className="p-6">
              {topArtists.length > 0 ? (
                <div className="space-y-4">
                  {topArtists.map((artist) => (
                    <div
                      key={artist.id}
                      className="flex items-center space-x-4"
                    >
                      <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                        {artist.avatar ? (
                          <img
                            src={artist.avatar}
                            alt={artist.stageName || artist.name}
                            className="w-full h-full object-cover rounded-full"
                          />
                        ) : (
                          <Users className="w-6 h-6 text-gray-400" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {artist.stageName || artist.name}
                        </p>
                        {artist.stageName &&
                          artist.name !== artist.stageName && (
                            <p className="text-xs text-gray-500">
                              본명: {artist.name}
                            </p>
                          )}
                        <div className="flex items-center space-x-4 mt-1">
                          <div className="flex items-center text-xs text-gray-500">
                            <Music className="w-3 h-3 mr-1" />
                            아티스트 프로필
                          </div>
                          <div className="flex items-center text-xs text-gray-500">
                            <TrendingUp className="w-3 h-3 mr-1" />
                            {new Date(artist.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            artist.isVerified
                              ? "bg-green-100 text-green-800"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {artist.isVerified ? "인증됨" : "미인증"}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Users className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">
                    등록된 아티스트가 없습니다
                  </h3>
                  <p className="mt-1 text-sm text-gray-500">
                    첫 번째 아티스트를 등록해보세요.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Additional Statistics for Admins */}
        {(user.role === "ADMIN" || user.role === "SUPER_ADMIN") && (
          <div className="bg-white rounded-lg shadow mt-8">
            <div className="px-6 py-4 border-b">
              <h2 className="text-lg font-semibold text-gray-900">
                관리자 통계
              </h2>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <BarChart3 className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                  <p className="text-sm font-medium text-gray-600">총 앨범</p>
                  <p className="text-xl font-semibold text-gray-900">
                    {stats.totalAlbums}
                  </p>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <Eye className="w-8 h-8 text-green-600 mx-auto mb-2" />
                  <p className="text-sm font-medium text-gray-600">
                    평균 조회수
                  </p>
                  <p className="text-xl font-semibold text-gray-900">
                    {Math.round(
                      stats.totalPlays / Math.max(stats.totalSongs, 1)
                    )}
                  </p>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <Users className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                  <p className="text-sm font-medium text-gray-600">
                    사용자당 음악
                  </p>
                  <p className="text-xl font-semibold text-gray-900">
                    {Math.round(
                      stats.totalSongs / Math.max(stats.totalUsers, 1)
                    )}
                  </p>
                </div>
                <div className="text-center p-4 bg-red-50 rounded-lg">
                  <Heart className="w-8 h-8 text-red-600 mx-auto mb-2" />
                  <p className="text-sm font-medium text-gray-600">활성 비율</p>
                  <p className="text-xl font-semibold text-gray-900">
                    {Math.round(
                      (stats.totalSongs / Math.max(stats.totalUsers, 1)) * 100
                    )}
                    %
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
