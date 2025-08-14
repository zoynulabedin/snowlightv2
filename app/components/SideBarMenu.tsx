import { Link } from "@remix-run/react";
import {
  ChevronDown,
  ChevronUp,
  BarChart2,
  Music2,
  Disc,
  FileText,
  Heart,
  Radio,
  Tv,
  User,
  Guitar,
  GalleryVerticalEnd,
} from "lucide-react";
import { useState } from "react";

export default function SidebarMenu() {
  const [open, setOpen] = useState<{ [key: string]: boolean }>({});
  const menuData = [
    {
      label: "스노우라이트차트",
      link: "/chart",
      icon: <BarChart2 className="w-4 h-4 mr-2" />,
    },
    {
      label: "최신 음악",
      link: "/newest",
      icon: <Music2 className="w-4 h-4 mr-2" />,
    },
    {
      label: "뮤직포유",
      link: "/music4u",
      icon: <Disc className="w-4 h-4 mr-2" />,
    },
    {
      label: "장르",
      link: "/genre",
      icon: <Guitar className="w-4 h-4 mr-2" />,
    },
    {
      label: "음악 포스트",
      link: "/musicposts",
      icon: <FileText className="w-4 h-4 mr-2" />,
    },
    {
      label: "테마",
      icon: <GalleryVerticalEnd className="w-4 h-4 mr-2" />,
      submenu: [
        { label: "뮤직 PD 앨범", link: "/pd-albums" },
        { label: "추천 앨범 리뷰", link: "/album-reviews" },
        { label: "연도별", link: "/by-year" },
      ],
    },
    {
      label: "투표",
      badge: "신규",
      icon: <Heart className="w-4 h-4 mr-2" />,
      submenu: [
        { label: "즐겨찾기", link: "/favorite" },
        { label: "하트 충전소", link: "/heart-station" },
      ],
    },
    {
      label: "커넥트",
      link: "/connect",
      icon: <User className="w-4 h-4 mr-2" />,
    },
    {
      label: "라디오",
      link: "/radio",
      icon: <Radio className="w-4 h-4 mr-2" />,
    },
    {
      label: "스노우라이트TV",
      icon: <Tv className="w-4 h-4 mr-2" />,
      submenu: [{ label: "스페셜 라이브", link: "/Snowlighttv/special-live" }],
    },
    {
      label: "내 음악",
      icon: <Music2 className="w-4 h-4 mr-2" />,
      submenu: [
        { label: "최근 들은 곡", link: "/my/recent" },
        { label: "가장 많이 들은 곡", link: "/my/most" },
        { label: "구매한 음악", link: "/my/purchased" },
      ],
    },
  ];

  const toggle = (label: string) => {
    setOpen((prev) => ({ ...prev, [label]: !prev[label] }));
  };

  return (
    <nav className="space-y-2 pr-4">
      {menuData.map((item) => (
        <div key={item.label}>
          {item.submenu &&
          Array.isArray(item.submenu) &&
          item.submenu.length > 0 ? (
            <button
              className="flex items-center w-full text-left py-2 hover:text-blue-600 cursor-pointer bg-transparent border-none focus:outline-none text-[16px] capitalize font-normal"
              aria-expanded={!!open[item.label]}
              aria-controls={`submenu-${item.label}`}
              onClick={() => toggle(item.label)}
              onKeyDown={(e) => {
                if (
                  e.key === "Enter" ||
                  e.key === " " ||
                  e.key === "Spacebar"
                ) {
                  e.preventDefault();
                  toggle(item.label);
                }
              }}
              tabIndex={0}
              id={`menuitem-${item.label}`}
            >
              {item.icon}
              <span className="text-[16px] capitalize font-normal">
                {item.label}
              </span>
              {item.badge && (
                <span className="ml-2 text-[10px] bg-red-500 text-white px-1 rounded">
                  {item.badge}
                </span>
              )}
              <span className="ml-auto">
                {open[item.label] ? (
                  <ChevronUp className="w-3 h-3" />
                ) : (
                  <ChevronDown className="w-3 h-3" />
                )}
              </span>
            </button>
          ) : item.link ? (
            <Link
              to={item.link}
              className="flex items-center text-gray-900 hover:text-blue-600 py-2 text-[16px] capitalize font-normal hover:underline"
            >
              {item.icon}
              <span className="text-[16px] capitalize font-normal">
                {item.label}
              </span>
            </Link>
          ) : (
            <span className="flex items-center text-gray-600 py-2 ml-2 text-[16px] capitalize font-normal">
              {item.icon}
              <span className="text-[16px] capitalize font-normal">
                {item.label}
              </span>
            </span>
          )}
          {item.submenu &&
            Array.isArray(item.submenu) &&
            item.submenu.length > 0 &&
            open[item.label] && (
              <div className="ml-4 space-y-1" id={`submenu-${item.label}`}>
                {item.submenu.map((sub) => (
                  <Link
                    key={sub.label}
                    to={sub.link}
                    className="block text-gray-600 hover:text-blue-600 py-1 ml-2 hover:underline"
                  >
                    {sub.label}
                  </Link>
                ))}
              </div>
            )}
        </div>
      ))}
    </nav>
  );
}
