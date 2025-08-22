import { useEffect, useState } from "react";
import { json } from "@remix-run/node";
import {
  Link,
  useLoaderData,
  useFetcher,
  useRevalidator,
} from "@remix-run/react";
import {
  Play,
  Plus,
  Download,
  Heart,
  MessageCircle,
  Eye,
  Check,
  Loader2,
  Heart as HeartFilled,
  ChevronRight,
  Video,
} from "lucide-react";
import { usePlayer } from "~/contexts/PlayerContext";

import Layout from "~/components/Layout";
import type { SidebarAlbum } from "~/components/Layout";
import type { Playlist as PlaylistBase } from "~/types";

// Extend Playlist type to include songs property
type Playlist = PlaylistBase & {
  songs: TrackWithCover[];
};

// Define Favorite type locally
type Favorite = {
  songId: string | number;
  // Add other fields if needed
};
import AudioPlayer from "~/components/AudioPlayer";
import VideoPlayer from "~/components/VideoPlayer";
import DownloadDropdown from "../components/DownloadDropdown";

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
  genre?: string | null;
  flac16Url?: string;
  flac24Url?: string;
  video1080Url?: string;
  video720Url?: string;
  video480Url?: string;
}
interface Video {
  id: string;
  title: string;
  videoUrl: string;
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
  coverImage: string;
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
  songMoreActions,
  findPlaylistItemsByUserId,
  findFavoritesByUserId,
  getAllPlaylistItems,
  toggleSongInPlaylist,
  toggleSongFavorite,
} from "~/lib/server";
import { validateSession } from "../lib/auth";
import MenuDropdown from "../components/MenuDropdown";
import VideoMenuDropdown from "../components/VideoMenuDropdown";
import { downloadMedia } from "../lib/utils";
import GridSwiperSlider from "../components/GridSwiperSlider";
import { SwiperSlide } from "swiper/react";

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
      playlists,
    ] = await Promise.all([
      getLatestAlbums(),
      getChartSongs(),
      getLatestVideos(),
      getFeaturedArtists(),
      getSidebarAlbums(),
      getSidebarAlbums(),
      findPlaylistItemsByUserId(user?.id ?? ""),
      findFavoritesByUserId(user?.id ?? ""),
      getAllPlaylistItems(),
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
      playlists: Array.isArray(playlists) ? playlists : [],
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
      const result = await toggleSongInPlaylist({ userId, playlistId, songId });

      return json(result);
    }
    case "toggleFavorite": {
      if (!userId || !songId)
        return json({ error: "Missing data" }, { status: 400 });
      // Use toggleSongFavorite instead of addSongToFavorite
      const result = await toggleSongFavorite({ userId, songId });

      return json(result);
    }

    case "More": {
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
  playlistItems: Playlist[];
  favorites: Favorite[];
  playlists: Playlist[]; // Use Playlist[] instead of any[]
}

export default function HomePage() {
  const data = useLoaderData<LoaderData>();
  const { playTrack, addToPlaylist, isAudioPlayerVisible } = usePlayer();
  const revalidator = useRevalidator();
  console.log(data.pdAlbums);
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

  const fetcher = useFetcher();
  const userId = data.user?.id || "";
  const [loadingSongId, setLoadingSongId] = useState<string | number | null>(
    null
  );
  const [loadingType, setLoadingType] = useState<
    "playlist" | "favorite" | null
  >(null);

  // Add modal state for audio/video preview
  const [previewVideo, setPreviewVideo] = useState<Video | null>(null);

  // Helper: check if song is in playlist or favorites
  const isSongInPlaylist = (songId: string | number) => {
    // data.playlistItems is an array of playlist items, each with a .song property
    if (!Array.isArray(data.playlistItems)) return false;
    return data.playlistItems.some(
      (item: any) => item.song && item.song?.id === songId
    );
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
    setLoadingSongId(song?.id);
    setLoadingType("playlist");
    await fetcher.submit(
      {
        actionType: "togglePlaylist",
        userId,
        songId: song?.id,
      },
      { method: "post" }
    );
    // Keep spinner until loader data is updated
    revalidator.revalidate(); // Refetch loader data
    setLoadingSongId(null);
    setLoadingType(null);
  };

  // Toggle favorite
  const handleToggleFavorite = async (song: TrackWithCover) => {
    if (!song) return;
    setLoadingSongId(song?.id);
    setLoadingType("favorite");
    await fetcher.submit(
      {
        actionType: "toggleFavorite",
        userId,
        songId: song?.id,
      },
      { method: "post" }
    );
    // Keep spinner until loader data is updated
    revalidator.revalidate(); // Refetch loader data
    setLoadingSongId(null);
    setLoadingType(null);
  };

  const handleDownload = (song: TrackWithCover) => {
    if (!song) return;
    fetcher.submit(
      {
        actionType: "download",
        songId: song?.id,
      },
      { method: "post" }
    );
  };

  const handleMore = (song: (typeof chartSongs)[number] | null) => {
    if (!song) return;
    fetcher.submit(
      {
        actionType: "More",
        userId,
        songId: song?.id,
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
  // 노래 차트 필터 (노래 차트 탭)
  const [chartTab, setChartTab] = useState<"전체" | "국내" | "해외">("전체");
  const filteredChartSongs = chartSongs.filter(
    (song) =>
      song &&
      (chartTab === "전체" ||
        (chartTab === "국내" && song.album?.isKorean === true) ||
        (chartTab === "해외" && song.album?.isKorean === false))
  );

  useEffect(() => {
    if (Array.isArray(data.playlists)) {
      data.playlists.forEach((item: any) => {
        if (item.song) {
          // Map item.song to your Track type if needed
          addToPlaylist({
            id: item.song?.id,
            title: item.song.title,
            artist: item.song.artist,
            album: item.song.album,
            duration: item.song.duration,
            coverImage: item.song.coverImage,
            audioUrl: item.song.audioUrl,
            imageUrl: item.song.imageUrl,
          });
        }
      });
    }
  }, [data.playlists, addToPlaylist]);
  const handlePreview = (song: any) => {
    playTrack(song);
  };
  return (
    <Layout sidebarAlbums={data.sidebarAlbums as SidebarAlbum[]}>
      <div className="space-y-8 w-full ">
        {/* Section 1: Hero - Latest Albums */}
        <section className="bg-slate-300 max-sm:px-5 px-10 py-5 w-full">
          <div className="flex items-center justify-between mb-4 w-full px-10">
            <div className="flex items-center justify-start gap-10">
              <h2 className="text-lg font-bold text-gray-900">최신 노래</h2>
              <div className="flex space-x-2">
                {["전체", "국내", "해외"].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setAlbumTab(tab as "전체" | "국내" | "해외")}
                    className={`px-3 cursor-pointer py-1 text-sm rounded-none flex items-center gap-1 ${
                      albumTab === tab
                        ? "border-b-2 border-b-red-600 bg-transparent  text-gray-700"
                        : "bg-transparent text-gray-700 hover:bg-gray-300"
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>
            <Link
              className="flex gap-1 items-center hover:text-Snowlight-red"
              to="/latest-musice"
            >
              더보기 <ChevronRight className="w-3 h3" />
            </Link>
          </div>
          {filteredChartSongs.length > 0 ? (
            <div className="relative">
              <div className={` relative h-auto w-full`}>
                <GridSwiperSlider>
                  {filteredChartSongs.map(
                    (song) =>
                      song && (
                        <SwiperSlide key={song?.id}>
                          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow group relative  min-w-[150px] min-h-[250px] max-2xl:min-h-[250px]">
                            <div className="relative">
                              <div className=" aspect-[4/3] relative w-full overflow-hidden">
                                <img
                                  src={
                                    song.coverImage ||
                                    song.album?.coverImage ||
                                    "https://placehold.co/600x400"
                                  }
                                  alt={song.title}
                                  className={`w-full h-full object-cover transition-all duration-300 `}
                                  loading="lazy"
                                />
                              </div>
                              {/* Song details on hover */}
                              <div className="absolute inset-0 bg-black bg-opacity-80 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-col justify-center items-center p-4 text-white">
                                <button
                                  onClick={() => handlePreview(song)}
                                  className="w-12 h-12 bg-white bg-opacity-90 rounded-full flex items-center justify-center hover:bg-opacity-100 transition-all duration-200 mb-2"
                                >
                                  <Play className="w-6 h-6 text-gray-800 ml-1" />
                                </button>
                                <p className="text-xs text-center line-clamp-3 mt-2">
                                  {song.title}
                                </p>
                                <p className="text-xs mt-1">{song.artist}</p>
                              </div>
                            </div>
                            <div className="p-3 flex justify-between items-start">
                              <div>
                                <Link
                                  to={`/song/${song?.id}`}
                                  className="text-sm font-medium text-gray-900 hover:text-pink-600 w-32 hover:underline truncate block"
                                >
                                  {song.title}
                                </Link>
                                <p className="text-xs text-gray-600 truncate">
                                  {song.artist}
                                </p>
                                <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
                                  <span>{song.album?.title || ""}</span>
                                </div>
                              </div>

                              <div className="z-10">
                                <MenuDropdown
                                  song={song}
                                  isFavorite={isSongFavorite(song?.id)}
                                  isPlaylist={isSongInPlaylist(song?.id)}
                                  loadingSongId={loadingSongId}
                                  loadingType={loadingType}
                                  onToggleFavorite={handleToggleFavorite}
                                  onDownload={handleDownload}
                                  onMore={handleMore}
                                />
                              </div>
                            </div>
                          </div>
                        </SwiperSlide>
                      )
                  )}
                </GridSwiperSlider>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-10 text-gray-500">
              <p className="text-lg">노래가 없습니다</p>
              <p className="text-sm mt-2">다른 필터를 시도해보세요</p>
            </div>
          )}
        </section>
        {/* Section 2: Chart */}
        <section className="px-10 max-sm:px-5 max-sm:min-w-full py-5 flex max-sm:flex-col  gap-5 w-full">
          <div
            className="w-7/12 max-sm:w-full  
overflow-x-auto"
          >
            <div className="flex items-center justify-between mb-4 border-b-2 border-b-slate-700 py-1">
              <h2 className="text-lg font-bold text-gray-900">노래 차트</h2>
              <Link className="flex items-center gap-1" to="/snowlight-songs">
                더보기 <ChevronRight className="w-3 h-3" />
              </Link>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg">
              {/* Header row */}

              <ul className="divide-y divide-gray-200 min-w-min shrink-0">
                {filteredChartSongs.filter(Boolean).map((song, idx) =>
                  song ? (
                    <li
                      key={song?.id || idx}
                      className="flex items-center hover:bg-gray-50 px-4 py-4 justify-between"
                    >
                      <div className="w-12 text-sm font-medium text-gray-900">
                        {idx + 1}
                      </div>
                      <div className="w-56 overflow-hidden flex-1 flex items-center space-x-3 group">
                        <img
                          src={
                            song.coverImage ||
                            song.album?.coverImage ||
                            "https://placehold.co/50x50"
                          }
                          alt={song.title}
                          className="w-10 h-10 shrink-0 hidden group-hover:block transition-all duration-300 ease-in-out rounded object-cover"
                        />
                        <div className="truncate whitespace-pre-wrap">
                          <Link
                            to={`/song/${song?.id}`}
                            className="text-sm w-32 truncate font-medium text-gray-900 hover:text-pink-600 hover:underline"
                          >
                            {song.title}
                          </Link>
                          <div className="text-sm text-gray-500 capitalize truncate">
                            {song?.genre}
                          </div>
                        </div>
                      </div>
                      <div className="w-32 truncate text-sm text-gray-500">
                        {song?.album?.title || "No album"}
                      </div>
                      <div className="w-20 flex justify-center">
                        <button
                          onClick={() => handlePreview(song)}
                          className="border border-slate-600 w-7 h-7 text-white text-xs p-1 rounded-full transition-colors flex items-center justify-center gap-1"
                        >
                          <Play className="w-4 h-4 fill-red-400" />
                        </button>
                      </div>
                      <div className="w-32 flex items-center space-x-2">
                        <button
                          className={`text-gray-400 hover:text-pink-500 ${
                            loadingSongId === song?.id &&
                            loadingType === "playlist"
                              ? "cursor-wait"
                              : ""
                          }`}
                          title={
                            isSongInPlaylist(song?.id)
                              ? "플레이리스트에서 제거"
                              : "플레이리스트에 추가"
                          }
                          onClick={() => handleTogglePlaylist(song)}
                          disabled={
                            loadingSongId === song?.id &&
                            loadingType === "playlist"
                          }
                        >
                          {loadingSongId === song?.id &&
                          loadingType === "playlist" ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : isSongInPlaylist(song?.id) ? (
                            <Check className="w-4 h-4 text-green-500" />
                          ) : (
                            <Plus className="w-4 h-4" />
                          )}
                        </button>
                        <DownloadDropdown
                          title={song.title}
                          buttonLabel={<Download className="w-3 h-3" />}
                          options={[
                            {
                              label: "Download MP3",
                              onClick: () =>
                                song.audioUrl &&
                                downloadMedia(
                                  song.audioUrl,
                                  `${song.title}.mp3`
                                ),
                              disabled: !song.audioUrl,
                            },
                            {
                              label: "Download FLAC 16/44.1",
                              onClick: () =>
                                song.flac16Url &&
                                downloadMedia(
                                  song.flac16Url,
                                  `${song.title}-16.flac`
                                ),
                              disabled: !song.flac16Url,
                            },
                            {
                              label: "Download FLAC 24/96",
                              onClick: () =>
                                song.flac24Url &&
                                downloadMedia(
                                  song.flac24Url,
                                  `${song.title}-24.flac`
                                ),
                              disabled: !song.flac24Url,
                            },
                          ]}
                        />
                        <DownloadDropdown
                          title={song.title}
                          buttonLabel={<Video className="w-3 h-3" />}
                          options={[
                            {
                              label: "Download 1080p",
                              onClick: () =>
                                song.video1080Url &&
                                downloadMedia(
                                  song.video1080Url,
                                  `${song.title}-1080p.mp4`
                                ),
                              disabled: !song.video1080Url,
                            },
                            {
                              label: "Download 720p",
                              onClick: () =>
                                song.video720Url &&
                                downloadMedia(
                                  song.video720Url,
                                  `${song.title}-720p.mp4`
                                ),
                              disabled: !song.video720Url,
                            },
                            {
                              label: "Download 480p",
                              onClick: () =>
                                song.video480Url &&
                                downloadMedia(
                                  song.video480Url,
                                  `${song.title}-480p.mp4`
                                ),
                              disabled: !song.video480Url,
                            },
                          ]}
                        />
                        <button
                          className={`text-gray-400 hover:text-red-500 ${
                            loadingSongId === song?.id &&
                            loadingType === "favorite"
                              ? "cursor-wait"
                              : ""
                          }`}
                          title={
                            isSongFavorite(song?.id)
                              ? "즐겨찾기에서 제거"
                              : "즐겨찾기 추가"
                          }
                          onClick={() => handleToggleFavorite(song)}
                          disabled={
                            loadingSongId === song?.id &&
                            loadingType === "favorite"
                          }
                        >
                          {loadingSongId === song?.id &&
                          loadingType === "favorite" ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : isSongFavorite(song?.id) ? (
                            <HeartFilled className="w-4 h-4 text-red-500 fill-red-500" />
                          ) : (
                            <Heart className="w-4 h-4" />
                          )}
                        </button>
                        <MenuDropdown
                          song={song}
                          isFavorite={isSongFavorite(song?.id)}
                          isPlaylist={isSongInPlaylist(song?.id)}
                          loadingSongId={loadingSongId}
                          loadingType={loadingType}
                          onToggleFavorite={handleToggleFavorite}
                          onDownload={handleDownload}
                          onMore={handleMore}
                        />
                      </div>
                    </li>
                  ) : null
                )}
              </ul>
              <div className="bg-gray-50 px-4 py-3 border-t border-gray-200">
                <div className="flex items-center space-x-4">
                  <button
                    className="bg-green-500 text-white text-sm py-2 px-4 rounded hover:bg-green-600 transition-colors flex items-center gap-1 shrink-0"
                    onClick={() => {
                      // 전체 재생: play all filtered chart songs not already in playlist
                      const notInPlaylist = filteredChartSongs.filter(
                        (song) => song && !isSongInPlaylist(song?.id)
                      );
                      if (notInPlaylist.length > 0) {
                        // Ensure coverImage is never null for playTrack
                        const firstTrack = {
                          ...notInPlaylist[0],
                          coverImage: notInPlaylist[0].coverImage ?? undefined,
                          audioUrl: notInPlaylist[0].audioUrl ?? "",
                        };
                        const playlistTracks = notInPlaylist.map((track) => ({
                          ...track,
                          coverImage: track.coverImage ?? undefined,
                          audioUrl: track.audioUrl ?? "",
                        }));
                        playTrack(firstTrack, playlistTracks);
                      }
                    }}
                  >
                    <Play className="w-4 h-4 mr-1" />
                    전체 재생
                  </button>
                  <button
                    className="bg-gray-200 text-gray-700 text-sm py-2 px-4 rounded hover:bg-gray-300 transition-colors flex items-center gap-1 shrink-0"
                    onClick={() => {
                      // 전체 플레이리스트에 추가 (skip songs already in playlist)
                      filteredChartSongs.forEach((song) => {
                        if (!isSongInPlaylist(song?.id)) {
                          addToPlaylist(song);
                        }
                      });
                    }}
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    전체 플레이리스트에 추가
                  </button>
                  <button
                    className="bg-gray-200 text-gray-700 text-sm py-2 px-4 rounded hover:bg-gray-300 transition-colors flex items-center gap-1 shrink-0"
                    onClick={() => {
                      // 전체 다운로드
                      filteredChartSongs.forEach((song) => {
                        if (song?.audioUrl) {
                          downloadMedia(song.audioUrl, `${song.title}.mp3`);
                        }
                      });
                    }}
                  >
                    <Download className="w-4 h-4 mr-1" />
                    전체 다운로드
                  </button>
                </div>
              </div>
            </div>
          </div>
          <div
            className="w-5/12 max-sm:w-full
overflow-x-auto "
          >
            <div className="flex items-center justify-between mb-4 border-b-2 border-b-slate-700 py-1">
              <h2 className="text-lg font-bold text-gray-900">
                인기 뮤직PD 앨범
              </h2>
              <Link className="flex items-center gap-1" to="/pb-album">
                더보기 <ChevronRight className="w-3 h-3" />
              </Link>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg ">
              <ul className="divide-y divide-gray-200 ">
                {pdAlbums.filter(Boolean).map((album, idx) =>
                  album ? (
                    <li
                      key={album?.id || idx}
                      className="flex items-center py-4 hover:bg-gray-50"
                    >
                      <div className="flex- ml-4">
                        <img
                          src={
                            album.coverImage ||
                            album?.coverImage ||
                            "https://placehold.co/50x50"
                          }
                          alt={album.title}
                          className="w-16 h-16 rounded object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0 px-4">
                        <Link
                          to={`/album/${album?.id}`}
                          className="block text-base font-medium text-gray-900 hover:text-pink-600 hover:underline truncate"
                        >
                          {album.title}
                        </Link>

                        <span className="text-xs text-gray-500 mb-2">
                          {album?.title || ""}
                        </span>
                      </div>
                      <div className="flex flex-col items-end mr-4 min-w-[120px]">
                        <div className="flex items-center space-x-2">
                          <MenuDropdown
                            album={album}
                            isFavorite={isSongFavorite(album?.id)}
                            isPlaylist={isSongInPlaylist(album?.id)}
                            loadingSongId={loadingSongId}
                            loadingType={loadingType}
                            onToggleFavorite={handleToggleFavorite}
                            onDownload={handleDownload}
                            onMore={handleMore}
                          />
                        </div>
                      </div>
                    </li>
                  ) : null
                )}
              </ul>
            </div>
          </div>
        </section>
        {/* Section 3: Latest Videos */}
        <section className="bg-slate-200 px-10 max-sm:px-5 py-5 w-full">
          <div className="flex items-center justify-between mb-4 w-full px-10">
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
              <div
                className={`overflow-hidden relative h-auto `}
                style={{ minHeight: "220px" }}
              >
                <div
                  className={`flex flex-wrap gap-4 transition-transform duration-350 e duration-350 ease-in-out`}
                >
                  <GridSwiperSlider>
                    {latestVideos?.filter(Boolean).map(
                      (video) =>
                        video.videoUrl && (
                          <SwiperSlide key={video?.id}>
                            <div
                              key={video?.id}
                              className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
                            >
                              <div className="relative">
                                <img
                                  src={
                                    video.thumbnailUrl ||
                                    "https://placehold.co/200x120"
                                  }
                                  alt={video.title}
                                  className="w-full h-32 object-cover min-h-[200px] max-2xl:min-h-[250px]"
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
                                    <VideoMenuDropdown
                                      video={video}
                                      isFavorite={false}
                                      loadingSongId={loadingSongId}
                                      loadingType={loadingType}
                                      onToggleFavorite={() => {}}
                                      onDownload={() => {}}
                                      onMore={() => {}}
                                    />
                                  </button>
                                </div>
                              </div>
                            </div>
                          </SwiperSlide>
                        )
                    )}
                  </GridSwiperSlider>
                </div>
              </div>
              {/* Page indicator (optional) */}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-10 text-gray-500">
              <p className="text-lg">영상이 없습니다</p>
              <p className="text-sm mt-2">다른 필터를 시도해보세요</p>
            </div>
          )}
        </section>
        {/* Section 4: Music Posts */}
        <section className="px-10 max-sm:px-5 py-5 w-full">
          <div className="flex items-center justify-between mb-4 w-full px-10">
            <h2 className="text-lg font-bold text-gray-900">뮤직포스트</h2>
            <Link
              to="/musicposts"
              className="text-sm text-gray-600 hover:text-gray-900"
            >
              뮤직포스트 더 보기
            </Link>
          </div>
          {musicPosts?.length > 0 ? (
            <GridSwiperSlider>
              <div className="space-y-4">
                {musicPosts?.filter(Boolean).map(
                  (post) =>
                    post && (
                      <SwiperSlide key={post?.id}>
                        <div
                          key={post?.id}
                          className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-lg transition-shadow"
                        >
                          <h3 className="text-sm font-medium text-gray-900 mb-2">
                            {post.title}
                          </h3>
                          <p className="text-sm text-gray-600 mb-3">
                            {post.content}
                          </p>
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
                      </SwiperSlide>
                    )
                )}
              </div>
            </GridSwiperSlider>
          ) : (
            <p className="w-full text-center">게시물이 없습니다</p>
          )}
        </section>
        {/* Section 5: Artist Connect Stories */}
        <section className="bg-slate-200 px-10 max-sm:px-5 py-5 w-full">
          <div className="flex items-center justify-between mb-4 w-full px-10">
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
          {artistStories?.length > 0 ? (
            <GridSwiperSlider>
              <div className="grid grid-cols-2 gap-4">
                {artistStories.filter(Boolean).map(
                  (story) =>
                    story && (
                      <SwiperSlide key={story?.id}>
                        <div
                          key={story?.id}
                          className="bg-white border border-gray-200 rounded-lg  hover:shadow-lg transition-shadow min-h-60 overflow-hidden"
                        >
                          <div className=" aspect-[4/3] relative w-full overflow-hidden">
                            <img
                              src={
                                story?.coverImage ||
                                "https://placeholder.co/500x500"
                              }
                              alt={story.title}
                              className={`w-full h-full object-cover transition-all duration-300 `}
                            />
                          </div>
                          <div className="p-4">
                            <div className="flex items-start flex-col  justify-between mb-2">
                              <Link to={`/artist/${story.artist}`}>
                                <h3 className="text-sm font-medium text-gray-900 w-full truncate">
                                  {story.artist}
                                </h3>
                              </Link>
                              <span className="text-xs text-gray-500">
                                {story.timestamp}
                              </span>
                            </div>
                            <p className="text-sm w-full truncate text-gray-600 mb-3">
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
                        </div>
                      </SwiperSlide>
                    )
                )}
              </div>
            </GridSwiperSlider>
          ) : (
            <div className="flex flex-col items-center justify-center py-10 text-gray-500">
              <p className="text-lg">스토리가 없습니다</p>
              <p className="text-sm mt-2">아직 작성된 스토리가 없습니다</p>
            </div>
          )}
        </section>
        {/* Section 6: PD Albums */}
        <section className="px-10 max-sm:px-5 py-5 w-full">
          <div className="flex items-center justify-between mb-4 w-full px-10">
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
          {pdAlbums?.length > 0 ? (
            <GridSwiperSlider>
              <div className="flex flex-wrap gap-4 ">
                {pdAlbums.filter(Boolean).map(
                  (album) =>
                    album && (
                      <SwiperSlide key={album?.id}>
                        <Link
                          to={`/album/${album?.id}`}
                          key={album?.id}
                          className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
                        >
                          <div className=" aspect-[4/3] relative w-full overflow-hidden">
                            <img
                              src={
                                album.coverImage ||
                                "https://placeholder.co/500x500"
                              }
                              alt={album.title}
                              className={`w-full h-full object-cover transition-all duration-300 `}
                            />
                          </div>
                          <div className="p-3">
                            <h3 className="text-sm truncate font-medium text-gray-900 mb-1">
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
                      </SwiperSlide>
                    )
                )}
              </div>
            </GridSwiperSlider>
          ) : (
            <p>No album</p>
          )}
        </section>
        {/* Section 7: Knowledge Content */}
        <section className="bg-slate-200 px-10 max-sm:px-5 py-5 w-full">
          <div className="flex items-center justify-between mb-4 w-full px-10">
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
      {isAudioPlayerVisible && <AudioPlayer userId={userId} />}

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
                  videoUrl={previewVideo?.videoUrl || ""}
                  title={previewVideo.title || ""}
                  isVisible={!!previewVideo}
                  onClose={() => setPreviewVideo(null)}
                  autoPlay={true}
                  duration={previewVideo.duration}
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
