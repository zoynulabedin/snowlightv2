import { useState } from "react";
import { Link } from "@remix-run/react";
import { Bell } from "lucide-react";
import { useAuth } from "~/contexts/AuthContext";

import SearchDropdown from "./SearchDropdown";
import AlbumFunction from "./sidebar";
import NavItem from "./albumrepeated";

export interface SidebarAlbum {
  id: string;
  title: string;
  coverImage?: string | null;
  artists?: Array<{
    artist: {
      name: string;
      stageName?: string | null;
    };
  }>;
}

interface LayoutProps {
  children: React.ReactNode;
  sidebarAlbums?: SidebarAlbum[];
}

export default function Layout({ children, sidebarAlbums = [] }: LayoutProps) {
  const { user, logout } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/search?q=${encodeURIComponent(searchQuery)}`;
    }
  };

  const handleLogout = async () => {
    await logout();
    window.location.href = "/";
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Main Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center">
              <Link to="/" className="text-3xl font-bold text-red-600">
                Snowlight!
              </Link>
            </div>

            {/* Search Bar */}
            <SearchDropdown
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              onSubmit={handleSearch}
            />

            {/* Right Actions */}
            <div className="flex items-center space-x-4 text-sm">
              {user ? (
                <>
                  <span className="text-gray-700">
                    {`안녕하세요, ${user.name || user.username}님`}
                  </span>
                  <button className="p-1 text-gray-400 hover:text-gray-600">
                    <Bell className="w-4 h-4" />
                  </button>
                  <button
                    onClick={handleLogout}
                    className="text-gray-600 hover:text-gray-900"
                  >
                    로그아웃
                  </button>
                  <Link
                    to="/dashboard"
                    className="text-gray-600 hover:text-gray-900"
                  >
                    대시보드
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="text-gray-600 hover:text-gray-900"
                  >
                    로그인/회원가입
                  </Link>
                  <button className="p-1 text-gray-400 hover:text-gray-600">
                    <Bell className="w-4 h-4" />
                  </button>
                </>
              )}
              <Link
                to="/purchase"
                className="text-gray-600 hover:text-gray-900"
              >
                이용권 구매
              </Link>
              <Link
                to="/register"
                className="text-gray-600 hover:text-gray-900"
              >
                신용권 등록
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Menu */}
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center space-x-8 py-2 text-sm overflow-x-auto">
            {sidebarAlbums.map((album) => (
              <NavItem key={album.id} title={album.title} id={album.id} />
            ))}
          </div>
        </div>
      </nav>

      {/* Main Content with Sidebar */}
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex gap-4">
          {/* Left Sidebar */}
          <aside className="w-48 flex-shrink-0">
            <div className="space-y-2">
              {/* Navigation Sections */}
              {sidebarAlbums.map((album) => (
                <AlbumFunction
                  key={album.id}
                  title={album.title}
                  id={album.id}
                />
              ))}
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1">{children}</main>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-100 border-t border-gray-200 mt-8">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-sm">
            <div>
              <h3 className="font-bold text-red-600 mb-4">Snowlight!</h3>
              <p className="text-gray-600">
                음악으로 연결되는 세상, Snowlight!
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-4 text-gray-900">서비스</h4>
              <ul className="space-y-2 text-gray-600">
                <li>
                  <Link to="/chart" className="hover:text-gray-900">
                    차트
                  </Link>
                </li>
                <li>
                  <Link to="/newest" className="hover:text-gray-900">
                    최신곡
                  </Link>
                </li>
                <li>
                  <Link to="/music4u" className="hover:text-gray-900">
                    추천음악
                  </Link>
                </li>
                <li>
                  <Link to="/membership" className="hover:text-gray-900">
                    VIP 멤버십
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4 text-gray-900">고객센터</h4>
              <ul className="space-y-2 text-gray-600">
                <li>
                  <button
                    type="button"
                    className="hover:text-gray-900 bg-transparent border-none p-0 underline cursor-pointer"
                  >
                    공지사항
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    className="hover:text-gray-900 bg-transparent border-none p-0 underline cursor-pointer"
                  >
                    자주 묻는 질문
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    className="hover:text-gray-900 bg-transparent border-none p-0 underline cursor-pointer"
                  >
                    문의하기
                  </button>
                </li>
                <li>
                  <span>전화상담: +447488818495</span>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4 text-gray-900">회사정보</h4>
              <ul className="space-y-2 text-gray-600">
                <li>
                  <button
                    type="button"
                    className="hover:text-gray-900 bg-transparent border-none p-0 underline cursor-pointer"
                  >
                    회사소개
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    className="hover:text-gray-900 bg-transparent border-none p-0 underline cursor-pointer"
                  >
                    이용약관
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    className="hover:text-gray-900 bg-transparent border-none p-0 underline cursor-pointer"
                  >
                    개인정보처리방침
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    className="hover:text-gray-900 bg-transparent border-none p-0 underline cursor-pointer"
                  >
                    청소년보호정책
                  </button>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-300 mt-8 pt-8 text-center text-xs text-gray-500">
            <p>© 2025 Snowlight. 모든 권리 보유.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
