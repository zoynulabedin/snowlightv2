import { r as l, j as e } from "./index-BJHAE5s4.js";
import { P as x } from "./play-xanyyhs6.js";
import { H as h } from "./heart-Dn2OeVKi.js";
import { D as u } from "./download-D1QhcQ9O.js";
import { E as g } from "./ellipsis-oYE1YOVG.js";
import { M as p, T as b } from "./trending-down-CfKxOW2Z.js";
import { T as j } from "./trending-up-BpWpwtul.js";
import "./createLucideIcon-iNHoReR6.js";
const T = () => [
    { title: "벅스차트 > 곡 차트 > 실시간 > 전체 장르 - 벅스" },
    { name: "description", content: "실시간 인기 차트를 확인하세요!" },
  ],
  c = [
    {
      rank: 1,
      title: "Golden",
      artist: "HUNTR/X",
      album: "KPop Demon Hunters (Soundtrack from the Netflix Fi...",
      change: "new",
      coverUrl: "/api/placeholder/60/60",
    },
    {
      rank: 2,
      title: "Soda Pop",
      artist: "Saja Boys",
      album: "KPop Demon Hunters (Soundtrack from the Netflix Fi...",
      change: "up",
      changeAmount: 3,
    },
    {
      rank: 3,
      title: "뛰어(JUMP)",
      artist: "BLACKPINK",
      album: "뛰어(JUMP)",
      change: "down",
      changeAmount: 1,
    },
    {
      rank: 4,
      title: "FAMOUS",
      artist: "ALLDAY PROJECT",
      album: "FAMOUS",
      change: "up",
      changeAmount: 2,
    },
    {
      rank: 5,
      title: "How It's Done",
      artist: "HUNTR/X",
      album: "KPop Demon Hunters (Soundtrack from the Netflix Fi...",
      change: "same",
    },
    {
      rank: 6,
      title: "여름이었다",
      artist: "H1-KEY (하이키)",
      album: "H1-KEY 4th Mini Album [Lovestruck]",
      change: "up",
      changeAmount: 5,
    },
    {
      rank: 7,
      title: "너에게 닿기를",
      artist: "10CM",
      album: "너에게 닿기를",
      change: "down",
      changeAmount: 2,
    },
    {
      rank: 8,
      title: "like JENNIE",
      artist: "제니 (JENNIE)",
      album: "Ruby",
      change: "up",
      changeAmount: 1,
    },
    {
      rank: 9,
      title: "멸종위기사랑",
      artist: "이찬혁",
      album: "EROS",
      change: "down",
      changeAmount: 3,
    },
    {
      rank: 10,
      title: "서우젯소리",
      artist: "사우스 카니발(South Carnival)",
      album: "서우젯소리",
      change: "new",
    },
  ],
  N = [
    { name: "곡", active: !0 },
    { name: "앨범", active: !1 },
    { name: "뮤직PD 앨범", active: !1 },
    { name: "영상", active: !1 },
    { name: "커넥트 곡", active: !1 },
    { name: "커넥트 영상", active: !1 },
  ],
  f = [
    { name: "실시간", active: !0 },
    { name: "일간", active: !1 },
    { name: "주간", active: !1 },
  ];
function D() {
  const [t, a] = l.useState([]),
    [n, i] = l.useState(!1),
    o = () => {
      a(n ? [] : c.map((s) => s.rank)), i(!n);
    },
    d = (s) => {
      t.includes(s) ? a(t.filter((r) => r !== s)) : a([...t, s]);
    },
    m = (s, r) => {
      switch (s) {
        case "up":
          return e.jsx(j, { className: "w-4 h-4 text-red-500" });
        case "down":
          return e.jsx(b, { className: "w-4 h-4 text-blue-500" });
        case "new":
          return e.jsx("span", {
            className: "text-xs font-bold text-orange-500",
            children: "NEW",
          });
        default:
          return e.jsx(p, { className: "w-4 h-4 text-gray-400" });
      }
    };
  return e.jsxs("div", {
    className: "space-y-6",
    children: [
      e.jsxs("div", {
        className: "flex items-center space-x-2 text-sm text-gray-600",
        children: [
          e.jsx("span", { children: "벅스차트" }),
          e.jsx("span", { children: ">" }),
          e.jsx("span", { children: "곡 차트" }),
          e.jsx("span", { children: ">" }),
          e.jsx("span", { children: "실시간" }),
          e.jsx("span", { children: ">" }),
          e.jsx("span", {
            className: "text-Snowlight-pink font-medium",
            children: "전체 장르",
          }),
        ],
      }),
      e.jsx("div", {
        className: "flex space-x-1 bg-gray-100 p-1 rounded-lg w-fit",
        children: N.map((s) =>
          e.jsx(
            "button",
            {
              className: `px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                s.active
                  ? "bg-white text-Snowlight-pink shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`,
              children: s.name,
            },
            s.name
          )
        ),
      }),
      e.jsx("div", {
        className: "flex space-x-1 bg-gray-100 p-1 rounded-lg w-fit",
        children: f.map((s) =>
          e.jsx(
            "button",
            {
              className: `px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                s.active
                  ? "bg-white text-Snowlight-pink shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`,
              children: s.name,
            },
            s.name
          )
        ),
      }),
      e.jsxs("div", {
        className: "flex items-center justify-between",
        children: [
          e.jsxs("div", {
            className: "text-sm text-gray-600",
            children: [
              e.jsx("span", {
                className: "font-medium",
                children: "2025.08.08 15:00",
              }),
              " 기준",
            ],
          }),
          e.jsx("div", {
            className: "text-xs text-gray-500",
            children: "집계기간 내 듣기와 다운로드 수 합산하여 반영",
          }),
        ],
      }),
      e.jsxs("div", {
        className: "flex items-center space-x-4 p-4 bg-gray-50 rounded-lg",
        children: [
          e.jsxs("label", {
            className: "flex items-center space-x-2",
            children: [
              e.jsx("input", {
                type: "checkbox",
                checked: n,
                onChange: o,
                className:
                  "rounded border-gray-300 text-Snowlight-pink focus:ring-Snowlight-pink",
              }),
              e.jsx("span", { className: "text-sm", children: "전체" }),
            ],
          }),
          e.jsxs("div", {
            className: "flex space-x-2",
            children: [
              e.jsx("button", {
                className:
                  "Snowlight-button Snowlight-button-secondary text-sm",
                children: "선택된 곡 재생듣기",
              }),
              e.jsx("button", {
                className:
                  "Snowlight-button Snowlight-button-secondary text-sm",
                children: "재생목록에 추가",
              }),
              e.jsx("button", {
                className:
                  "Snowlight-button Snowlight-button-secondary text-sm",
                children: "내 앨범에 담기",
              }),
              e.jsx("button", {
                className:
                  "Snowlight-button Snowlight-button-secondary text-sm",
                children: "다운로드",
              }),
            ],
          }),
        ],
      }),
      e.jsxs("div", {
        className: "bg-white rounded-lg border border-gray-200 overflow-hidden",
        children: [
          e.jsxs("div", {
            className:
              "grid grid-cols-12 gap-4 p-4 bg-gray-50 border-b border-gray-200 text-sm font-medium text-gray-700",
            children: [
              e.jsx("div", { className: "col-span-1", children: "순위" }),
              e.jsx("div", { className: "col-span-1" }),
              e.jsx("div", { className: "col-span-6", children: "곡" }),
              e.jsx("div", { className: "col-span-2", children: "아티스트" }),
              e.jsx("div", {
                className: "col-span-2",
                children: "듣기 재생목록 내앨범 다운 영상 기타",
              }),
            ],
          }),
          c.map((s) =>
            e.jsxs(
              "div",
              {
                className:
                  "grid grid-cols-12 gap-4 p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors",
                children: [
                  e.jsxs("div", {
                    className: "col-span-1 flex items-center space-x-2",
                    children: [
                      e.jsx("label", {
                        className: "flex items-center",
                        children: e.jsx("input", {
                          type: "checkbox",
                          checked: t.includes(s.rank),
                          onChange: () => d(s.rank),
                          className:
                            "rounded border-gray-300 text-Snowlight-pink focus:ring-Snowlight-pink",
                        }),
                      }),
                      e.jsxs("div", {
                        className: "text-center",
                        children: [
                          e.jsx("div", {
                            className: "text-lg font-bold",
                            children: s.rank,
                          }),
                          e.jsxs("div", {
                            className: "flex items-center justify-center",
                            children: [
                              m(s.change, s.changeAmount),
                              s.changeAmount &&
                                e.jsx("span", {
                                  className: "text-xs ml-1",
                                  children: s.changeAmount,
                                }),
                            ],
                          }),
                        ],
                      }),
                    ],
                  }),
                  e.jsx("div", {
                    className: "col-span-1 flex items-center",
                    children: e.jsx("img", {
                      src: `https://via.placeholder.com/60x60/ff1493/ffffff?text=${s.rank}`,
                      alt: s.title,
                      className: "w-12 h-12 rounded-md object-cover",
                    }),
                  }),
                  e.jsx("div", {
                    className: "col-span-6 flex items-center",
                    children: e.jsxs("div", {
                      children: [
                        e.jsx("h3", {
                          className:
                            "font-medium text-gray-900 hover:text-Snowlight-pink cursor-pointer",
                          children: s.title,
                        }),
                        e.jsx("p", {
                          className:
                            "text-sm text-gray-600 hover:text-Snowlight-pink cursor-pointer",
                          children: s.album,
                        }),
                      ],
                    }),
                  }),
                  e.jsx("div", {
                    className: "col-span-2 flex items-center",
                    children: e.jsx("span", {
                      className:
                        "text-gray-900 hover:text-Snowlight-pink cursor-pointer",
                      children: s.artist,
                    }),
                  }),
                  e.jsxs("div", {
                    className: "col-span-2 flex items-center space-x-2",
                    children: [
                      e.jsx("button", {
                        className: "p-1 hover:bg-gray-200 rounded",
                        title: "듣기",
                        children: e.jsx(x, {
                          className: "w-4 h-4 text-Snowlight-pink",
                        }),
                      }),
                      e.jsx("button", {
                        className: "p-1 hover:bg-gray-200 rounded",
                        title: "재생목록에 추가",
                        children: e.jsx("span", {
                          className: "text-xs text-gray-600",
                          children: "재생목록",
                        }),
                      }),
                      e.jsx("button", {
                        className: "p-1 hover:bg-gray-200 rounded",
                        title: "내 앨범에 담기",
                        children: e.jsx(h, {
                          className: "w-4 h-4 text-gray-600",
                        }),
                      }),
                      e.jsx("button", {
                        className: "p-1 hover:bg-gray-200 rounded",
                        title: "다운로드",
                        children: e.jsx(u, {
                          className: "w-4 h-4 text-gray-600",
                        }),
                      }),
                      e.jsx("button", {
                        className: "p-1 hover:bg-gray-200 rounded",
                        title: "기타 기능",
                        children: e.jsx(g, {
                          className: "w-4 h-4 text-gray-600",
                        }),
                      }),
                    ],
                  }),
                ],
              },
              s.rank
            )
          ),
        ],
      }),
      e.jsx("div", {
        className: "text-xs text-gray-500 bg-gray-50 p-4 rounded-lg",
        children: e.jsx("p", {
          children:
            "벅스차트는 이용자들의 음악 감상 패턴을 분석하여 제공하는 차트입니다. 실시간 차트는 최근 1시간 동안의 이용 현황을 반영합니다.",
        }),
      }),
    ],
  });
}
export { D as default, T as meta };
