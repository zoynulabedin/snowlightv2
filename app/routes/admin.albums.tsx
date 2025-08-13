import React, { useState } from 'react';
import { Link, useLoaderData, Form } from '@remix-run/react';
import { json, LoaderFunctionArgs, ActionFunctionArgs, redirect } from '@remix-run/node';
import { validateSession } from '~/lib/auth';
import { db } from '~/lib/db';
import Layout from '~/components/Layout';
import { 
  Album, 
  Search, 
  Filter, 
  Edit, 
  Trash2, 
  Plus,
  Music,
  Calendar,
  Eye,
  Users,
  Play,
  Heart
} from 'lucide-react';

export async function loader({ request }: LoaderFunctionArgs) {
  const cookieHeader = request.headers.get('Cookie');
  const token = cookieHeader?.split(';')
    .find(c => c.trim().startsWith('auth_token='))
    ?.split('=')[1];

  if (!token) {
    return redirect('/login');
  }

  const user = await validateSession(token);
  if (!user || !user.isAdmin) {
    return redirect('/dashboard');
  }

  const url = new URL(request.url);
  const search = url.searchParams.get('search') || '';
  const genre = url.searchParams.get('genre') || '';
  const type = url.searchParams.get('type') || '';

  const where: any = {};
  if (search) {
    where.OR = [
      { title: { contains: search, mode: 'insensitive' } },
      { description: { contains: search, mode: 'insensitive' } }
    ];
  }
  if (genre) {
    where.genre = { contains: genre, mode: 'insensitive' };
  }
  if (type) {
    where.type = type;
  }

  const [albums, totalAlbums, artists] = await Promise.all([
    db.album.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: 50,
      include: {
        artists: {
          include: {
            artist: true
          }
        },
        _count: {
          select: {
            songs: true,
            favorites: true
          }
        }
      }
    }),
    db.album.count({ where }),
    db.artist.findMany({
      select: {
        id: true,
        name: true,
        stageName: true
      },
      orderBy: { name: 'asc' }
    })
  ]);

  return json({
    user,
    albums,
    totalAlbums,
    artists,
    filters: { search, genre, type }
  });
}

export async function action({ request }: ActionFunctionArgs) {
  const cookieHeader = request.headers.get('Cookie');
  const token = cookieHeader?.split(';')
    .find(c => c.trim().startsWith('auth_token='))
    ?.split('=')[1];

  if (!token) {
    return redirect('/login');
  }

  const user = await validateSession(token);
  if (!user || !user.isAdmin) {
    return redirect('/dashboard');
  }

  const formData = await request.formData();
  const action = formData.get('action');
  const albumId = formData.get('albumId') as string;

  switch (action) {
    case 'deleteAlbum':
      await db.album.delete({ where: { id: albumId } });
      break;

    case 'createAlbum':
      const title = formData.get('title') as string;
      const description = formData.get('description') as string;
      const genre = formData.get('genre') as string;
      const type = formData.get('type') as string;
      const releaseDate = formData.get('releaseDate') as string;
      const artistIds = formData.getAll('artistIds') as string[];
      
      const album = await db.album.create({
        data: {
          title,
          description,
          genre,
          type: type as any,
          releaseDate: releaseDate ? new Date(releaseDate) : null
        }
      });

      // Add artists to album
      for (const artistId of artistIds) {
        if (artistId) {
          await db.albumArtist.create({
            data: {
              albumId: album.id,
              artistId
            }
          });
        }
      }
      break;
  }

  return redirect('/admin/albums');
}

export default function AdminAlbums() {
  const { user, albums, totalAlbums, artists, filters } = useLoaderData<typeof loader>();
  const [showCreateForm, setShowCreateForm] = useState(false);

  const getAlbumTypeBadge = (type: string) => {
    const colors = {
      SINGLE: 'bg-blue-100 text-blue-800',
      EP: 'bg-green-100 text-green-800',
      ALBUM: 'bg-purple-100 text-purple-800',
      COMPILATION: 'bg-orange-100 text-orange-800',
      SOUNDTRACK: 'bg-red-100 text-red-800'
    };
    
    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${colors[type as keyof typeof colors] || colors.ALBUM}`}>
        {type}
      </span>
    );
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white border-b">
          <div className="max-w-7xl mx-auto px-4 py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">앨범 관리</h1>
                <p className="text-gray-600">총 {totalAlbums.toLocaleString()}개의 앨범</p>
              </div>
              <div className="flex items-center space-x-4">
                <Link
                  to="/admin"
                  className="text-gray-600 hover:text-gray-900"
                >
                  ← 관리자 대시보드
                </Link>
                <button
                  onClick={() => setShowCreateForm(true)}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  새 앨범 추가
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 py-8">
          {/* Create Album Form */}
          {showCreateForm && (
            <div className="bg-white rounded-lg shadow mb-6">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">새 앨범 추가</h3>
              </div>
              <Form method="post" className="p-6">
                <input type="hidden" name="action" value="createAlbum" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">앨범 제목</label>
                    <input
                      type="text"
                      name="title"
                      required
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">앨범 타입</label>
                    <select
                      name="type"
                      required
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                    >
                      <option value="SINGLE">싱글</option>
                      <option value="EP">EP</option>
                      <option value="ALBUM">정규앨범</option>
                      <option value="COMPILATION">컴필레이션</option>
                      <option value="SOUNDTRACK">사운드트랙</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">장르</label>
                    <input
                      type="text"
                      name="genre"
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">발매일</label>
                    <input
                      type="date"
                      name="releaseDate"
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">아티스트</label>
                    <select
                      name="artistIds"
                      multiple
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                      size={5}
                    >
                      {artists.map((artist) => (
                        <option key={artist.id} value={artist.id}>
                          {artist.stageName || artist.name}
                        </option>
                      ))}
                    </select>
                    <p className="text-xs text-gray-500 mt-1">Ctrl/Cmd 키를 누르고 클릭하여 여러 아티스트를 선택할 수 있습니다.</p>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">설명</label>
                    <textarea
                      name="description"
                      rows={3}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                </div>
                <div className="mt-6 flex items-center justify-end space-x-4">
                  <button
                    type="button"
                    onClick={() => setShowCreateForm(false)}
                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                  >
                    취소
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                  >
                    앨범 추가
                  </button>
                </div>
              </Form>
            </div>
          )}

          {/* Filters */}
          <div className="bg-white rounded-lg shadow mb-6">
            <div className="p-6">
              <Form method="get" className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">검색</label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="text"
                      name="search"
                      defaultValue={filters.search}
                      placeholder="앨범 제목, 설명"
                      className="pl-10 w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">장르</label>
                  <input
                    type="text"
                    name="genre"
                    defaultValue={filters.genre}
                    placeholder="장르 검색"
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">앨범 타입</label>
                  <select
                    name="type"
                    defaultValue={filters.type}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    <option value="">모든 타입</option>
                    <option value="SINGLE">싱글</option>
                    <option value="EP">EP</option>
                    <option value="ALBUM">정규앨범</option>
                    <option value="COMPILATION">컴필레이션</option>
                    <option value="SOUNDTRACK">사운드트랙</option>
                  </select>
                </div>
                <div className="flex items-end">
                  <button
                    type="submit"
                    className="w-full inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
                  >
                    <Filter className="w-4 h-4 mr-2" />
                    필터 적용
                  </button>
                </div>
              </Form>
            </div>
          </div>

          {/* Albums Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {albums.map((album) => (
              <div key={album.id} className="bg-white rounded-lg shadow overflow-hidden">
                <div className="relative">
                  {album.coverImage ? (
                    <img 
                      src={album.coverImage} 
                      alt={album.title}
                      className="w-full h-48 object-cover"
                    />
                  ) : (
                    <div className="w-full h-48 bg-gradient-to-br from-green-400 to-blue-400 flex items-center justify-center">
                      <Album className="w-16 h-16 text-white" />
                    </div>
                  )}
                  <div className="absolute top-4 left-4">
                    {getAlbumTypeBadge(album.type)}
                  </div>
                </div>
                
                <div className="p-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                    {album.title}
                  </h3>
                  
                  <div className="text-sm text-gray-600 mb-2">
                    {album.artists.map((albumArtist, index) => (
                      <span key={albumArtist.artist.id}>
                        {index > 0 && ', '}
                        {albumArtist.artist.stageName || albumArtist.artist.name}
                      </span>
                    ))}
                  </div>
                  
                  {album.genre && (
                    <div className="text-xs text-gray-500 mb-2">{album.genre}</div>
                  )}
                  
                  {album.releaseDate && (
                    <div className="flex items-center text-xs text-gray-500 mb-3">
                      <Calendar className="w-3 h-3 mr-1" />
                      {new Date(album.releaseDate).toLocaleDateString()}
                    </div>
                  )}
                  
                  <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                    <span className="flex items-center">
                      <Music className="w-4 h-4 mr-1" />
                      {album._count.songs}곡
                    </span>
                    <span className="flex items-center">
                      <Heart className="w-4 h-4 mr-1" />
                      {album._count.favorites}
                    </span>
                    <span className="flex items-center">
                      <Play className="w-4 h-4 mr-1" />
                      {album.plays.toLocaleString()}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Link
                        to={`/admin/albums/${album.id}/edit`}
                        className="text-indigo-600 hover:text-indigo-900"
                      >
                        <Edit className="w-4 h-4" />
                      </Link>
                      <Link
                        to={`/album/${album.id}`}
                        className="text-green-600 hover:text-green-900"
                      >
                        <Eye className="w-4 h-4" />
                      </Link>
                    </div>
                    
                    <Form method="post" className="inline">
                      <input type="hidden" name="action" value="deleteAlbum" />
                      <input type="hidden" name="albumId" value={album.id} />
                      <button
                        type="submit"
                        className="text-red-600 hover:text-red-900 p-1 rounded"
                        onClick={(e) => {
                          if (!confirm('정말로 이 앨범을 삭제하시겠습니까?')) {
                            e.preventDefault();
                          }
                        }}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </Form>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {albums.length === 0 && (
            <div className="bg-white rounded-lg shadow p-8 text-center">
              <Album className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">앨범을 찾을 수 없습니다</h3>
              <p className="text-gray-500">검색 조건을 변경하거나 새 앨범을 추가해보세요.</p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}

