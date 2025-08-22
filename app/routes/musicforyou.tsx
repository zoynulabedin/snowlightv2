import type { MetaFunction } from "@remix-run/node";
import { Link } from "@remix-run/react";
import {
  Play,
  Heart,
  Download,
  MoreHorizontal,
  Plus,
  TrendingUp,
  Music,
  Users,
  Clock,
} from "lucide-react";
import { usePlayer } from "~/contexts/PlayerContext";
import Layout from "../components/Layout";
// import mockTracks from the correct location or define it here if needed
// Define mockTracks locally since '~/mock/mockTracks' cannot be found
const mockTracks = [
  {
    id: "1",
    title: "서우젯소리",
    artist: "사우스 카니발(South Carnival)",
    album: "서우젯소리",
    duration: 272, // 4 minutes 32 seconds
    coverUrl: "https://placehold.co/60x60/ff1493/ffffff?text=1",
    reason: "최근 들은 인디록 장르와 유사",
    audioUrl: "https://example.com/audio/1.mp3",
  },
  {
    id: "2",
    title: "Golden",
    artist: "HUNTR/X",
    album: "KPop Demon Hunters",
    duration: 245, // 4 minutes 5 seconds
    coverUrl: "https://placehold.co/60x60/ff1493/ffffff?text=2",
    reason: "좋아요 표시한 아티스트의 신곡",
    audioUrl: "https://example.com/audio/2.mp3",
  },
  {
    id: "3",
    title: "Dream",
    artist: "HANZI(한지)",
    album: "Dream",
    duration: 208, // 3 minutes 28 seconds
    coverUrl: "https://placehold.co/60x60/ff1493/ffffff?text=3",
    reason: "자주 듣는 시간대에 인기",
    audioUrl: "https://example.com/audio/3.mp3",
  },
];

export const meta: MetaFunction = () => {
  return [
    { title: "뮤직4U - 벅스" },
    { name: "description", content: "당신을 위한 맞춤 음악 추천" },
  ];
};

export default function Music4U() {
  const { playTrack } = usePlayer();

  const handlePlayTrack = (trackId: string) => {
    const track = mockTracks.find((t) => t.id === trackId);
    if (track) {
      playTrack(track, mockTracks);
    }
  };

  const recommendedPlaylists = [
    {
      id: "1",
      title: "당신이 좋아할 만한 곡들",
      description: "최근 들은 음악을 바탕으로 추천",
      coverUrl: "https://placehold.co/200x200/ff1493/ffffff?text=Rec1",
      trackCount: 25,
      playCount: 1250000,
    },
    {
      id: "2",
      title: "비슷한 취향의 사용자들이 듣는 음악",
      description: "당신과 비슷한 음악 취향을 가진 사용자들의 선택",
      coverUrl: "https://placehold.co/200x200/ff1493/ffffff?text=Rec2",
      trackCount: 30,
      playCount: 890000,
    },
    {
      id: "3",
      title: "요즘 뜨는 신곡",
      description: "당신의 취향에 맞는 최신 트렌드 음악",
      coverUrl: "https://placehold.co/200x200/ff1493/ffffff?text=Rec3",
      trackCount: 20,
      playCount: 2100000,
      reason: "자주 듣는 시간대에 인기",
    },
  ];

  const personalizedTracks = [
    {
      id: "1",
      title: "서우젯소리",
      artist: "사우스 카니발(South Carnival)",
      album: "서우젯소리",
      duration: 272, // 4 minutes 32 seconds
      coverUrl: "https://placehold.co/60x60/ff1493/ffffff?text=1",
      reason: "최근 들은 인디록 장르와 유사",
      audioUrl: "https://example.com/audio/1.mp3",
    },
    {
      id: "2",
      title: "Golden",
      artist: "HUNTR/X",
      album: "KPop Demon Hunters",
      duration: 245, // 4 minutes 5 seconds
      coverUrl: "https://placehold.co/60x60/ff1493/ffffff?text=2",
      reason: "좋아요 표시한 아티스트의 신곡",
      audioUrl: "https://example.com/audio/2.mp3",
    },
    {
      id: "3",
      title: "Dream",
      artist: "HANZI(한지)",
      album: "Dream",
      duration: 208, // 3 minutes 28 seconds
      coverUrl: "https://placehold.co/60x60/ff1493/ffffff?text=3",
      reason: "자주 듣는 시간대에 인기",
      audioUrl: "https://example.com/audio/3.mp3",
    },
  ];

  const musicMoods = [
    { name: "집중할 때", icon: "🎯", color: "bg-blue-500" },
    { name: "운동할 때", icon: "💪", color: "bg-red-500" },
    { name: "휴식할 때", icon: "😌", color: "bg-green-500" },
    { name: "드라이브", icon: "🚗", color: "bg-purple-500" },
    { name: "파티", icon: "🎉", color: "bg-yellow-500" },
    { name: "잠들기 전", icon: "🌙", color: "bg-indigo-500" },
  ];

  return (
    <Layout>
      {/* Header */}
      <div className="bg-gradient-to-r from-Snowlight-pink to-purple-600 rounded-lg p-8 text-white">
        <h1 className="text-3xl font-bold mb-2">뮤직4U</h1>
        <p className="text-lg opacity-90">당신만을 위한 맞춤 음악 추천</p>
        <div className="flex items-center space-x-6 mt-4 text-sm">
          <div className="flex items-center space-x-2">
            <Music className="w-4 h-4" />
            <span>개인화된 추천</span>
          </div>
          <div className="flex items-center space-x-2">
            <TrendingUp className="w-4 h-4" />
            <span>실시간 업데이트</span>
          </div>
          <div className="flex items-center space-x-2">
            <Users className="w-4 h-4" />
            <span>취향 분석</span>
          </div>
        </div>
      </div>

      {/* Mood Selection */}
      <section>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          지금 기분에 맞는 음악
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {musicMoods.map((mood) => (
            <button
              key={mood.name}
              className={`${mood.color} text-white p-6 rounded-lg hover:opacity-90 transition-opacity`}
            >
              <div className="text-2xl mb-2">{mood.icon}</div>
              <div className="font-medium">{mood.name}</div>
            </button>
          ))}
        </div>
      </section>

      {/* Personalized Recommendations */}
      <section>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          당신을 위한 추천 플레이리스트
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {recommendedPlaylists.map((playlist) => (
            <div
              key={playlist.id}
              className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
            >
              <div className="relative aspect-square">
                <img
                  src={playlist.coverUrl}
                  alt={playlist.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/0 hover:bg-black/20 transition-colors duration-300 flex items-center justify-center">
                  <button className="w-16 h-16 bg-white rounded-full flex items-center justify-center opacity-0 hover:opacity-100 transform scale-75 hover:scale-100 transition-all duration-300 shadow-lg">
                    <Play className="w-6 h-6 text-Snowlight-pink ml-1" />
                  </button>
                </div>
              </div>
              <div className="p-4">
                <h3 className="font-bold text-gray-900 mb-1 line-clamp-2">
                  {playlist.title}
                </h3>
                <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                  {playlist.description}
                </p>
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>{playlist.trackCount}곡</span>
                  <span>{playlist.playCount.toLocaleString()} 재생</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Personalized Track Recommendations */}
      <section>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          당신이 좋아할 만한 곡
        </h2>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="divide-y divide-gray-200">
            {personalizedTracks.map((track, index) => (
              <div
                key={track.id}
                className="p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center space-x-4">
                  <div className="flex-shrink-0 w-8 text-center">
                    <span className="text-sm font-medium text-gray-500">
                      {index + 1}
                    </span>
                  </div>

                  <img
                    src={track.coverUrl}
                    alt={track.title}
                    className="w-12 h-12 rounded object-cover"
                  />

                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-gray-900 truncate">
                      {track.title}
                    </h3>
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <Link
                        to={`/artist/${track.artist}`}
                        className="hover:text-Snowlight-pink"
                      >
                        {track.artist}
                      </Link>
                      <span>•</span>
                      <Link
                        to={`/album/${track.id}`}
                        className="hover:text-Snowlight-pink"
                      >
                        {track.album}
                      </Link>
                      <span>•</span>
                      <span>
                        {`${Math.floor(track.duration / 60)}:${(
                          track.duration % 60
                        )
                          .toString()
                          .padStart(2, "0")}`}
                      </span>
                    </div>
                    <p className="text-xs text-Snowlight-pink mt-1">
                      {track.reason}
                    </p>
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handlePlayTrack(track.id)}
                      className="p-2 text-gray-600 hover:text-Snowlight-pink hover:bg-pink-50 rounded-md transition-colors"
                    >
                      <Play className="w-4 h-4" />
                    </button>
                    <button className="p-2 text-gray-600 hover:text-Snowlight-pink hover:bg-pink-50 rounded-md transition-colors">
                      <Plus className="w-4 h-4" />
                    </button>
                    <button className="p-2 text-gray-600 hover:text-Snowlight-pink hover:bg-pink-50 rounded-md transition-colors">
                      <Heart className="w-4 h-4" />
                    </button>
                    <button className="p-2 text-gray-600 hover:text-Snowlight-pink hover:bg-pink-50 rounded-md transition-colors">
                      <Download className="w-4 h-4" />
                    </button>
                    <button className="p-2 text-gray-600 hover:text-Snowlight-pink hover:bg-pink-50 rounded-md transition-colors">
                      <MoreHorizontal className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Listening Stats */}
      <section>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          나의 음악 통계
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-Snowlight-pink rounded-lg flex items-center justify-center">
                <Clock className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900">이번 주 재생시간</h3>
                <p className="text-2xl font-bold text-Snowlight-pink">
                  24시간 32분
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-purple-500 rounded-lg flex items-center justify-center">
                <Music className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900">가장 많이 들은 장르</h3>
                <p className="text-2xl font-bold text-purple-500">인디록</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900">
                  발견한 새로운 아티스트
                </h3>
                <p className="text-2xl font-bold text-green-500">12명</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}
