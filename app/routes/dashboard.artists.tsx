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
  useNavigation,
} from "@remix-run/react";
import { useState } from "react";
import {
  User,
  Plus,
  Search,
  Filter,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  Music,
  Calendar,
  MapPin,
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

  const where = {
    userId: user.id, // Artists created by this user
    ...(search && {
      OR: [
        { name: { contains: search, mode: "insensitive" as const } },
        { stageName: { contains: search, mode: "insensitive" as const } },
        { bio: { contains: search, mode: "insensitive" as const } },
      ],
    }),
    ...(status === "published" && { isVerified: true }),
    ...(status === "unpublished" && { isVerified: false }),
  };

  const [artists, totalCount] = await Promise.all([
    db.artist.findMany({
      where,
      include: {
        songArtists: {
          where: { song: { uploadedById: user.id } },
          include: {
            song: { select: { id: true, title: true, isPublished: true } },
          },
        },
        albumArtists: {
          include: { album: { select: { id: true, title: true } } },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 20,
    }),
    db.artist.count({ where }),
  ]);

  return json({ artists, totalCount, search, status });
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
  const intent = formData.get("intent") as string;
  const artistId = formData.get("artistId") as string;

  try {
    switch (intent) {
      case "toggle-verified": {
        const artist = await db.artist.findUnique({
          where: { id: artistId, userId: user.id },
        });

        if (!artist) {
          return json({ error: "아티스트를 찾을 수 없습니다." });
        }

        await db.artist.update({
          where: { id: artistId },
          data: { isVerified: !artist.isVerified },
        });

        return json({ success: true });
      }

      case "delete": {
        const artist = await db.artist.findUnique({
          where: { id: artistId, userId: user.id },
          include: {
            songArtists: true,
            albumArtists: true,
          },
        });

        if (!artist) {
          return json({ error: "아티스트를 찾을 수 없습니다." });
        }

        if (artist.songArtists.length > 0 || artist.albumArtists.length > 0) {
          return json({
            error: "음악이나 앨범이 연결된 아티스트는 삭제할 수 없습니다.",
          });
        }

        await db.artist.delete({
          where: { id: artistId },
        });

        return json({ success: true });
      }

      default:
        return json({ error: "잘못된 요청입니다." });
    }
  } catch (error) {
    console.error("Error in dashboard artists action:", error);
    return json({ error: "오류가 발생했습니다." });
  }
}

export default function DashboardArtists() {
  const { artists, totalCount, search, status } =
    useLoaderData<typeof loader>();
  const actionData = useActionData<{ error?: string; success?: boolean }>();
  const navigation = useNavigation();
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const verifiedCount = artists.filter((artist) => artist.isVerified).length;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                아티스트 관리
              </h1>
              <p className="text-gray-600 mt-1">
                아티스트 프로필을 관리하고 편집하세요
              </p>
            </div>
            <Link
              to="/dashboard/artists/new"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700"
            >
              <Plus className="w-4 h-4 mr-2" />새 아티스트 등록
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Action Messages */}
        {actionData && "error" in actionData && (
          <div className="bg-red-50 border border-red-300 rounded-md p-4 mb-4">
            <p className="text-sm text-red-700">{actionData.error}</p>
          </div>
        )}
        {actionData && "success" in actionData && (
          <div className="bg-green-50 border border-green-300 rounded-md p-4 mb-4">
            <p className="text-sm text-green-700">작업이 완료되었습니다.</p>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <User className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">
                  전체 아티스트
                </p>
                <p className="text-2xl font-semibold text-gray-900">
                  {totalCount}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <Eye className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">인증됨</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {verifiedCount}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <Music className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">총 음악 수</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {artists.reduce(
                    (total: number, artist) =>
                      total + artist.songArtists.length,
                    0
                  )}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="p-6">
            <Form
              method="get"
              className="grid grid-cols-1 md:grid-cols-3 gap-4"
            >
              <div>
                <label
                  htmlFor="search"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  검색
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    id="search"
                    name="search"
                    defaultValue={search}
                    placeholder="이름, 예명, 소개..."
                    className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="status"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  상태
                </label>
                <select
                  id="status"
                  name="status"
                  defaultValue={status}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-red-500"
                >
                  <option value="">모든 상태</option>
                  <option value="published">인증됨</option>
                  <option value="unpublished">미인증</option>
                </select>
              </div>

              <div className="flex items-end">
                <button
                  type="submit"
                  className="w-full inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700"
                >
                  <Filter className="w-4 h-4 mr-2" />
                  필터 적용
                </button>
              </div>
            </Form>
          </div>
        </div>

        {/* Artists Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {artists.map((artist) => (
            <div
              key={artist.id}
              className="bg-white rounded-lg shadow overflow-hidden"
            >
              <div className="aspect-square bg-gray-200 relative">
                {artist.avatar || artist.coverImage ? (
                  <img
                    src={artist.avatar || artist.coverImage || ""}
                    alt={artist.stageName || artist.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <User className="w-20 h-20 text-gray-400" />
                  </div>
                )}
                <div className="absolute top-2 right-2">
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

              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-1">
                  {artist.stageName || artist.name}
                </h3>
                {artist.stageName && artist.name !== artist.stageName && (
                  <p className="text-sm text-gray-600 mb-2">
                    본명: {artist.name}
                  </p>
                )}

                {artist.bio && (
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                    {artist.bio}
                  </p>
                )}

                <div className="space-y-2 mb-4">
                  {artist.country && (
                    <div className="flex items-center text-sm text-gray-500">
                      <MapPin className="w-4 h-4 mr-2" />
                      {artist.country}
                    </div>
                  )}

                  {artist.debutYear && (
                    <div className="flex items-center text-sm text-gray-500">
                      <Calendar className="w-4 h-4 mr-2" />
                      {artist.debutYear}년 데뷔
                    </div>
                  )}

                  <div className="flex items-center text-sm text-gray-500">
                    <Music className="w-4 h-4 mr-2" />
                    음악 {artist.songArtists.length}곡
                  </div>
                </div>

                {/* Songs List */}
                {artist.songArtists.length > 0 && (
                  <div className="mb-4">
                    <p className="text-sm font-medium text-gray-700 mb-2">
                      대표곡:
                    </p>
                    <div className="space-y-1 max-h-20 overflow-y-auto">
                      {artist.songArtists.slice(0, 3).map((songArtist) => (
                        <div
                          key={songArtist.songId}
                          className="flex items-center justify-between text-xs text-gray-600"
                        >
                          <span className="truncate">
                            {songArtist.song.title}
                          </span>
                          {songArtist.song.isPublished && (
                            <Eye className="w-3 h-3 text-green-500 flex-shrink-0 ml-1" />
                          )}
                        </div>
                      ))}
                      {artist.songArtists.length > 3 && (
                        <p className="text-xs text-gray-500">
                          외 {artist.songArtists.length - 3}곡
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex items-center justify-between pt-4 border-t">
                  <div className="flex items-center space-x-2">
                    <Link
                      to={`/dashboard/artists/${artist.id}`}
                      className="text-indigo-600 hover:text-indigo-900"
                    >
                      <Edit className="w-4 h-4" />
                    </Link>

                    <Form method="post" className="inline">
                      <input
                        type="hidden"
                        name="intent"
                        value="toggle-verified"
                      />
                      <input type="hidden" name="artistId" value={artist.id} />
                      <button
                        type="submit"
                        className={`${
                          artist.isVerified
                            ? "text-gray-600 hover:text-gray-900"
                            : "text-green-600 hover:text-green-900"
                        }`}
                        disabled={navigation.state === "submitting"}
                      >
                        {artist.isVerified ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                    </Form>
                  </div>

                  {deleteConfirm === artist.id ? (
                    <div className="flex items-center space-x-1">
                      <Form method="post" className="inline">
                        <input type="hidden" name="intent" value="delete" />
                        <input
                          type="hidden"
                          name="artistId"
                          value={artist.id}
                        />
                        <button
                          type="submit"
                          className="text-red-600 hover:text-red-900 text-xs px-2 py-1 bg-red-100 rounded"
                          disabled={navigation.state === "submitting"}
                        >
                          확인
                        </button>
                      </Form>
                      <button
                        onClick={() => setDeleteConfirm(null)}
                        className="text-gray-600 hover:text-gray-900 text-xs px-2 py-1 bg-gray-100 rounded"
                      >
                        취소
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setDeleteConfirm(artist.id)}
                      className="text-red-600 hover:text-red-900"
                      disabled={
                        artist.songArtists.length > 0 ||
                        artist.albumArtists.length > 0
                      }
                      title={
                        artist.songArtists.length > 0 ||
                        artist.albumArtists.length > 0
                          ? "연결된 음악이나 앨범이 있어 삭제할 수 없습니다"
                          : "삭제"
                      }
                    >
                      <Trash2
                        className={`w-4 h-4 ${
                          artist.songArtists.length > 0 ||
                          artist.albumArtists.length > 0
                            ? "opacity-50"
                            : ""
                        }`}
                      />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {artists.length === 0 && (
          <div className="text-center py-12">
            <User className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              등록된 아티스트가 없습니다
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              첫 번째 아티스트를 등록해보세요.
            </p>
            <div className="mt-6">
              <Link
                to="/dashboard/artists/new"
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                아티스트 등록
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
