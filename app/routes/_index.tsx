import { useState } from "react";
import { json } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";
import {
  Play,
  MoreHorizontal,
  Plus,
  Download,
  TrendingUp,
  TrendingDown,
  Minus,
  Heart,
  MessageCircle,
  Eye,
} from "lucide-react";
import { usePlayer } from "~/contexts/PlayerContext";
import { useLanguage } from "~/contexts/LanguageContext";

import Layout from "~/components/Layout";

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

interface TrackWithCover {
  id: string | number;
  title: string;
  artist: string;
  audioUrl?: string;
  imageUrl: string;
}

interface ChartTrack {
  rank: number;
  change: number;
  title: string;
  artist: string;
  album: string;
  imageUrl: string;
  audioUrl?: string;
}

interface Video {
  id: number;
  title: string;
  artist: string;
  duration: string;
  rating: string;
  imageUrl: string;
  views: number;
  videoUrl?: string;
}

interface MusicPost {
  id: number;
  title: string;
  content: string;
  author: string;
  timestamp: string;
  likes: number;
  comments: number;
  views: number;
}

interface ConnectStory {
  id: number;
  artist: string;
  content: string;
  timestamp: string;
  comments: number;
  views: number;
}

interface PDAlbum {
  id: number;
  title: string;
  description: string;
  curator: string;
  imageUrl: string;
  trackCount: number;
}

// Mock data definitions
const mockLatestAlbums: Album[] = [
  {
    id: 1,
    title: "서우젯소리",
    artist: "사우스 카니발(South Carnival)",
    releaseDate: "2025.08.08",
    albumType: "싱글",
    imageUrl: "https://via.placeholder.com/150x150/ff6b6b/ffffff?text=1",
    rank: 1,
  },
  {
    id: 2,
    title: "AT THE HIGH CASTLE",
    artist: "이수린, Kiho Oum",
    releaseDate: "2025.08.08",
    albumType: "정규",
    imageUrl: "https://via.placeholder.com/150x150/4ecdc4/ffffff?text=2",
    rank: 2,
  },
  {
    id: 3,
    title: "A Little More",
    artist: "Ed Sheeran(에드 시런)",
    releaseDate: "2025.08.07",
    albumType: "싱글",
    imageUrl: "https://via.placeholder.com/150x150/45b7d1/ffffff?text=3",
    rank: 3,
  },
  {
    id: 4,
    title: "MAESTRO",
    artist: "SEVENTEEN(세븐틴)",
    releaseDate: "2025.08.06",
    albumType: "정규",
    imageUrl: "https://via.placeholder.com/150x150/f9ca24/ffffff?text=4",
    rank: 4,
  },
  {
    id: 5,
    title: "How Sweet",
    artist: "NewJeans(뉴진스)",
    releaseDate: "2025.08.05",
    albumType: "싱글",
    imageUrl: "https://via.placeholder.com/150x150/6c5ce7/ffffff?text=5",
    rank: 5,
  },
  {
    id: 6,
    title: "GOLDEN",
    artist: "정국(Jung Kook)",
    releaseDate: "2025.08.04",
    albumType: "정규",
    imageUrl: "https://via.placeholder.com/150x150/a29bfe/ffffff?text=6",
    rank: 6,
  },
  {
    id: 7,
    title: "Get Up",
    artist: "NewJeans(뉴진스)",
    releaseDate: "2025.08.03",
    albumType: "정규",
    imageUrl: "https://via.placeholder.com/150x150/fd79a8/ffffff?text=7",
    rank: 7,
  },
  {
    id: 8,
    title: "UNFORGIVEN",
    artist: "LE SSERAFIM(르세라핌)",
    releaseDate: "2025.08.02",
    albumType: "정규",
    imageUrl: "https://via.placeholder.com/150x150/00b894/ffffff?text=8",
    rank: 8,
  },
];

const mockChartSongs: ChartTrack[] = [
  {
    rank: 1,
    change: 0,
    title: "Supernova",
    artist: "aespa(에스파)",
    album: "Armageddon",
    imageUrl: "https://via.placeholder.com/50x50/ff6b6b/ffffff?text=1",
  },
  {
    rank: 2,
    change: 1,
    title: "How Sweet",
    artist: "NewJeans(뉴진스)",
    album: "How Sweet",
    imageUrl: "https://via.placeholder.com/50x50/4ecdc4/ffffff?text=2",
  },
  {
    rank: 3,
    change: -1,
    title: "클락션 (Klaxon)",
    artist: "(여자)아이들",
    album: "클락션 (Klaxon)",
    imageUrl: "https://via.placeholder.com/50x50/45b7d1/ffffff?text=3",
  },
  {
    rank: 4,
    change: 2,
    title: "SPOT!",
    artist: "지코 (ZICO) (Feat. JENNIE)",
    album: "SPOT!",
    imageUrl: "https://via.placeholder.com/50x50/f9ca24/ffffff?text=4",
  },
  {
    rank: 5,
    change: 0,
    title: "고민중독",
    artist: "QWER",
    album: "1st Mini Album 'MANITO'",
    imageUrl: "https://via.placeholder.com/50x50/6c5ce7/ffffff?text=5",
  },
  {
    rank: 6,
    change: -2,
    title: "Small girl (feat. 도경수(D.O.))",
    artist: "이영지",
    album: "16 Fantasy",
    imageUrl: "https://via.placeholder.com/50x50/a29bfe/ffffff?text=6",
  },
  {
    rank: 7,
    change: 1,
    title: "천상연",
    artist: "이창섭",
    album: "1집 Repackage '웹툰'",
    imageUrl: "https://via.placeholder.com/50x50/fd79a8/ffffff?text=7",
  },
  {
    rank: 8,
    change: 4,
    title: "Bubble Gum",
    artist: "NewJeans(뉴진스)",
    album: "How Sweet",
    imageUrl: "https://via.placeholder.com/50x50/e17055/ffffff?text=8",
  },
  {
    rank: 9,
    change: 3,
    title: "Sticky",
    artist: "KISS OF LIFE(키스 오브 라이프)",
    album: "Sticky",
    imageUrl: "https://via.placeholder.com/50x50/e17055/ffffff?text=9",
  },
  {
    rank: 10,
    change: -1,
    title: "Supernova",
    artist: "aespa(에스파)",
    album: "Supernova",
    imageUrl: "https://via.placeholder.com/50x50/00b894/ffffff?text=10",
  },
];

const mockLatestVideos: Video[] = [
  {
    id: 1,
    title: "헹가래",
    artist: "SEVENTEEN(세븐틴)",
    duration: "02:55",
    rating: "전체 관람가",
    imageUrl: "https://via.placeholder.com/200x120/ff6b6b/ffffff?text=Video1",
    views: 1234567,
  },
  {
    id: 2,
    title: "OOBS",
    artist: "SEVENTEEN(세븐틴)",
    duration: "03:26",
    rating: "전체 관람가",
    imageUrl: "https://via.placeholder.com/200x120/4ecdc4/ffffff?text=Video2",
    views: 987654,
  },
  {
    id: 3,
    title: "Feel the Vibe",
    artist: "SEVENTEEN(세븐틴)",
    duration: "02:51",
    rating: "12세 이상 관람가",
    imageUrl: "https://via.placeholder.com/200x120/45b7d1/ffffff?text=Video3",
    views: 876543,
  },
  {
    id: 4,
    title: "shy girl",
    artist: "SEVENTEEN(세븐틴)",
    duration: "02:49",
    rating: "전체 관람가",
    imageUrl: "https://via.placeholder.com/200x120/f9ca24/ffffff?text=Video4",
    views: 765432,
  },
  {
    id: 5,
    title: "MAESTRO",
    artist: "SEVENTEEN(세븐틴)",
    duration: "04:11",
    rating: "15세 이상 관람가",
    imageUrl: "https://via.placeholder.com/200x120/6c5ce7/ffffff?text=Video5",
    views: 654321,
  },
  {
    id: 6,
    title: "God of Music",
    artist: "SEVENTEEN(세븐틴)",
    duration: "04:07",
    rating: "전체 관람가",
    imageUrl: "https://via.placeholder.com/200x120/a29bfe/ffffff?text=Video6",
    views: 543210,
  },
];

const mockMusicPosts: MusicPost[] = [
  {
    id: 1,
    title: "2025년 상반기 최고의 K-POP 앨범",
    content: "올해 상반기를 빛낸 K-POP 앨범들을 소개합니다.",
    author: "음악 에디터",
    timestamp: "2시간 전",
    likes: 245,
    comments: 32,
    views: 1567,
  },
  {
    id: 2,
    title: "여름 페스티벌 시즌 추천 곡",
    content: "뜨거운 여름밤을 달굴 페스티벌 추천 플레이리스트",
    author: "페스티벌 큐레이터",
    timestamp: "5시간 전",
    likes: 189,
    comments: 28,
    views: 1234,
  },
  {
    id: 3,
    title: "신인 아티스트 주목! 8월 데뷔 앨범",
    content: "8월에 데뷔하는 신인 아티스트들의 앨범을 미리 만나보세요",
    author: "신인 발굴단",
    timestamp: "1일 전",
    likes: 156,
    comments: 19,
    views: 987,
  },
];

const mockArtistStories: ConnectStory[] = [
  {
    id: 1,
    artist: "송파울프스",
    content: "MOVE ON! 새로운 시작을 알리는 첫 번째 이야기",
    timestamp: "23시간 전",
    comments: 0,
    views: 7,
  },
  {
    id: 2,
    artist: "뉴잭스윙",
    content: "스튜디오에서의 하루, 새로운 곡 작업 중입니다",
    timestamp: "1일 전",
    comments: 0,
    views: 5,
  },
  {
    id: 3,
    artist: "차세대",
    content: "공연 스케줄 업데이트! 여러분을 만날 준비 완료",
    timestamp: "4일 전",
    comments: 2,
    views: 12,
  },
  {
    id: 4,
    artist: "LOTI",
    content: "Band ver. 녹음 비하인드 스토리",
    timestamp: "5일 전",
    comments: 1,
    views: 8,
  },
  {
    id: 5,
    artist: "재연",
    content: "새 싱글 '널' 발매 소감을 전합니다",
    timestamp: "1주 전",
    comments: 3,
    views: 15,
  },
  {
    id: 6,
    artist: "어라이벌",
    content: "THE PAST 앨범 컨셉 스토리",
    timestamp: "1주 전",
    comments: 0,
    views: 6,
  },
];

const mockPdAlbums: PDAlbum[] = [
  {
    id: 1,
    title: "여름밤 감성 발라드",
    description: "시원한 밤바람과 함께 듣는 감성 발라드 모음",
    curator: "벅스 뮤직PD",
    imageUrl: "https://via.placeholder.com/150x150/ff6b6b/ffffff?text=PD1",
    trackCount: 20,
  },
  {
    id: 2,
    title: "출근길 에너지 충전",
    description: "월요일 아침을 활기차게 시작하는 플레이리스트",
    curator: "벅스 뮤직PD",
    imageUrl: "https://via.placeholder.com/150x150/4ecdc4/ffffff?text=PD2",
    trackCount: 25,
  },
  {
    id: 3,
    title: "카페에서 듣기 좋은 재즈",
    description: "여유로운 오후 시간을 위한 재즈 컬렉션",
    curator: "벅스 뮤직PD",
    imageUrl: "https://via.placeholder.com/150x150/45b7d1/ffffff?text=PD3",
    trackCount: 18,
  },
  {
    id: 4,
    title: "운동할 때 듣는 신나는 음악",
    description: "운동 효과를 높여주는 업템포 플레이리스트",
    curator: "벅스 뮤직PD",
    imageUrl: "https://via.placeholder.com/150x150/f9ca24/ffffff?text=PD4",
    trackCount: 30,
  },
];

const mockKnowledgeContent = {
  title: "음악, 아는만큼 들린다",
  description: "음악의 깊이를 더하는 지식",
  content:
    "아티스트의 이야기, 음악의 역사, 장르의 특징까지. 음악을 더 깊이 이해하고 즐길 수 있는 다양한 콘텐츠를 만나보세요.",
};

import {
  getLatestAlbums,
  getChartSongs,
  getLatestVideos,
  getFeaturedArtists,
  getFeaturedSongs,
  getSidebarAlbums,
  getAllAlbums,
} from "~/lib/server";

export async function loader() {
  // const allAlbums = await getAllAlbums();
  // console.log("All Albums:", allAlbums);
  try {
    // Get all data using our server functions
    const [
      latestAlbums,
      chartSongs,
      latestVideos,
      artistStories,
      pdAlbums,
      sidebarAlbums,
    ] = await Promise.all([
      getLatestAlbums(8),
      getChartSongs(20),
      getLatestVideos(6),
      getFeaturedArtists(6),
      getFeaturedSongs(8),
      getSidebarAlbums(15),
    ]);

    // No need for transformation since our server functions already format the data

    return json({
      latestAlbums: latestAlbums.length > 0 ? latestAlbums : mockLatestAlbums,
      chartSongs: chartSongs.length > 0 ? chartSongs : mockChartSongs,
      latestVideos: latestVideos.length > 0 ? latestVideos : mockLatestVideos,
      musicPosts: mockMusicPosts, // No real data for music posts yet
      artistStories:
        artistStories.length > 0 ? artistStories : mockArtistStories,
      pdAlbums: pdAlbums.length > 0 ? pdAlbums : mockPdAlbums,
      knowledgeContent: mockKnowledgeContent,
      sidebarAlbums: sidebarAlbums.length > 0 ? sidebarAlbums : [],
    });
  } catch (error) {
    console.error("Database error:", error);
    // Fallback to mock data if database fails
    return json({
      latestAlbums: mockLatestAlbums,
      chartSongs: mockChartSongs,
      latestVideos: mockLatestVideos,
      musicPosts: mockMusicPosts,
      artistStories: mockArtistStories,
      pdAlbums: mockPdAlbums,
      knowledgeContent: mockKnowledgeContent,
      sidebarAlbums: [],
    });
  }
}

export default function HomePage() {
  const data = useLoaderData<typeof loader>();
  const { playTrack } = usePlayer();
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<"전체" | "국내" | "해외">("전체");

  // Use data from loader
  const latestAlbums = data.latestAlbums;
  const chartSongs = data.chartSongs;
  const latestVideos = data.latestVideos;
  const musicPosts = data.musicPosts;
  const artistStories = data.artistStories;
  const pdAlbums = data.pdAlbums;

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

  interface ChartTrack {
    id?: string | number;
    rank: number;
    change: number;
    title: string;
    artist: string;
    album: string;
    imageUrl: string;
    audioUrl?: string | null;
  }

  const handlePlayChart = (track: ChartTrack) => {
    playTrack({
      id: track.id?.toString() || track.rank.toString(),
      title: track.title,
      artist: track.artist,
      audioUrl:
        track.audioUrl ||
        "https://commondatastorage.googleapis.com/codeskulptor-demos/DDR_assets/Kangaroo_MusiQue_-_The_Neverwritten_Role_Playing_Game.mp3",
      imageUrl: track.imageUrl,
    });
  };

  return (
    <Layout sidebarAlbums={data.sidebarAlbums}>
      <div className="space-y-8 p-6">
        {/* Section 1: Hero - Latest Albums */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-900">
              {t("home.latest_albums")}
            </h2>
            <div className="flex space-x-2">
              {(["전체", "국내", "해외"] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-3 py-1 text-sm rounded ${
                    activeTab === tab
                      ? "bg-purple-600 text-white"
                      : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  }`}
                >
                  {tab === "전체"
                    ? t("home.all")
                    : tab === "국내"
                    ? t("home.domestic")
                    : t("home.international")}
                </button>
              ))}
            </div>
          </div>

          {latestAlbums.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {latestAlbums
                .filter((album) => {
                  if (activeTab === "전체") return true;
                  if (activeTab === "국내" && album.isKorean) return true;
                  if (activeTab === "해외" && album.isKorean === false)
                    return true;
                  return false;
                })
                .map((album) => (
                  <div
                    key={album.id}
                    className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow group"
                  >
                    <div className="relative">
                      <img
                        src={
                          album?.coverImage ||
                          `https://via.placeholder.com/150x150/ff6b6b/ffffff?text=Album`
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
                          onClick={() => handlePlay(album)}
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
                          <p className="text-xs mt-1">장르: {album.genre}</p>
                        )}
                        {album.plays && album.plays > 0 && (
                          <p className="text-xs mt-1">
                            재생 수: {album.plays.toLocaleString()}
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
                ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-10 text-gray-500">
              <p className="text-lg">
                {t("home.no_albums_found") || "No albums found"}
              </p>
              <p className="text-sm mt-2">
                {t("home.try_different_filter") || "Try a different filter"}
              </p>
            </div>
          )}
        </section>

        {/* Section 2: Chart */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-900">
              {t("chart.song_chart")}
            </h2>
            <div className="flex space-x-2">
              {(["전체", "국내", "해외"] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-3 py-1 text-sm rounded ${
                    activeTab === tab
                      ? "bg-purple-600 text-white"
                      : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  }`}
                >
                  {tab === "전체"
                    ? t("home.all")
                    : tab === "국내"
                    ? t("home.domestic")
                    : t("home.international")}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t("chart.rank")}
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t("chart.song")}
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t("album.album")}
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t("player.play")}
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t("chart.add_to_playlist")}
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {chartSongs.map((track) => (
                  <tr key={track.rank} className="hover:bg-gray-50">
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-medium text-gray-900">
                          {track.rank}
                        </span>
                        {track.change > 0 && (
                          <div className="flex items-center text-red-500">
                            <TrendingUp className="w-3 h-3" />
                            <span className="text-xs">{track.change}</span>
                          </div>
                        )}
                        {track.change < 0 && (
                          <div className="flex items-center text-blue-500">
                            <TrendingDown className="w-3 h-3" />
                            <span className="text-xs">
                              {Math.abs(track.change)}
                            </span>
                          </div>
                        )}
                        {track.change === 0 && (
                          <div className="flex items-center text-gray-400">
                            <Minus className="w-3 h-3" />
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-3">
                        <img
                          src={track.imageUrl}
                          alt={track.title}
                          className="w-10 h-10 rounded object-cover"
                        />
                        <div>
                          <Link
                            to={`/song/${track.rank}`}
                            className="text-sm font-medium text-gray-900 hover:text-pink-600 hover:underline"
                          >
                            {track.title}
                          </Link>
                          <div className="text-sm text-gray-500">
                            {track.artist}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                      {track.album}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <button
                        onClick={() => handlePlayChart(track)}
                        className="bg-green-500 text-white text-xs py-1 px-3 rounded hover:bg-green-600 transition-colors"
                      >
                        듣기
                      </button>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <button className="text-gray-400 hover:text-gray-600">
                          <Plus className="w-4 h-4" />
                        </button>
                        <button className="text-gray-400 hover:text-gray-600">
                          <Download className="w-4 h-4" />
                        </button>
                        <button className="text-gray-400 hover:text-gray-600">
                          <MoreHorizontal className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="bg-gray-50 px-4 py-3 border-t border-gray-200">
              <div className="flex items-center space-x-4">
                <button className="bg-green-500 text-white text-sm py-2 px-4 rounded hover:bg-green-600 transition-colors">
                  전체 듣기
                </button>
                <button className="bg-gray-200 text-gray-700 text-sm py-2 px-4 rounded hover:bg-gray-300 transition-colors">
                  전체 재생목록에 추가
                </button>
                <button className="bg-gray-200 text-gray-700 text-sm py-2 px-4 rounded hover:bg-gray-300 transition-colors">
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

          <div className="grid grid-cols-3 gap-4">
            {latestVideos.map((video) => (
              <div
                key={video.id}
                className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
              >
                <div className="relative">
                  <img
                    src={video.imageUrl}
                    alt={video.title}
                    className="w-full h-32 object-cover"
                  />
                  <div className="absolute bottom-2 right-2 bg-black bg-opacity-75 text-white text-xs px-2 py-1 rounded">
                    {video.duration}
                  </div>
                  <div className="absolute top-2 left-2 bg-blue-600 text-white text-xs px-2 py-1 rounded">
                    {video.rating}
                  </div>
                  <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                    <button className="w-12 h-12 bg-white bg-opacity-90 rounded-full flex items-center justify-center hover:bg-opacity-100 transition-all duration-200">
                      <Play className="w-6 h-6 text-gray-800 ml-1" />
                    </button>
                  </div>
                </div>
                <div className="p-3">
                  <h3 className="text-sm font-medium text-gray-900 truncate">
                    {video.title}
                  </h3>
                  <p className="text-xs text-gray-600 truncate">
                    {video.artist}
                  </p>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-xs text-gray-500">
                      조회수 {video.views.toLocaleString()}
                    </span>
                    <button className="text-gray-400 hover:text-gray-600">
                      <MoreHorizontal className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
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
            {musicPosts.map((post) => (
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
            ))}
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
            {artistStories.map((story) => (
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
                <p className="text-sm text-gray-600 mb-3">{story.content}</p>
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
            ))}
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
            {pdAlbums.map((album) => (
              <div
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
              </div>
            ))}
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
    </Layout>
  );
}
