import type { MetaFunction } from "@remix-run/node";
import { Link } from "@remix-run/react";
import { Play, Calendar, User, Star, Music } from "lucide-react";
import { useLanguage } from "~/contexts/LanguageContext";

export const meta: MetaFunction = () => {
  return [
    { title: "뮤직PD 앨범 - 벅스" },
    {
      name: "description",
      content: "벅스 뮤직PD가 엄선한 특별한 앨범들을 만나보세요",
    },
  ];
};

export default function PDAlbums() {
  const { t } = useLanguage();

  const pdAlbums = [
    {
      id: "1",
      title: "여름밤의 감성 발라드",
      description: "무더운 여름밤, 마음을 시원하게 해줄 감성 발라드 모음",
      curator: "벅스 PD 김민수",
      coverUrl: "https://placehold.co/300x300/ff1493/ffffff?text=Summer+Ballad",
      trackCount: 15,
      playCount: 2450000,
      rating: 4.8,
      date: "2025.08.08",
      featured: true,
    },
    {
      id: "2",
      title: "출근길 에너지 부스터",
      description: "월요일 아침을 활기차게 시작할 수 있는 업템포 곡들",
      curator: "벅스 PD 이지은",
      coverUrl: "https://placehold.co/300x300/3b82f6/ffffff?text=Energy+Boost",
      trackCount: 20,
      playCount: 1890000,
      rating: 4.6,
      date: "2025.08.07",
      featured: false,
    },
    {
      id: "3",
      title: "힙합 신예들의 등장",
      description: "2025년 주목해야 할 힙합 신예 아티스트들의 대표곡",
      curator: "벅스 PD 박준호",
      coverUrl: "https://placehold.co/300x300/374151/ffffff?text=New+Hiphop",
      trackCount: 12,
      playCount: 1560000,
      rating: 4.7,
      date: "2025.08.06",
      featured: false,
    },
    {
      id: "4",
      title: "카페에서 듣기 좋은 재즈",
      description: "여유로운 오후 시간을 위한 모던 재즈 컬렉션",
      curator: "벅스 PD 최수진",
      coverUrl: "https://placehold.co/300x300/10b981/ffffff?text=Cafe+Jazz",
      trackCount: 18,
      playCount: 980000,
      rating: 4.9,
      date: "2025.08.05",
      featured: false,
    },
    {
      id: "5",
      title: "인디 록의 새로운 물결",
      description: "독립 음악씬에서 주목받는 록 밴드들의 신곡 모음",
      curator: "벅스 PD 정민우",
      coverUrl: "https://placehold.co/300x300/8b5cf6/ffffff?text=Indie+Rock",
      trackCount: 14,
      playCount: 1230000,
      rating: 4.5,
      date: "2025.08.04",
      featured: false,
    },
    {
      id: "6",
      title: "K-POP 글로벌 히트곡",
      description: "전 세계를 사로잡은 K-POP 대표 히트곡들",
      curator: "벅스 PD 김하늘",
      coverUrl: "https://placehold.co/300x300/f59e0b/ffffff?text=KPOP+Global",
      trackCount: 25,
      playCount: 3450000,
      rating: 4.8,
      date: "2025.08.03",
      featured: false,
    },
  ];

  const featuredAlbum = pdAlbums.find((album) => album.featured);
  const regularAlbums = pdAlbums.filter((album) => !album.featured);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-Snowlight-pink to-purple-600 rounded-lg p-8 text-white">
        <h1 className="text-3xl font-bold mb-2">뮤직PD 앨범</h1>
        <p className="text-lg opacity-90">
          벅스 뮤직PD가 엄선한 특별한 앨범들을 만나보세요
        </p>
        <div className="flex items-center space-x-6 mt-4 text-sm">
          <div className="flex items-center space-x-2">
            <User className="w-4 h-4" />
            <span>전문 큐레이터</span>
          </div>
          <div className="flex items-center space-x-2">
            <Star className="w-4 h-4" />
            <span>엄선된 곡들</span>
          </div>
          <div className="flex items-center space-x-2">
            <Music className="w-4 h-4" />
            <span>매주 업데이트</span>
          </div>
        </div>
      </div>

      {/* Featured Album */}
      {featuredAlbum && (
        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">이주의 추천</h2>
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="md:flex">
              <div className="md:w-1/3">
                <div className="relative aspect-square">
                  <img
                    src={featuredAlbum.coverUrl}
                    alt={featuredAlbum.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/0 hover:bg-black/20 transition-colors duration-300 flex items-center justify-center">
                    <button className="w-16 h-16 bg-white rounded-full flex items-center justify-center opacity-0 hover:opacity-100 transform scale-75 hover:scale-100 transition-all duration-300 shadow-lg">
                      <Play className="w-6 h-6 text-Snowlight-pink ml-1" />
                    </button>
                  </div>
                  <div className="absolute top-4 left-4">
                    <span className="bg-red-500 text-white text-xs px-2 py-1 rounded font-medium">
                      FEATURED
                    </span>
                  </div>
                </div>
              </div>
              <div className="md:w-2/3 p-6">
                <h3 className="text-2xl font-bold text-gray-900 mb-3">
                  {featuredAlbum.title}
                </h3>
                <p className="text-gray-600 mb-4 text-lg">
                  {featuredAlbum.description}
                </p>
                <div className="flex items-center space-x-6 mb-4">
                  <div className="flex items-center space-x-2">
                    <User className="w-4 h-4 text-gray-500" />
                    <span className="text-sm text-gray-600">
                      {featuredAlbum.curator}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-4 h-4 text-gray-500" />
                    <span className="text-sm text-gray-600">
                      {featuredAlbum.date}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Music className="w-4 h-4 text-gray-500" />
                    <span className="text-sm text-gray-600">
                      {featuredAlbum.trackCount}곡
                    </span>
                  </div>
                </div>
                <div className="flex items-center space-x-6 mb-6">
                  <div className="flex items-center space-x-2">
                    <div className="flex items-center space-x-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${
                            i < Math.floor(featuredAlbum.rating)
                              ? "text-yellow-400 fill-current"
                              : "text-gray-300"
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-sm text-gray-600">
                      {featuredAlbum.rating}
                    </span>
                  </div>
                  <div className="text-sm text-gray-600">
                    {featuredAlbum.playCount.toLocaleString()} 재생
                  </div>
                </div>
                <div className="flex space-x-3">
                  <button className="Snowlight-button Snowlight-button-primary">
                    <Play className="w-4 h-4 mr-2" />
                    전체 재생
                  </button>
                  <Link
                    to={`/pdalbum/${featuredAlbum.id}`}
                    className="Snowlight-button Snowlight-button-secondary"
                  >
                    자세히 보기
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Regular Albums */}
      <section>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">PD 추천 앨범</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {regularAlbums.map((album) => (
            <div
              key={album.id}
              className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
            >
              <div className="relative aspect-square">
                <img
                  src={album.coverUrl}
                  alt={album.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/0 hover:bg-black/20 transition-colors duration-300 flex items-center justify-center">
                  <button className="w-12 h-12 bg-white rounded-full flex items-center justify-center opacity-0 hover:opacity-100 transform scale-75 hover:scale-100 transition-all duration-300 shadow-lg">
                    <Play className="w-5 h-5 text-Snowlight-pink ml-0.5" />
                  </button>
                </div>
              </div>
              <div className="p-4">
                <h3 className="font-bold text-gray-900 mb-2 line-clamp-1 hover:text-Snowlight-pink transition-colors">
                  <Link to={`/pdalbum/${album.id}`}>{album.title}</Link>
                </h3>
                <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                  {album.description}
                </p>
                <div className="flex items-center space-x-2 mb-3">
                  <User className="w-3 h-3 text-gray-500" />
                  <span className="text-xs text-gray-600">{album.curator}</span>
                </div>
                <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                  <div className="flex items-center space-x-3">
                    <span>{album.trackCount}곡</span>
                    <span>{album.playCount.toLocaleString()} 재생</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Star className="w-3 h-3 text-yellow-400 fill-current" />
                    <span>{album.rating}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">{album.date}</span>
                  <Link
                    to={`/pdalbum/${album.id}`}
                    className="text-xs text-Snowlight-pink hover:text-pink-600 font-medium"
                  >
                    자세히 보기
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Load More */}
      <div className="text-center">
        <button className="Snowlight-button Snowlight-button-secondary">
          더 많은 PD 앨범 보기
        </button>
      </div>
    </div>
  );
}
