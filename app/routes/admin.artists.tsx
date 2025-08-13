import React, { useState } from 'react';
import { Link, useLoaderData, Form } from '@remix-run/react';
import { json, LoaderFunctionArgs, ActionFunctionArgs, redirect } from '@remix-run/node';
import { validateSession } from '~/lib/auth';
import { db } from '~/lib/db';
import Layout from '~/components/Layout';
import { 
  Mic, 
  Search, 
  Filter, 
  Edit, 
  Trash2, 
  CheckCircle, 
  XCircle,
  Plus,
  Users,
  Music,
  Album,
  Eye,
  Star,
  Globe,
  Calendar
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
  const verified = url.searchParams.get('verified') || '';

  const where: any = {};
  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { stageName: { contains: search, mode: 'insensitive' } }
    ];
  }
  if (genre) {
    where.genre = { contains: genre, mode: 'insensitive' };
  }
  if (verified === 'true') {
    where.isVerified = true;
  } else if (verified === 'false') {
    where.isVerified = false;
  }

  const [artists, totalArtists] = await Promise.all([
    db.artist.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: 50,
      include: {
        user: {
          select: {
            username: true,
            email: true
          }
        },
        _count: {
          select: {
            albums: true,
            songs: true
          }
        }
      }
    }),
    db.artist.count({ where })
  ]);

  return json({
    user,
    artists,
    totalArtists,
    filters: { search, genre, verified }
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
  const artistId = formData.get('artistId') as string;

  switch (action) {
    case 'toggleVerification':
      const currentArtist = await db.artist.findUnique({ where: { id: artistId } });
      await db.artist.update({
        where: { id: artistId },
        data: { isVerified: !currentArtist?.isVerified }
      });
      break;

    case 'deleteArtist':
      await db.artist.delete({ where: { id: artistId } });
      break;

    case 'createArtist':
      const name = formData.get('name') as string;
      const stageName = formData.get('stageName') as string;
      const genre = formData.get('genre') as string;
      const country = formData.get('country') as string;
      const bio = formData.get('bio') as string;
      
      await db.artist.create({
        data: {
          name,
          stageName,
          genre,
          country,
          bio
        }
      });
      break;
  }

  return redirect('/admin/artists');
}

export default function AdminArtists() {
  const { user, artists, totalArtists, filters } = useLoaderData<typeof loader>();
  const [showCreateForm, setShowCreateForm] = useState(false);

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white border-b">
          <div className="max-w-7xl mx-auto px-4 py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">아티스트 관리</h1>
                <p className="text-gray-600">총 {totalArtists.toLocaleString()}명의 아티스트</p>
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
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  새 아티스트 추가
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 py-8">
          {/* Create Artist Form */}
          {showCreateForm && (
            <div className="bg-white rounded-lg shadow mb-6">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">새 아티스트 추가</h3>
              </div>
              <Form method="post" className="p-6">
                <input type="hidden" name="action" value="createArtist" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">실명</label>
                    <input
                      type="text"
                      name="name"
                      required
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">예명</label>
                    <input
                      type="text"
                      name="stageName"
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">장르</label>
                    <input
                      type="text"
                      name="genre"
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">국가</label>
                    <input
                      type="text"
                      name="country"
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">소개</label>
                    <textarea
                      name="bio"
                      rows={3}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
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
                    className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
                  >
                    아티스트 추가
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
                      placeholder="아티스트명, 예명"
                      className="pl-10 w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
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
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">인증 상태</label>
                  <select
                    name="verified"
                    defaultValue={filters.verified}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="">모든 상태</option>
                    <option value="true">인증됨</option>
                    <option value="false">미인증</option>
                  </select>
                </div>
                <div className="flex items-end">
                  <button
                    type="submit"
                    className="w-full inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700"
                  >
                    <Filter className="w-4 h-4 mr-2" />
                    필터 적용
                  </button>
                </div>
              </Form>
            </div>
          </div>

          {/* Artists Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {artists.map((artist) => (
              <div key={artist.id} className="bg-white rounded-lg shadow overflow-hidden">
                <div className="relative">
                  {artist.coverImage ? (
                    <img 
                      src={artist.coverImage} 
                      alt={artist.name}
                      className="w-full h-48 object-cover"
                    />
                  ) : (
                    <div className="w-full h-48 bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center">
                      <Mic className="w-16 h-16 text-white" />
                    </div>
                  )}
                  {artist.isVerified && (
                    <div className="absolute top-4 right-4">
                      <div className="bg-blue-500 rounded-full p-1">
                        <CheckCircle className="w-4 h-4 text-white" />
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {artist.stageName || artist.name}
                    </h3>
                    {artist.isVerified ? (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        <Star className="w-3 h-3 mr-1" />
                        인증됨
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        미인증
                      </span>
                    )}
                  </div>
                  
                  {artist.stageName && artist.name !== artist.stageName && (
                    <p className="text-sm text-gray-600 mb-2">실명: {artist.name}</p>
                  )}
                  
                  <div className="flex items-center text-sm text-gray-500 mb-2">
                    {artist.genre && (
                      <span className="mr-4">{artist.genre}</span>
                    )}
                    {artist.country && (
                      <span className="flex items-center">
                        <Globe className="w-3 h-3 mr-1" />
                        {artist.country}
                      </span>
                    )}
                  </div>
                  
                  <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                    <span className="flex items-center">
                      <Album className="w-4 h-4 mr-1" />
                      앨범 {artist._count.albums}
                    </span>
                    <span className="flex items-center">
                      <Music className="w-4 h-4 mr-1" />
                      곡 {artist._count.songs}
                    </span>
                    <span className="flex items-center">
                      <Users className="w-4 h-4 mr-1" />
                      {artist.followers.toLocaleString()}
                    </span>
                  </div>
                  
                  {artist.user && (
                    <div className="text-xs text-gray-400 mb-4">
                      연결된 계정: {artist.user.username}
                    </div>
                  )}
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Link
                        to={`/admin/artists/${artist.id}/edit`}
                        className="text-indigo-600 hover:text-indigo-900"
                      >
                        <Edit className="w-4 h-4" />
                      </Link>
                      <Link
                        to={`/artist/${encodeURIComponent(artist.stageName || artist.name)}`}
                        className="text-green-600 hover:text-green-900"
                      >
                        <Eye className="w-4 h-4" />
                      </Link>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Form method="post" className="inline">
                        <input type="hidden" name="action" value="toggleVerification" />
                        <input type="hidden" name="artistId" value={artist.id} />
                        <button
                          type="submit"
                          className={`p-1 rounded ${
                            artist.isVerified 
                              ? 'text-red-600 hover:text-red-900' 
                              : 'text-blue-600 hover:text-blue-900'
                          }`}
                          title={artist.isVerified ? '인증 해제' : '인증 승인'}
                        >
                          {artist.isVerified ? <XCircle className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
                        </button>
                      </Form>
                      
                      <Form method="post" className="inline">
                        <input type="hidden" name="action" value="deleteArtist" />
                        <input type="hidden" name="artistId" value={artist.id} />
                        <button
                          type="submit"
                          className="text-red-600 hover:text-red-900 p-1 rounded"
                          onClick={(e) => {
                            if (!confirm('정말로 이 아티스트를 삭제하시겠습니까?')) {
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
              </div>
            ))}
          </div>

          {artists.length === 0 && (
            <div className="bg-white rounded-lg shadow p-8 text-center">
              <Mic className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">아티스트를 찾을 수 없습니다</h3>
              <p className="text-gray-500">검색 조건을 변경하거나 새 아티스트를 추가해보세요.</p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}

