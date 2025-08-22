import type { MetaFunction } from "@remix-run/node";
import { Link } from "@remix-run/react";
import { Play, TrendingUp, Music } from "lucide-react";
import { useLanguage } from "~/contexts/LanguageContext";
import Layout from "../components/Layout";

export const meta: MetaFunction = () => {
  return [
    { title: "장르 - 벅스" },
    {
      name: "description",
      content: "다양한 음악 장르별 인기곡과 신곡을 만나보세요",
    },
  ];
};

export default function Genres() {
  const { t } = useLanguage();

  const genres = [
    {
      id: "kpop",
      name: "K-POP",
      description: "한국 대중음악",
      color: "bg-gradient-to-br from-pink-500 to-rose-600",
      trackCount: 15420,
      coverUrl: "https://placehold.co/300x200/ff1493/ffffff?text=K-POP",
    },
    {
      id: "pop",
      name: "POP",
      description: "팝 음악",
      color: "bg-gradient-to-br from-blue-500 to-cyan-600",
      trackCount: 28950,
      coverUrl: "https://placehold.co/300x200/3b82f6/ffffff?text=POP",
    },
    {
      id: "rock",
      name: "록",
      description: "록 음악",
      color: "bg-gradient-to-br from-red-500 to-orange-600",
      trackCount: 12340,
      coverUrl: "https://placehold.co/300x200/ef4444/ffffff?text=ROCK",
    },
    {
      id: "indie",
      name: "인디",
      description: "인디 음악",
      color: "bg-gradient-to-br from-purple-500 to-indigo-600",
      trackCount: 8760,
      coverUrl: "https://placehold.co/300x200/8b5cf6/ffffff?text=INDIE",
    },
    {
      id: "hiphop",
      name: "힙합",
      description: "힙합/랩",
      color: "bg-gradient-to-br from-gray-700 to-gray-900",
      trackCount: 9850,
      coverUrl: "https://placehold.co/300x200/374151/ffffff?text=HIPHOP",
    },
    {
      id: "rnb",
      name: "R&B",
      description: "알앤비/소울",
      color: "bg-gradient-to-br from-amber-500 to-yellow-600",
      trackCount: 6420,
      coverUrl: "https://placehold.co/300x200/f59e0b/ffffff?text=R%26B",
    },
    {
      id: "electronic",
      name: "일렉트로닉",
      description: "전자음악",
      color: "bg-gradient-to-br from-cyan-500 to-teal-600",
      trackCount: 7890,
      coverUrl: "https://placehold.co/300x200/06b6d4/ffffff?text=EDM",
    },
    {
      id: "jazz",
      name: "재즈",
      description: "재즈",
      color: "bg-gradient-to-br from-emerald-500 to-green-600",
      trackCount: 4320,
      coverUrl: "https://placehold.co/300x200/10b981/ffffff?text=JAZZ",
    },
    {
      id: "classical",
      name: "클래식",
      description: "클래식",
      color: "bg-gradient-to-br from-violet-500 to-purple-600",
      trackCount: 5670,
      coverUrl: "https://placehold.co/300x200/8b5cf6/ffffff?text=CLASSIC",
    },
    {
      id: "folk",
      name: "포크",
      description: "포크/컨트리",
      color: "bg-gradient-to-br from-orange-500 to-red-600",
      trackCount: 3450,
      coverUrl: "https://placehold.co/300x200/f97316/ffffff?text=FOLK",
    },
    {
      id: "ballad",
      name: "발라드",
      description: "발라드",
      color: "bg-gradient-to-br from-rose-500 to-pink-600",
      trackCount: 11230,
      coverUrl: "https://placehold.co/300x200/f43f5e/ffffff?text=BALLAD",
    },
    {
      id: "trot",
      name: "트로트",
      description: "트로트",
      color: "bg-gradient-to-br from-yellow-500 to-orange-600",
      trackCount: 2890,
      coverUrl: "https://placehold.co/300x200/eab308/ffffff?text=TROT",
    },
  ];

  const popularGenres = genres.slice(0, 6);
  const allGenres = genres;

  return (
    <Layout>
      {/* Header */}
      <div className="bg-gradient-to-r from-Snowlight-pink to-purple-600 rounded-lg p-8 text-white">
        <h1 className="text-3xl font-bold mb-2">장르</h1>
        <p className="text-lg opacity-90">
          다양한 음악 장르별 인기곡과 신곡을 만나보세요
        </p>
        <div className="flex items-center space-x-6 mt-4 text-sm">
          <div className="flex items-center space-x-2">
            <Music className="w-4 h-4" />
            <span>12개 장르</span>
          </div>
          <div className="flex items-center space-x-2">
            <TrendingUp className="w-4 h-4" />
            <span>실시간 차트</span>
          </div>
        </div>
      </div>

      {/* Popular Genres */}
      <section>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">인기 장르</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {popularGenres.map((genre) => (
            <Link
              key={genre.id}
              to={`/genre/${genre.id}`}
              className="group relative overflow-hidden rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
            >
              <div
                className={`${genre.color} aspect-[3/2] flex items-center justify-center relative`}
              >
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors duration-300" />
                <div className="relative z-10 text-center text-white">
                  <h3 className="text-2xl font-bold mb-2">{genre.name}</h3>
                  <p className="text-sm opacity-90 mb-3">{genre.description}</p>
                  <div className="flex items-center justify-center space-x-2 text-xs">
                    <Music className="w-3 h-3" />
                    <span>{genre.trackCount.toLocaleString()}곡</span>
                  </div>
                </div>
                <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                    <Play className="w-5 h-5 text-white ml-0.5" />
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* All Genres */}
      <section>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">모든 장르</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
          {allGenres.map((genre) => (
            <Link
              key={genre.id}
              to={`/genre/${genre.id}`}
              className="group bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md hover:border-Snowlight-pink transition-all duration-300"
            >
              <div className="text-center">
                <div
                  className={`w-16 h-16 ${genre.color} rounded-full mx-auto mb-3 flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}
                >
                  <Music className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-bold text-gray-900 mb-1 group-hover:text-Snowlight-pink transition-colors">
                  {genre.name}
                </h3>
                <p className="text-xs text-gray-600 mb-2">
                  {genre.description}
                </p>
                <p className="text-xs text-gray-500">
                  {genre.trackCount.toLocaleString()}곡
                </p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Genre Stats */}
      <section>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">장르별 통계</h2>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-Snowlight-pink mb-2">
                {genres
                  .reduce((sum, genre) => sum + genre.trackCount, 0)
                  .toLocaleString()}
              </div>
              <div className="text-sm text-gray-600">전체 곡 수</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-500 mb-2">12</div>
              <div className="text-sm text-gray-600">장르 수</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-500 mb-2">매일</div>
              <div className="text-sm text-gray-600">업데이트</div>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}
