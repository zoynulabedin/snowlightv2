import type { MetaFunction, LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData, Link } from "@remix-run/react";
import { useState } from "react";
import { Play, Heart, Share2, Users, Calendar, Music, Video, Star, MoreHorizontal, Plus } from "lucide-react";
import { usePlayer, mockTracks } from "~/contexts/PlayerContext";
import { useLanguage } from "~/contexts/LanguageContext";

export const meta: MetaFunction = () => {
  return [
    { title: "사우스 카니발(South Carnival) - 벅스" },
    { name: "description", content: "사우스 카니발(South Carnival)의 음악을 벅스에서 감상하세요!" },
  ];
};

export async function loader({ params }: LoaderFunctionArgs) {
  // Mock artist data
  const artist = {
    name: decodeURIComponent(params.name || ""),
    profileImage: "https://via.placeholder.com/300x300/ff1493/ffffff?text=Artist",
    genre: ["인디록", "얼터너티브"],
    debutDate: "2020.03.15",
    agency: "사우스 카니발 레코즈",
    nationality: "대한민국",
    followers: 15420,
    likes: 8934,
    description: "사우스 카니발(South Carnival)은 2020년 결성된 대한민국의 인디 록 밴드입니다. 독특한 사운드와 깊이 있는 가사로 많은 사랑을 받고 있으며, 현대 사회의 다양한 이슈를 음악으로 표현하는 것으로 유명합니다.",
    topTracks: [
      {
        id: "1",
        title: "서우젯소리",
        album: "서우젯소리",
        duration: "4:32",
        playCount: 1250000,
        isTitle: true
      },
      {
        id: "2", 
        title: "멀구야",
        album: "서우젯소리",
        duration: "4:33",
        playCount: 890000,
        isTitle: false
      },
      {
        id: "3",
        title: "도시의 밤",
        album: "Urban Nights",
        duration: "3:45",
        playCount: 750000,
        isTitle: true
      }
    ],
    albums: [
      {
        id: "1",
        title: "서우젯소리",
        type: "싱글",
        releaseDate: "2025.08.08",
        coverUrl: "https://via.placeholder.com/150x150/ff1493/ffffff?text=1"
      },
      {
        id: "2",
        title: "Urban Nights",
        type: "EP",
        releaseDate: "2024.12.15",
        coverUrl: "https://via.placeholder.com/150x150/ff1493/ffffff?text=2"
      },
      {
        id: "3",
        title: "First Steps",
        type: "정규",
        releaseDate: "2023.06.20",
        coverUrl: "https://via.placeholder.com/150x150/ff1493/ffffff?text=3"
      }
    ],
    videos: [
      {
        id: "1",
        title: "서우젯소리 (Official MV)",
        thumbnail: "https://via.placeholder.com/200x120/ff1493/ffffff?text=MV1",
        duration: "4:32",
        views: 2100000
      },
      {
        id: "2",
        title: "도시의 밤 (Live Performance)",
        thumbnail: "https://via.placeholder.com/200x120/ff1493/ffffff?text=MV2",
        duration: "3:45",
        views: 850000
      }
    ]
  };

  return { artist };
}

export default function ArtistDetail() {
  const { artist } = useLoaderData<typeof loader>();
  const { playTrack } = usePlayer();
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState("overview");
  const [isFollowing, setIsFollowing] = useState(false);

  const handlePlayTrack = (trackId: string) => {
    const track = mockTracks.find(t => t.id === trackId);
    if (track) {
      playTrack(track, mockTracks);
    }
  };

  const handlePlayAll = () => {
    if (mockTracks.length > 0) {
      playTrack(mockTracks[0], mockTracks);
    }
  };

  const tabs = [
    { id: "overview", name: "개요", icon: Music },
    { id: "albums", name: "앨범", icon: Music },
    { id: "videos", name: "영상", icon: Video },
    { id: "similar", name: "비슷한 아티스트", icon: Users }
  ];

  return (
    <div className="space-y-8">
      {/* Artist Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Artist Image */}
          <div className="flex-shrink-0">
            <img
              src={artist.profileImage}
              alt={artist.name}
              className="w-64 h-64 rounded-lg shadow-lg object-cover"
            />
          </div>

          {/* Artist Info */}
          <div className="flex-1 space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{artist.name}</h1>
              <div className="flex items-center space-x-4 text-sm text-gray-600 mb-4">
                <div className="flex items-center space-x-1">
                  <Users className="w-4 h-4" />
                  <span>{artist.followers.toLocaleString()} 팔로워</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Heart className="w-4 h-4" />
                  <span>{artist.likes.toLocaleString()} 좋아요</span>
                </div>
              </div>
            </div>

            {/* Artist Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="space-y-2">
                <div className="flex">
                  <span className="w-20 text-gray-600">장르</span>
                  <div className="flex space-x-2">
                    {artist.genre.map((g) => (
                      <Link key={g} to={`/genre/${g}`} className="text-bugs-pink hover:underline">
                        {g}
                      </Link>
                    ))}
                  </div>
                </div>
                <div className="flex">
                  <span className="w-20 text-gray-600">데뷔</span>
                  <span>{artist.debutDate}</span>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex">
                  <span className="w-20 text-gray-600">소속사</span>
                  <span>{artist.agency}</span>
                </div>
                <div className="flex">
                  <span className="w-20 text-gray-600">국적</span>
                  <span>{artist.nationality}</span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-3">
              <button
                onClick={handlePlayAll}
                className="bugs-button bugs-button-primary flex items-center space-x-2"
              >
                <Play className="w-4 h-4" />
                <span>인기곡 재생</span>
              </button>
              <button
                onClick={() => setIsFollowing(!isFollowing)}
                className={`bugs-button flex items-center space-x-2 ${
                  isFollowing ? "bugs-button-primary" : "bugs-button-secondary"
                }`}
              >
                <Plus className="w-4 h-4" />
                <span>{isFollowing ? "팔로잉" : "팔로우"}</span>
              </button>
              <button className="bugs-button bugs-button-secondary flex items-center space-x-2">
                <Heart className="w-4 h-4" />
                <span>좋아요</span>
              </button>
              <button className="bugs-button bugs-button-secondary flex items-center space-x-2">
                <Share2 className="w-4 h-4" />
                <span>공유</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                  activeTab === tab.id
                    ? "border-bugs-pink text-bugs-pink"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.name}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === "overview" && (
        <div className="space-y-8">
          {/* Artist Description */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">아티스트 소개</h2>
            <p className="text-gray-700 leading-relaxed">{artist.description}</p>
          </div>

          {/* Top Tracks */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">인기곡</h2>
            </div>
            <div className="divide-y divide-gray-200">
              {artist.topTracks.map((track, index) => (
                <div key={track.id} className="p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center space-x-4">
                    <span className="text-lg font-bold text-gray-500 w-8 text-center">
                      {index + 1}
                    </span>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2">
                        <h3 className="font-medium text-gray-900 truncate">
                          {track.title}
                        </h3>
                        {track.isTitle && (
                          <span className="text-xs bg-bugs-pink text-white px-2 py-0.5 rounded">
                            타이틀곡
                          </span>
                        )}
                      </div>
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <span>{track.album}</span>
                        <span>•</span>
                        <span>{track.duration}</span>
                        <span>•</span>
                        <span>{track.playCount.toLocaleString()} 회 재생</span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handlePlayTrack(track.id)}
                        className="p-2 text-gray-600 hover:text-bugs-pink hover:bg-pink-50 rounded-md transition-colors"
                      >
                        <Play className="w-4 h-4" />
                      </button>
                      <button className="p-2 text-gray-600 hover:text-bugs-pink hover:bg-pink-50 rounded-md transition-colors">
                        <Plus className="w-4 h-4" />
                      </button>
                      <button className="p-2 text-gray-600 hover:text-bugs-pink hover:bg-pink-50 rounded-md transition-colors">
                        <Heart className="w-4 h-4" />
                      </button>
                      <button className="p-2 text-gray-600 hover:text-bugs-pink hover:bg-pink-50 rounded-md transition-colors">
                        <MoreHorizontal className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === "albums" && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">앨범 ({artist.albums.length})</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {artist.albums.map((album) => (
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
                      <Play className="w-5 h-5 text-bugs-pink ml-0.5" />
                    </button>
                  </div>
                </div>
                <div className="space-y-1">
                  <h3 className="font-medium text-gray-900 hover:text-bugs-pink transition-colors line-clamp-1">
                    {album.title}
                  </h3>
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>{album.releaseDate}</span>
                    <span>{album.type}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {activeTab === "videos" && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">영상 ({artist.videos.length})</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {artist.videos.map((video) => (
              <div key={video.id} className="group cursor-pointer">
                <div className="relative aspect-video mb-3 overflow-hidden rounded-lg bg-gray-200">
                  <img
                    src={video.thumbnail}
                    alt={video.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 flex items-center justify-center">
                    <button className="w-12 h-12 bg-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transform scale-75 group-hover:scale-100 transition-all duration-300 shadow-lg">
                      <Play className="w-5 h-5 text-bugs-pink ml-0.5" />
                    </button>
                  </div>
                  <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                    {video.duration}
                  </div>
                </div>
                <div className="space-y-1">
                  <h3 className="font-medium text-gray-900 hover:text-bugs-pink transition-colors line-clamp-2">
                    {video.title}
                  </h3>
                  <p className="text-xs text-gray-500">
                    {video.views.toLocaleString()} 회 재생
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === "similar" && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">비슷한 아티스트</h2>
          <div className="text-center py-8 text-gray-500">
            <Users className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p>비슷한 아티스트 정보를 준비 중입니다.</p>
          </div>
        </div>
      )}
    </div>
  );
}

