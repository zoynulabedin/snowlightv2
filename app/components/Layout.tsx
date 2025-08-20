import { useState } from "react";
import { Link } from "@remix-run/react";
import { Bell, ChevronDown, ChevronRight, ChevronUp } from "lucide-react";
import { useAuth } from "~/contexts/AuthContext";
import SearchDropdown from "./SearchDropdown";
import SidebarMenu from "./SideBarMenu";

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

export default function Layout({ children }: LayoutProps) {
  const { user, logout } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");

  const [sidebarOpen, setSidebarOpen] = useState(true);

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
    <div className="min-h-screen bg-white w-full">
      {/* Main Header */}
      <header
        style={{ minWidth: "calc(100vw-75px)" }}
        className="bg-white border-b border-gray-200 sticky top-0 z-[9999] w-full"
      >
        <div className="w-full px-4 py-3">
          <div className="flex items-center justify-between w-full">
            {/* Logo */}
            <div className="flex items-center w-full">
              <Link to="/" className="text-3xl font-bold text-red-600">
                Snowlight!
              </Link>
            </div>
            {/* Search Bar */}
            <div className="w-full flex justify-center">
              <SearchDropdown
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                onSubmit={handleSearch}
              />
            </div>
            {/* Right Actions */}
            <div className="flex items-center space-x-4 text-sm w-full justify-end">
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

      {/* Main Content with Sidebar */}
      <div className=" w-full mx-auto  py-4 z-[9999]">
        <div className="flex w-full">
          {/* Left Sidebar */}
          <div className="z-[9999] sticky top-[75px] h-[calc(100vh-75px)] border-r-2 border-r-gray-200 w-auto flex-shrink-0">
            <button
              className={`absolute top-4 z-[9999] left-[100%] py-5 border border-l-0 bg-white transition-all duration-300 hover:w-[4.5rem] w-8 rounded-tr-md rounded-br-md group md:block sm:block hidden cursor-pointer`}
              id="gnbHandleBtn"
              onClick={() => setSidebarOpen((open) => !open)}
            >
              <div className="flex items-center gap-1 justify-center">
                <ChevronRight className="w-5 h-5" />
                <span className="transition-all duration-500 ease-in-out whitespace-nowrap hidden group-hover:block">
                  MENU
                </span>
              </div>
            </button>

            <aside
              className={`w-60 flex-shrink-0 px-5 transition-all duration-500 ease-in-out ${
                sidebarOpen ? "block" : "hidden"
              }`}
            >
              <SidebarMenu />
            </aside>
          </div>

          {/* Main Content */}
          <main
            className="z-0 flex-1 overflow-x-auto overflow-y-auto relative"
            style={{
              width: "100%",
              height: "calc(100vh - 75px)",
              maxHeight: "calc(100vh - 75px)",
            }}
          >
            <div className="w-full min-w-[1200px]">{children}</div>
            {/* Footer */}
            <footer className="bg-gray-100 border-t border-gray-200 mt-8">
              <div className="mx-auto px-4 py-8 w-full">
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
                    <h4 className="font-semibold mb-4 text-gray-900">
                      고객센터
                    </h4>
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
                    <h4 className="font-semibold mb-4 text-gray-900">
                      회사정보
                    </h4>
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
          </main>
        </div>
      </div>
    </div>
  );
}
