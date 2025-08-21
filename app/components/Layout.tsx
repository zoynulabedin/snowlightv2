import { useState } from "react";
import { Link } from "@remix-run/react";
import {
  Bell,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  Menu,
  X,
} from "lucide-react";
import { useAuth } from "~/contexts/AuthContext";
import SearchDropdown from "./SearchDropdown";
import SidebarMenu from "./SideBarMenu";
import ScrollToTop from "./ScrollToTop";

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

  const [sidebarOpen, setSidebarOpen] = useState(false);

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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleInteraction = (e: React.KeyboardEvent | React.MouseEvent) => {
    if (
      e.type === "click" ||
      (e instanceof KeyboardEvent && (e.key === "Enter" || e.key === " "))
    ) {
      e.preventDefault();
      setSidebarOpen((open) => !open);
    }
  };
  return (
    <div className="min-h-screen bg-white w-full">
      {/* Main Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-[9999] w-full">
        <div className="w-full px-4 py-3">
          <div className="flex items-center justify-between md:grid md:grid-cols-3 md:gap-4">
            {/* Logo */}
            <div className="flex items-center">
              <Link to="/" className="text-3xl font-bold text-red-600">
                Snowlight!
              </Link>
            </div>

            {/* Search Bar */}
            <div className="hidden md:flex md:justify-center">
              <SearchDropdown
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                onSubmit={handleSearch}
              />
            </div>

            {/* Right Actions */}
            <div className="flex items-center">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden text-Snowlight-red hover:text-gray-900 "
              >
                {isMobileMenuOpen ? (
                  <X className="h-6 w-6" />
                ) : (
                  <Menu className="h-6 w-6" />
                )}
              </button>
              <div className="hidden md:flex items-center space-x-4 text-sm justify-end">
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
        </div>
      </header>
      {/* Mobile Menu Backdrop */}{" "}
      <div
        role="button"
        tabIndex={0}
        aria-expanded={sidebarOpen}
        aria-label="Toggle sidebar"
        onClick={handleInteraction}
        onKeyDown={handleInteraction}
      />
      {/* Mobile Menu */}{" "}
      <div
        className={`md:hidden fixed top-[73px] max-sm:bottom-0 max-sm:top-auto right-0 w-[280px] h-[calc(100vh-73px)] bg-slate-100 shadow-xl transition-transform duration-300 ease-in-out transform ${
          isMobileMenuOpen ? "translate-x-0" : "translate-x-full"
        } z-[99998] overflow-y-auto`}
      >
        <div className="p-6">
          <div className="mb-6">
            <SearchDropdown
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              onSubmit={handleSearch}
            />
          </div>
          <div className="flex flex-col space-y-5">
            {user ? (
              <>
                <div className="pb-4 border-b border-gray-200">
                  <span className="text-gray-900 font-medium">
                    {`안녕하세요, ${user.name || user.username}님`}
                  </span>
                </div>
                <button className="flex items-center text-gray-700 hover:text-gray-900 hover:bg-gray-50 px-3 py-2 rounded-lg transition-colors">
                  <Bell className="w-5 h-5 mr-3" />
                  알림
                </button>
                <Link
                  to="/dashboard"
                  className="flex items-center text-gray-700 hover:text-gray-900 hover:bg-gray-50 px-3 py-2 rounded-lg transition-colors"
                >
                  <ChevronRight className="w-5 h-5 mr-3" />
                  대시보드
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex items-center text-gray-700 hover:text-gray-900 hover:bg-gray-50 px-3 py-2 rounded-lg transition-colors"
                >
                  <ChevronRight className="w-5 h-5 mr-3" />
                  로그아웃
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="flex items-center text-gray-700 hover:text-gray-900 hover:bg-gray-50 px-3 py-2 rounded-lg transition-colors"
                >
                  <ChevronRight className="w-5 h-5 mr-3" />
                  로그인/회원가입
                </Link>
                <button className="flex items-center text-gray-700 hover:text-gray-900 hover:bg-gray-50 px-3 py-2 rounded-lg transition-colors">
                  <Bell className="w-5 h-5 mr-3" />
                  알림
                </button>
              </>
            )}
            <div className="border-t border-gray-200 pt-4 mt-2">
              <Link
                to="/purchase"
                className="flex items-center text-gray-700 hover:text-gray-900 hover:bg-gray-50 px-3 py-2 rounded-lg transition-colors"
              >
                <ChevronRight className="w-5 h-5 mr-3" />
                이용권 구매
              </Link>
              <Link
                to="/register"
                className="flex items-center text-gray-700 hover:text-gray-900 hover:bg-gray-50 px-3 py-2 rounded-lg transition-colors mt-2"
              >
                <ChevronRight className="w-5 h-5 mr-3" />
                신용권 등록
              </Link>
            </div>
          </div>
        </div>
      </div>
      {/* Main Content with Sidebar */}
      <div className=" w-full mx-auto  py-4 z-[9999]">
        <div className="flex w-full">
          {/* Left Sidebar */}
          <div className="z-[9999] sticky max-sm:fixed max-sm:min-h-screen top-[70px] max-sm:top:70px h-[calc(100vh-70px)] border-r-2 max-sm:bottom-0 max-sm:top-auto border-r-gray-200 w-auto flex-shrink-0 bg-slate-200">
            <button
              className={`absolute top-4 max-sm:bottom-10 max-sm:top-auto max-sm:right-0 max-sm:fixed max-sm:left-auto text-Snowlight-red z-[9999] left-[100%] py-5 border border-l-0 bg-slate-200 transition-all duration-300 hover:w-[4.5rem] w-8 rounded-tr-md rounded-br-md group md:block sm:block  cursor-pointer max-sm:rounded-tl-md max-sm:rounded-bl-md max-sm:rounded-tr-none max-sm:rounded-br-none`}
              id="gnbHandleBtn"
              onClick={() => setSidebarOpen((open) => !open)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  setSidebarOpen((open) => !open);
                }
              }}
              tabIndex={0}
              aria-label={
                sidebarOpen ? "Hide sidebar menu" : "Show sidebar menu"
              }
            >
              <div className="flex items-center gap-1 justify-center">
                {sidebarOpen ? (
                  <ChevronRight className="w-5 h-5" />
                ) : (
                  <ChevronLeft className="w-5 h-5" />
                )}
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
            className="z-0 flex-1  overflow-y-auto relative"
            style={{
              height: "calc(100vh - 70px)",
              maxHeight: "calc(100vh - 70px)",
            }}
          >
            <div className="w-full">{children}</div>
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
