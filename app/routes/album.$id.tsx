import type { MetaFunction, LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData, Link } from "@remix-run/react";
import { useState } from "react";
import { Play, Heart, Share2, MessageCircle } from "lucide-react";
import Layout from "../components/Layout";
import AudioPlayer from "../components/AudioPlayer";
import { getAlbumById, getSidebarAlbums } from "../lib/server";
import { usePlayer } from "../contexts/PlayerContext";

export const meta: MetaFunction = () => {
  return [
    { title: "서우젯소리 - 벅스" },
    {
      name: "description",
      content: "사우스 카니발(South Carnival)의 앨범 서우젯소리",
    },
  ];
};

type Song = {
  id: string;
  title: string;
  duration?: number | string | null | undefined;
  isTitle?: boolean;
  artists?: Array<{ artist?: { name?: string } }>;
  audioUrl?: string | null | undefined;
  // add other song properties as needed
};

type Album = {
  title: string;
  description: string | null;
  id: string;
  coverImage: string | null;
  releaseDate: Date | null;
  genre: string | null | string[];
  type: string;
  plays: number;
  likes: number;
  distributor?: string;
  label?: string;
  duration?: string;
  quality?: string;
  style?: string | string[];
  updatedAt: Date;
  artists?: Array<{ artist?: { name?: string } }>;
  songs?: Song[];
  totalSongs?: number;
  currentPage?: number;
  pageSize?: number;
};

export async function loader({ params, request }: LoaderFunctionArgs) {
  const albums = await getSidebarAlbums(15);
  const url = new URL(request.url);
  const pageParam = url.searchParams.get("page");
  const page = pageParam ? parseInt(pageParam, 10) : 1;
  const pageSize = 10;
  const albumRaw = params.id ? await getAlbumById(params.id) : null;

  let album: Album | null = null;
  if (albumRaw) {
    const totalSongs = Array.isArray(albumRaw.songs)
      ? albumRaw.songs.length
      : 0;
    album = {
      ...albumRaw,
      songs: Array.isArray(albumRaw.songs)
        ? albumRaw.songs
            .slice((page - 1) * pageSize, page * pageSize)
            .map((song: Song) => ({
              ...song,
              duration:
                song.duration !== undefined && song.duration !== null
                  ? String(song.duration)
                  : undefined,
            }))
        : [],
      totalSongs,
      currentPage: page,
      pageSize,
    } as Album & { totalSongs: number; currentPage: number; pageSize: number };
  }
  return { albums, album };
}

export default function AlbumDetail() {
  const { albums, album } = useLoaderData<typeof loader>();
  const [selectedTracks, setSelectedTracks] = useState<string[]>([]);
  const [selectAll, setSelectAll] = useState(false);
  const [playingSongId, setPlayingSongId] = useState<string | null>(null);
  const { playTrack } = usePlayer();
  const handlePlay = (song: Song) => {
    setPlayingSongId(song?.id);
    playTrack({
      id: song.id,
      title: song.title,
      artist: (song.artists ?? []).map((a) => a.artist?.name).join(", "),
      audioUrl: song.audioUrl || "",
      coverImage: album?.coverImage || "",
      duration:
        typeof song.duration === "number"
          ? song.duration
          : song.duration
          ? Number(song.duration)
          : undefined,
    });
  };
  // Fallback UI if album or songs are missing
  if (!album) {
    return (
      <Layout sidebarAlbums={albums}>
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            앨범을 찾을 수 없습니다.
          </h2>
          <p className="text-gray-500">
            존재하지 않는 앨범이거나 삭제된 앨범입니다.
          </p>
        </div>
      </Layout>
    );
  }

  const songs = Array.isArray(album.songs) ? album.songs : [];

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedTracks([]);
    } else {
      setSelectedTracks(songs.map((song: Song) => song.id));
    }
    setSelectAll(!selectAll);
  };

  const handleSelectTrack = (trackId: string) => {
    if (selectedTracks.includes(trackId)) {
      setSelectedTracks(selectedTracks.filter((id) => id !== trackId));
    } else {
      setSelectedTracks([...selectedTracks, trackId]);
    }
  };

  // Helper for releaseDate
  const releaseDateStr =
    album.releaseDate instanceof Date
      ? album.releaseDate.toISOString().split("T")[0]
      : album.releaseDate || "";

  // Helper to safely get pagination values
  const totalSongs =
    album &&
    typeof (album as Album & { totalSongs?: number }).totalSongs === "number"
      ? (album as Album & { totalSongs: number }).totalSongs
      : 0;
  const currentPage =
    album &&
    typeof (album as Album & { currentPage?: number }).currentPage === "number"
      ? (album as Album & { currentPage: number }).currentPage
      : 1;
  const pageSize =
    album &&
    typeof (album as Album & { pageSize?: number }).pageSize === "number"
      ? (album as Album & { pageSize: number }).pageSize
      : 10;
  const totalPages = Math.ceil(totalSongs / pageSize);

  return (
    <Layout sidebarAlbums={albums}>
      <div className="space-y-8">
        {/* Album Header */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Album Cover */}
          <div className="lg:col-span-1">
            <div className="relative aspect-square rounded-lg overflow-hidden bg-gray-200 group">
              <img
                src={
                  album.coverImage &&
                  typeof album.coverImage === "string" &&
                  (album.coverImage.startsWith("http") ||
                    album.coverImage.startsWith("/"))
                    ? album.coverImage
                    : `https://via.placeholder.com/400x400/ff1493/ffffff?text=${encodeURIComponent(
                        album.title || ""
                      )}`
                }
                alt={album.title || ""}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 flex items-center justify-center">
                <button className="w-16 h-16 bg-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transform scale-75 group-hover:scale-100 transition-all duration-300 shadow-lg">
                  <Play className="w-6 h-6 text-Snowlight-pink ml-1" />
                </button>
              </div>
            </div>
          </div>

          {/* Album Info */}
          <div className="lg:col-span-2 space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {album.title || ""}
              </h1>
              <Link
                to={`/artist/${album.artists?.[0]?.artist?.name || ""}`}
                className="text-xl text-Snowlight-pink hover:text-pink-600 font-medium"
              >
                {album.artists?.[0]?.artist?.name || ""}
              </Link>
            </div>

            {/* Album Metadata */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="space-y-2">
                <div className="flex">
                  <span className="w-20 text-gray-600">유형</span>
                  <span>{album.type || ""}</span>
                </div>
                <div className="flex">
                  <span className="w-20 text-gray-600">장르</span>
                  <div className="flex space-x-2">
                    {Array.isArray(album.genre) ? (
                      album.genre.map((g: string) => (
                        <Link
                          key={g}
                          to={`/genre/${g}`}
                          className="text-Snowlight-pink hover:underline"
                        >
                          {g}
                        </Link>
                      ))
                    ) : album.genre ? (
                      <span>{album.genre}</span>
                    ) : null}
                  </div>
                </div>
                <div className="flex">
                  <span className="w-20 text-gray-600">스타일</span>
                  <div className="flex space-x-2">
                    {Array.isArray(album.style) ? (
                      album.style.map((s: string) => (
                        <Link
                          key={s}
                          to={`/style/${s}`}
                          className="text-Snowlight-pink hover:underline"
                        >
                          {s}
                        </Link>
                      ))
                    ) : album.style ? (
                      <span>{album.style}</span>
                    ) : null}
                  </div>
                </div>
                <div className="flex">
                  <span className="w-20 text-gray-600">발매일</span>
                  <span>{releaseDateStr}</span>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex">
                  <span className="w-20 text-gray-600">유통사</span>
                  <span>{album.distributor || ""}</span>
                </div>
                <div className="flex">
                  <span className="w-20 text-gray-600">기획사</span>
                  <span>{album.label || ""}</span>
                </div>
                <div className="flex">
                  <span className="w-20 text-gray-600">재생 시간</span>
                  <span>{album.duration || ""}</span>
                </div>
                <div className="flex">
                  <span className="w-20 text-gray-600">고음질</span>
                  <span className="text-Snowlight-pink">
                    {album.quality || ""}
                  </span>
                </div>
              </div>
            </div>

            {/* Album Actions */}
            <div className="flex items-center space-x-4">
              <button className="Snowlight-button Snowlight-button-primary">
                앨범구매
              </button>
              <button className="flex items-center space-x-2 text-gray-600 hover:text-Snowlight-pink">
                <Heart className="w-5 h-5" />
                <span>좋아 0</span>
              </button>
              <button className="flex items-center space-x-2 text-gray-600 hover:text-Snowlight-pink">
                <MessageCircle className="w-5 h-5" />
                <span>0개</span>
              </button>
              <button className="flex items-center space-x-2 text-gray-600 hover:text-Snowlight-pink">
                <Share2 className="w-5 h-5" />
                <span>공유</span>
              </button>
            </div>
          </div>
        </div>

        {/* Track List */}
        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            수록곡 ({songs.length})
          </h2>

          {/* Bulk Actions */}
          <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg mb-4">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={selectAll}
                onChange={handleSelectAll}
                className="rounded border-gray-300 text-Snowlight-pink focus:ring-Snowlight-pink"
              />
              <span className="text-sm">곡 목록 전체</span>
            </label>
            <div className="flex space-x-2">
              <button className="Snowlight-button Snowlight-button-secondary text-sm">
                선택된 곡 재생듣기
              </button>
              <button className="Snowlight-button Snowlight-button-secondary text-sm">
                재생목록에 추가
              </button>
              <button className="Snowlight-button Snowlight-button-secondary text-sm">
                내 앨범에 담기
              </button>
              <button className="Snowlight-button Snowlight-button-secondary text-sm">
                다운로드
              </button>
            </div>
            <div className="flex space-x-2 ml-auto">
              <button className="Snowlight-button Snowlight-button-primary text-sm">
                전체 듣기(재생목록 추가)
              </button>
              <button className="Snowlight-button Snowlight-button-secondary text-sm">
                전체 듣기(재생목록 교체)
              </button>
            </div>
          </div>

          {/* Track Table */}
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div className="grid grid-cols-12 gap-4 p-4 bg-gray-50 border-b border-gray-200 text-sm font-medium text-gray-700">
              <div className="col-span-1">번호</div>
              <div className="col-span-6">곡</div>
              <div className="col-span-2">아티스트</div>
              <div className="col-span-3">
                듣기 재생목록 내앨범 다운 영상 기타
              </div>
            </div>

            {songs.map((song: Song, idx: number) => (
              <div
                key={song.id}
                className="grid grid-cols-12 gap-4 p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors"
              >
                {/* Track Number */}
                <div className="col-span-1 flex items-center space-x-2">
                  <label className="flex items-center">
                    <span className="sr-only">곡 {idx + 1} 선택</span>
                    <input
                      type="checkbox"
                      checked={selectedTracks.includes(song.id)}
                      onChange={() => handleSelectTrack(song.id)}
                      className="rounded border-gray-300 text-Snowlight-pink focus:ring-Snowlight-pink"
                    />
                  </label>
                  <div className="text-center">
                    <div className="text-lg font-bold">{idx + 1}</div>
                    {song.isTitle && (
                      <span className="text-xs text-Snowlight-pink font-bold">
                        [타이틀곡]
                      </span>
                    )}
                  </div>
                </div>

                {/* Track Info */}
                <div className="col-span-6 flex items-center">
                  <div>
                    <h3 className="font-medium text-gray-900 hover:text-Snowlight-pink cursor-pointer">
                      {song.title}
                    </h3>
                    <p className="text-sm text-gray-600">{song.duration}</p>
                    {playingSongId === song.id && (
                      <AudioPlayer
                        src={song.audioUrl || ""}
                        coverImage={album.coverImage || undefined}
                        title={song.title}
                        artist={
                          song.artists?.map((a) => a.artist?.name).join(", ") ||
                          ""
                        }
                        album={album.title}
                        duration={
                          typeof song.duration === "number"
                            ? song.duration
                            : undefined
                        }
                        id={song.id}
                      />
                    )}
                  </div>
                </div>

                {/* Artist */}
                <div className="col-span-2 flex items-center">
                  <Link
                    to={`/artist/${song.artists?.[0]?.artist?.name || ""}`}
                    className="text-gray-900 hover:text-Snowlight-pink"
                  >
                    {song.artists
                      ?.map(
                        (a: { artist?: { name?: string } }) => a.artist?.name
                      )
                      .join(", ") || "No Artist"}
                  </Link>
                </div>

                {/* Actions */}
                <div className="col-span-3 flex items-center space-x-2">
                  <button className="Snowlight-button-secondary text-xs px-2 py-1">
                    곡정보
                  </button>
                  <button
                    className="p-1 hover:bg-gray-200 rounded"
                    title="듣기"
                    onClick={() => handlePlay(song)}
                  >
                    <Play className="w-4 h-4 text-Snowlight-pink" />
                  </button>
                  <button className="text-xs text-gray-600 hover:text-Snowlight-pink">
                    재생목록에 추가
                  </button>
                  <button className="text-xs text-gray-600 hover:text-Snowlight-pink">
                    내 앨범에 담기
                  </button>
                  <button className="text-xs text-Snowlight-pink hover:text-pink-600">
                    flac 다운로드
                  </button>
                  <button className="text-xs text-gray-600 hover:text-Snowlight-pink">
                    기타 기능
                  </button>
                </div>
              </div>
            ))}
          </div>

          {totalSongs > pageSize && (
            <div className="flex justify-center items-center space-x-2 mt-4">
              <button
                disabled={currentPage === 1}
                onClick={() => {
                  const prevPage = currentPage - 1;
                  window.location.search = `?page=${prevPage}`;
                }}
                className={`Snowlight-button Snowlight-button-secondary text-sm ${
                  currentPage === 1 ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                이전
              </button>
              <span className="px-2 text-gray-700">
                {currentPage} / {totalPages}
              </span>
              <button
                disabled={currentPage === totalPages}
                onClick={() => {
                  const nextPage = currentPage + 1;
                  window.location.search = `?page=${nextPage}`;
                }}
                className={`Snowlight-button Snowlight-button-secondary text-sm ${
                  currentPage === totalPages
                    ? "opacity-50 cursor-not-allowed"
                    : ""
                }`}
              >
                다음
              </button>
            </div>
          )}
        </section>

        {/* Album Description */}
        {album.description && (
          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-4">앨범 소개</h2>
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                {album.description}
              </p>
            </div>
          </section>
        )}

        {/* Comments Section */}
        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-4">한마디 (0)</h2>
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="space-y-4">
              <textarea
                placeholder="한마디 입력"
                className="w-full p-3 border border-gray-300 rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-Snowlight-pink focus:border-transparent"
                rows={3}
              />
              <div className="flex items-center justify-between">
                <button className="Snowlight-button Snowlight-button-secondary text-sm">
                  음악 첨부
                </button>
                <div className="flex items-center space-x-4">
                  <span className="text-sm text-gray-500">0/300</span>
                  <button className="Snowlight-button Snowlight-button-primary text-sm">
                    등록
                  </button>
                </div>
              </div>
            </div>
            <div className="mt-6 text-center text-gray-500">
              등록된 한마디가 없습니다. 첫 번째 한마디를 남겨보세요!
            </div>
          </div>
        </section>
      </div>
    </Layout>
  );
}
