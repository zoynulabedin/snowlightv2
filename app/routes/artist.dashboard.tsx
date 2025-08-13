import { json, LoaderFunctionArgs, ActionFunctionArgs } from "@remix-run/node";
import { useLoaderData, Form, Link } from "@remix-run/react";
import { useState } from "react";
import { validateSession } from "~/lib/auth";
import { db } from "~/lib/db";
import Layout from "~/components/Layout";

export async function loader({ request }: LoaderFunctionArgs) {
  const user = await validateSession(request);
  
  if (!user) {
    throw new Response("Unauthorized", { status: 401 });
  }

  // Get or create artist profile for the user
  let artist = await db.artist.findUnique({
    where: { userId: user.id },
    include: {
      albumArtists: {
        include: { album: true }
      },
      songArtists: {
        include: { song: true }
      }
    }
  });

  // If user doesn't have an artist profile, create one
  if (!artist) {
    artist = await db.artist.create({
      data: {
        userId: user.id,
        name: user.name || user.username,
        stageName: user.username
      },
      include: {
        albumArtists: {
          include: { album: true }
        },
        songArtists: {
          include: { song: true }
        }
      }
    });
  }

  // Get artist statistics
  const [totalSongs, totalAlbums, totalPlays, totalLikes] = await Promise.all([
    db.song.count({
      where: {
        artists: {
          some: { artistId: artist.id }
        }
      }
    }),
    db.album.count({
      where: {
        artists: {
          some: { artistId: artist.id }
        }
      }
    }),
    db.song.aggregate({
      where: {
        artists: {
          some: { artistId: artist.id }
        }
      },
      _sum: { plays: true }
    }),
    db.song.aggregate({
      where: {
        artists: {
          some: { artistId: artist.id }
        }
      },
      _sum: { likes: true }
    })
  ]);

  return json({
    user,
    artist,
    stats: {
      totalSongs,
      totalAlbums,
      totalPlays: totalPlays._sum.plays || 0,
      totalLikes: totalLikes._sum.likes || 0
    }
  });
}

export default function ArtistDashboard() {
  const { user, artist, stats } = useLoaderData<typeof loader>();
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50">
        {/* Artist Header */}
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white">
          <div className="max-w-7xl mx-auto px-4 py-8">
            <div className="flex items-center space-x-6">
              <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center">
                {artist.avatar ? (
                  <img src={artist.avatar} alt={artist.name} className="w-24 h-24 rounded-full object-cover" />
                ) : (
                  <span className="text-3xl">🎤</span>
                )}
              </div>
              <div>
                <h1 className="text-3xl font-bold">{artist.stageName || artist.name}</h1>
                <p className="text-purple-100">아티스트 대시보드</p>
                {artist.isVerified && (
                  <div className="flex items-center space-x-2 mt-2">
                    <span className="bg-blue-500 text-white px-2 py-1 rounded-full text-xs">✓ 인증됨</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white border-b">
          <div className="max-w-7xl mx-auto px-4">
            <nav className="flex space-x-8">
              {[
                { id: 'overview', name: '개요', icon: '📊' },
                { id: 'songs', name: '내 곡', icon: '🎵' },
                { id: 'albums', name: '내 앨범', icon: '💿' },
                { id: 'upload', name: '업로드', icon: '📤' },
                { id: 'profile', name: '프로필 설정', icon: '⚙️' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-purple-500 text-purple-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <span className="mr-2">{tab.icon}</span>
                  {tab.name}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-7xl mx-auto px-4 py-8">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-lg shadow">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                        <span className="text-white text-sm">🎵</span>
                      </div>
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">총 곡 수</p>
                      <p className="text-2xl font-semibold text-gray-900">{stats.totalSongs}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
                        <span className="text-white text-sm">💿</span>
                      </div>
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">총 앨범</p>
                      <p className="text-2xl font-semibold text-gray-900">{stats.totalAlbums}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center">
                        <span className="text-white text-sm">▶️</span>
                      </div>
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">총 재생 수</p>
                      <p className="text-2xl font-semibold text-gray-900">{stats.totalPlays.toLocaleString()}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-red-500 rounded-lg flex items-center justify-center">
                        <span className="text-white text-sm">❤️</span>
                      </div>
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">총 좋아요</p>
                      <p className="text-2xl font-semibold text-gray-900">{stats.totalLikes.toLocaleString()}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">빠른 작업</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <button
                    onClick={() => setActiveTab('upload')}
                    className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-center"
                  >
                    <div className="text-2xl mb-2">🎵</div>
                    <div className="text-sm font-medium">새 곡 업로드</div>
                  </button>
                  <button
                    onClick={() => setActiveTab('albums')}
                    className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-center"
                  >
                    <div className="text-2xl mb-2">💿</div>
                    <div className="text-sm font-medium">앨범 생성</div>
                  </button>
                  <button
                    onClick={() => setActiveTab('profile')}
                    className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-center"
                  >
                    <div className="text-2xl mb-2">⚙️</div>
                    <div className="text-sm font-medium">프로필 편집</div>
                  </button>
                  <Link
                    to={`/artist/${encodeURIComponent(artist.stageName || artist.name)}`}
                    className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-center"
                  >
                    <div className="text-2xl mb-2">👁️</div>
                    <div className="text-sm font-medium">공개 프로필 보기</div>
                  </Link>
                </div>
              </div>

              {/* Recent Activity */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">최근 곡</h3>
                  <div className="space-y-3">
                    {artist.songArtists.slice(0, 5).map((songArtist) => (
                      <div key={songArtist.id} className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-900">{songArtist.song.title}</p>
                          <p className="text-xs text-gray-500">{songArtist.role}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-gray-500">
                            {songArtist.song.plays.toLocaleString()} 재생
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">최근 앨범</h3>
                  <div className="space-y-3">
                    {artist.albumArtists.slice(0, 5).map((albumArtist) => (
                      <div key={albumArtist.id} className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-900">{albumArtist.album.title}</p>
                          <p className="text-xs text-gray-500">{albumArtist.album.type}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-gray-500">
                            {albumArtist.album.plays.toLocaleString()} 재생
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'songs' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-900">내 곡</h2>
                <button
                  onClick={() => setActiveTab('upload')}
                  className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700"
                >
                  새 곡 업로드
                </button>
              </div>
              <div className="bg-white rounded-lg shadow">
                <div className="p-6">
                  <div className="space-y-4">
                    {artist.songArtists.map((songArtist) => (
                      <div key={songArtist.id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="font-medium text-gray-900">{songArtist.song.title}</h3>
                            <p className="text-sm text-gray-500">
                              {songArtist.role} • {songArtist.song.genre || '장르 없음'}
                            </p>
                            <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                              <span>재생: {songArtist.song.plays.toLocaleString()}</span>
                              <span>좋아요: {songArtist.song.likes.toLocaleString()}</span>
                              <span>다운로드: {songArtist.song.downloads.toLocaleString()}</span>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className={`px-2 py-1 text-xs rounded-full ${
                              songArtist.song.isPublished 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-gray-100 text-gray-800'
                            }`}>
                              {songArtist.song.isPublished ? '공개' : '비공개'}
                            </span>
                            <span className={`px-2 py-1 text-xs rounded-full ${
                              songArtist.song.isApproved 
                                ? 'bg-blue-100 text-blue-800' 
                                : 'bg-yellow-100 text-yellow-800'
                            }`}>
                              {songArtist.song.isApproved ? '승인됨' : '대기중'}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'albums' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-900">내 앨범</h2>
                <Link
                  to="/artist/albums/new"
                  className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700"
                >
                  새 앨범 생성
                </Link>
              </div>
              <div className="bg-white rounded-lg shadow">
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {artist.albumArtists.map((albumArtist) => (
                      <div key={albumArtist.id} className="border border-gray-200 rounded-lg p-4">
                        <div className="aspect-square bg-gray-200 rounded-lg mb-4 flex items-center justify-center">
                          {albumArtist.album.coverImage ? (
                            <img 
                              src={albumArtist.album.coverImage} 
                              alt={albumArtist.album.title}
                              className="w-full h-full object-cover rounded-lg"
                            />
                          ) : (
                            <span className="text-4xl">💿</span>
                          )}
                        </div>
                        <h3 className="font-medium text-gray-900">{albumArtist.album.title}</h3>
                        <p className="text-sm text-gray-500">{albumArtist.album.type}</p>
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-xs text-gray-500">
                            {albumArtist.album.plays.toLocaleString()} 재생
                          </span>
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            albumArtist.album.isPublished 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {albumArtist.album.isPublished ? '공개' : '비공개'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'upload' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900">새 곡 업로드</h2>
              <div className="bg-white rounded-lg shadow p-6">
                <Link
                  to="/upload"
                  className="block w-full p-8 border-2 border-dashed border-gray-300 rounded-lg text-center hover:border-purple-500 hover:bg-purple-50"
                >
                  <div className="text-4xl mb-4">📤</div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">새 곡 업로드</h3>
                  <p className="text-gray-500">음악 파일을 업로드하고 정보를 입력하세요</p>
                </Link>
              </div>
            </div>
          )}

          {activeTab === 'profile' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900">프로필 설정</h2>
              <div className="bg-white rounded-lg shadow p-6">
                <Form method="post" className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        실명
                      </label>
                      <input
                        type="text"
                        defaultValue={artist.name}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        예명/활동명
                      </label>
                      <input
                        type="text"
                        defaultValue={artist.stageName || ''}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      아티스트 소개
                    </label>
                    <textarea
                      rows={4}
                      defaultValue={artist.bio || ''}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                      placeholder="자신에 대해 소개해주세요"
                    />
                  </div>

                  <div className="flex justify-end">
                    <button
                      type="submit"
                      className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700"
                    >
                      프로필 업데이트
                    </button>
                  </div>
                </Form>
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}

