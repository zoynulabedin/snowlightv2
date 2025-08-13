import {
  json,
  LoaderFunctionArgs,
  ActionFunctionArgs,
  redirect,
} from "@remix-run/node";
import {
  Form,
  Link,
  useLoaderData,
  useActionData,
  useNavigation,
} from "@remix-run/react";
import { useState, useEffect } from "react";
import {
  User,
  Search,
  Filter,
  Trash2,
  Shield,
  ShieldCheck,
  Crown,
  Settings,
  Mail,
  Calendar,
  UserPlus,
  Edit,
  Save,
  X,
} from "lucide-react";
import { validateSession } from "~/lib/auth";
import { db } from "~/lib/db";
import bcrypt from "bcryptjs";
import DashboardSidebar from "../components/DashboardSidebar";

// Define a user type for the dashboard
type DashboardUser = {
  id: string;
  email: string;
  username: string;
  name: string | null;
  avatar: string | null;
  role: string;
  isAdmin: boolean;
  isVip: boolean;
  vipType: string | null;
  hearts: number;
  createdAt: string;
  _count: {
    uploadedSongs: number;
    playlists: number;
    favorites: number;
  };
};

export async function loader({ request }: LoaderFunctionArgs) {
  const cookieHeader = request.headers.get("Cookie");
  const token = cookieHeader
    ?.split(";")
    .find((c) => c.trim().startsWith("auth-token="))
    ?.split("=")[1];

  if (!token) {
    return redirect("/login");
  }

  const user = await validateSession(token);
  if (!user) {
    return redirect("/login");
  }

  // Check if user has admin privileges
  if (user.role !== "ADMIN" && user.role !== "SUPER_ADMIN") {
    throw new Response("Forbidden", { status: 403 });
  }

  const url = new URL(request.url);
  const search = url.searchParams.get("search") || "";
  const roleFilter = url.searchParams.get("role") || "";

  const where = {
    ...(search && {
      OR: [
        { email: { contains: search, mode: "insensitive" as const } },
        { username: { contains: search, mode: "insensitive" as const } },
        { name: { contains: search, mode: "insensitive" as const } },
      ],
    }),
    ...(roleFilter && {
      role: roleFilter as "USER" | "MODERATOR" | "ADMIN" | "SUPER_ADMIN",
    }),
  };

  const [users, totalCount] = await Promise.all([
    db.user.findMany({
      where,
      select: {
        id: true,
        email: true,
        username: true,
        name: true,
        avatar: true,
        role: true,
        isAdmin: true,
        isVip: true,
        vipType: true,
        hearts: true,
        createdAt: true,
        _count: {
          select: {
            uploadedSongs: true,
            playlists: true,
            favorites: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 50,
    }),
    db.user.count({ where }),
  ]);

  return json({ users, totalCount, search, roleFilter, currentUser: user });
}

export async function action({ request }: ActionFunctionArgs) {
  const cookieHeader = request.headers.get("Cookie");
  const token = cookieHeader
    ?.split(";")
    .find((c) => c.trim().startsWith("auth-token="))
    ?.split("=")[1];

  if (!token) {
    return redirect("/login");
  }

  const user = await validateSession(token);
  if (!user) {
    return redirect("/login");
  }

  // Check if user has admin privileges
  if (user.role !== "ADMIN" && user.role !== "SUPER_ADMIN") {
    return json({ error: "권한이 없습니다." });
  }

  const formData = await request.formData();
  const intent = formData.get("intent") as string;
  const userId = formData.get("userId") as string;

  try {
    switch (intent) {
      case "create-user": {
        const email = formData.get("email") as string;
        const username = formData.get("username") as string;
        const password = formData.get("password") as string;
        const name = formData.get("name") as string;
        const role = formData.get("role") as string;
        const isVip = formData.get("isVip") === "true";

        // Validate input
        if (!email || !username || !password) {
          return json({
            error: "이메일, 사용자 이름 및 비밀번호는 필수 입력 사항입니다.",
          });
        }

        // Check if email or username already exists
        const existingUser = await db.user.findFirst({
          where: {
            OR: [{ email }, { username }],
          },
        });

        if (existingUser) {
          return json({
            error: "이미 사용 중인 이메일 또는 사용자 이름입니다.",
          });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create user
        const newUser = await db.user.create({
          data: {
            email,
            username,
            password: hashedPassword,
            name: name || username,
            role: role
              ? (role as "USER" | "MODERATOR" | "ADMIN" | "SUPER_ADMIN")
              : "USER",
            isAdmin: ["ADMIN", "SUPER_ADMIN"].includes(role),
            isVip,
            vipType: isVip ? "BASIC" : null,
            vipExpiry: isVip
              ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
              : null,
          },
        });

        return json({
          success: true,
          message: "사용자가 성공적으로 생성되었습니다.",
          userId: newUser.id,
        });
      }

      case "update-user": {
        const email = formData.get("email") as string;
        const username = formData.get("username") as string;
        const name = formData.get("name") as string;
        const password = formData.get("password") as string;

        // Validate input
        if (!email || !username) {
          return json({
            error: "이메일과 사용자 이름은 필수 입력 사항입니다.",
          });
        }

        // Check if email or username already exists (excluding current user)
        const existingUser = await db.user.findFirst({
          where: {
            OR: [{ email }, { username }],
            NOT: {
              id: userId,
            },
          },
        });

        if (existingUser) {
          return json({
            error: "이미 사용 중인 이메일 또는 사용자 이름입니다.",
          });
        }

        // Prepare update data
        const updateData: {
          email: string;
          username: string;
          name: string;
          password?: string;
        } = {
          email,
          username,
          name: name || username,
        };

        // Only update password if provided and not empty
        if (password && password.trim() !== "") {
          if (password.length < 6) {
            return json({ error: "비밀번호는 최소 6자 이상이어야 합니다." });
          }
          updateData.password = await bcrypt.hash(password, 10);
        }

        // Update user
        await db.user.update({
          where: { id: userId },
          data: updateData,
        });

        return json({
          success: true,
          message: "사용자 정보가 성공적으로 업데이트되었습니다.",
        });
      }

      case "change-role": {
        const newRole = formData.get("newRole") as string;

        if (!["USER", "MODERATOR", "ADMIN", "SUPER_ADMIN"].includes(newRole)) {
          return json({ error: "유효하지 않은 역할입니다." });
        }

        // Prevent changing own role if SUPER_ADMIN
        if (userId === user.id && user.role === "SUPER_ADMIN") {
          return json({
            error: "슈퍼 관리자는 자신의 역할을 변경할 수 없습니다.",
          });
        }

        // Only SUPER_ADMIN can assign SUPER_ADMIN role
        if (newRole === "SUPER_ADMIN" && user.role !== "SUPER_ADMIN") {
          return json({
            error: "슈퍼 관리자만 슈퍼 관리자 역할을 부여할 수 있습니다.",
          });
        }

        await db.user.update({
          where: { id: userId },
          data: {
            role: newRole as "USER" | "MODERATOR" | "ADMIN" | "SUPER_ADMIN",
            isAdmin: ["ADMIN", "SUPER_ADMIN"].includes(newRole),
          },
        });

        return json({
          success: true,
          message: "사용자 역할이 변경되었습니다.",
        });
      }

      case "toggle-vip": {
        const targetUser = await db.user.findUnique({
          where: { id: userId },
        });

        if (!targetUser) {
          return json({ error: "사용자를 찾을 수 없습니다." });
        }

        await db.user.update({
          where: { id: userId },
          data: {
            isVip: !targetUser.isVip,
            vipType: !targetUser.isVip ? "BASIC" : null,
            vipExpiry: !targetUser.isVip
              ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
              : null, // 30 days
          },
        });

        return json({
          success: true,
          message: !targetUser.isVip
            ? "VIP 멤버십이 활성화되었습니다."
            : "VIP 멤버십이 비활성화되었습니다.",
        });
      }

      case "make-admin": {
        // Check if the current user is a super admin
        if (user.role !== "SUPER_ADMIN") {
          return json({
            error: "슈퍼 관리자만 다른 사용자를 관리자로 승격할 수 있습니다.",
          });
        }

        // Get the target user
        const targetUser = await db.user.findUnique({
          where: { id: userId },
        });

        if (!targetUser) {
          return json({ error: "사용자를 찾을 수 없습니다." });
        }

        // Check if user is already admin or super admin
        if (targetUser.role === "ADMIN" || targetUser.role === "SUPER_ADMIN") {
          return json({
            error: "이 사용자는 이미 관리자 권한을 가지고 있습니다.",
          });
        }

        // Promote to admin
        await db.user.update({
          where: { id: userId },
          data: {
            role: "ADMIN",
            isAdmin: true,
          },
        });

        return json({
          success: true,
          message: "사용자가 성공적으로 관리자로 승격되었습니다.",
        });
      }

      case "delete": {
        // Prevent deleting super admin
        const targetUser = await db.user.findUnique({
          where: { id: userId },
        });

        if (targetUser?.role === "SUPER_ADMIN") {
          return json({ error: "슈퍼 관리자는 삭제할 수 없습니다." });
        }

        if (userId === user.id) {
          return json({ error: "자신을 삭제할 수 없습니다." });
        }

        await db.user.delete({
          where: { id: userId },
        });

        return json({ success: true, message: "사용자가 삭제되었습니다." });
      }

      default:
        return json({ error: "잘못된 요청입니다." });
    }
  } catch (error) {
    console.error("Error in user management action:", error);
    return json({ error: "오류가 발생했습니다." });
  }
}

export default function DashboardUsers() {
  const { users, user, search, roleFilter, currentUser } =
    useLoaderData<typeof loader>();
  const actionData = useActionData<{
    error?: string;
    success?: boolean;
    message?: string;
  }>();
  const navigation = useNavigation();
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [adminPromoteConfirm, setAdminPromoteConfirm] = useState<string | null>(
    null
  );
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingUser, setEditingUser] = useState<DashboardUser | null>(null);
  const [viewingUser, setViewingUser] = useState<DashboardUser | null>(null);
  const [recentlyPromoted, setRecentlyPromoted] = useState<string | null>(null);

  // Close modals on successful action
  useEffect(() => {
    if (actionData?.success) {
      // Store userId before resetting states
      const userId = adminPromoteConfirm;

      setShowCreateModal(false);
      setEditingUser(null);
      setDeleteConfirm(null);
      setAdminPromoteConfirm(null);
      setViewingUser(null);

      // If action was make-admin, set recently promoted
      if (
        actionData.message &&
        actionData.message.includes("관리자로 승격") &&
        userId
      ) {
        setRecentlyPromoted(userId);

        // Clear the recently promoted status after 5 seconds
        setTimeout(() => {
          setRecentlyPromoted(null);
        }, 5000);
      }
    }
  }, [actionData, adminPromoteConfirm]);

  const roleStats = {
    USER: users.filter((u) => u.role === "USER").length,
    MODERATOR: users.filter((u) => u.role === "MODERATOR").length,
    ADMIN: users.filter((u) => u.role === "ADMIN").length,
    SUPER_ADMIN: users.filter((u) => u.role === "SUPER_ADMIN").length,
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "SUPER_ADMIN":
        return <ShieldCheck className="w-4 h-4 text-red-600" />;
      case "ADMIN":
        return <Shield className="w-4 h-4 text-orange-600" />;
      case "MODERATOR":
        return <Settings className="w-4 h-4 text-blue-600" />;
      default:
        return <User className="w-4 h-4 text-gray-600" />;
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "SUPER_ADMIN":
        return "bg-red-100 text-red-800";
      case "ADMIN":
        return "bg-orange-100 text-orange-800";
      case "MODERATOR":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="min-h-screen flex bg-gray-50 w-full">
      <DashboardSidebar user={user} />
      {/* Header */}
      <div className="w-full">
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  사용자 관리
                </h1>
                <p className="text-gray-600 mt-1">
                  사용자 역할과 권한을 관리하세요
                </p>
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                >
                  <UserPlus className="w-4 h-4 mr-2" />새 사용자 생성
                </button>
                <Link
                  to="/dashboard"
                  className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                >
                  ← 대시보드로 돌아가기
                </Link>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 py-8">
          {/* Action Messages */}
          {actionData && "error" in actionData && (
            <div className="bg-red-50 border border-red-300 rounded-md p-4 mb-4">
              <p className="text-sm text-red-700">{actionData.error}</p>
            </div>
          )}
          {actionData && "success" in actionData && (
            <div className="bg-green-50 border border-green-300 rounded-md p-4 mb-4">
              <p className="text-sm text-green-700">
                {actionData.message || "작업이 완료되었습니다."}
              </p>
            </div>
          )}

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <User className="h-8 w-8 text-gray-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">
                    일반 사용자
                  </p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {roleStats.USER}
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <Settings className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">
                    모더레이터
                  </p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {roleStats.MODERATOR}
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <Shield className="h-8 w-8 text-orange-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">관리자</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {roleStats.ADMIN}
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <ShieldCheck className="h-8 w-8 text-red-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">
                    슈퍼 관리자
                  </p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {roleStats.SUPER_ADMIN}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-white rounded-lg shadow mb-6">
            <div className="p-6">
              <Form
                method="get"
                className="grid grid-cols-1 md:grid-cols-3 gap-4"
              >
                <div>
                  <label
                    htmlFor="search"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    검색
                  </label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="text"
                      id="search"
                      name="search"
                      defaultValue={search}
                      placeholder="이메일, 사용자명, 이름..."
                      className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="role"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    역할
                  </label>
                  <select
                    id="role"
                    name="role"
                    defaultValue={roleFilter}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  >
                    <option value="">모든 역할</option>
                    <option value="USER">일반 사용자</option>
                    <option value="MODERATOR">모더레이터</option>
                    <option value="ADMIN">관리자</option>
                    <option value="SUPER_ADMIN">슈퍼 관리자</option>
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
          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <ul className="divide-y divide-gray-200">
              {users.map((user) => (
                <li
                  key={user.id}
                  className={`px-6 py-4 ${
                    recentlyPromoted === user.id
                      ? "bg-orange-50 transition-colors duration-500"
                      : ""
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="flex-shrink-0">
                        <button
                          className="bg-transparent border-0 p-0 focus:outline-none focus:ring-2 focus:ring-red-500 rounded-full"
                          onClick={() => setViewingUser(user)}
                          aria-label="View user profile"
                        >
                          {user.avatar ? (
                            <img
                              className="h-10 w-10 rounded-full"
                              src={user.avatar}
                              alt={`${user.name || user.username}'s profile`}
                            />
                          ) : (
                            <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                              <User className="h-6 w-6 text-gray-600" />
                            </div>
                          )}
                        </button>
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2">
                          <button
                            className="bg-transparent border-0 p-0 text-sm font-medium text-gray-900 truncate hover:text-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 rounded"
                            onClick={() => setViewingUser(user)}
                            aria-label="View user profile"
                          >
                            {user.name || user.username}
                          </button>
                          {getRoleIcon(user.role)}
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleBadgeColor(
                              user.role
                            )}`}
                          >
                            {user.role}
                          </span>
                          {user.isVip && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                              <Crown className="w-3 h-3 mr-1" />
                              VIP
                            </span>
                          )}
                          {recentlyPromoted === user.id && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 animate-pulse">
                              방금 승격됨
                            </span>
                          )}
                        </div>

                        <div className="flex items-center space-x-4 mt-1">
                          <div className="flex items-center text-sm text-gray-500">
                            <Mail className="w-4 h-4 mr-1" />
                            {user.email}
                          </div>
                          <div className="flex items-center text-sm text-gray-500">
                            <Calendar className="w-4 h-4 mr-1" />
                            {new Date(user.createdAt).toLocaleDateString()}
                          </div>
                        </div>

                        <div className="flex items-center space-x-4 mt-1 text-xs text-gray-500">
                          <span>음악: {user._count.uploadedSongs}개</span>
                          <span>플레이리스트: {user._count.playlists}개</span>
                          <span>하트: {user.hearts}개</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      {/* Role Change */}
                      <Form method="post" className="inline">
                        <input
                          type="hidden"
                          name="intent"
                          value="change-role"
                        />
                        <input type="hidden" name="userId" value={user.id} />
                        <select
                          name="newRole"
                          defaultValue={user.role}
                          onChange={(e) => e.target.form?.requestSubmit()}
                          className="text-xs border border-gray-300 rounded px-2 py-1"
                          disabled={
                            user.id === currentUser.id &&
                            currentUser.role === "SUPER_ADMIN"
                          }
                        >
                          <option value="USER">USER</option>
                          <option value="MODERATOR">MODERATOR</option>
                          <option value="ADMIN">ADMIN</option>
                          {currentUser.role === "SUPER_ADMIN" && (
                            <option value="SUPER_ADMIN">SUPER_ADMIN</option>
                          )}
                        </select>
                      </Form>

                      {/* VIP Toggle */}
                      <Form method="post" className="inline">
                        <input type="hidden" name="intent" value="toggle-vip" />
                        <input type="hidden" name="userId" value={user.id} />
                        <button
                          type="submit"
                          className={`text-xs px-2 py-1 rounded ${
                            user.isVip
                              ? "bg-yellow-100 text-yellow-800 hover:bg-yellow-200"
                              : "bg-gray-100 text-gray-800 hover:bg-gray-200"
                          }`}
                          disabled={navigation.state === "submitting"}
                        >
                          {user.isVip ? "VIP 해제" : "VIP 설정"}
                        </button>
                      </Form>

                      {/* Edit User */}
                      <button
                        onClick={() => setEditingUser(user)}
                        className="text-blue-600 hover:text-blue-900 text-xs px-2 py-1 bg-blue-100 rounded flex items-center"
                      >
                        <Edit className="w-3 h-3 mr-1" />
                        편집
                      </button>

                      {/* Make Admin (only shown to super admins for non-admin users) */}
                      {currentUser.role === "SUPER_ADMIN" &&
                        user.role !== "ADMIN" &&
                        user.role !== "SUPER_ADMIN" &&
                        (adminPromoteConfirm === user.id ? (
                          <div className="flex items-center space-x-1">
                            <Form method="post" className="inline">
                              <input
                                type="hidden"
                                name="intent"
                                value="make-admin"
                              />
                              <input
                                type="hidden"
                                name="userId"
                                value={user.id}
                              />
                              <button
                                type="submit"
                                className="text-orange-600 hover:text-orange-900 text-xs px-2 py-1 bg-orange-100 rounded"
                                disabled={navigation.state === "submitting"}
                              >
                                확인
                              </button>
                            </Form>
                            <button
                              onClick={() => setAdminPromoteConfirm(null)}
                              className="text-gray-600 hover:text-gray-900 text-xs px-2 py-1 bg-gray-100 rounded"
                            >
                              취소
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setAdminPromoteConfirm(user.id)}
                            className="text-orange-600 hover:text-orange-900 text-xs px-2 py-1 bg-orange-100 rounded flex items-center"
                          >
                            <Shield className="w-3 h-3 mr-1" />
                            관리자로 승격
                          </button>
                        ))}

                      {/* Delete */}
                      {deleteConfirm === user.id ? (
                        <div className="flex items-center space-x-1">
                          <Form method="post" className="inline">
                            <input type="hidden" name="intent" value="delete" />
                            <input
                              type="hidden"
                              name="userId"
                              value={user.id}
                            />
                            <button
                              type="submit"
                              className="text-red-600 hover:text-red-900 text-xs px-2 py-1 bg-red-100 rounded"
                              disabled={navigation.state === "submitting"}
                            >
                              확인
                            </button>
                          </Form>
                          <button
                            onClick={() => setDeleteConfirm(null)}
                            className="text-gray-600 hover:text-gray-900 text-xs px-2 py-1 bg-gray-100 rounded"
                          >
                            취소
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setDeleteConfirm(user.id)}
                          className="text-red-600 hover:text-red-900"
                          disabled={
                            user.role === "SUPER_ADMIN" ||
                            user.id === currentUser.id
                          }
                          title={
                            user.role === "SUPER_ADMIN"
                              ? "슈퍼 관리자는 삭제할 수 없습니다"
                              : user.id === currentUser.id
                              ? "자신을 삭제할 수 없습니다"
                              : "삭제"
                          }
                        >
                          <Trash2
                            className={`w-4 h-4 ${
                              user.role === "SUPER_ADMIN" ||
                              user.id === currentUser.id
                                ? "opacity-50"
                                : ""
                            }`}
                          />
                        </button>
                      )}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {users.length === 0 && (
            <div className="text-center py-12">
              <User className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">
                사용자가 없습니다
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                검색 조건을 변경해보세요.
              </p>
            </div>
          )}
        </div>

        {/* Create User Modal */}
        {showCreateModal && (
          <div className="fixed z-10 inset-0 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
              <div
                className="fixed inset-0 transition-opacity"
                aria-hidden="true"
              >
                <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
              </div>

              <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <div className="sm:flex sm:items-start">
                    <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 sm:mx-0 sm:h-10 sm:w-10">
                      <UserPlus className="h-6 w-6 text-blue-600" />
                    </div>
                    <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                      <h3 className="text-lg leading-6 font-medium text-gray-900">
                        새 사용자 생성
                      </h3>
                      <div className="mt-4">
                        <Form method="post" className="space-y-4">
                          <input
                            type="hidden"
                            name="intent"
                            value="create-user"
                          />

                          <div>
                            <label
                              htmlFor="email"
                              className="block text-sm font-medium text-gray-700"
                            >
                              이메일
                            </label>
                            <input
                              type="email"
                              name="email"
                              id="email"
                              required
                              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm"
                            />
                          </div>

                          <div>
                            <label
                              htmlFor="username"
                              className="block text-sm font-medium text-gray-700"
                            >
                              사용자 이름
                            </label>
                            <input
                              type="text"
                              name="username"
                              id="username"
                              required
                              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm"
                            />
                          </div>

                          <div>
                            <label
                              htmlFor="name"
                              className="block text-sm font-medium text-gray-700"
                            >
                              이름
                            </label>
                            <input
                              type="text"
                              name="name"
                              id="name"
                              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm"
                            />
                          </div>

                          <div>
                            <label
                              htmlFor="password"
                              className="block text-sm font-medium text-gray-700"
                            >
                              비밀번호
                            </label>
                            <input
                              type="password"
                              name="password"
                              id="password"
                              required
                              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm"
                            />
                          </div>

                          <div>
                            <label
                              htmlFor="role"
                              className="block text-sm font-medium text-gray-700"
                            >
                              역할
                            </label>
                            <select
                              id="role"
                              name="role"
                              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm rounded-md"
                            >
                              <option value="USER">일반 사용자</option>
                              <option value="MODERATOR">모더레이터</option>
                              <option value="ADMIN">관리자</option>
                              {currentUser.role === "SUPER_ADMIN" && (
                                <option value="SUPER_ADMIN">슈퍼 관리자</option>
                              )}
                            </select>
                          </div>

                          <div className="flex items-center">
                            <input
                              id="isVip"
                              name="isVip"
                              type="checkbox"
                              value="true"
                              className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                            />
                            <label
                              htmlFor="isVip"
                              className="ml-2 block text-sm text-gray-900"
                            >
                              VIP 회원으로 설정
                            </label>
                          </div>

                          <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                            <button
                              type="submit"
                              className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm"
                              disabled={navigation.state === "submitting"}
                            >
                              {navigation.state === "submitting"
                                ? "처리 중..."
                                : "생성"}
                            </button>
                            <button
                              type="button"
                              className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:w-auto sm:text-sm"
                              onClick={() => setShowCreateModal(false)}
                            >
                              취소
                            </button>
                          </div>
                        </Form>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Edit User Modal */}
        {editingUser && (
          <div className="fixed z-10 inset-0 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
              <div
                className="fixed inset-0 transition-opacity"
                aria-hidden="true"
              >
                <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
              </div>

              <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <div className="sm:flex sm:items-start">
                    <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 sm:mx-0 sm:h-10 sm:w-10">
                      <Edit className="h-6 w-6 text-blue-600" />
                    </div>
                    <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                      <h3 className="text-lg leading-6 font-medium text-gray-900">
                        사용자 정보 편집
                      </h3>
                      <div className="mt-4">
                        <Form method="post" className="space-y-4">
                          <input
                            type="hidden"
                            name="intent"
                            value="update-user"
                          />
                          <input
                            type="hidden"
                            name="userId"
                            value={editingUser.id}
                          />

                          <div>
                            <label
                              htmlFor="email"
                              className="block text-sm font-medium text-gray-700"
                            >
                              이메일
                            </label>
                            <input
                              type="email"
                              name="email"
                              id="email"
                              defaultValue={editingUser.email}
                              required
                              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm"
                            />
                          </div>

                          <div>
                            <label
                              htmlFor="username"
                              className="block text-sm font-medium text-gray-700"
                            >
                              사용자 이름
                            </label>
                            <input
                              type="text"
                              name="username"
                              id="username"
                              defaultValue={editingUser.username}
                              required
                              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm"
                            />
                          </div>

                          <div>
                            <label
                              htmlFor="name"
                              className="block text-sm font-medium text-gray-700"
                            >
                              이름
                            </label>
                            <input
                              type="text"
                              name="name"
                              id="name"
                              defaultValue={editingUser.name || ""}
                              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm"
                            />
                          </div>

                          <div>
                            <label
                              htmlFor="password"
                              className="block text-sm font-medium text-gray-700"
                            >
                              새 비밀번호 (비워두면 변경되지 않음)
                            </label>
                            <input
                              type="password"
                              name="password"
                              id="password"
                              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm"
                            />
                          </div>

                          <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                            <button
                              type="submit"
                              className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm"
                              disabled={navigation.state === "submitting"}
                            >
                              {navigation.state === "submitting"
                                ? "처리 중..."
                                : "저장"}
                            </button>
                            <button
                              type="button"
                              className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:w-auto sm:text-sm"
                              onClick={() => setEditingUser(null)}
                            >
                              취소
                            </button>
                          </div>
                        </Form>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* User Profile Modal */}
        {viewingUser && (
          <div className="fixed z-10 inset-0 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
              <div
                className="fixed inset-0 transition-opacity"
                aria-hidden="true"
              >
                <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
              </div>

              <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center">
                      <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                        <User className="h-6 w-6 text-red-600" />
                      </div>
                      <h3 className="ml-3 text-lg leading-6 font-medium text-gray-900">
                        사용자 정보
                      </h3>
                    </div>
                    <button
                      type="button"
                      className="bg-white rounded-md text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                      onClick={() => setViewingUser(null)}
                    >
                      <span className="sr-only">닫기</span>
                      <X className="h-6 w-6" />
                    </button>
                  </div>

                  <div className="mt-3 sm:mt-5">
                    <div className="flex flex-col items-center mb-6">
                      {viewingUser.avatar ? (
                        <img
                          className="h-24 w-24 rounded-full mb-3"
                          src={viewingUser.avatar}
                          alt={`${
                            viewingUser.name || viewingUser.username
                          }'s profile`}
                        />
                      ) : (
                        <div className="h-24 w-24 rounded-full bg-gray-300 flex items-center justify-center mb-3">
                          <User className="h-12 w-12 text-gray-600" />
                        </div>
                      )}
                      <h4 className="text-xl font-bold">
                        {viewingUser.name || viewingUser.username}
                      </h4>
                      <div className="flex items-center mt-1">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleBadgeColor(
                            viewingUser.role
                          )}`}
                        >
                          {viewingUser.role}
                        </span>
                        {viewingUser.isVip && (
                          <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                            <Crown className="w-3 h-3 mr-1" />
                            VIP
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="border-t border-gray-200 py-4">
                      <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
                        <div className="sm:col-span-1">
                          <dt className="text-sm font-medium text-gray-500">
                            이메일
                          </dt>
                          <dd className="mt-1 text-sm text-gray-900 flex items-center">
                            <Mail className="w-4 h-4 mr-1 text-gray-400" />
                            {viewingUser.email}
                          </dd>
                        </div>
                        <div className="sm:col-span-1">
                          <dt className="text-sm font-medium text-gray-500">
                            사용자 이름
                          </dt>
                          <dd className="mt-1 text-sm text-gray-900">
                            @{viewingUser.username}
                          </dd>
                        </div>
                        <div className="sm:col-span-1">
                          <dt className="text-sm font-medium text-gray-500">
                            가입일
                          </dt>
                          <dd className="mt-1 text-sm text-gray-900 flex items-center">
                            <Calendar className="w-4 h-4 mr-1 text-gray-400" />
                            {new Date(
                              viewingUser.createdAt
                            ).toLocaleDateString()}
                          </dd>
                        </div>
                        <div className="sm:col-span-1">
                          <dt className="text-sm font-medium text-gray-500">
                            하트 수
                          </dt>
                          <dd className="mt-1 text-sm text-gray-900">
                            {viewingUser.hearts} 개
                          </dd>
                        </div>
                      </dl>
                    </div>

                    <div className="border-t border-gray-200 py-4">
                      <h4 className="text-sm font-medium text-gray-500 mb-3">
                        활동 통계
                      </h4>
                      <div className="grid grid-cols-3 gap-4">
                        <div className="bg-gray-50 rounded-lg p-3 text-center">
                          <p className="text-xs text-gray-500">업로드한 음악</p>
                          <p className="text-xl font-bold">
                            {viewingUser._count.uploadedSongs}
                          </p>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-3 text-center">
                          <p className="text-xs text-gray-500">플레이리스트</p>
                          <p className="text-xl font-bold">
                            {viewingUser._count.playlists}
                          </p>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-3 text-center">
                          <p className="text-xs text-gray-500">좋아요한 음악</p>
                          <p className="text-xl font-bold">
                            {viewingUser._count.favorites}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                  <button
                    type="button"
                    className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:w-auto sm:text-sm"
                    onClick={() => setViewingUser(null)}
                  >
                    닫기
                  </button>
                  <button
                    type="button"
                    className="ml-3 w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm"
                    onClick={() => {
                      setEditingUser(viewingUser);
                      setViewingUser(null);
                    }}
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    편집
                  </button>

                  {/* Make Admin button - only shown to super admins for non-admin users */}
                  {currentUser.role === "SUPER_ADMIN" &&
                    viewingUser.role !== "ADMIN" &&
                    viewingUser.role !== "SUPER_ADMIN" &&
                    (adminPromoteConfirm === viewingUser.id ? (
                      <div className="ml-3 flex items-center">
                        <Form method="post">
                          <input
                            type="hidden"
                            name="intent"
                            value="make-admin"
                          />
                          <input
                            type="hidden"
                            name="userId"
                            value={viewingUser.id}
                          />
                          <button
                            type="submit"
                            className="inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-orange-600 text-base font-medium text-white hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 sm:w-auto sm:text-sm"
                          >
                            확인
                          </button>
                        </Form>
                        <button
                          type="button"
                          onClick={() => setAdminPromoteConfirm(null)}
                          className="ml-2 inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:w-auto sm:text-sm"
                        >
                          취소
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        className="ml-3 w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-orange-600 text-base font-medium text-white hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 sm:ml-3 sm:w-auto sm:text-sm"
                        onClick={() => setAdminPromoteConfirm(viewingUser.id)}
                      >
                        <Shield className="w-4 h-4 mr-2" />
                        관리자로 승격
                      </button>
                    ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
