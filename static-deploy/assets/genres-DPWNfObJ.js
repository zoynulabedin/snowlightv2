import { j as e } from "./index-BJHAE5s4.js";
import { u as l } from "./LanguageContext-BFw3fmyY.js";
import { M as s } from "./music-CZuQgL7Q.js";
import { T as n } from "./trending-up-BpWpwtul.js";
import { L as o } from "./components-BzXIzYa5.js";
import { P as d } from "./play-xanyyhs6.js";
import "./createLucideIcon-iNHoReR6.js";
import "./index-CiN_UGES.js";
const j = () => [
  { title: "장르 - 벅스" },
  {
    name: "description",
    content: "다양한 음악 장르별 인기곡과 신곡을 만나보세요",
  },
];
function N() {
  const { t: x } = l(),
    r = [
      {
        id: "kpop",
        name: "K-POP",
        description: "한국 대중음악",
        color: "bg-gradient-to-br from-pink-500 to-rose-600",
        trackCount: 15420,
        coverUrl:
          "https://via.placeholder.com/300x200/ff1493/ffffff?text=K-POP",
      },
      {
        id: "pop",
        name: "POP",
        description: "팝 음악",
        color: "bg-gradient-to-br from-blue-500 to-cyan-600",
        trackCount: 28950,
        coverUrl: "https://via.placeholder.com/300x200/3b82f6/ffffff?text=POP",
      },
      {
        id: "rock",
        name: "록",
        description: "록 음악",
        color: "bg-gradient-to-br from-red-500 to-orange-600",
        trackCount: 12340,
        coverUrl: "https://via.placeholder.com/300x200/ef4444/ffffff?text=ROCK",
      },
      {
        id: "indie",
        name: "인디",
        description: "인디 음악",
        color: "bg-gradient-to-br from-purple-500 to-indigo-600",
        trackCount: 8760,
        coverUrl:
          "https://via.placeholder.com/300x200/8b5cf6/ffffff?text=INDIE",
      },
      {
        id: "hiphop",
        name: "힙합",
        description: "힙합/랩",
        color: "bg-gradient-to-br from-gray-700 to-gray-900",
        trackCount: 9850,
        coverUrl:
          "https://via.placeholder.com/300x200/374151/ffffff?text=HIPHOP",
      },
      {
        id: "rnb",
        name: "R&B",
        description: "알앤비/소울",
        color: "bg-gradient-to-br from-amber-500 to-yellow-600",
        trackCount: 6420,
        coverUrl:
          "https://via.placeholder.com/300x200/f59e0b/ffffff?text=R%26B",
      },
      {
        id: "electronic",
        name: "일렉트로닉",
        description: "전자음악",
        color: "bg-gradient-to-br from-cyan-500 to-teal-600",
        trackCount: 7890,
        coverUrl: "https://via.placeholder.com/300x200/06b6d4/ffffff?text=EDM",
      },
      {
        id: "jazz",
        name: "재즈",
        description: "재즈",
        color: "bg-gradient-to-br from-emerald-500 to-green-600",
        trackCount: 4320,
        coverUrl: "https://via.placeholder.com/300x200/10b981/ffffff?text=JAZZ",
      },
      {
        id: "classical",
        name: "클래식",
        description: "클래식",
        color: "bg-gradient-to-br from-violet-500 to-purple-600",
        trackCount: 5670,
        coverUrl:
          "https://via.placeholder.com/300x200/8b5cf6/ffffff?text=CLASSIC",
      },
      {
        id: "folk",
        name: "포크",
        description: "포크/컨트리",
        color: "bg-gradient-to-br from-orange-500 to-red-600",
        trackCount: 3450,
        coverUrl: "https://via.placeholder.com/300x200/f97316/ffffff?text=FOLK",
      },
      {
        id: "ballad",
        name: "발라드",
        description: "발라드",
        color: "bg-gradient-to-br from-rose-500 to-pink-600",
        trackCount: 11230,
        coverUrl:
          "https://via.placeholder.com/300x200/f43f5e/ffffff?text=BALLAD",
      },
      {
        id: "trot",
        name: "트로트",
        description: "트로트",
        color: "bg-gradient-to-br from-yellow-500 to-orange-600",
        trackCount: 2890,
        coverUrl: "https://via.placeholder.com/300x200/eab308/ffffff?text=TROT",
      },
    ],
    a = r.slice(0, 6),
    c = r;
  return e.jsxs("div", {
    className: "space-y-8",
    children: [
      e.jsxs("div", {
        className:
          "bg-gradient-to-r from-Snowlight-pink to-purple-600 rounded-lg p-8 text-white",
        children: [
          e.jsx("h1", {
            className: "text-3xl font-bold mb-2",
            children: "장르",
          }),
          e.jsx("p", {
            className: "text-lg opacity-90",
            children: "다양한 음악 장르별 인기곡과 신곡을 만나보세요",
          }),
          e.jsxs("div", {
            className: "flex items-center space-x-6 mt-4 text-sm",
            children: [
              e.jsxs("div", {
                className: "flex items-center space-x-2",
                children: [
                  e.jsx(s, { className: "w-4 h-4" }),
                  e.jsx("span", { children: "12개 장르" }),
                ],
              }),
              e.jsxs("div", {
                className: "flex items-center space-x-2",
                children: [
                  e.jsx(n, { className: "w-4 h-4" }),
                  e.jsx("span", { children: "실시간 차트" }),
                ],
              }),
            ],
          }),
        ],
      }),
      e.jsxs("section", {
        children: [
          e.jsx("h2", {
            className: "text-2xl font-bold text-gray-900 mb-6",
            children: "인기 장르",
          }),
          e.jsx("div", {
            className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6",
            children: a.map((t) =>
              e.jsx(
                o,
                {
                  to: `/genre/${t.id}`,
                  className:
                    "group relative overflow-hidden rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105",
                  children: e.jsxs("div", {
                    className: `${t.color} aspect-[3/2] flex items-center justify-center relative`,
                    children: [
                      e.jsx("div", {
                        className:
                          "absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors duration-300",
                      }),
                      e.jsxs("div", {
                        className: "relative z-10 text-center text-white",
                        children: [
                          e.jsx("h3", {
                            className: "text-2xl font-bold mb-2",
                            children: t.name,
                          }),
                          e.jsx("p", {
                            className: "text-sm opacity-90 mb-3",
                            children: t.description,
                          }),
                          e.jsxs("div", {
                            className:
                              "flex items-center justify-center space-x-2 text-xs",
                            children: [
                              e.jsx(s, { className: "w-3 h-3" }),
                              e.jsxs("span", {
                                children: [t.trackCount.toLocaleString(), "곡"],
                              }),
                            ],
                          }),
                        ],
                      }),
                      e.jsx("div", {
                        className:
                          "absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300",
                        children: e.jsx("div", {
                          className:
                            "w-12 h-12 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm",
                          children: e.jsx(d, {
                            className: "w-5 h-5 text-white ml-0.5",
                          }),
                        }),
                      }),
                    ],
                  }),
                },
                t.id
              )
            ),
          }),
        ],
      }),
      e.jsxs("section", {
        children: [
          e.jsx("h2", {
            className: "text-2xl font-bold text-gray-900 mb-6",
            children: "모든 장르",
          }),
          e.jsx("div", {
            className:
              "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4",
            children: c.map((t) =>
              e.jsx(
                o,
                {
                  to: `/genre/${t.id}`,
                  className:
                    "group bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md hover:border-Snowlight-pink transition-all duration-300",
                  children: e.jsxs("div", {
                    className: "text-center",
                    children: [
                      e.jsx("div", {
                        className: `w-16 h-16 ${t.color} rounded-full mx-auto mb-3 flex items-center justify-center group-hover:scale-110 transition-transform duration-300`,
                        children: e.jsx(s, { className: "w-6 h-6 text-white" }),
                      }),
                      e.jsx("h3", {
                        className:
                          "font-bold text-gray-900 mb-1 group-hover:text-Snowlight-pink transition-colors",
                        children: t.name,
                      }),
                      e.jsx("p", {
                        className: "text-xs text-gray-600 mb-2",
                        children: t.description,
                      }),
                      e.jsxs("p", {
                        className: "text-xs text-gray-500",
                        children: [t.trackCount.toLocaleString(), "곡"],
                      }),
                    ],
                  }),
                },
                t.id
              )
            ),
          }),
        ],
      }),
      e.jsxs("section", {
        children: [
          e.jsx("h2", {
            className: "text-2xl font-bold text-gray-900 mb-6",
            children: "장르별 통계",
          }),
          e.jsx("div", {
            className:
              "bg-white rounded-lg shadow-sm border border-gray-200 p-6",
            children: e.jsxs("div", {
              className: "grid grid-cols-1 md:grid-cols-3 gap-6",
              children: [
                e.jsxs("div", {
                  className: "text-center",
                  children: [
                    e.jsx("div", {
                      className: "text-3xl font-bold text-Snowlight-pink mb-2",
                      children: r
                        .reduce((t, i) => t + i.trackCount, 0)
                        .toLocaleString(),
                    }),
                    e.jsx("div", {
                      className: "text-sm text-gray-600",
                      children: "전체 곡 수",
                    }),
                  ],
                }),
                e.jsxs("div", {
                  className: "text-center",
                  children: [
                    e.jsx("div", {
                      className: "text-3xl font-bold text-purple-500 mb-2",
                      children: "12",
                    }),
                    e.jsx("div", {
                      className: "text-sm text-gray-600",
                      children: "장르 수",
                    }),
                  ],
                }),
                e.jsxs("div", {
                  className: "text-center",
                  children: [
                    e.jsx("div", {
                      className: "text-3xl font-bold text-green-500 mb-2",
                      children: "매일",
                    }),
                    e.jsx("div", {
                      className: "text-sm text-gray-600",
                      children: "업데이트",
                    }),
                  ],
                }),
              ],
            }),
          }),
        ],
      }),
    ],
  });
}
export { N as default, j as meta };
