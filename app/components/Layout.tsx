import { useState } from "react";
import { Link, useLocation } from "@remix-run/react";
import {
  Bell,
  User,
  Menu,
  X,
  Heart,
  Crown,
  LogOut,
  Settings,
  ChevronDown,
  ChevronUp,
  Album,
} from "lucide-react";
import { useLanguage } from "~/contexts/LanguageContext";
import { useAuth } from "~/contexts/AuthContext";
import LanguageSwitcher from "./LanguageSwitcher";
import SearchDropdown from "./SearchDropdown";

interface SidebarAlbum {
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
  const { t } = useLanguage();
  const { user, logout } = useAuth();

  const [searchQuery, setSearchQuery] = useState("");
  const [expandedSections, setExpandedSections] = useState<{
    [key: string]: boolean;
  }>({
    기타: false,
    즐겨찾기: false,
    벅스TV: false,
    앨범: true, // Albums section expanded by default
  });

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

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Top Banner */}
      {/* <div className="bg-gradient-to-r from-blue-400 to-blue-600 text-white py-1 px-4 text-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <span>{t("layout.favorite_2025")}</span>
          </div>
          <button className="text-white hover:text-gray-200">
            {t("layout.close_banner")}
          </button>
        </div>
      </div> */}

      {/* Service Links Bar */}
      <div className="bg-gray-100 border-b py-1 px-4 text-xs">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link to="#" className="text-gray-600 hover:text-gray-900">
              {t("layout.my_playlist")}
            </Link>
            <Link to="#" className="text-gray-600 hover:text-gray-900">
              {t("layout.essential")}
            </Link>
            <Link to="#" className="text-gray-600 hover:text-gray-900">
              {t("layout.web_player")}
            </Link>
            <Link to="#" className="text-gray-600 hover:text-gray-900">
              {t("layout.bugs_player")}
            </Link>
            <Link to="#" className="text-gray-600 hover:text-gray-900">
              {t("layout.customer_center")}
            </Link>
          </div>
          <div className="flex items-center space-x-4">
            <Link to="#" className="text-gray-600 hover:text-gray-900">
              {t("layout.games")}
            </Link>
            <Link to="#" className="text-gray-600 hover:text-gray-900">
              {t("layout.comico")}
            </Link>
            <Link to="#" className="text-gray-600 hover:text-gray-900">
              {t("layout.ticketlink")}
            </Link>
            <Link to="#" className="text-gray-600 hover:text-gray-900">
              {t("layout.hangame")}
            </Link>
            <div className="border-l border-gray-300 pl-4 ml-4">
              <LanguageSwitcher variant="header" size="sm" />
            </div>
          </div>
        </div>
      </div>

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
                    {t("layout.hello_user").replace(
                      "{name}",
                      user.name || user.username
                    )}
                  </span>
                  <button className="p-1 text-gray-400 hover:text-gray-600">
                    <Bell className="w-4 h-4" />
                  </button>
                  <button
                    onClick={handleLogout}
                    className="text-gray-600 hover:text-gray-900"
                  >
                    {t("layout.logout")}
                  </button>
                  <Link
                    to="/dashboard"
                    className="text-gray-600 hover:text-gray-900"
                  >
                    {t("layout.dashboard")}
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="text-gray-600 hover:text-gray-900"
                  >
                    {t("layout.login_signup")}
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
                {t("layout.purchase_ticket")}
              </Link>
              <Link
                to="/register"
                className="text-gray-600 hover:text-gray-900"
              >
                {t("layout.register_voucher")}
              </Link>
              <div className="border-l border-gray-300 pl-3 ml-3">
                <LanguageSwitcher variant="header" size="md" />
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Menu */}
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center space-x-8 py-2 text-sm overflow-x-auto">
            <Link
              to="/chart"
              className="text-gray-700 hover:text-gray-900 font-medium"
            >
              {t("nav.chart")}
            </Link>
            <Link
              to="/newest"
              className="text-gray-700 hover:text-gray-900 font-medium"
            >
              {t("nav.newest")}
            </Link>
            <Link
              to="/music4u"
              className="text-gray-700 hover:text-gray-900 font-medium"
            >
              {t("nav.music4u")}
            </Link>
            <Link
              to="/genres"
              className="text-gray-700 hover:text-gray-900 font-medium"
            >
              {t("nav.genre")}
            </Link>
            <Link
              to="/musicposts"
              className="text-gray-700 hover:text-gray-900 font-medium"
            >
              {t("nav.posts")}
            </Link>
            <Link
              to="/pdalbums"
              className="text-gray-700 hover:text-gray-900 font-medium"
            >
              {t("nav.pd_albums")}
            </Link>
            {/* Dynamic albums from sidebarAlbums */}
            {sidebarAlbums.slice(0, 5).map((album) => (
              <Link
                key={album.id}
                to={`/album/${album.id}`}
                className="flex items-center space-x-1 text-gray-700 hover:text-gray-900 font-medium"
                title={album.title}
              >
                {album.coverImage ? (
                  <img
                    src={album.coverImage}
                    alt={album.title}
                    className="w-5 h-5 rounded object-cover"
                  />
                ) : (
                  <Album className="w-4 h-4 text-gray-400" />
                )}
                <span className="truncate max-w-[100px]">{album.title}</span>
              </Link>
            ))}
            {sidebarAlbums.length > 5 && (
              <Link
                to="/newest"
                className="text-blue-600 hover:text-blue-800 font-medium"
              >
                +{sidebarAlbums.length - 5} {t("layout.more_albums")}
              </Link>
            )}
            <Link
              to="/reviews"
              className="text-gray-700 hover:text-gray-900 font-medium"
            >
              {t("nav.reviews")}
            </Link>
            <Link
              to="/by-year"
              className="text-gray-700 hover:text-gray-900 font-medium"
            >
              {t("nav.by_year")}
            </Link>
            <Link
              to="/favorite"
              className="text-gray-700 hover:text-gray-900 font-medium"
            >
              {t("nav.favorite")}
            </Link>
            <Link
              to="/heart-station"
              className="text-gray-700 hover:text-gray-900 font-medium"
            >
              {t("nav.hearts")}
            </Link>
            <a
              href="#"
              className="text-gray-700 hover:text-gray-900 font-medium"
            >
              {t("nav.connect")}
            </a>
            <a
              href="#"
              className="text-gray-700 hover:text-gray-900 font-medium"
            >
              {t("nav.radio")}
            </a>
          </div>
        </div>
      </nav>

      {/* Main Content with Sidebar */}
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex gap-4">
          {/* Left Sidebar */}
          <aside className="w-48 flex-shrink-0">
            <div className="space-y-2">
              {/* 이용권 구매 */}
              {/* <div className="bg-purple-600 text-white rounded p-2 text-center text-sm font-medium">
                <Link to="/membership" className="block">
                  {t("layout.membership_guide")}
                </Link>
              </div> */}

              {/* 신용권 등록 */}
              {/* <div className="bg-orange-500 text-white rounded p-2 text-center text-sm font-medium">
                <a href="#" className="block">
                  {t("layout.credit_register")}
                </a>
              </div> */}

              {/* Navigation Sections */}
              <div className="space-y-1">
                <div className="bg-green-100 border-l-4 border-green-500 p-2">
                  <Link
                    to="/chart"
                    className="text-green-700 font-medium text-sm"
                  >
                    {t("nav.chart")}
                  </Link>
                </div>

                <div className="bg-red-100 border-l-4 border-red-500 p-2">
                  <Link
                    to="/newest"
                    className="text-red-700 font-medium text-sm"
                  >
                    {t("nav.newest")}
                  </Link>
                </div>

                <div className="bg-blue-100 border-l-4 border-blue-500 p-2">
                  <Link
                    to="/music4u"
                    className="text-blue-700 font-medium text-sm"
                  >
                    {t("nav.music4u")}
                  </Link>
                </div>

                <div className="bg-red-100 border-l-4 border-red-500 p-2">
                  <Link
                    to="/genres"
                    className="text-red-700 font-medium text-sm"
                  >
                    {t("nav.genre")}
                  </Link>
                </div>

                <div className="bg-green-100 border-l-4 border-green-500 p-2">
                  <Link
                    to="/musicposts"
                    className="text-green-700 font-medium text-sm"
                  >
                    {t("nav.posts")}
                  </Link>
                </div>

                <div className="bg-purple-100 border-l-4 border-purple-500 p-2">
                  <Link
                    to="/pdalbums"
                    className="text-purple-700 font-medium text-sm"
                  >
                    {t("nav.pd_albums")}
                  </Link>
                </div>

                {/* Albums - Dynamic Section */}
                {sidebarAlbums.length > 0 && (
                  <div className="border border-gray-200 rounded">
                    <button
                      onClick={() => toggleSection("앨범")}
                      className="w-full flex items-center justify-between p-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                    >
                      {t("layout.albums")}
                      {expandedSections["앨범"] ? (
                        <ChevronUp className="w-4 h-4" />
                      ) : (
                        <ChevronDown className="w-4 h-4" />
                      )}
                    </button>
                    {expandedSections["앨범"] && (
                      <div className="border-t border-gray-200 p-2 space-y-2 max-h-64 overflow-y-auto">
                        {sidebarAlbums.slice(0, 10).map((album) => (
                          <Link
                            key={album.id}
                            to={`/album/${album.id}`}
                            className="flex items-center space-x-2 p-1 hover:bg-gray-50 rounded text-xs"
                          >
                            <div className="flex-shrink-0 w-8 h-8">
                              {album.coverImage ? (
                                <img
                                  src={album.coverImage}
                                  alt={album.title}
                                  className="w-8 h-8 rounded object-cover"
                                />
                              ) : (
                                <div className="w-8 h-8 bg-gray-200 rounded flex items-center justify-center">
                                  <Album className="w-4 h-4 text-gray-400" />
                                </div>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="text-gray-900 font-medium truncate">
                                {album.title}
                              </div>
                              <div className="text-gray-500 truncate">
                                {album.artists && album.artists.length > 0
                                  ? album.artists
                                      .map(
                                        (sa) =>
                                          sa.artist.stageName || sa.artist.name
                                      )
                                      .join(", ")
                                  : "Various Artists"}
                              </div>
                            </div>
                          </Link>
                        ))}
                        {sidebarAlbums.length > 10 && (
                          <Link
                            to="/newest"
                            className="block text-center text-xs text-blue-600 hover:text-blue-800 py-1"
                          >
                            + {sidebarAlbums.length - 10}개 더 보기
                          </Link>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* 기타 - Expandable */}
                <div className="border border-gray-200 rounded">
                  <button
                    onClick={() => toggleSection("기타")}
                    className="w-full flex items-center justify-between p-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    {t("layout.others")}
                    {expandedSections["기타"] ? (
                      <ChevronUp className="w-4 h-4" />
                    ) : (
                      <ChevronDown className="w-4 h-4" />
                    )}
                  </button>
                  {expandedSections["기타"] && (
                    <div className="border-t border-gray-200 p-2 space-y-1">
                      <Link
                        to="/reviews"
                        className="block text-xs text-gray-600 hover:text-gray-900"
                      >
                        {t("nav.reviews")}
                      </Link>
                      <Link
                        to="/by-year"
                        className="block text-xs text-gray-600 hover:text-gray-900"
                      >
                        {t("nav.by_year")}
                      </Link>
                      <Link
                        to="/upload"
                        className="block text-xs text-gray-600 hover:text-gray-900"
                      >
                        {t("layout.upload")}
                      </Link>
                    </div>
                  )}
                </div>

                {/* 즐겨찾기 - Expandable */}
                <div className="border border-gray-200 rounded">
                  <button
                    onClick={() => toggleSection("즐겨찾기")}
                    className="w-full flex items-center justify-between p-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    {t("layout.favorites")}
                    {expandedSections["즐겨찾기"] ? (
                      <ChevronUp className="w-4 h-4" />
                    ) : (
                      <ChevronDown className="w-4 h-4" />
                    )}
                  </button>
                  {expandedSections["즐겨찾기"] && (
                    <div className="border-t border-gray-200 p-2 space-y-1">
                      <Link
                        to="/favorite"
                        className="block text-xs text-gray-600 hover:text-gray-900"
                      >
                        {t("nav.favorite")}
                      </Link>
                      <Link
                        to="/heart-station"
                        className="block text-xs text-gray-600 hover:text-gray-900"
                      >
                        {t("nav.hearts")}
                      </Link>
                      <Link
                        to="/dashboard"
                        className="block text-xs text-gray-600 hover:text-gray-900"
                      >
                        {t("layout.mypage")}
                      </Link>
                    </div>
                  )}
                </div>

                <div className="bg-purple-100 border-l-4 border-purple-500 p-2">
                  <a href="#" className="text-purple-700 font-medium text-sm">
                    {t("nav.connect")}
                  </a>
                </div>

                <div className="bg-orange-100 border-l-4 border-orange-500 p-2">
                  <a href="#" className="text-orange-700 font-medium text-sm">
                    {t("nav.radio")}
                  </a>
                </div>

                {/* 벅스TV - Expandable */}
                <div className="border border-gray-200 rounded">
                  <button
                    onClick={() => toggleSection("벅스TV")}
                    className="w-full flex items-center justify-between p-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    {t("layout.Snowlight_tv")}
                    {expandedSections["벅스TV"] ? (
                      <ChevronUp className="w-4 h-4" />
                    ) : (
                      <ChevronDown className="w-4 h-4" />
                    )}
                  </button>
                  {expandedSections["벅스TV"] && (
                    <div className="border-t border-gray-200 p-2 space-y-1">
                      <a
                        href="#"
                        className="block text-xs text-gray-600 hover:text-gray-900"
                      >
                        {t("layout.music_video")}
                      </a>
                      <a
                        href="#"
                        className="block text-xs text-gray-600 hover:text-gray-900"
                      >
                        {t("layout.live")}
                      </a>
                      <a
                        href="#"
                        className="block text-xs text-gray-600 hover:text-gray-900"
                      >
                        {t("layout.interview")}
                      </a>
                    </div>
                  )}
                </div>

                {/* 추가 섹션들 */}
                <div className="bg-yellow-100 border-l-4 border-yellow-500 p-2">
                  <a href="#" className="text-yellow-700 font-medium text-sm">
                    {t("layout.events")}
                  </a>
                </div>

                <div className="bg-indigo-100 border-l-4 border-indigo-500 p-2">
                  <a href="#" className="text-indigo-700 font-medium text-sm">
                    {t("layout.notices")}
                  </a>
                </div>

                <div className="bg-pink-100 border-l-4 border-pink-500 p-2">
                  <a href="#" className="text-pink-700 font-medium text-sm">
                    {t("layout.customer_center")}
                  </a>
                </div>

                {/* 언어 설정 */}
                <div className="border border-gray-200 rounded p-2">
                  <LanguageSwitcher variant="sidebar" />
                </div>

                {/* 소셜 링크 */}
                <div className="bg-gray-100 border border-gray-200 rounded p-2">
                  <div className="text-xs font-medium text-gray-700 mb-2">
                    {t("layout.social_media")}
                  </div>
                  <div className="flex space-x-2">
                    <a
                      href="#"
                      className="text-blue-600 hover:text-blue-800 text-xs"
                    >
                      Facebook
                    </a>
                    <a
                      href="#"
                      className="text-blue-400 hover:text-blue-600 text-xs"
                    >
                      Twitter
                    </a>
                    <a
                      href="#"
                      className="text-pink-600 hover:text-pink-800 text-xs"
                    >
                      Instagram
                    </a>
                  </div>
                </div>

                {/* 앱 다운로드 */}
                <div className="bg-gray-900 text-white rounded p-2 text-center">
                  <div className="text-xs font-medium mb-1">
                    {t("layout.app_download")}
                  </div>
                  <div className="flex space-x-1">
                    <a
                      href="#"
                      className="text-xs bg-gray-700 px-2 py-1 rounded hover:bg-gray-600"
                    >
                      iOS
                    </a>
                    <a
                      href="#"
                      className="text-xs bg-gray-700 px-2 py-1 rounded hover:bg-gray-600"
                    >
                      Android
                    </a>
                  </div>
                </div>
              </div>
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
              <p className="text-gray-600">{t("layout.footer_slogan")}</p>
            </div>

            <div>
              <h4 className="font-semibold mb-4 text-gray-900">
                {t("layout.services")}
              </h4>
              <ul className="space-y-2 text-gray-600">
                <li>
                  <Link to="/chart" className="hover:text-gray-900">
                    {t("nav.chart")}
                  </Link>
                </li>
                <li>
                  <Link to="/newest" className="hover:text-gray-900">
                    {t("nav.newest")}
                  </Link>
                </li>
                <li>
                  <Link to="/music4u" className="hover:text-gray-900">
                    {t("nav.music4u")}
                  </Link>
                </li>
                <li>
                  <Link to="/membership" className="hover:text-gray-900">
                    {t("layout.vip_membership")}
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4 text-gray-900">
                {t("layout.customer_support")}
              </h4>
              <ul className="space-y-2 text-gray-600">
                <li>
                  <a href="#" className="hover:text-gray-900">
                    {t("layout.notices")}
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-gray-900">
                    {t("layout.faq")}
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-gray-900">
                    {t("layout.inquiry")}
                  </a>
                </li>
                <li>
                  <span>{t("layout.phone_support")}</span>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4 text-gray-900">
                {t("layout.company_info")}
              </h4>
              <ul className="space-y-2 text-gray-600">
                <li>
                  <a href="#" className="hover:text-gray-900">
                    {t("layout.company_intro")}
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-gray-900">
                    {t("layout.terms")}
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-gray-900">
                    {t("layout.privacy")}
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-gray-900">
                    {t("layout.youth_policy")}
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-300 mt-8 pt-8 text-center text-xs text-gray-500">
            <p>{t("layout.footer_copyright")}</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
