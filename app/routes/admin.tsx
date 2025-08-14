import React, { useState } from "react";
import { Link, useLoaderData } from "@remix-run/react";
import { json, LoaderFunctionArgs, redirect } from "@remix-run/node";
import { validateSession } from "~/lib/auth";
import { db } from "~/lib/db";
import Layout from "~/components/Layout";
import {
  Users,
  Music,
  Video,
  Album,
  Mic,
  Settings,
  BarChart3,
  Shield,
  Plus,
  Edit,
  Trash2,
  Eye,
  CheckCircle,
  XCircle,
  Crown,
  Heart,
  Upload,
} from "lucide-react";

export async function loader({ request }: LoaderFunctionArgs) {
  const cookieHeader = request.headers.get("Cookie");
  const token = cookieHeader
    ?.split(";")
    .find((c) => c.trim().startsWith("auth_token="))
    ?.split("=")[1];

  if (!token) {
    return redirect("/login");
  }

  const user = await validateSession(token);
  if (!user || !user.isAdmin) {
    return redirect("/dashboard");
  }

  // Get admin statistics
  const [
    totalUsers,
    totalArtists,
    totalAlbums,
    totalSongs,
    totalUploads,
    pendingUploads,
    recentUsers,
    recentUploads,
  ] = await Promise.all([
    db.user.count(),
    db.artist.count(),
    db.album.count(),
    db.song.count(),
    db.upload.count(),
    db.upload.count({ where: { isApproved: false } }),
    db.user.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        username: true,
        email: true,
        isVip: true,
        role: true,
        createdAt: true,
      },
    }),
    db.upload.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      include: {
        user: {
          select: { username: true },
        },
      },
    }),
  ]);

  return json({
    user,
    stats: {
      totalUsers,
      totalArtists,
      totalAlbums,
      totalSongs,
      totalUploads,
      pendingUploads,
    },
    recentUsers,
    recentUploads,
  });
}

export default function AdminDashboard() {
  const { user, stats, recentUsers, recentUploads } =
    useLoaderData<typeof loader>();
  const [activeTab, setActiveTab] = useState<
    "overview" | "users" | "content" | "uploads"
  >("overview");

  const adminSections = [
    {
      id: "users",
      title: "사용자 관리",
      icon: Users,
      description: "사용자 계정, 역할, VIP 멤버십 관리",
      count: stats.totalUsers,
      color: "bg-blue-500",
    },
    {
      id: "artists",
      title: "아티스트 관리",
      icon: Mic,
      description: "아티스트 프로필, 인증, 정보 관리",
      count: stats.totalArtists,
      color: "bg-purple-500",
    },
    {
      id: "albums",
      title: "앨범 관리",
      icon: Album,
      description: "앨범 정보, 커버, 메타데이터 관리",
      count: stats.totalAlbums,
      color: "bg-green-500",
    },
    {
      id: "songs",
      title: "음악 관리",
      icon: Music,
      description: "음악 파일, 가사, 메타데이터 관리",
      count: stats.totalSongs,
      color: "bg-red-500",
    },
    {
      id: "videos",
      title: "비디오 관리",
      icon: Video,
      description: "뮤직비디오, 라이브 영상 관리",
      count: 0,
      color: "bg-orange-500",
    },
    {
      id: "uploads",
      title: "업로드 승인",
      icon: Upload,
      description: "사용자 업로드 검토 및 승인",
      count: stats.pendingUploads,
      color: "bg-yellow-500",
    },
  ];

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50">
        {/* Admin Header */}
        <div className="bg-gradient-to-r from-red-600 to-pink-600 text-white">
          <div className="max-w-7xl mx-auto px-4 py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Shield className="w-8 h-8" />
                <div>
                  <h1 className="text-2xl font-bold">
                    Snowlight 관리자 대시보드
                  </h1>
                  <p className="text-red-100">
                    안녕하세요, {user.name || user.username}님!
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2 bg-white/20 rounded-lg px-3 py-2">
                  <Crown className="w-5 h-5" />
                  <span className="text-sm font-medium">SUPER ADMIN</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white border-b">
          <div className="max-w-7xl mx-auto px-4">
            <nav className="flex space-x-8">
              {[
                { id: "overview", label: "개요", icon: BarChart3 },
                { id: "users", label: "사용자", icon: Users },
                { id: "content", label: "콘텐츠", icon: Music },
                { id: "uploads", label: "업로드 승인", icon: Upload },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center space-x-2 py-4 px-2 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? "border-red-500 text-red-600"
                      : "border-transparent text-gray-500 hover:text-gray-700"
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              ))}
            </nav>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 py-8">
          {activeTab === "overview" && (
            <div className="space-y-8">
              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {adminSections.map((section) => (
                  <div
                    key={section.id}
                    className="bg-white rounded-lg shadow p-6"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">
                          {section.title}
                        </p>
                        <p className="text-2xl font-bold text-gray-900">
                          {section.count.toLocaleString()}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {section.description}
                        </p>
                      </div>
                      <div className={`${section.color} rounded-lg p-3`}>
                        <section.icon className="w-6 h-6 text-white" />
                      </div>
                    </div>
                    <div className="mt-4">
                      <Link
                        to={`/admin/${section.id}`}
                        className="text-sm text-red-600 hover:text-red-800 font-medium"
                      >
                        관리하기 →
                      </Link>
                    </div>
                  </div>
                ))}
              </div>

              {/* Recent Activity */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Recent Users */}
                <div className="bg-white rounded-lg shadow">
                  <div className="px-6 py-4 border-b border-gray-200">
                    <h3 className="text-lg font-medium text-gray-900">
                      최근 가입 사용자
                    </h3>
                  </div>
                  <div className="p-6">
                    <div className="space-y-4">
                      {recentUsers.map((user) => (
                        <div
                          key={user.id}
                          className="flex items-center justify-between"
                        >
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {user.username}
                            </p>
                            <p className="text-xs text-gray-500">
                              {user.email}
                            </p>
                          </div>
                          <div className="flex items-center space-x-2">
                            {user.isVip && (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                VIP
                              </span>
                            )}
                            <span
                              className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                user.role === "ADMIN"
                                  ? "bg-red-100 text-red-800"
                                  : user.role === "MODERATOR"
                                  ? "bg-blue-100 text-blue-800"
                                  : "bg-gray-100 text-gray-800"
                              }`}
                            >
                              {user.role}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Recent Uploads */}
                <div className="bg-white rounded-lg shadow">
                  <div className="px-6 py-4 border-b border-gray-200">
                    <h3 className="text-lg font-medium text-gray-900">
                      최근 업로드
                    </h3>
                  </div>
                  <div className="p-6">
                    <div className="space-y-4">
                      {recentUploads.map((upload) => (
                        <div
                          key={upload.id}
                          className="flex items-center justify-between"
                        >
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {upload.title}
                            </p>
                            <p className="text-xs text-gray-500">
                              by {upload.user.username}
                            </p>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span
                              className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                upload.isApproved
                                  ? "bg-green-100 text-green-800"
                                  : "bg-yellow-100 text-yellow-800"
                              }`}
                            >
                              {upload.isApproved ? "승인됨" : "대기중"}
                            </span>
                            <span
                              className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                upload.type === "AUDIO"
                                  ? "bg-blue-100 text-blue-800"
                                  : "bg-purple-100 text-purple-800"
                              }`}
                            >
                              {upload.type}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "users" && (
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900">
                  사용자 관리
                </h3>
                <Link
                  to="/admin/users/new"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700"
                >
                  <Plus className="w-4 h-4 mr-2" />새 사용자 추가
                </Link>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <Link
                    to="/admin/users"
                    className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
                  >
                    <Users className="w-8 h-8 text-blue-500 mb-2" />
                    <h4 className="font-medium">모든 사용자</h4>
                    <p className="text-sm text-gray-500">사용자 계정 관리</p>
                  </Link>
                  <Link
                    to="/admin/users/roles"
                    className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
                  >
                    <Shield className="w-8 h-8 text-purple-500 mb-2" />
                    <h4 className="font-medium">역할 관리</h4>
                    <p className="text-sm text-gray-500">사용자 권한 설정</p>
                  </Link>
                  <Link
                    to="/admin/users/vip"
                    className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
                  >
                    <Crown className="w-8 h-8 text-yellow-500 mb-2" />
                    <h4 className="font-medium">VIP 관리</h4>
                    <p className="text-sm text-gray-500">VIP 멤버십 관리</p>
                  </Link>
                </div>
              </div>
            </div>
          )}

          {activeTab === "content" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Link
                  to="/admin/artists"
                  className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow"
                >
                  <Mic className="w-8 h-8 text-purple-500 mb-3" />
                  <h3 className="font-medium text-gray-900">아티스트</h3>
                  <p className="text-sm text-gray-500">아티스트 프로필 관리</p>
                  <p className="text-2xl font-bold text-purple-500 mt-2">
                    {stats.totalArtists}
                  </p>
                </Link>
                <Link
                  to="/admin/albums"
                  className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow"
                >
                  <Album className="w-8 h-8 text-green-500 mb-3" />
                  <h3 className="font-medium text-gray-900">앨범</h3>
                  <p className="text-sm text-gray-500">앨범 정보 관리</p>
                  <p className="text-2xl font-bold text-green-500 mt-2">
                    {stats.totalAlbums}
                  </p>
                </Link>
                <Link
                  to="/admin/songs"
                  className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow"
                >
                  <Music className="w-8 h-8 text-red-500 mb-3" />
                  <h3 className="font-medium text-gray-900">음악</h3>
                  <p className="text-sm text-gray-500">음악 파일 관리</p>
                  <p className="text-2xl font-bold text-red-500 mt-2">
                    {stats.totalSongs}
                  </p>
                </Link>
                <Link
                  to="/admin/videos"
                  className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow"
                >
                  <Video className="w-8 h-8 text-orange-500 mb-3" />
                  <h3 className="font-medium text-gray-900">비디오</h3>
                  <p className="text-sm text-gray-500">뮤직비디오 관리</p>
                  <p className="text-2xl font-bold text-orange-500 mt-2">0</p>
                </Link>
              </div>
            </div>
          )}

          {activeTab === "uploads" && (
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">
                  업로드 승인 대기
                </h3>
                <p className="text-sm text-gray-500">
                  사용자가 업로드한 콘텐츠를 검토하고 승인하세요
                </p>
              </div>
              <div className="p-6">
                {stats.pendingUploads > 0 ? (
                  <div className="space-y-4">
                    {recentUploads
                      .filter((upload) => !upload.isApproved)
                      .map((upload) => (
                        <div
                          key={upload.id}
                          className="border border-gray-200 rounded-lg p-4"
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="font-medium text-gray-900">
                                {upload.title}
                              </h4>
                              <p className="text-sm text-gray-500">
                                업로드: {upload.user.username} • {upload.type} •{" "}
                                {new Date(
                                  upload.createdAt
                                ).toLocaleDateString()}
                              </p>
                            </div>
                            <div className="flex items-center space-x-2">
                              <button className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700">
                                <CheckCircle className="w-4 h-4 mr-1" />
                                승인
                              </button>
                              <button className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700">
                                <XCircle className="w-4 h-4 mr-1" />
                                거부
                              </button>
                              <button className="inline-flex items-center px-3 py-1 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
                                <Eye className="w-4 h-4 mr-1" />
                                미리보기
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      승인 대기 중인 업로드가 없습니다
                    </h3>
                    <p className="text-gray-500">
                      모든 업로드가 처리되었습니다.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
