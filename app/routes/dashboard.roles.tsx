import { json, LoaderFunctionArgs } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";
import { Shield, ShieldCheck, User, Settings, Eye, Users } from "lucide-react";
import { validateSession } from "~/lib/auth";
import { db } from "~/lib/db";

export async function loader({ request }: LoaderFunctionArgs) {
  const cookieHeader = request.headers.get("Cookie");
  const token = cookieHeader
    ?.split(";")
    .find((c) => c.trim().startsWith("auth-token="))
    ?.split("=")[1];

  if (!token) {
    throw new Response("Unauthorized", { status: 401 });
  }

  const user = await validateSession(token);
  if (!user) {
    throw new Response("Unauthorized", { status: 401 });
  }

  // Check if user has admin privileges
  if (user.role !== "ADMIN" && user.role !== "SUPER_ADMIN") {
    throw new Response("Forbidden", { status: 403 });
  }

  // Get role statistics
  const roleStats = await db.user.groupBy({
    by: ["role"],
    _count: {
      id: true,
    },
  });

  const permissions = {
    USER: [
      "Upload music",
      "Create playlists",
      "Like/favorite music",
      "Comment on music",
      "Basic profile management",
    ],
    MODERATOR: [
      "All USER permissions",
      "Moderate comments",
      "Review reported content",
      "Manage artist verifications",
      "Basic content moderation",
    ],
    ADMIN: [
      "All MODERATOR permissions",
      "Manage all users",
      "Delete any content",
      "Access analytics",
      "Manage site settings",
      "Content management",
    ],
    SUPER_ADMIN: [
      "All ADMIN permissions",
      "Manage admin roles",
      "System configuration",
      "Database access",
      "Server management",
      "Complete system control",
    ],
  };

  return json({ roleStats, permissions, currentUser: user });
}

export default function DashboardRoles() {
  const { roleStats, permissions, currentUser } =
    useLoaderData<typeof loader>();

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "SUPER_ADMIN":
        return <ShieldCheck className="w-8 h-8 text-red-600" />;
      case "ADMIN":
        return <Shield className="w-8 h-8 text-orange-600" />;
      case "MODERATOR":
        return <Settings className="w-8 h-8 text-blue-600" />;
      default:
        return <User className="w-8 h-8 text-gray-600" />;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case "SUPER_ADMIN":
        return "border-red-200 bg-red-50";
      case "ADMIN":
        return "border-orange-200 bg-orange-50";
      case "MODERATOR":
        return "border-blue-200 bg-blue-50";
      default:
        return "border-gray-200 bg-gray-50";
    }
  };

  const getRoleCount = (role: string) => {
    const stat = roleStats.find((s) => s.role === role);
    return stat?._count.id || 0;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">역할 관리</h1>
              <p className="text-gray-600 mt-1">
                시스템 역할과 권한을 확인하고 관리하세요
              </p>
            </div>
            <div className="flex space-x-3">
              <Link
                to="/dashboard/users"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700"
              >
                <Users className="w-4 h-4 mr-2" />
                사용자 관리
              </Link>
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
        {/* Current User Info */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            현재 사용자 정보
          </h2>
          <div className="flex items-center space-x-4">
            {getRoleIcon(currentUser.role)}
            <div>
              <p className="text-lg font-medium text-gray-900">
                {currentUser.name || currentUser.username}
              </p>
              <p className="text-sm text-gray-600">{currentUser.email}</p>
              <span
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium mt-2 ${
                  currentUser.role === "SUPER_ADMIN"
                    ? "bg-red-100 text-red-800"
                    : currentUser.role === "ADMIN"
                    ? "bg-orange-100 text-orange-800"
                    : currentUser.role === "MODERATOR"
                    ? "bg-blue-100 text-blue-800"
                    : "bg-gray-100 text-gray-800"
                }`}
              >
                {currentUser.role}
              </span>
            </div>
          </div>
        </div>

        {/* Role Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {Object.entries(permissions).map(([role, perms]) => (
            <div
              key={role}
              className={`bg-white rounded-lg shadow-lg border-2 ${getRoleColor(
                role
              )}`}
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    {getRoleIcon(role)}
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900">
                        {role}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {getRoleCount(role)}명의 사용자
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span
                      className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                        role === "SUPER_ADMIN"
                          ? "bg-red-100 text-red-800"
                          : role === "ADMIN"
                          ? "bg-orange-100 text-orange-800"
                          : role === "MODERATOR"
                          ? "bg-blue-100 text-blue-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {role === "SUPER_ADMIN"
                        ? "최고 관리자"
                        : role === "ADMIN"
                        ? "관리자"
                        : role === "MODERATOR"
                        ? "모더레이터"
                        : "일반 사용자"}
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-gray-700 mb-3">
                    권한:
                  </h4>
                  <ul className="space-y-2">
                    {perms.map((permission, index) => (
                      <li
                        key={index}
                        className="flex items-center text-sm text-gray-600"
                      >
                        <div className="w-2 h-2 bg-green-400 rounded-full mr-3 flex-shrink-0"></div>
                        {permission}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Actions */}
                <div className="mt-6 pt-4 border-t border-gray-200">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">
                      {role === currentUser.role && "(현재 역할)"}
                    </span>
                    <div className="flex space-x-2">
                      <Link
                        to={`/dashboard/users?role=${role}`}
                        className="inline-flex items-center px-3 py-1 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        사용자 보기
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Role Hierarchy */}
        <div className="bg-white rounded-lg shadow p-6 mt-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            역할 계층 구조
          </h2>
          <div className="flex items-center justify-center space-x-8">
            <div className="text-center">
              <User className="w-12 h-12 text-gray-600 mx-auto mb-2" />
              <p className="text-sm font-medium">USER</p>
              <p className="text-xs text-gray-500">기본 사용자</p>
            </div>
            <div className="text-gray-400">→</div>
            <div className="text-center">
              <Settings className="w-12 h-12 text-blue-600 mx-auto mb-2" />
              <p className="text-sm font-medium">MODERATOR</p>
              <p className="text-xs text-gray-500">컨텐츠 관리</p>
            </div>
            <div className="text-gray-400">→</div>
            <div className="text-center">
              <Shield className="w-12 h-12 text-orange-600 mx-auto mb-2" />
              <p className="text-sm font-medium">ADMIN</p>
              <p className="text-xs text-gray-500">시스템 관리</p>
            </div>
            <div className="text-gray-400">→</div>
            <div className="text-center">
              <ShieldCheck className="w-12 h-12 text-red-600 mx-auto mb-2" />
              <p className="text-sm font-medium">SUPER_ADMIN</p>
              <p className="text-xs text-gray-500">최고 권한</p>
            </div>
          </div>
        </div>

        {/* Security Notice */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mt-8">
          <div className="flex">
            <ShieldCheck className="h-5 w-5 text-yellow-400" />
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800">
                보안 주의사항
              </h3>
              <div className="mt-2 text-sm text-yellow-700">
                <ul className="list-disc list-inside space-y-1">
                  <li>슈퍼 관리자 권한은 신중하게 부여하세요.</li>
                  <li>정기적으로 사용자 권한을 검토하고 업데이트하세요.</li>
                  <li>불필요한 관리자 권한은 즉시 회수하세요.</li>
                  <li>역할 변경 시 반드시 로그를 확인하세요.</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
