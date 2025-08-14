import { useState } from "react";
import { json, redirect } from "@remix-run/node";
import {
  Link,
  useLoaderData,
  useFetcher,
  useRevalidator,
} from "@remix-run/react";
import {
  Play,
  MoreHorizontal,
  Plus,
  Download,
  Heart,
  MessageCircle,
  Eye,
  Check,
  Loader2,
  Heart as HeartFilled,
} from "lucide-react";
import { usePlayer } from "~/contexts/PlayerContext";

import Layout from "~/components/Layout";
import type { SidebarAlbum } from "~/components/Layout";
import type { PlaylistItem, Favorite } from "~/types";
import AudioPlayer from "~/components/AudioPlayer";
import VideoPlayer from "~/components/VideoPlayer";

interface Album {
  id: string | number;
  title: string;
  artist: string;
  releaseDate: string;
  albumType: string;
  type?: string;
  imageUrl: string;
  rank?: number;
  isKorean?: boolean;
  artists?: Array<{ artist: { name: string; stageName?: string } }>;
  coverImage?: string | null;
  description?: string | null;
  genre?: string | null;
  plays?: number;
  likes?: number;
}

interface Artist {
  name: string;
  stageName?: string;
}
interface TrackWithCover {
  id: string;
  title: string;
  artist: string;
  audioUrl?: string;
  imageUrl: string;
  coverImage?: string | null;
  album?: Album;
  artists?: Array<{ artist: Artist }>;
}
interface Video {
  id: string;
  title: string;
  url: string;
  thumbnail: string;
  thumbnailUrl?: string;
  duration?: number;
  views?: number;
}
interface MusicPost {
  id: string;
  title: string;
  content: string;
  author?: string;
  timestamp?: string;
  likes?: number;
  comments?: number;
  views?: number;
}
interface ArtistStory {
  id: string;
  title: string;
  content: string;
  artist?: string;
  timestamp?: string;
  comments?: number;
  views?: number;
}
interface PdAlbum {
  id: string;
  title: string;
  curator: string;
  coverUrl: string;
  trackCount: number;
  playCount: number;
  rating: number;
  date: string;
  featured: boolean;
  imageUrl?: string;
  description?: string;
}
interface KnowledgeContent {
  albumId?: string;
  uploadId?: string;
}

import {
  getLatestAlbums,
  getChartSongs,
  getLatestVideos,
  getFeaturedArtists,
  getFeaturedSongs,
  getSidebarAlbums,
  addSongToPlaylist,
  getSongDownloadInfo,
  addSongToFavorite,
  songMoreActions,
  findPlaylistItemsByUserId,
  findFavoritesByUserId,
} from "~/lib/server";
import { validateSession } from "../lib/auth";

export async function loader({ request }: { request: Request }) {
  try {
    // Get cookie from request
    const cookieHeader = request.headers.get("Cookie") || "";
    const token = cookieHeader
      ?.split(";")
      .find((c) => c.trim().startsWith("auth-token="))
      ?.split("=")[1];

    const user = await validateSession(token ?? "");

    // Validate session

    // Fetch playlist items and favorites for user
    const [
      latestAlbums,
      chartSongs,
      latestVideos,
      artistStories,
      pdAlbums,
      sidebarAlbums,
      playlistItems,
      favorites,
    ] = await Promise.all([
      getLatestAlbums(8),
      getChartSongs(20),
      getLatestVideos(6),
      getFeaturedArtists(6),
      getFeaturedSongs(8),
      getSidebarAlbums(15),
      findPlaylistItemsByUserId(user?.id ?? ""),
      findFavoritesByUserId(user?.id ?? ""),
    ]);

    return json({
      user: user ? { id: user.id } : null,
      latestAlbums: Array.isArray(latestAlbums)
        ? latestAlbums.filter(Boolean)
        : [],
      chartSongs: Array.isArray(chartSongs) ? chartSongs.filter(Boolean) : [],
      latestVideos: Array.isArray(latestVideos)
        ? latestVideos.filter(Boolean)
        : [],
      musicPosts: [],
      artistStories: Array.isArray(artistStories)
        ? artistStories.filter(Boolean)
        : [],
      pdAlbums: Array.isArray(pdAlbums) ? pdAlbums.filter(Boolean) : [],
      knowledgeContent: {},
      sidebarAlbums: Array.isArray(sidebarAlbums)
        ? (sidebarAlbums.filter(Boolean) as SidebarAlbum[])
        : [],
      playlistItems: Array.isArray(playlistItems) ? playlistItems : [],
      favorites: Array.isArray(favorites) ? favorites : [],
    });
  } catch (error) {
    console.error("Database error:", error);
    return json({
      user: null,
      latestAlbums: [],
      chartSongs: [],
      latestVideos: [],
      musicPosts: [],
      artistStories: [],
      pdAlbums: [],
      knowledgeContent: {},
      sidebarAlbums: [],
    });
  }
}

export const action = async ({ request }: { request: Request }) => {
  const formData = await request.formData();
  const actionType = formData.get("actionType");
  const userId = formData.get("userId") as string;
  const playlistId = formData.get("playlistId") as string;
  const songId = formData.get("songId") as string;

  switch (actionType) {
    case "togglePlaylist": {
      if (!userId || !songId)
        return json({ error: "Missing data" }, { status: 400 });
      // Use toggleSongInPlaylist instead of addSongToPlaylist
      const result = await import("~/lib/server").then((m) =>
        m.toggleSongInPlaylist({ userId, playlistId, songId })
      );
      return json(result);
    }
    case "toggleFavorite": {
      if (!userId || !songId)
        return json({ error: "Missing data" }, { status: 400 });
      // Use toggleSongFavorite instead of addSongToFavorite
      const result = await import("~/lib/server").then((m) =>
        m.toggleSongFavorite({ userId, songId })
      );
      return json(result);
    }
    case "download": {
      if (!songId) return json({ error: "Missing songId" }, { status: 400 });
      const result = await getSongDownloadInfo(songId);
      return json(result);
    }
    case "more": {
      if (!userId || !songId)
        return json({ error: "Missing data" }, { status: 400 });
      const result = await songMoreActions({ userId, songId });
      return json(result);
    }
    default:
      return json({ error: "Unknown action" }, { status: 400 });
  }
};

// Fix loader return type for useLoaderData
interface LoaderData {
  user: { id: string } | null;
  latestAlbums: Album[];
  chartSongs: TrackWithCover[];
  latestVideos: Video[];
  musicPosts: MusicPost[];
  artistStories: ArtistStory[];
  pdAlbums: PdAlbum[];
  knowledgeContent: KnowledgeContent;
  sidebarAlbums: SidebarAlbum[];
  playlistItems: PlaylistItem[];
  favorites: Favorite[];
}

export default function HomePage() {
  const data = useLoaderData<LoaderData>();
  const { playTrack } = usePlayer();
  const revalidator = useRevalidator();
  console.log(data);

  // Use data from loader
  const latestAlbums = Array.isArray(data.latestAlbums)
    ? data.latestAlbums.filter(Boolean)
    : [];
  const chartSongs = Array.isArray(data.chartSongs)
    ? data.chartSongs.filter(Boolean)
    : [];
  const latestVideos = Array.isArray(data.latestVideos)
    ? data.latestVideos.filter(Boolean)
    : [];
  const musicPosts = Array.isArray(data.musicPosts)
    ? data.musicPosts.filter(
        (post) => post !== null && typeof post === "object"
      )
    : [];
  const artistStories = Array.isArray(data.artistStories)
    ? data.artistStories.filter(Boolean)
    : [];
  const pdAlbums = Array.isArray(data.pdAlbums)
    ? data.pdAlbums.filter(Boolean)
    : [];

  const getNumberColor = (rank: number) => {
    const colors = [
      "bg-red-500", // 1
      "bg-orange-500", // 2
      "bg-yellow-500", // 3
      "bg-green-500", // 4
      "bg-blue-500", // 5
      "bg-indigo-500", // 6
      "bg-purple-500", // 7
      "bg-pink-500", // 8
    ];
    return colors[rank - 1] || "bg-gray-500";
  };

  const handlePlay = (track: Album | TrackWithCover) => {
    playTrack({
      id: track.id?.toString() || "1",
      title: track.title,
      artist: track.artist,
      audioUrl:
        "audioUrl" in track && track.audioUrl
          ? track.audioUrl
          : "https://commondatastorage.googleapis.com/codeskulptor-demos/DDR_assets/Kangaroo_MusiQue_-_The_Neverwritten_Role_Playing_Game.mp3",
      imageUrl: track.imageUrl,
    });
  };

  const fetcher = useFetcher();
  const userId = data.user?.id || "";

  const [loadingSongId, setLoadingSongId] = useState<string | number | null>(
    null
  );
  const [loadingType, setLoadingType] = useState<
    "playlist" | "favorite" | null
  >(null);

  // Add modal state for audio/video preview
  const [previewAudio, setPreviewAudio] = useState<TrackWithCover | null>(null);
  const [previewVideo, setPreviewVideo] = useState<Video | null>(null);
  console.log(previewAudio);
  // Helper: check if song is in playlist or favorites
  const isSongInPlaylist = (songId: string | number) => {
    return Array.isArray(data.playlistItems)
      ? (data.playlistItems as PlaylistItem[]).some(
          (item) => item.songId === songId
        )
      : false;
  };
  const isSongFavorite = (songId: string | number) => {
    return Array.isArray(data.favorites)
      ? (data.favorites as Favorite[]).some((fav) => fav.songId === songId)
      : false;
  };

  // Toggle playlist
  const handleTogglePlaylist = async (
    song: (typeof chartSongs)[number] | null
  ) => {
    if (!song) return;
    setLoadingSongId(song.id);
    setLoadingType("playlist");
    await fetcher.submit(
      {
        actionType: "togglePlaylist",
        userId,
        songId: song.id,
      },
      { method: "post" }
    );
    // Keep spinner until loader data is updated
    revalidator.revalidate(); // Refetch loader data
    setLoadingSongId(null);
    setLoadingType(null);
  };

  // Toggle favorite
  const handleToggleFavorite = async (
    song: (typeof chartSongs)[number] | null
  ) => {
    if (!song) return;
    setLoadingSongId(song.id);
    setLoadingType("favorite");
    await fetcher.submit(
      {
        actionType: "toggleFavorite",
        userId,
        songId: song.id,
      },
      { method: "post" }
    );
    // Keep spinner until loader data is updated
    revalidator.revalidate(); // Refetch loader data
    setLoadingSongId(null);
    setLoadingType(null);
  };

  const handleDownload = (song: (typeof chartSongs)[number] | null) => {
    if (!song) return;
    fetcher.submit(
      {
        actionType: "download",
        songId: song.id,
      },
      { method: "post" }
    );
  };

  const handleMore = (song: (typeof chartSongs)[number] | null) => {
    if (!song) return;
    fetcher.submit(
      {
        actionType: "more",
        userId,
        songId: song.id,
      },
      { method: "post" }
    );
  };

  // 앨범 필터 (최신 앨범 탭)
  const [albumTab, setAlbumTab] = useState<"전체" | "국내" | "해외">("전체");
  const filteredAlbums = latestAlbums.filter(
    (album) =>
      album &&
      (albumTab === "전체" ||
        (albumTab === "국내" && album.isKorean === true) ||
        (albumTab === "해외" && album.isKorean === false))
  );

  // 앨범 슬라이더 상태
  const [albumPage, setAlbumPage] = useState(0);
  const albumsPerPage = 4; // Show 4 albums per page (matches lg:grid-cols-4)
  const totalAlbumPages = Math.ceil(filteredAlbums.length / albumsPerPage);
  const pagedAlbums = filteredAlbums.slice(
    albumPage * albumsPerPage,
    albumPage * albumsPerPage + albumsPerPage
  );
  // 슬라이드 애니메이션 상태
  const [isSliding, setIsSliding] = useState(false);
  const [slideDirection, setSlideDirection] = useState<"left" | "right" | null>(
    null
  );

  const handleAlbumNav = (dir: "left" | "right") => {
    if (isSliding) return;
    setSlideDirection(dir);
    setIsSliding(true);
    setTimeout(() => {
      setAlbumPage((p) => {
        if (dir === "left") return Math.max(0, p - 1);
        return Math.min(totalAlbumPages - 1, p + 1);
      });
      setIsSliding(false);
      setSlideDirection(null);
    }, 350); // duration matches transition
  };

  // 노래 차트 필터 (노래 차트 탭)
  const [chartTab, setChartTab] = useState<"전체" | "국내" | "해외">("전체");
  const filteredChartSongs = chartSongs.filter(
    (song) =>
      song &&
      (chartTab === "전체" ||
        (chartTab === "국내" && song.album?.isKorean === true) ||
        (chartTab === "해외" && song.album?.isKorean === false))
  );

  // Video slider state
  const [videoPage, setVideoPage] = useState(0);
  const videosPerPage = 3; // Show 3 videos per page
  const totalVideoPages = Math.ceil(latestVideos.length / videosPerPage);
  const pagedVideos = latestVideos.slice(
    videoPage * videosPerPage,
    videoPage * videosPerPage + videosPerPage
  );
  const [isVideoSliding, setIsVideoSliding] = useState(false);
  const [videoSlideDirection, setVideoSlideDirection] = useState<
    "left" | "right" | null
  >(null);

  const handleVideoNav = (dir: "left" | "right") => {
    if (isVideoSliding) return;
    setVideoSlideDirection(dir);
    setIsVideoSliding(true);
    setTimeout(() => {
      setVideoPage((p) => {
        if (dir === "left") return Math.max(0, p - 1);
        return Math.min(totalVideoPages - 1, p + 1);
      });
      setIsVideoSliding(false);
      setVideoSlideDirection(null);
    }, 350); // duration matches transition
  };

  return (
    <Layout sidebarAlbums={data.sidebarAlbums as SidebarAlbum[]}>
      <div className="space-y-8 p-6">
        {/* Section 1: Hero - Latest Albums */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-900">최신 앨범</h2>
            <div className="flex space-x-2">
              {["전체", "국내", "해외"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setAlbumTab(tab as "전체" | "국내" | "해외")}
                  className={`px-3 py-1 text-sm rounded flex items-center gap-1 ${
                    albumTab === tab
                      ? "bg-purple-600 text-white"
                      : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  }`}
                >
                  {tab === "전체" && <MoreHorizontal className="w-4 h-4" />}
                  {tab === "국내" && <Heart className="w-4 h-4" />}
                  {tab === "해외" && <Eye className="w-4 h-4" />}
                  {tab}
                </button>
              ))}
            </div>
          </div>

          {filteredAlbums.length > 0 ? (
            <div className="relative">
              {/* Slider Controls */}
              <button
                className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white bg-opacity-80 rounded-full p-2 shadow hover:bg-opacity-100 transition disabled:opacity-40"
                onClick={() => handleAlbumNav("left")}
                disabled={albumPage === 0 || isSliding}
                aria-label="이전 앨범"
                style={{ left: "-2rem" }}
              >
                <svg
                  width="24"
                  height="24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="lucide lucide-chevron-left"
                >
                  <polyline points="15 18 9 12 15 6" />
                </svg>
              </button>
              <button
                className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white bg-opacity-80 rounded-full p-2 shadow hover:bg-opacity-100 transition disabled:opacity-40"
                onClick={() => handleAlbumNav("right")}
                disabled={albumPage >= totalAlbumPages - 1 || isSliding}
                aria-label="다음 앨범"
                style={{ right: "-2rem" }}
              >
                <svg
                  width="24"
                  height="24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="lucide lucide-chevron-right"
                >
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </button>
              <div
                className={`overflow-hidden relative h-auto`}
                style={{ minHeight: "220px" }}
              >
                <div
                  className={`grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 transition-transform duration-350 ease-in-out ${
                    isSliding && slideDirection === "left"
                      ? "-translate-x-16 opacity-60"
                      : isSliding && slideDirection === "right"
                      ? "translate-x-16 opacity-60"
                      : "translate-x-0 opacity-100"
                  }`}
                >
                  {pagedAlbums.filter(Boolean).map(
                    (album) =>
                      album && (
                        <div
                          key={String(album.id)}
                          className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow group"
                        >
                          <div className="relative">
                            <img
                              src={
                                album?.coverImage ||
                                `https://placehold.co/600x400`
                              }
                              alt={album.title}
                              className="w-full h-40 object-cover"
                              loading="lazy"
                            />
                            {album.rank && (
                              <div
                                className={`absolute top-2 left-2 ${getNumberColor(
                                  album.rank
                                )} text-white text-sm font-bold w-6 h-6 rounded-full flex items-center justify-center`}
                              >
                                {album.rank}
                              </div>
                            )}
                            {/* Album details on hover */}
                            <div className="absolute inset-0 bg-black bg-opacity-80 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-col justify-center items-center p-4 text-white">
                              <button
                                onClick={() => handlePlay(album as Album)}
                                className="w-12 h-12 bg-white bg-opacity-90 rounded-full flex items-center justify-center hover:bg-opacity-100 transition-all duration-200 mb-2"
                              >
                                <Play className="w-6 h-6 text-gray-800 ml-1" />
                              </button>
                              {album.description && (
                                <p className="text-xs text-center line-clamp-3 mt-2">
                                  {album.description}
                                </p>
                              )}
                              {album.genre && (
                                <p className="text-xs mt-1">
                                  장르: {album.genre}
                                </p>
                              )}
                              {album.plays && album.plays > 0 && (
                                <p className="text-xs mt-1">
                                  Plays: {album.plays.toLocaleString()}
                                </p>
                              )}
                            </div>
                          </div>
                          <div className="p-3">
                            <Link
                              to={`/album/${album.id}`}
                              className="text-sm font-medium text-gray-900 hover:text-pink-600 hover:underline truncate block"
                            >
                              {album.title}
                            </Link>
                            <p className="text-xs text-gray-600 truncate"></p>
                            <p className="text-xs text-gray-600 truncate">
                              {album.artist}
                            </p>
                            <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
                              <span>
                                {album.releaseDate?.split("T")[0] ||
                                  album.releaseDate}
                              </span>
                              <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded">
                                {album.albumType || "ALBUM"}
                              </span>
                            </div>
                          </div>
                        </div>
                      )
                  )}
                </div>
              </div>
              {/* Page indicator (optional) */}
              <div className="flex justify-center mt-2">
                <span className="text-xs text-gray-500">
                  {albumPage + 1} / {totalAlbumPages}
                </span>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-10 text-gray-500">
              <p className="text-lg">앨범이 없습니다</p>
              <p className="text-sm mt-2">다른 필터를 시도해보세요</p>
            </div>
          )}
        </section>

        {/* Section 2: Chart */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-900">노래 차트</h2>
            <div className="flex space-x-2">
              {["전체", "국내", "해외"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setChartTab(tab as "전체" | "국내" | "해외")}
                  className={`px-3 py-1 text-sm rounded flex items-center gap-1 ${
                    chartTab === tab
                      ? "bg-purple-600 text-white"
                      : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  }`}
                >
                  {tab === "전체" && <MoreHorizontal className="w-4 h-4" />}
                  {tab === "국내" && <Heart className="w-4 h-4" />}
                  {tab === "해외" && <Eye className="w-4 h-4" />}
                  {tab}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    순위
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    노래
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    앨범
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    재생
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    플레이리스트에 추가
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredChartSongs.filter(Boolean).map(
                  (song, idx) =>
                    song && (
                      <tr key={song.id || idx} className="hover:bg-gray-50">
                        <td className="px-4 py-4 whitespace-nowrap">
                          <span className="text-sm font-medium text-gray-900">
                            {idx + 1}
                          </span>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div className="flex items-center space-x-3">
                            <img
                              src={
                                song.coverImage ||
                                song.album?.coverImage ||
                                "https://placehold.co/50x50"
                              }
                              alt={song.title}
                              className="w-10 h-10 rounded object-cover"
                            />
                            <div>
                              <Link
                                to={`/song/${song.id}`}
                                className="text-sm font-medium text-gray-900 hover:text-pink-600 hover:underline"
                              >
                                {song.title}
                              </Link>
                              <div className="text-sm text-gray-500">
                                {(song.artists ?? [])
                                  .map(
                                    (a: { artist: Artist }) =>
                                      a.artist?.stageName || a.artist?.name
                                  )
                                  .join(", ")}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                          {song.album?.title || ""}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <button
                            onClick={() => setPreviewAudio(song)}
                            className="bg-green-500 text-white text-xs py-1 px-3 rounded hover:bg-green-600 transition-colors flex items-center gap-1"
                          >
                            <Play className="w-4 h-4 mr-1" />
                            재생
                          </button>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div className="flex items-center space-x-2">
                            <button
                              className={`text-gray-400 hover:text-pink-500 ${
                                loadingSongId === song.id &&
                                loadingType === "playlist"
                                  ? "cursor-wait"
                                  : ""
                              }`}
                              title={
                                isSongInPlaylist(song.id)
                                  ? "플레이리스트에서 제거"
                                  : "플레이리스트에 추가"
                              }
                              onClick={() => handleTogglePlaylist(song)}
                              disabled={
                                loadingSongId === song.id &&
                                loadingType === "playlist"
                              }
                            >
                              {loadingSongId === song.id &&
                              loadingType === "playlist" ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : isSongInPlaylist(song.id) ? (
                                <Check className="w-4 h-4 text-green-500" />
                              ) : (
                                <Plus className="w-4 h-4" />
                              )}
                            </button>
                            <button
                              className="text-gray-400 hover:text-blue-500"
                              title="다운로드"
                              onClick={() => handleDownload(song)}
                            >
                              <Download className="w-4 h-4" />
                            </button>
                            <button
                              className={`text-gray-400 hover:text-red-500 ${
                                loadingSongId === song.id &&
                                loadingType === "favorite"
                                  ? "cursor-wait"
                                  : ""
                              }`}
                              title={
                                isSongFavorite(song.id)
                                  ? "즐겨찾기에서 제거"
                                  : "즐겨찾기 추가"
                              }
                              onClick={() => handleToggleFavorite(song)}
                              disabled={
                                loadingSongId === song.id &&
                                loadingType === "favorite"
                              }
                            >
                              {loadingSongId === song.id &&
                              loadingType === "favorite" ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : isSongFavorite(song.id) ? (
                                <HeartFilled className="w-4 h-4 text-red-500 fill-red-500" />
                              ) : (
                                <Heart className="w-4 h-4" />
                              )}
                            </button>
                            <button
                              className="text-gray-400 hover:text-gray-600"
                              title="더보기"
                              onClick={() => handleMore(song)}
                            >
                              <MoreHorizontal className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                )}
              </tbody>
            </table>

            <div className="bg-gray-50 px-4 py-3 border-t border-gray-200">
              <div className="flex items-center space-x-4">
                <button className="bg-green-500 text-white text-sm py-2 px-4 rounded hover:bg-green-600 transition-colors flex items-center gap-1">
                  <Play className="w-4 h-4 mr-1" />
                  전체 재생
                </button>
                <button className="bg-gray-200 text-gray-700 text-sm py-2 px-4 rounded hover:bg-gray-300 transition-colors flex items-center gap-1">
                  <Plus className="w-4 h-4 mr-1" />
                  전체 플레이리스트에 추가
                </button>
                <button className="bg-gray-200 text-gray-700 text-sm py-2 px-4 rounded hover:bg-gray-300 transition-colors flex items-center gap-1">
                  <Download className="w-4 h-4 mr-1" />
                  전체 다운로드
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Section 3: Latest Videos */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-900">최신 영상</h2>
            <Link
              to="/videos"
              className="text-sm text-gray-600 hover:text-gray-900"
            >
              최신 영상 더 보기
            </Link>
          </div>

          {latestVideos.length > 0 ? (
            <div className="relative">
              {/* Slider Controls */}
              <button
                className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white bg-opacity-80 rounded-full p-2 shadow hover:bg-opacity-100 transition disabled:opacity-40"
                onClick={() => handleVideoNav("left")}
                disabled={videoPage === 0 || isVideoSliding}
                aria-label="이전 영상"
                style={{ left: "-2rem" }}
              >
                <svg
                  width="24"
                  height="24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="lucide lucide-chevron-left"
                >
                  <polyline points="15 18 9 12 15 6" />
                </svg>
              </button>
              <button
                className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white bg-opacity-80 rounded-full p-2 shadow hover:bg-opacity-100 transition disabled:opacity-40"
                onClick={() => handleVideoNav("right")}
                disabled={videoPage >= totalVideoPages - 1 || isVideoSliding}
                aria-label="다음 영상"
                style={{ right: "-2rem" }}
              >
                <svg
                  width="24"
                  height="24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="lucide lucide-chevron-right"
                >
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </button>
              <div
                className={`overflow-hidden relative h-auto`}
                style={{ minHeight: "140px" }}
              >
                <div
                  className={`grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 transition-transform duration-350 ease-in-out ${
                    isVideoSliding && videoSlideDirection === "left"
                      ? "-translate-x-16 opacity-60"
                      : isVideoSliding && videoSlideDirection === "right"
                      ? "translate-x-16 opacity-60"
                      : "translate-x-0 opacity-100"
                  }`}
                >
                  {pagedVideos.filter(Boolean).map(
                    (video) =>
                      video && (
                        <div
                          key={video.id}
                          className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
                        >
                          <div className="relative">
                            <img
                              src={
                                video.thumbnailUrl ||
                                "https://placehold.co/200x120"
                              }
                              alt={video.title}
                              className="w-full h-32 object-cover"
                            />
                            <div className="absolute bottom-2 right-2 bg-black bg-opacity-75 text-white text-xs px-2 py-1 rounded">
                              {video.duration}
                            </div>
                            <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                              <button
                                className="w-12 h-12 bg-white bg-opacity-90 rounded-full flex items-center justify-center hover:bg-opacity-100 transition-all duration-200"
                                onClick={() => setPreviewVideo(video)}
                                title="비디오 미리보기"
                              >
                                <Play className="w-6 h-6 text-gray-800 ml-1" />
                              </button>
                            </div>
                          </div>
                          <div className="p-3">
                            <h3 className="text-sm font-medium text-gray-900 truncate">
                              영상 제목
                            </h3>
                            <p className="text-xs text-gray-600 truncate">
                              아티스트명
                            </p>
                            <div className="flex items-center justify-between mt-2">
                              <span className="text-xs text-gray-500">
                                조회수{" "}
                                {typeof video.views === "number"
                                  ? video.views.toLocaleString()
                                  : "0"}
                              </span>
                              <button className="text-gray-400 hover:text-gray-600">
                                <MoreHorizontal className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      )
                  )}
                </div>
              </div>
              {/* Page indicator (optional) */}
              <div className="flex justify-center mt-2">
                <span className="text-xs text-gray-500">
                  {videoPage + 1} / {totalVideoPages}
                </span>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-10 text-gray-500">
              <p className="text-lg">영상이 없습니다</p>
              <p className="text-sm mt-2">다른 필터를 시도해보세요</p>
            </div>
          )}
        </section>

        {/* Section 4: Music Posts */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-900">뮤직포스트</h2>
            <Link
              to="/musicposts"
              className="text-sm text-gray-600 hover:text-gray-900"
            >
              뮤직포스트 더 보기
            </Link>
          </div>

          <div className="space-y-4">
            {musicPosts?.filter(Boolean).map(
              (post) =>
                post && (
                  <div
                    key={post.id}
                    className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-lg transition-shadow"
                  >
                    <h3 className="text-sm font-medium text-gray-900 mb-2">
                      {post.title}
                    </h3>
                    <p className="text-sm text-gray-600 mb-3">{post.content}</p>
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <div className="flex items-center space-x-4">
                        <span>{post.author}</span>
                        <span>{post.timestamp}</span>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-1">
                          <Heart className="w-3 h-3" />
                          <span>{post.likes}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <MessageCircle className="w-3 h-3" />
                          <span>{post.comments}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Eye className="w-3 h-3" />
                          <span>{post.views}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )
            )}
          </div>
        </section>

        {/* Section 5: Artist Connect Stories */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-900">
              아티스트가 쓴 커넥트 스토리
            </h2>
            <Link
              to="/connect-stories"
              className="text-sm text-gray-600 hover:text-gray-900"
            >
              커넥트 스토리 더 보기
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {artistStories.filter(Boolean).map(
              (story) =>
                story && (
                  <div
                    key={story.id}
                    className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-lg transition-shadow"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-sm font-medium text-gray-900">
                        {story.artist}
                      </h3>
                      <span className="text-xs text-gray-500">
                        {story.timestamp}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">
                      {story.content}
                    </p>
                    <div className="flex items-center space-x-4 text-xs text-gray-500">
                      <div className="flex items-center space-x-1">
                        <MessageCircle className="w-3 h-3" />
                        <span>{story.comments}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Eye className="w-3 h-3" />
                        <span>{story.views}</span>
                      </div>
                    </div>
                  </div>
                )
            )}
          </div>
        </section>

        {/* Section 6: PD Albums */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-900">
              테마별 음악은 뮤직PD 앨범
            </h2>
            <Link
              to="/pd-albums"
              className="text-sm text-gray-600 hover:text-gray-900"
            >
              뮤직PD 앨범 더 보기
            </Link>
          </div>

          <div className="grid grid-cols-4 gap-4">
            {pdAlbums.filter(Boolean).map(
              (album) =>
                album && (
                  <Link
                    to={`/album/${album?.id}`}
                    key={album.id}
                    className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
                  >
                    <img
                      src={album.imageUrl}
                      alt={album.title}
                      className="w-full h-32 object-cover"
                    />
                    <div className="p-3">
                      <h3 className="text-sm font-medium text-gray-900 mb-1">
                        {album.title}
                      </h3>
                      <p className="text-xs text-gray-600 mb-2">
                        {album.description}
                      </p>
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>{album.curator}</span>
                        <span>{album.trackCount}곡</span>
                      </div>
                    </div>
                  </Link>
                )
            )}
          </div>
        </section>

        {/* Section 7: Knowledge Content */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-900">
              음악, 아는만큼 들린다
            </h2>
            <Link
              to="/music-knowledge"
              className="text-sm text-gray-600 hover:text-gray-900"
            >
              더 보기
            </Link>
          </div>

          <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg p-6 text-white">
            <h3 className="text-xl font-bold mb-2">
              음악의 깊이를 더하는 지식
            </h3>
            <p className="text-sm opacity-90 mb-4">
              아티스트의 이야기, 음악의 역사, 장르의 특징까지. 음악을 더 깊이
              이해하고 즐길 수 있는 다양한 콘텐츠를 만나보세요.
            </p>
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-white bg-opacity-20 rounded-lg p-3">
                <h4 className="font-medium mb-1">아티스트 스토리</h4>
                <p className="text-xs opacity-80">음악가들의 숨겨진 이야기</p>
              </div>
              <div className="bg-white bg-opacity-20 rounded-lg p-3">
                <h4 className="font-medium mb-1">장르 가이드</h4>
                <p className="text-xs opacity-80">음악 장르의 모든 것</p>
              </div>
              <div className="bg-white bg-opacity-20 rounded-lg p-3">
                <h4 className="font-medium mb-1">음악 역사</h4>
                <p className="text-xs opacity-80">시대별 음악의 변천사</p>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* AudioPlayer Modal */}
      {previewAudio && (
        <AudioPlayer
          src={previewAudio.audioUrl || ""}
          coverImage={
            previewAudio.coverImage || previewAudio.album?.coverImage || ""
          }
          title={previewAudio.title}
          artist={(previewAudio.artists ?? [])
            .map((a) => a.artist?.stageName || a.artist?.name)
            .join(", ")}
          album={previewAudio.album?.title || ""}
          id={previewAudio.id}
          onClose={() => setPreviewAudio(null)}
        />
      )}

      {/* VideoPlayer Modal */}
      {previewVideo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70">
          <div className="bg-white rounded-lg shadow-lg p-4 relative w-full max-w-2xl">
            <button
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
              onClick={() => setPreviewVideo(null)}
            >
              닫기
            </button>
            {(() => {
              return (
                <VideoPlayer
                  videoUrl={previewVideo?.videoUrl}
                  title={previewVideo.title || ""}
                  isVisible={!!previewVideo}
                  onClose={() => setPreviewVideo(null)}
                  autoPlay={true}
                />
              );
            })()}
            <div className="mt-2 text-center font-bold">
              {previewVideo.title}
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}
