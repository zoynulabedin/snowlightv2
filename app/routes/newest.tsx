import type { MetaFunction } from "@remix-run/node";
import { Link } from "@remix-run/react";
import { Play, Heart, MoreHorizontal, Filter } from "lucide-react";

export const meta: MetaFunction = () => {
  return [
    { title: "최신 음악 > 최신 앨범 > 전체 - 벅스" },
    { name: "description", content: "최신 발매된 음악을 만나보세요!" },
  ];
};

// Mock data for newest albums
const newestAlbums = [
  {
    id: "1",
    title: "서우젯소리",
    artist: "사우스 카니발(South Carnival)",
    coverUrl: "/api/placeholder/300/300",
    releaseDate: "2025.08.08",
    type: "싱글"
  },
  {
    id: "2",
    title: "AT THE HIGH CASTLE",
    artist: "이수린",
    coverUrl: "/api/placeholder/300/300",
    releaseDate: "2025.08.08",
    type: "정규"
  },
  {
    id: "3",
    title: "잊어 빨리",
    artist: "KIRIN (기린)",
    coverUrl: "/api/placeholder/300/300",
    releaseDate: "2025.08.08",
    type: "싱글"
  },
  {
    id: "4",
    title: "A Little More",
    artist: "Ed Sheeran(에드 시런)",
    coverUrl: "/api/placeholder/300/300",
    releaseDate: "2025.08.07",
    type: "싱글"
  },
  {
    id: "5",
    title: "사랑의 콜센타 세븐스타즈 PART14",
    artist: "Various Artists",
    coverUrl: "/api/placeholder/300/300",
    releaseDate: "2025.08.08",
    type: "컴필레이션"
  },
  {
    id: "6",
    title: "명랑하게",
    artist: "차세대",
    coverUrl: "/api/placeholder/300/300",
    releaseDate: "2025.08.08",
    type: "정규"
  },
  {
    id: "7",
    title: "그럼에도 불구하고 (Band ver.)",
    artist: "LOTI (로티)",
    coverUrl: "/api/placeholder/300/300",
    releaseDate: "2025.08.08",
    type: "싱글"
  },
  {
    id: "8",
    title: "널",
    artist: "재연",
    coverUrl: "/api/placeholder/300/300",
    releaseDate: "2025.08.08",
    type: "싱글"
  },
  {
    id: "9",
    title: "THE PAST : WE BEEN HERE",
    artist: "어라이벌 (Arrival)",
    coverUrl: "/api/placeholder/300/300",
    releaseDate: "2025.08.08",
    type: "싱글"
  },
  {
    id: "10",
    title: "Dream",
    artist: "HANZI(한지)",
    coverUrl: "/api/placeholder/300/300",
    releaseDate: "2025.08.08",
    type: "싱글"
  },
  {
    id: "11",
    title: "Golden Hour",
    artist: "NewJeans",
    coverUrl: "/api/placeholder/300/300",
    releaseDate: "2025.08.07",
    type: "EP(미니)"
  },
  {
    id: "12",
    title: "Summer Vibes",
    artist: "IVE",
    coverUrl: "/api/placeholder/300/300",
    releaseDate: "2025.08.07",
    type: "싱글"
  },
  {
    id: "13",
    title: "Midnight Rain",
    artist: "aespa",
    coverUrl: "/api/placeholder/300/300",
    releaseDate: "2025.08.06",
    type: "정규"
  },
  {
    id: "14",
    title: "Ocean Drive",
    artist: "ITZY",
    coverUrl: "/api/placeholder/300/300",
    releaseDate: "2025.08.06",
    type: "EP(미니)"
  },
  {
    id: "15",
    title: "Starlight",
    artist: "(G)I-DLE",
    coverUrl: "/api/placeholder/300/300",
    releaseDate: "2025.08.05",
    type: "싱글"
  },
  {
    id: "16",
    title: "Neon Dreams",
    artist: "LE SSERAFIM",
    coverUrl: "/api/placeholder/300/300",
    releaseDate: "2025.08.05",
    type: "정규"
  },
  {
    id: "17",
    title: "Crystal Clear",
    artist: "TWICE",
    coverUrl: "/api/placeholder/300/300",
    releaseDate: "2025.08.04",
    type: "싱글"
  },
  {
    id: "18",
    title: "Electric Love",
    artist: "Red Velvet",
    coverUrl: "/api/placeholder/300/300",
    releaseDate: "2025.08.04",
    type: "EP(미니)"
  },
  {
    id: "19",
    title: "Moonlight Serenade",
    artist: "BLACKPINK",
    coverUrl: "/api/placeholder/300/300",
    releaseDate: "2025.08.03",
    type: "싱글"
  },
  {
    id: "20",
    title: "Digital Paradise",
    artist: "Girls' Generation",
    coverUrl: "/api/placeholder/300/300",
    releaseDate: "2025.08.03",
    type: "정규"
  }
];

const contentTypes = [
  { name: "곡", active: false },
  { name: "앨범", active: true },
  { name: "뮤직PD 앨범", active: false },
  { name: "영상", active: false },
  { name: "커넥트 곡", active: false },
  { name: "커넥트 영상", active: false }
];

const filters = [
  { name: "전체 국가", active: true },
  { name: "전체 장르", active: true }
];

const categories = [
  { name: "주목", active: false },
  { name: "전체", active: true }
];

export default function Newest() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center space-x-2 text-sm text-gray-600">
        <span>최신 음악</span>
        <span>&gt;</span>
        <span>최신 앨범</span>
        <span>&gt;</span>
        <span className="text-bugs-pink font-medium">전체</span>
      </div>

      {/* Content Type Tabs */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg w-fit">
        {contentTypes.map((type) => (
          <button
            key={type.name}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              type.active
                ? "bg-white text-bugs-pink shadow-sm"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            {type.name}
          </button>
        ))}
      </div>

      {/* Filters */}
      <div className="flex items-center space-x-4">
        <div className="flex space-x-2">
          {filters.map((filter) => (
            <button
              key={filter.name}
              className={`flex items-center space-x-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                filter.active
                  ? "bg-bugs-pink text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              <span>{filter.name}</span>
              <Filter className="w-3 h-3" />
            </button>
          ))}
        </div>
        
        <div className="flex space-x-2">
          {categories.map((category) => (
            <button
              key={category.name}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                category.active
                  ? "bg-bugs-pink text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {category.name}
            </button>
          ))}
        </div>
      </div>

      {/* Albums Grid */}
      <div className="bugs-album-grid">
        {newestAlbums.map((album) => (
          <div key={album.id} className="group">
            <div className="relative aspect-square mb-3 overflow-hidden rounded-lg bg-gray-200">
              <img
                src={`https://via.placeholder.com/300x300/ff1493/ffffff?text=${encodeURIComponent(album.title)}`}
                alt={album.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 flex items-center justify-center">
                <button className="w-12 h-12 bg-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transform scale-75 group-hover:scale-100 transition-all duration-300 shadow-lg">
                  <Play className="w-5 h-5 text-bugs-pink ml-0.5" />
                </button>
              </div>
              <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <button className="w-8 h-8 bg-white/90 rounded-full flex items-center justify-center">
                  <Heart className="w-4 h-4 text-gray-600" />
                </button>
              </div>
              <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <button className="w-8 h-8 bg-white/90 rounded-full flex items-center justify-center">
                  <MoreHorizontal className="w-4 h-4 text-gray-600" />
                </button>
              </div>
            </div>
            <div className="space-y-1">
              <Link
                to={`/album/${album.id}`}
                className="block font-medium text-gray-900 hover:text-bugs-pink transition-colors line-clamp-2"
              >
                {album.title}
              </Link>
              <Link
                to={`/artist/${album.artist}`}
                className="block text-sm text-gray-600 hover:text-bugs-pink transition-colors line-clamp-1"
              >
                {album.artist}
              </Link>
              <div className="flex items-center justify-between text-xs text-gray-500">
                <span>{album.releaseDate}</span>
                <span className="bg-gray-100 px-2 py-1 rounded">{album.type}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Load More */}
      <div className="flex justify-center mt-12">
        <button className="bugs-button bugs-button-secondary">
          더 많은 앨범 보기
        </button>
      </div>

      {/* Info Box */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-800">
        <h3 className="font-semibold mb-2">최신 음악 안내</h3>
        <p>
          최신 음악은 발매일 기준으로 정렬되며, 매일 새로운 음악이 업데이트됩니다.
          국가별, 장르별 필터를 통해 원하는 음악을 쉽게 찾아보세요.
        </p>
      </div>
    </div>
  );
}

