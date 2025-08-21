import type { MetaFunction, LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData, Link } from "@remix-run/react";
import { useState } from "react";
import {
  Play,
  Heart,
  Download,
  MoreHorizontal,
  Plus,
  Search as SearchIcon,
  Filter,
} from "lucide-react";
import { usePlayer } from "~/contexts/PlayerContext";

// Local mockTracks definition (copy from loader if needed)
const mockTracks = [
  {
    id: "1",
    title: "서우젯소리",
    artist: "사우스 카니발(South Carnival)",
    album: "서우젯소리",
    duration: 272, // 4:32 in seconds
    coverUrl: "https://placehold.co/60x60/ff1493/ffffff?text=1",
    isTitle: true,
    audioUrl: "https://example.com/audio/1.mp3",
  },
  {
    id: "2",
    title: "Golden",
    artist: "HUNTR/X",
    album: "KPop Demon Hunters",
    duration: 245, // 4:05 in seconds
    coverUrl: "https://placehold.co/60x60/ff1493/ffffff?text=2",
    isTitle: false,
    audioUrl: "https://example.com/audio/2.mp3",
  },
  {
    id: "3",
    title: "서울의 밤",
    artist: "Various Artists",
    album: "서울 컴필레이션",
    duration: 208, // 3:28 in seconds
    coverUrl: "https://placehold.co/60x60/ff1493/ffffff?text=3",
    isTitle: false,
    audioUrl: "https://example.com/audio/3.mp3",
  },
];

export const meta: MetaFunction = () => {
  return [
    { title: "검색 결과 - 벅스" },
    { name: "description", content: "벅스에서 음악을 검색하세요!" },
  ];
};

export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const query = url.searchParams.get("q") || "";

  // Mock search results
  const searchResults = {
    query,
    totalResults: 156,
    tracks: [
      {
        id: "1",
        title: "서우젯소리",
        artist: "사우스 카니발(South Carnival)",
        album: "서우젯소리",
        duration: "4:32",
        coverUrl: "https://placehold.co/60x60/ff1493/ffffff?text=1",
        isTitle: true,
      },
      {
        id: "2",
        title: "Golden",
        artist: "HUNTR/X",
        album: "KPop Demon Hunters",
        duration: "4:05",
        coverUrl: "https://placehold.co/60x60/ff1493/ffffff?text=2",
        isTitle: false,
      },
      {
        id: "3",
        title: "서울의 밤",
        artist: "Various Artists",
        album: "서울 컴필레이션",
        duration: "3:28",
        coverUrl: "https://placehold.co/60x60/ff1493/ffffff?text=3",
        isTitle: false,
      },
    ],
    artists: [
      {
        id: "1",
        name: "사우스 카니발(South Carnival)",
        profileImage: "https://placehold.co/100x100/ff1493/ffffff?text=Artist1",
        genre: "인디록",
        followers: 15420,
      },
      {
        id: "2",
        name: "서태지",
        profileImage: "https://placehold.co/100x100/ff1493/ffffff?text=Artist2",
        genre: "록",
        followers: 89234,
      },
    ],
    albums: [
      {
        id: "1",
        title: "서우젯소리",
        artist: "사우스 카니발(South Carnival)",
        releaseDate: "2025.08.08",
        type: "싱글",
        coverUrl: "https://placehold.co/120x120/ff1493/ffffff?text=Album1",
      },
      {
        id: "2",
        title: "서울 야경",
        artist: "City Lights",
        releaseDate: "2024.12.15",
        type: "정규",
        coverUrl: "https://placehold.co/120x120/ff1493/ffffff?text=Album2",
      },
    ],
    videos: [
      {
        id: "1",
        title: "서우젯소리 (Official MV)",
        artist: "사우스 카니발(South Carnival)",
        duration: "4:32",
        views: 2100000,
        thumbnail: "https://placehold.co/160x90/ff1493/ffffff?text=Video1",
      },
    ],
  };

  return { searchResults };
}

export default function Search() {
  const { searchResults } = useLoaderData<typeof loader>();
  const { playTrack } = usePlayer();

  const [activeTab, setActiveTab] = useState("all");
  const [sortBy, setSortBy] = useState("relevance");
  const [selectedTracks, setSelectedTracks] = useState<string[]>([]);

  const handlePlayTrack = (trackId: string) => {
    const track = mockTracks.find((t) => t.id === trackId);
    if (track) {
      playTrack(track, mockTracks);
    }
  };

  const handleSelectTrack = (trackId: string) => {
    setSelectedTracks((prev) =>
      prev.includes(trackId)
        ? prev.filter((id) => id !== trackId)
        : [...prev, trackId]
    );
  };

  const tabs = [
    { id: "all", name: "전체", count: searchResults.totalResults },
    { id: "tracks", name: "곡", count: searchResults.tracks.length },
    { id: "artists", name: "아티스트", count: searchResults.artists.length },
    { id: "albums", name: "앨범", count: searchResults.albums.length },
    { id: "videos", name: "영상", count: searchResults.videos.length },
  ];

  const sortOptions = [
    { value: "relevance", label: "관련도순" },
    { value: "latest", label: "최신순" },
    { value: "popular", label: "인기순" },
    { value: "title", label: "제목순" },
  ];

  return (
    <div className="space-y-6">
      {/* Search Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            &#39;{searchResults.query}&#39; 검색 결과
          </h1>
          <p className="text-gray-600 mt-1">
            총 {searchResults.totalResults.toLocaleString()}개의 결과를
            찾았습니다.
          </p>
        </div>

        <div className="flex items-center space-x-4">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-Snowlight-pink"
          >
            {sortOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

          <button className="flex items-center space-x-2 px-3 py-2 border border-gray-300 rounded-md text-sm hover:bg-gray-50">
            <Filter className="w-4 h-4" />
            <span>필터</span>
          </button>
        </div>
      </div>

      {/* Search Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? "border-Snowlight-pink text-Snowlight-pink"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              {tab.name} ({tab.count})
            </button>
          ))}
        </nav>
      </div>

      {/* Search Results */}
      {(activeTab === "all" || activeTab === "tracks") &&
        searchResults.tracks.length > 0 && (
          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-4">곡</h2>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              {/* Bulk Actions */}
              {activeTab === "tracks" && (
                <div className="p-4 border-b border-gray-200 bg-gray-50">
                  <div className="flex items-center space-x-4">
                    <button className="text-sm text-Snowlight-pink hover:text-pink-600">
                      전체 선택
                    </button>
                    <div className="flex space-x-2">
                      <button className="Snowlight-button Snowlight-button-secondary text-sm">
                        선택된 곡 재생
                      </button>
                      <button className="Snowlight-button Snowlight-button-secondary text-sm">
                        재생목록에 추가
                      </button>
                      <button className="Snowlight-button Snowlight-button-secondary text-sm">
                        다운로드
                      </button>
                    </div>
                  </div>
                </div>
              )}

              <div className="divide-y divide-gray-200">
                {searchResults.tracks.map((track) => (
                  <div
                    key={track.id}
                    className="p-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center space-x-4">
                      {activeTab === "tracks" && (
                        <input
                          type="checkbox"
                          checked={selectedTracks.includes(track.id)}
                          onChange={() => handleSelectTrack(track.id)}
                          className="rounded border-gray-300 text-Snowlight-pink focus:ring-Snowlight-pink"
                        />
                      )}

                      <img
                        src={track.coverUrl}
                        alt={track.title}
                        className="w-12 h-12 rounded object-cover"
                      />

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2">
                          <h3 className="font-medium text-gray-900 truncate">
                            {track.title}
                          </h3>
                          {track.isTitle && (
                            <span className="text-xs bg-Snowlight-pink text-white px-2 py-0.5 rounded">
                              타이틀곡
                            </span>
                          )}
                        </div>
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
                          <span>{track.duration}</span>
                        </div>
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

              {activeTab === "all" && searchResults.tracks.length > 3 && (
                <div className="p-4 border-t border-gray-200 text-center">
                  <Link
                    to={`/search?q=${searchResults.query}&tab=tracks`}
                    className="text-Snowlight-pink hover:text-pink-600 font-medium"
                  >
                    곡 더보기 ({searchResults.tracks.length - 3}개 더)
                  </Link>
                </div>
              )}
            </div>
          </section>
        )}

      {/* Artists Results */}
      {(activeTab === "all" || activeTab === "artists") &&
        searchResults.artists.length > 0 && (
          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-4">아티스트</h2>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {searchResults.artists.map((artist) => (
                  <Link
                    key={artist.id}
                    to={`/artist/${artist.name}`}
                    className="flex items-center space-x-4 p-4 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <img
                      src={artist.profileImage}
                      alt={artist.name}
                      className="w-16 h-16 rounded-full object-cover"
                    />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-gray-900 truncate">
                        {artist.name}
                      </h3>
                      <p className="text-sm text-gray-600">{artist.genre}</p>
                      <p className="text-xs text-gray-500">
                        {artist.followers.toLocaleString()} 팔로워
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}

      {/* Albums Results */}
      {(activeTab === "all" || activeTab === "albums") &&
        searchResults.albums.length > 0 && (
          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-4">앨범</h2>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                {searchResults.albums.map((album) => (
                  <Link
                    key={album.id}
                    to={`/album/${album.id}`}
                    className="group"
                  >
                    <div className="relative aspect-square mb-3 overflow-hidden rounded-lg bg-gray-200">
                      <img
                        src={album.coverUrl}
                        alt={album.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 flex items-center justify-center">
                        <button className="w-12 h-12 bg-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transform scale-75 group-hover:scale-100 transition-all duration-300 shadow-lg">
                          <Play className="w-5 h-5 text-Snowlight-pink ml-0.5" />
                        </button>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <h3 className="font-medium text-gray-900 hover:text-Snowlight-pink transition-colors line-clamp-1">
                        {album.title}
                      </h3>
                      <p className="text-sm text-gray-600 hover:text-Snowlight-pink transition-colors line-clamp-1">
                        {album.artist}
                      </p>
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>{album.releaseDate}</span>
                        <span>{album.type}</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}

      {/* Videos Results */}
      {(activeTab === "all" || activeTab === "videos") &&
        searchResults.videos.length > 0 && (
          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-4">영상</h2>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {searchResults.videos.map((video) => (
                  <div key={video.id} className="group cursor-pointer">
                    <div className="relative aspect-video mb-3 overflow-hidden rounded-lg bg-gray-200">
                      <img
                        src={video.thumbnail}
                        alt={video.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 flex items-center justify-center">
                        <button className="w-12 h-12 bg-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transform scale-75 group-hover:scale-100 transition-all duration-300 shadow-lg">
                          <Play className="w-5 h-5 text-Snowlight-pink ml-0.5" />
                        </button>
                      </div>
                      <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                        {video.duration}
                      </div>
                    </div>
                    <div className="space-y-1">
                      <h3 className="font-medium text-gray-900 hover:text-Snowlight-pink transition-colors line-clamp-2">
                        {video.title}
                      </h3>
                      <p className="text-sm text-gray-600 hover:text-Snowlight-pink transition-colors">
                        {video.artist}
                      </p>
                      <p className="text-xs text-gray-500">
                        {video.views.toLocaleString()} 회 재생
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

      {/* No Results */}
      {searchResults.totalResults === 0 && (
        <div className="text-center py-12">
          <SearchIcon className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            검색 결과가 없습니다
          </h2>
          <p className="text-gray-600 mb-6">다른 검색어로 다시 시도해보세요.</p>
          <div className="space-y-2 text-sm text-gray-500">
            <p>• 검색어의 철자가 정확한지 확인해보세요</p>
            <p>• 더 간단한 검색어를 사용해보세요</p>
            <p>• 다른 검색어를 사용해보세요</p>
          </div>
        </div>
      )}
    </div>
  );
}
