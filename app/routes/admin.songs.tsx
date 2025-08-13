import {
  json,
  LoaderFunctionArgs,
  ActionFunctionArgs,
  redirect,
} from "@remix-run/node";
import { Form, Link, useLoaderData } from "@remix-run/react";
import { useState } from "react";
import {
  ArrowLeft,
  Plus,
  Play,
  Edit,
  Trash2,
  Music,
  Eye,
  EyeOff,
} from "lucide-react";
import { validateSession } from "~/lib/auth";
import { db } from "~/lib/db";

export async function loader({ request }: LoaderFunctionArgs) {
  const cookieHeader = request.headers.get("Cookie");
  const token = cookieHeader
    ?.split(";")
    .find((c) => c.trim().startsWith("auth_token="))
    ?.split("=")[1];

  if (!token) {
    return redirect("/login");
  }

  const user = await validateSession(token);
  if (!user || !user.isAdmin) {
    return redirect("/dashboard");
  }

  const url = new URL(request.url);
  const search = url.searchParams.get("search") || "";
  const album = url.searchParams.get("album") || "";
  const genre = url.searchParams.get("genre") || "";

  const where: {
    OR?: Array<{
      title?: { contains: string; mode: "insensitive" };
      artists?: {
        some: { artist: { name: { contains: string; mode: "insensitive" } } };
      };
      genre?: { contains: string; mode: "insensitive" };
    }>;
    albumId?: string;
    genre?: string;
  } = {};

  if (search) {
    where.OR = [
      { title: { contains: search, mode: "insensitive" } },
      {
        artists: {
          some: { artist: { name: { contains: search, mode: "insensitive" } } },
        },
      },
      { genre: { contains: search, mode: "insensitive" } },
    ];
  }
  if (album) {
    where.albumId = album;
  }
  if (genre && genre !== "") {
    where.genre = genre;
  }

  const [songs, albums, totalCount] = await Promise.all([
    db.song.findMany({
      where,
      include: {
        artists: {
          include: { artist: true },
        },
        album: true,
      },
      orderBy: { createdAt: "desc" },
      take: 50,
    }),
    db.album.findMany({
      orderBy: { title: "asc" },
      select: { id: true, title: true },
    }),
    db.song.count({ where }),
  ]);

  return json({ songs, albums, totalCount, search, album, genre });
}

export async function action({ request }: ActionFunctionArgs) {
  const cookieHeader = request.headers.get("Cookie");
  const token = cookieHeader
    ?.split(";")
    .find((c) => c.trim().startsWith("auth_token="))
    ?.split("=")[1];

  if (!token) {
    return redirect("/login");
  }

  const user = await validateSession(token);
  if (!user || !user.isAdmin) {
    return redirect("/dashboard");
  }

  const formData = await request.formData();
  const action = formData.get("action");
  const songId = formData.get("songId") as string;

  switch (action) {
    case "togglePublished": {
      const currentSong = await db.song.findUnique({
        where: { id: songId },
        select: { isPublished: true },
      });
      await db.song.update({
        where: { id: songId },
        data: { isPublished: !currentSong?.isPublished },
      });
      break;
    }

    case "toggleApproved": {
      const song = await db.song.findUnique({
        where: { id: songId },
        select: { isApproved: true },
      });
      await db.song.update({
        where: { id: songId },
        data: { isApproved: !song?.isApproved },
      });
      break;
    }

    case "toggleFeatured": {
      const featuredSong = await db.song.findUnique({
        where: { id: songId },
        select: { isFeatured: true },
      });
      await db.song.update({
        where: { id: songId },
        data: { isFeatured: !featuredSong?.isFeatured },
      });
      break;
    }

    case "deleteSong":
      await db.song.delete({ where: { id: songId } });
      break;

    case "incrementPlays":
      await db.song.update({
        where: { id: songId },
        data: { plays: { increment: 1 } },
      });
      break;
  }

  return redirect("/admin/songs");
}

export default function AdminSongs() {
  const { songs, albums, totalCount, search, album, genre } =
    useLoaderData<typeof loader>();
  const [playingId, setPlayingId] = useState<string | null>(null);

  const handlePlay = (audioUrl: string, songId: string) => {
    if (playingId === songId) {
      setPlayingId(null);
    } else {
      setPlayingId(songId);
      // Here you could integrate with your audio player
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link
                to="/admin"
                className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft className="w-5 h-5 mr-2" />← 관리자 대시보드
              </Link>
              <Link
                to="/admin/songs/new"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700"
              >
                <Plus className="w-4 h-4 mr-2" />새 음악 추가
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <div className="text-2xl font-bold text-gray-900">{totalCount}</div>
            <div className="text-sm text-gray-600">총 음악</div>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <div className="text-2xl font-bold text-green-600">
              {songs.filter((s) => s.isPublished).length}
            </div>
            <div className="text-sm text-gray-600">공개된 음악</div>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <div className="text-2xl font-bold text-blue-600">
              {songs.filter((s) => s.isApproved).length}
            </div>
            <div className="text-sm text-gray-600">승인된 음악</div>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <div className="text-2xl font-bold text-purple-600">
              {songs.filter((s) => s.isFeatured).length}
            </div>
            <div className="text-sm text-gray-600">추천 음악</div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="p-6">
            <Form
              method="get"
              className="grid grid-cols-1 md:grid-cols-4 gap-4"
            >
              <div>
                <label
                  htmlFor="search-input"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  검색
                </label>
                <input
                  id="search-input"
                  type="text"
                  name="search"
                  defaultValue={search}
                  placeholder="제목, 아티스트, 장르로 검색..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>
              <div>
                <label
                  htmlFor="album-select"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  앨범
                </label>
                <select
                  id="album-select"
                  name="album"
                  defaultValue={album}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  <option value="">모든 앨범</option>
                  {albums.map((albumItem) => (
                    <option key={albumItem.id} value={albumItem.id}>
                      {albumItem.title}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label
                  htmlFor="genre-select"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  장르
                </label>
                <select
                  id="genre-select"
                  name="genre"
                  defaultValue={genre}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  <option value="">모든 장르</option>
                  <option value="KPOP">K-POP</option>
                  <option value="POP">POP</option>
                  <option value="ROCK">ROCK</option>
                  <option value="HIPHOP">HIP-HOP</option>
                  <option value="RNB">R&B</option>
                  <option value="JAZZ">JAZZ</option>
                  <option value="CLASSICAL">CLASSICAL</option>
                  <option value="ELECTRONIC">ELECTRONIC</option>
                  <option value="INDIE">INDIE</option>
                  <option value="FOLK">FOLK</option>
                </select>
              </div>
              <div className="flex items-end">
                <button
                  type="submit"
                  className="w-full px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                >
                  필터 적용
                </button>
              </div>
            </Form>
          </div>
        </div>

        {/* Songs Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    음악
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    아티스트
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    앨범
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    장르
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    재생수
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    상태
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    액션
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {songs.map((song) => (
                  <tr key={song.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-12 w-12">
                          {song.coverImage ? (
                            <img
                              className="h-12 w-12 rounded-md object-cover"
                              src={song.coverImage}
                              alt={song.title}
                            />
                          ) : (
                            <div className="h-12 w-12 rounded-md bg-gray-200 flex items-center justify-center">
                              <Music className="h-6 w-6 text-gray-400" />
                            </div>
                          )}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {song.title}
                          </div>
                          <div className="text-sm text-gray-500">
                            {formatDuration(song.duration || 0)}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {song.artists
                        .map((sa) => sa.artist.stageName || sa.artist.name)
                        .join(", ")}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {song.album?.title || "싱글"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {song.genre}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {song.plays?.toLocaleString() || 0}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div className="flex flex-col space-y-1">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            song.isPublished
                              ? "bg-green-100 text-green-800"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {song.isPublished ? "공개" : "비공개"}
                        </span>
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            song.isApproved
                              ? "bg-blue-100 text-blue-800"
                              : "bg-yellow-100 text-yellow-800"
                          }`}
                        >
                          {song.isApproved ? "승인" : "대기"}
                        </span>
                        {song.isFeatured && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                            추천
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        {song.audioUrl && (
                          <button
                            onClick={() => handlePlay(song.audioUrl!, song.id)}
                            className="text-green-600 hover:text-green-900"
                            title="재생"
                          >
                            <Play className="h-4 w-4" />
                          </button>
                        )}

                        <Link
                          to={`/admin/songs/${song.id}/edit`}
                          className="text-indigo-600 hover:text-indigo-900"
                          title="편집"
                        >
                          <Edit className="h-4 w-4" />
                        </Link>

                        <Form method="post" className="inline">
                          <input
                            type="hidden"
                            name="action"
                            value="togglePublished"
                          />
                          <input type="hidden" name="songId" value={song.id} />
                          <button
                            type="submit"
                            className={`${
                              song.isPublished
                                ? "text-gray-600 hover:text-gray-900"
                                : "text-green-600 hover:text-green-900"
                            }`}
                            title={
                              song.isPublished ? "비공개로 설정" : "공개로 설정"
                            }
                          >
                            {song.isPublished ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </button>
                        </Form>

                        <Form method="post" className="inline">
                          <input
                            type="hidden"
                            name="action"
                            value="deleteSong"
                          />
                          <input type="hidden" name="songId" value={song.id} />
                          <button
                            type="submit"
                            className="text-red-600 hover:text-red-900"
                            title="삭제"
                            onClick={(e) => {
                              if (
                                !confirm("정말 이 음악을 삭제하시겠습니까?")
                              ) {
                                e.preventDefault();
                              }
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </Form>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {songs.length === 0 && (
            <div className="text-center py-12">
              <Music className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">
                음악이 없습니다
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                새로운 음악을 추가해보세요.
              </p>
              <div className="mt-6">
                <Link
                  to="/admin/songs/new"
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  음악 추가
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
