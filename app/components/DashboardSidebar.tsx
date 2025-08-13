import { Link, useLocation } from "@remix-run/react";
import {
  Music,
  Video,
  Disc,
  Users,
  UserCheck,
  BarChart3,
  Settings,
  Home,
} from "lucide-react";

interface DashboardSidebarProps {
  user?: {
    username: string;
    name?: string | null;
    avatar?: string | null;
    role: string;
  };
}

export default function DashboardSidebar({ user }: DashboardSidebarProps) {
  const location = useLocation();

  const menuItems = [
    {
      to: "/dashboard",
      icon: Home,
      label: "Dashboard",
      exact: true,
    },
    {
      to: "/dashboard/audio",
      icon: Music,
      label: "Audio Management",
    },
    {
      to: "/dashboard/video",
      icon: Video,
      label: "Video Management",
    },
    {
      to: "/dashboard/album",
      icon: Disc,
      label: "Album Management",
    },
    {
      to: "/dashboard/artist",
      icon: Users,
      label: "Artist Management",
    },
    {
      to: "/dashboard/users",
      icon: UserCheck,
      label: "User Role Management",
    },
    {
      to: "/dashboard/statistics",
      icon: BarChart3,
      label: "Statistics",
    },
  ];

  const isActiveLink = (to: string, exact?: boolean) => {
    if (exact) {
      return location.pathname === to;
    }
    return location.pathname.startsWith(to);
  };

  return (
    <div className="w-64 bg-white shadow-md flex flex-col">
      {/* Administrator Section */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          {/* Profile Picture */}
          <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
            {user?.avatar ? (
              <img
                src={user.avatar}
                alt={user.name || user?.username}
                className="w-12 h-12 rounded-full object-cover"
              />
            ) : (
              <span className="text-white text-xl font-semibold">
                {user?.name?.charAt(0) || user?.username?.charAt(0) || "A"}
              </span>
            )}
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-800">
              {user?.name || user?.username || "Administrator"}
            </h2>
            <p className="text-sm text-gray-500">{user?.role || "Admin"}</p>
          </div>
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = isActiveLink(item.to, item.exact);

            return (
              <li key={item.to}>
                <Link
                  to={item.to}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                    isActive
                      ? "bg-blue-50 text-blue-600 border-r-2 border-blue-600"
                      : "text-gray-700 hover:bg-blue-50 hover:text-blue-600"
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span>{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Settings at bottom */}
      <div className="p-4 border-t border-gray-200">
        <Link
          to="/dashboard/settings"
          className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
            isActiveLink("/dashboard/settings")
              ? "bg-blue-50 text-blue-600"
              : "text-gray-700 hover:bg-blue-50 hover:text-blue-600"
          }`}
        >
          <Settings className="h-5 w-5" />
          <span>Settings</span>
        </Link>
      </div>
    </div>
  );
}
