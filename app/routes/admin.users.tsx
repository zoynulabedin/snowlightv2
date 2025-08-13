import React, { useState } from 'react';
import { Link, useLoaderData, Form } from '@remix-run/react';
import { json, LoaderFunctionArgs, ActionFunctionArgs, redirect } from '@remix-run/node';
import { validateSession } from '~/lib/auth';
import { db } from '~/lib/db';
import Layout from '~/components/Layout';
import { 
  Users, 
  Search, 
  Filter, 
  Edit, 
  Trash2, 
  Crown, 
  Shield, 
  Heart,
  Mail,
  Calendar,
  MoreVertical,
  UserPlus,
  Settings
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
  const role = url.searchParams.get('role') || '';
  const vip = url.searchParams.get('vip') || '';

  const where: any = {};
  if (search) {
    where.OR = [
      { username: { contains: search, mode: 'insensitive' } },
      { email: { contains: search, mode: 'insensitive' } },
      { name: { contains: search, mode: 'insensitive' } }
    ];
  }
  if (role) {
    where.role = role;
  }
  if (vip === 'true') {
    where.isVip = true;
  } else if (vip === 'false') {
    where.isVip = false;
  }

  const [users, totalUsers] = await Promise.all([
    db.user.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: 50,
      select: {
        id: true,
        username: true,
        email: true,
        name: true,
        avatar: true,
        role: true,
        isAdmin: true,
        isVip: true,
        vipType: true,
        hearts: true,
        followers: true,
        createdAt: true,
        _count: {
          select: {
            uploads: true,
            playlists: true
          }
        }
      }
    }),
    db.user.count({ where })
  ]);

  return json({
    user,
    users,
    totalUsers,
    filters: { search, role, vip }
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
  const userId = formData.get('userId') as string;

  switch (action) {
    case 'updateRole':
      const newRole = formData.get('role') as string;
      await db.user.update({
        where: { id: userId },
        data: { 
          role: newRole as any,
          isAdmin: newRole === 'ADMIN' || newRole === 'SUPER_ADMIN'
        }
      });
      break;

    case 'toggleVip':
      const currentUser = await db.user.findUnique({ where: { id: userId } });
      await db.user.update({
        where: { id: userId },
        data: { 
          isVip: !currentUser?.isVip,
          vipType: !currentUser?.isVip ? 'BASIC' : null
        }
      });
      break;

    case 'addHearts':
      const hearts = parseInt(formData.get('hearts') as string);
      await db.user.update({
        where: { id: userId },
        data: { hearts: { increment: hearts } }
      });
      break;

    case 'deleteUser':
      await db.user.delete({ where: { id: userId } });
      break;
  }

  return redirect('/admin/users');
}

export default function AdminUsers() {
  const { user, users, totalUsers, filters } = useLoaderData<typeof loader>();
  const [selectedUser, setSelectedUser] = useState<string | null>(null);

  const getRoleBadge = (role: string, isAdmin: boolean) => {
    if (isAdmin) {
      return (
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
          <Shield className="w-3 h-3 mr-1" />
          ADMIN
        </span>
      );
    }
    
    const colors = {
      USER: 'bg-gray-100 text-gray-800',
      MODERATOR: 'bg-blue-100 text-blue-800',
      ADMIN: 'bg-red-100 text-red-800',
      SUPER_ADMIN: 'bg-purple-100 text-purple-800'
    };
    
    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${colors[role as keyof typeof colors] || colors.USER}`}>
        {role}
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
                <h1 className="text-2xl font-bold text-gray-900">사용자 관리</h1>
                <p className="text-gray-600">총 {totalUsers.toLocaleString()}명의 사용자</p>
              </div>
              <div className="flex items-center space-x-4">
                <Link
                  to="/admin"
                  className="text-gray-600 hover:text-gray-900"
                >
                  ← 관리자 대시보드
                </Link>
                <Link
                  to="/admin/users/new"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700"
                >
                  <UserPlus className="w-4 h-4 mr-2" />
                  새 사용자 추가
                </Link>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 py-8">
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
                      placeholder="사용자명, 이메일, 이름"
                      className="pl-10 w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">역할</label>
                  <select
                    name="role"
                    defaultValue={filters.role}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
                  >
                    <option value="">모든 역할</option>
                    <option value="USER">일반 사용자</option>
                    <option value="MODERATOR">모더레이터</option>
                    <option value="ADMIN">관리자</option>
                    <option value="SUPER_ADMIN">슈퍼 관리자</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">VIP 상태</label>
                  <select
                    name="vip"
                    defaultValue={filters.vip}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
                  >
                    <option value="">모든 상태</option>
                    <option value="true">VIP 회원</option>
                    <option value="false">일반 회원</option>
                  </select>
                </div>
                <div className="flex items-end">
                  <button
                    type="submit"
                    className="w-full inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700"
                  >
                    <Filter className="w-4 h-4 mr-2" />
                    필터 적용
                  </button>
                </div>
              </Form>
            </div>
          </div>

          {/* Users Table */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      사용자
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      역할
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      VIP
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      하트
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      활동
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      가입일
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      작업
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {users.map((userData) => (
                    <tr key={userData.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            {userData.avatar ? (
                              <img className="h-10 w-10 rounded-full" src={userData.avatar} alt="" />
                            ) : (
                              <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                                <Users className="w-5 h-5 text-gray-600" />
                              </div>
                            )}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{userData.username}</div>
                            <div className="text-sm text-gray-500">{userData.email}</div>
                            {userData.name && (
                              <div className="text-xs text-gray-400">{userData.name}</div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getRoleBadge(userData.role, userData.isAdmin)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {userData.isVip ? (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                            <Crown className="w-3 h-3 mr-1" />
                            {userData.vipType}
                          </span>
                        ) : (
                          <span className="text-gray-400 text-sm">일반</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <Heart className="w-4 h-4 text-red-500 mr-1" />
                          <span className="text-sm text-gray-900">{userData.hearts.toLocaleString()}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div>업로드: {userData._count.uploads}</div>
                        <div>플레이리스트: {userData._count.playlists}</div>
                        <div>팔로워: {userData.followers}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(userData.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end space-x-2">
                          <Link
                            to={`/admin/users/${userData.id}/edit`}
                            className="text-indigo-600 hover:text-indigo-900"
                          >
                            <Edit className="w-4 h-4" />
                          </Link>
                          <Form method="post" className="inline">
                            <input type="hidden" name="action" value="deleteUser" />
                            <input type="hidden" name="userId" value={userData.id} />
                            <button
                              type="submit"
                              className="text-red-600 hover:text-red-900"
                              onClick={(e) => {
                                if (!confirm('정말로 이 사용자를 삭제하시겠습니까?')) {
                                  e.preventDefault();
                                }
                              }}
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </Form>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {users.length === 0 && (
            <div className="bg-white rounded-lg shadow p-8 text-center">
              <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">사용자를 찾을 수 없습니다</h3>
              <p className="text-gray-500">검색 조건을 변경해보세요.</p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}

