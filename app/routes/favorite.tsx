import type { MetaFunction } from "@remix-run/node";
import { Link } from "@remix-run/react";
import {
  Play,
  Heart,
  Download,
  MoreHorizontal,
  Plus,
  Calendar,
  Music,
  User,
} from "lucide-react";
import { usePlayer } from "~/contexts/PlayerContext";
import { useLanguage } from "~/contexts/LanguageContext";

export const meta: MetaFunction = () => {
  return [
    { title: "Favorite - 벅스" },
    { name: "description", content: "좋아하는 음악을 모아보세요" },
  ];
};

export default function Favorite() {
  const { playTrack } = usePlayer();

  const handlePlayTrack = (trackId: string) => {
    const track = favoriteTracks.find((t) => t.id === trackId);
    if (track) {
      playTrack(track, favoriteTracks);
    }
  };

  const favoriteTracks = [
    {
      id: "1",
      title: "서우젯소리",
      artist: "사우스 카니발(South Carnival)",
      album: "서우젯소리",
      duration: "4:32",
      coverUrl: "https://via.placeholder.com/60x60/ff1493/ffffff?text=1",
      addedDate: "2025.08.08",
      audioUrl: "https://example.com/audio/1.mp3",
    },
    {
      id: "2",
      title: "Golden",
      artist: "HUNTR/X",
      album: "KPop Demon Hunters",
      duration: "4:05",
      coverUrl: "https://via.placeholder.com/60x60/ff1493/ffffff?text=2",
      addedDate: "2025.08.07",
      audioUrl: "https://example.com/audio/2.mp3",
    },
    {
      id: "3",
      title: "Dream",
      artist: "HANZI(한지)",
      album: "Dream",
      duration: "3:28",
      coverUrl: "https://via.placeholder.com/60x60/ff1493/ffffff?text=3",
      addedDate: "2025.08.06",
      audioUrl: "https://example.com/audio/3.mp3",
    },
  ];

  const favoriteArtists = [
    {
      id: "1",
      name: "사우스 카니발(South Carnival)",
      genre: "인디록",
      profileImage:
        "https://via.placeholder.com/100x100/ff1493/ffffff?text=Artist1",
      followDate: "2025.08.05",
    },
    {
      id: "2",
      name: "HUNTR/X",
      genre: "일렉트로닉",
      profileImage:
        "https://via.placeholder.com/100x100/ff1493/ffffff?text=Artist2",
      followDate: "2025.08.04",
    },
  ];

  const favoriteAlbums = [
    {
      id: "1",
      title: "서우젯소리",
      artist: "사우스 카니발(South Carnival)",
      coverUrl: "https://via.placeholder.com/120x120/ff1493/ffffff?text=Album1",
      addedDate: "2025.08.03",
    },
    {
      id: "2",
      title: "KPop Demon Hunters",
      artist: "HUNTR/X",
      coverUrl: "https://via.placeholder.com/120x120/ff1493/ffffff?text=Album2",
      addedDate: "2025.08.02",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-Snowlight-pink to-purple-600 rounded-lg p-8 text-white">
        <h1 className="text-3xl font-bold mb-2">Favorite</h1>
        <p className="text-lg opacity-90">좋아하는 음악을 모아보세요</p>
        <div className="flex items-center space-x-6 mt-4 text-sm">
          <div className="flex items-center space-x-2">
            <Music className="w-4 h-4" />
            <span>{favoriteTracks.length}곡</span>
          </div>
          <div className="flex items-center space-x-2">
            <User className="w-4 h-4" />
            <span>{favoriteArtists.length}명</span>
          </div>
          <div className="flex items-center space-x-2">
            <Heart className="w-4 h-4" />
            <span>나만의 컬렉션</span>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-Snowlight-pink rounded-lg flex items-center justify-center">
              <Music className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900">좋아하는 곡</h3>
              <p className="text-2xl font-bold text-Snowlight-pink">
                {favoriteTracks.length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-purple-500 rounded-lg flex items-center justify-center">
              <User className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900">팔로우 아티스트</h3>
              <p className="text-2xl font-bold text-purple-500">
                {favoriteArtists.length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center">
              <Heart className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900">좋아하는 앨범</h3>
              <p className="text-2xl font-bold text-green-500">
                {favoriteAlbums.length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Favorite Tracks */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">좋아하는 곡</h2>
          <button className="Snowlight-button Snowlight-button-primary">
            <Play className="w-4 h-4 mr-2" />
            전체 재생
          </button>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="divide-y divide-gray-200">
            {favoriteTracks.map((track, index) => (
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
                      <span>{track.duration}</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      추가일: {track.addedDate}
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
                    <button className="p-2 text-red-500 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors">
                      <Heart className="w-4 h-4 fill-current" />
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

      {/* Favorite Artists */}
      <section>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          팔로우 아티스트
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {favoriteArtists.map((artist) => (
            <div
              key={artist.id}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
            >
              <div className="flex items-center space-x-4">
                <img
                  src={artist.profileImage}
                  alt={artist.name}
                  className="w-16 h-16 rounded-full object-cover"
                />
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-gray-900 truncate hover:text-Snowlight-pink transition-colors">
                    <Link to={`/artist/${artist.name}`}>{artist.name}</Link>
                  </h3>
                  <p className="text-sm text-gray-600">{artist.genre}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    팔로우: {artist.followDate}
                  </p>
                </div>
                <button className="Snowlight-button Snowlight-button-secondary text-sm">
                  팔로잉
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Favorite Albums */}
      <section>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">좋아하는 앨범</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6">
          {favoriteAlbums.map((album) => (
            <div key={album.id} className="group">
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
                <div className="absolute top-2 right-2">
                  <button className="w-8 h-8 bg-white/80 rounded-full flex items-center justify-center backdrop-blur-sm">
                    <Heart className="w-4 h-4 text-red-500 fill-current" />
                  </button>
                </div>
              </div>
              <div className="space-y-1">
                <h3 className="font-medium text-gray-900 hover:text-Snowlight-pink transition-colors line-clamp-1">
                  <Link to={`/album/${album.id}`}>{album.title}</Link>
                </h3>
                <p className="text-sm text-gray-600 hover:text-Snowlight-pink transition-colors line-clamp-1">
                  <Link to={`/artist/${album.artist}`}>{album.artist}</Link>
                </p>
                <p className="text-xs text-gray-500">추가: {album.addedDate}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Empty State (if no favorites) */}
      {favoriteTracks.length === 0 && (
        <div className="text-center py-12">
          <Heart className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            아직 좋아하는 음악이 없습니다
          </h2>
          <p className="text-gray-600 mb-6">
            마음에 드는 음악에 하트를 눌러 나만의 컬렉션을 만들어보세요.
          </p>
          <Link
            to="/chart"
            className="Snowlight-button Snowlight-button-primary"
          >
            인기 차트 둘러보기
          </Link>
        </div>
      )}
    </div>
  );
}
