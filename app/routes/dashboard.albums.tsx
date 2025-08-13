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
  Album,
  Plus,
  Search,
  Filter,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  Calendar,
  Music,
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
    songs: { some: { uploadedById: user.id } },
    ...(search && {
      OR: [
        { title: { contains: search, mode: "insensitive" as const } },
        { description: { contains: search, mode: "insensitive" as const } },
      ],
    }),
    ...(status === "published" && { isPublished: true }),
    ...(status === "unpublished" && { isPublished: false }),
  };

  const [albums, totalCount] = await Promise.all([
    db.album.findMany({
      where,
      include: {
        songs: {
          where: { uploadedById: user.id },
          select: { id: true, title: true, isPublished: true },
        },
        artists: {
          include: {
            artist: { select: { id: true, name: true, stageName: true } },
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 20,
    }),
    db.album.count({ where }),
  ]);

  return json({ albums, totalCount, search, status });
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
  const albumId = formData.get("albumId") as string;

  try {
    switch (intent) {
      case "toggle-publish": {
        // Check if user has songs in this album
        const albumWithUserSongs = await db.album.findFirst({
          where: {
            id: albumId,
            songs: { some: { uploadedById: user.id } },
          },
        });

        if (!albumWithUserSongs) {
          return json({ error: "앨범을 찾을 수 없습니다." });
        }

        await db.album.update({
          where: { id: albumId },
          data: { isPublished: !albumWithUserSongs.isPublished },
        });

        return json({ success: true });
      }

      case "delete": {
        // Check if user has songs in this album before deletion
        const albumWithUserSongs = await db.album.findFirst({
          where: {
            id: albumId,
            songs: { some: { uploadedById: user.id } },
          },
          include: {
            songs: { select: { id: true, uploadedById: true } },
          },
        });

        if (!albumWithUserSongs) {
          return json({ error: "앨범을 찾을 수 없습니다." });
        }

        // Only allow deletion if all songs in album belong to user
        const allSongsBelongToUser = albumWithUserSongs.songs.every(
          (song) => song.uploadedById === user.id
        );

        if (!allSongsBelongToUser) {
          return json({
            error: "다른 사용자의 음악이 포함된 앨범은 삭제할 수 없습니다.",
          });
        }

        await db.album.delete({
          where: { id: albumId },
        });

        return json({ success: true });
      }

      default:
        return json({ error: "잘못된 요청입니다." });
    }
  } catch (error) {
    console.error("Error in dashboard albums action:", error);
    return json({ error: "오류가 발생했습니다." });
  }
}

interface AlbumData {
  id: string;
  title: string;
  description: string | null;
  coverImage: string | null;
  releaseDate: string | null;
  isPublished: boolean;
  createdAt: string;
  songs: Array<{
    id: string;
    title: string;
    isPublished: boolean;
  }>;
  artists: Array<{
    artistId: string;
    artist: { id: string; name: string; stageName: string | null };
  }>;
}

export default function DashboardAlbums() {
  const { albums, totalCount, search, status } = useLoaderData<typeof loader>();
  const actionData = useActionData<{ error?: string; success?: boolean }>();
  const navigation = useNavigation();
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const publishedCount = albums.filter(
    (album: AlbumData) => album.isPublished
  ).length;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">내 앨범 관리</h1>
              <p className="text-gray-600 mt-1">앨범을 관리하고 편집하세요</p>
            </div>
            <Link
              to="/dashboard/albums/new"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700"
            >
              <Plus className="w-4 h-4 mr-2" />새 앨범 만들기
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
              <Album className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">전체 앨범</p>
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
                <p className="text-sm font-medium text-gray-600">공개됨</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {publishedCount}
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
                  {albums.reduce(
                    (total: number, album: AlbumData) =>
                      total + album.songs.length,
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
                    placeholder="앨범명, 설명..."
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
                  <option value="published">공개됨</option>
                  <option value="unpublished">비공개</option>
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

        {/* Albums Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {albums.map((album: AlbumData) => (
            <div
              key={album.id}
              className="bg-white rounded-lg shadow overflow-hidden"
            >
              <div className="aspect-square bg-gray-200 relative">
                {album.coverImage ? (
                  <img
                    src={album.coverImage}
                    alt={album.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Album className="w-20 h-20 text-gray-400" />
                  </div>
                )}
                <div className="absolute top-2 right-2">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      album.isPublished
                        ? "bg-green-100 text-green-800"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {album.isPublished ? "공개" : "비공개"}
                  </span>
                </div>
              </div>

              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {album.title}
                </h3>

                {album.description && (
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                    {album.description}
                  </p>
                )}

                <div className="space-y-2 mb-4">
                  <div className="flex items-center text-sm text-gray-500">
                    <Music className="w-4 h-4 mr-2" />
                    {album.songs.length}곡
                  </div>

                  {album.releaseDate && (
                    <div className="flex items-center text-sm text-gray-500">
                      <Calendar className="w-4 h-4 mr-2" />
                      {new Date(album.releaseDate).toLocaleDateString("ko-KR")}
                    </div>
                  )}

                  {album.artists.length > 0 && (
                    <div className="text-sm text-gray-600">
                      아티스트:{" "}
                      {album.artists
                        .map(
                          (artist) =>
                            artist.artist.stageName || artist.artist.name
                        )
                        .join(", ")}
                    </div>
                  )}
                </div>

                {/* Songs List */}
                {album.songs.length > 0 && (
                  <div className="mb-4">
                    <p className="text-sm font-medium text-gray-700 mb-2">
                      수록곡:
                    </p>
                    <div className="space-y-1 max-h-24 overflow-y-auto">
                      {album.songs.slice(0, 3).map((song) => (
                        <div
                          key={song.id}
                          className="flex items-center justify-between text-xs text-gray-600"
                        >
                          <span className="truncate">{song.title}</span>
                          {song.isPublished && (
                            <Eye className="w-3 h-3 text-green-500 flex-shrink-0 ml-1" />
                          )}
                        </div>
                      ))}
                      {album.songs.length > 3 && (
                        <p className="text-xs text-gray-500">
                          외 {album.songs.length - 3}곡
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex items-center justify-between pt-4 border-t">
                  <div className="flex items-center space-x-2">
                    <Link
                      to={`/dashboard/albums/${album.id}`}
                      className="text-indigo-600 hover:text-indigo-900"
                    >
                      <Edit className="w-4 h-4" />
                    </Link>

                    <Form method="post" className="inline">
                      <input
                        type="hidden"
                        name="intent"
                        value="toggle-publish"
                      />
                      <input type="hidden" name="albumId" value={album.id} />
                      <button
                        type="submit"
                        className={`${
                          album.isPublished
                            ? "text-gray-600 hover:text-gray-900"
                            : "text-green-600 hover:text-green-900"
                        }`}
                        disabled={navigation.state === "submitting"}
                      >
                        {album.isPublished ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                    </Form>
                  </div>

                  {deleteConfirm === album.id ? (
                    <div className="flex items-center space-x-1">
                      <Form method="post" className="inline">
                        <input type="hidden" name="intent" value="delete" />
                        <input type="hidden" name="albumId" value={album.id} />
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
                      onClick={() => setDeleteConfirm(album.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {albums.length === 0 && (
          <div className="text-center py-12">
            <Album className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              앨범이 없습니다
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              첫 번째 앨범을 만들어보세요.
            </p>
            <div className="mt-6">
              <Link
                to="/dashboard/albums/new"
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                앨범 만들기
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
