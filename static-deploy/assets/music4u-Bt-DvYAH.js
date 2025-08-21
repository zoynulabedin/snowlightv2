import { j as e } from "./index-BJHAE5s4.js";
import { u as p, m as r } from "./PlayerContext-V_k27SiC.js";
import { u as f } from "./LanguageContext-BFw3fmyY.js";
import { M as a } from "./music-CZuQgL7Q.js";
import { T as i } from "./trending-up-BpWpwtul.js";
import { U as g } from "./users-ChKsnVKg.js";
import { P as l } from "./play-xanyyhs6.js";
import { L as c } from "./components-BzXIzYa5.js";
import { P as j } from "./plus-FsPOmVV4.js";
import { H as u } from "./heart-Dn2OeVKi.js";
import { D as b } from "./download-D1QhcQ9O.js";
import { E as v } from "./ellipsis-oYE1YOVG.js";
import { C as N } from "./clock-CDLMwhTV.js";
import "./createLucideIcon-iNHoReR6.js";
import "./index-CiN_UGES.js";
const z = () => [
  { title: "뮤직4U - 벅스" },
  { name: "description", content: "당신을 위한 맞춤 음악 추천" },
];
function A() {
  const { playTrack: n } = p(),
    { t: w } = f(),
    o = (s) => {
      const t = r.find((h) => h.id === s);
      t && n(t, r);
    },
    d = [
      {
        id: "1",
        title: "당신이 좋아할 만한 곡들",
        description: "최근 들은 음악을 바탕으로 추천",
        coverUrl: "https://placehold.co/200x200/ff1493/ffffff?text=Rec1",
        trackCount: 25,
        playCount: 125e4,
      },
      {
        id: "2",
        title: "비슷한 취향의 사용자들이 듣는 음악",
        description: "당신과 비슷한 음악 취향을 가진 사용자들의 선택",
        coverUrl: "https://placehold.co/200x200/ff1493/ffffff?text=Rec2",
        trackCount: 30,
        playCount: 89e4,
      },
      {
        id: "3",
        title: "요즘 뜨는 신곡",
        description: "당신의 취향에 맞는 최신 트렌드 음악",
        coverUrl: "https://placehold.co/200x200/ff1493/ffffff?text=Rec3",
        trackCount: 20,
        playCount: 21e5,
      },
    ],
    x = [
      {
        id: "1",
        title: "서우젯소리",
        artist: "사우스 카니발(South Carnival)",
        album: "서우젯소리",
        duration: "4:32",
        coverUrl: "https://placehold.co/60x60/ff1493/ffffff?text=1",
        reason: "최근 들은 인디록 장르와 유사",
      },
      {
        id: "2",
        title: "Golden",
        artist: "HUNTR/X",
        album: "KPop Demon Hunters",
        duration: "4:05",
        coverUrl: "https://placehold.co/60x60/ff1493/ffffff?text=2",
        reason: "좋아요 표시한 아티스트의 신곡",
      },
      {
        id: "3",
        title: "Dream",
        artist: "HANZI(한지)",
        album: "Dream",
        duration: "3:28",
        coverUrl: "https://placehold.co/60x60/ff1493/ffffff?text=3",
        reason: "자주 듣는 시간대에 인기",
      },
    ],
    m = [
      { name: "집중할 때", icon: "🎯", color: "bg-blue-500" },
      { name: "운동할 때", icon: "💪", color: "bg-red-500" },
      { name: "휴식할 때", icon: "😌", color: "bg-green-500" },
      { name: "드라이브", icon: "🚗", color: "bg-purple-500" },
      { name: "파티", icon: "🎉", color: "bg-yellow-500" },
      { name: "잠들기 전", icon: "🌙", color: "bg-indigo-500" },
    ];
  return e.jsxs("div", {
    className: "space-y-8",
    children: [
      e.jsxs("div", {
        className:
          "bg-gradient-to-r from-Snowlight-pink to-purple-600 rounded-lg p-8 text-white",
        children: [
          e.jsx("h1", {
            className: "text-3xl font-bold mb-2",
            children: "뮤직4U",
          }),
          e.jsx("p", {
            className: "text-lg opacity-90",
            children: "당신만을 위한 맞춤 음악 추천",
          }),
          e.jsxs("div", {
            className: "flex items-center space-x-6 mt-4 text-sm",
            children: [
              e.jsxs("div", {
                className: "flex items-center space-x-2",
                children: [
                  e.jsx(a, { className: "w-4 h-4" }),
                  e.jsx("span", { children: "개인화된 추천" }),
                ],
              }),
              e.jsxs("div", {
                className: "flex items-center space-x-2",
                children: [
                  e.jsx(i, { className: "w-4 h-4" }),
                  e.jsx("span", { children: "실시간 업데이트" }),
                ],
              }),
              e.jsxs("div", {
                className: "flex items-center space-x-2",
                children: [
                  e.jsx(g, { className: "w-4 h-4" }),
                  e.jsx("span", { children: "취향 분석" }),
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
            children: "지금 기분에 맞는 음악",
          }),
          e.jsx("div", {
            className: "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4",
            children: m.map((s) =>
              e.jsxs(
                "button",
                {
                  className: `${s.color} text-white p-6 rounded-lg hover:opacity-90 transition-opacity`,
                  children: [
                    e.jsx("div", {
                      className: "text-2xl mb-2",
                      children: s.icon,
                    }),
                    e.jsx("div", {
                      className: "font-medium",
                      children: s.name,
                    }),
                  ],
                },
                s.name
              )
            ),
          }),
        ],
      }),
      e.jsxs("section", {
        children: [
          e.jsx("h2", {
            className: "text-2xl font-bold text-gray-900 mb-6",
            children: "당신을 위한 추천 플레이리스트",
          }),
          e.jsx("div", {
            className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6",
            children: d.map((s) =>
              e.jsxs(
                "div",
                {
                  className:
                    "bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow",
                  children: [
                    e.jsxs("div", {
                      className: "relative aspect-square",
                      children: [
                        e.jsx("img", {
                          src: s.coverUrl,
                          alt: s.title,
                          className: "w-full h-full object-cover",
                        }),
                        e.jsx("div", {
                          className:
                            "absolute inset-0 bg-black/0 hover:bg-black/20 transition-colors duration-300 flex items-center justify-center",
                          children: e.jsx("button", {
                            className:
                              "w-16 h-16 bg-white rounded-full flex items-center justify-center opacity-0 hover:opacity-100 transform scale-75 hover:scale-100 transition-all duration-300 shadow-lg",
                            children: e.jsx(l, {
                              className: "w-6 h-6 text-Snowlight-pink ml-1",
                            }),
                          }),
                        }),
                      ],
                    }),
                    e.jsxs("div", {
                      className: "p-4",
                      children: [
                        e.jsx("h3", {
                          className:
                            "font-bold text-gray-900 mb-1 line-clamp-2",
                          children: s.title,
                        }),
                        e.jsx("p", {
                          className: "text-sm text-gray-600 mb-3 line-clamp-2",
                          children: s.description,
                        }),
                        e.jsxs("div", {
                          className:
                            "flex items-center justify-between text-xs text-gray-500",
                          children: [
                            e.jsxs("span", { children: [s.trackCount, "곡"] }),
                            e.jsxs("span", {
                              children: [s.playCount.toLocaleString(), " 재생"],
                            }),
                          ],
                        }),
                      ],
                    }),
                  ],
                },
                s.id
              )
            ),
          }),
        ],
      }),
      e.jsxs("section", {
        children: [
          e.jsx("h2", {
            className: "text-2xl font-bold text-gray-900 mb-6",
            children: "당신이 좋아할 만한 곡",
          }),
          e.jsx("div", {
            className: "bg-white rounded-lg shadow-sm border border-gray-200",
            children: e.jsx("div", {
              className: "divide-y divide-gray-200",
              children: x.map((s, t) =>
                e.jsx(
                  "div",
                  {
                    className: "p-4 hover:bg-gray-50 transition-colors",
                    children: e.jsxs("div", {
                      className: "flex items-center space-x-4",
                      children: [
                        e.jsx("div", {
                          className: "flex-shrink-0 w-8 text-center",
                          children: e.jsx("span", {
                            className: "text-sm font-medium text-gray-500",
                            children: t + 1,
                          }),
                        }),
                        e.jsx("img", {
                          src: s.coverUrl,
                          alt: s.title,
                          className: "w-12 h-12 rounded object-cover",
                        }),
                        e.jsxs("div", {
                          className: "flex-1 min-w-0",
                          children: [
                            e.jsx("h3", {
                              className: "font-medium text-gray-900 truncate",
                              children: s.title,
                            }),
                            e.jsxs("div", {
                              className:
                                "flex items-center space-x-2 text-sm text-gray-600",
                              children: [
                                e.jsx(c, {
                                  to: `/artist/${s.artist}`,
                                  className: "hover:text-Snowlight-pink",
                                  children: s.artist,
                                }),
                                e.jsx("span", { children: "•" }),
                                e.jsx(c, {
                                  to: `/album/${s.id}`,
                                  className: "hover:text-Snowlight-pink",
                                  children: s.album,
                                }),
                                e.jsx("span", { children: "•" }),
                                e.jsx("span", { children: s.duration }),
                              ],
                            }),
                            e.jsx("p", {
                              className: "text-xs text-Snowlight-pink mt-1",
                              children: s.reason,
                            }),
                          ],
                        }),
                        e.jsxs("div", {
                          className: "flex items-center space-x-2",
                          children: [
                            e.jsx("button", {
                              onClick: () => o(s.id),
                              className:
                                "p-2 text-gray-600 hover:text-Snowlight-pink hover:bg-pink-50 rounded-md transition-colors",
                              children: e.jsx(l, { className: "w-4 h-4" }),
                            }),
                            e.jsx("button", {
                              className:
                                "p-2 text-gray-600 hover:text-Snowlight-pink hover:bg-pink-50 rounded-md transition-colors",
                              children: e.jsx(j, { className: "w-4 h-4" }),
                            }),
                            e.jsx("button", {
                              className:
                                "p-2 text-gray-600 hover:text-Snowlight-pink hover:bg-pink-50 rounded-md transition-colors",
                              children: e.jsx(u, { className: "w-4 h-4" }),
                            }),
                            e.jsx("button", {
                              className:
                                "p-2 text-gray-600 hover:text-Snowlight-pink hover:bg-pink-50 rounded-md transition-colors",
                              children: e.jsx(b, { className: "w-4 h-4" }),
                            }),
                            e.jsx("button", {
                              className:
                                "p-2 text-gray-600 hover:text-Snowlight-pink hover:bg-pink-50 rounded-md transition-colors",
                              children: e.jsx(v, { className: "w-4 h-4" }),
                            }),
                          ],
                        }),
                      ],
                    }),
                  },
                  s.id
                )
              ),
            }),
          }),
        ],
      }),
      e.jsxs("section", {
        children: [
          e.jsx("h2", {
            className: "text-2xl font-bold text-gray-900 mb-6",
            children: "나의 음악 통계",
          }),
          e.jsxs("div", {
            className: "grid grid-cols-1 md:grid-cols-3 gap-6",
            children: [
              e.jsx("div", {
                className:
                  "bg-white rounded-lg shadow-sm border border-gray-200 p-6",
                children: e.jsxs("div", {
                  className: "flex items-center space-x-3",
                  children: [
                    e.jsx("div", {
                      className:
                        "w-12 h-12 bg-Snowlight-pink rounded-lg flex items-center justify-center",
                      children: e.jsx(N, { className: "w-6 h-6 text-white" }),
                    }),
                    e.jsxs("div", {
                      children: [
                        e.jsx("h3", {
                          className: "font-bold text-gray-900",
                          children: "이번 주 재생시간",
                        }),
                        e.jsx("p", {
                          className: "text-2xl font-bold text-Snowlight-pink",
                          children: "24시간 32분",
                        }),
                      ],
                    }),
                  ],
                }),
              }),
              e.jsx("div", {
                className:
                  "bg-white rounded-lg shadow-sm border border-gray-200 p-6",
                children: e.jsxs("div", {
                  className: "flex items-center space-x-3",
                  children: [
                    e.jsx("div", {
                      className:
                        "w-12 h-12 bg-purple-500 rounded-lg flex items-center justify-center",
                      children: e.jsx(a, { className: "w-6 h-6 text-white" }),
                    }),
                    e.jsxs("div", {
                      children: [
                        e.jsx("h3", {
                          className: "font-bold text-gray-900",
                          children: "가장 많이 들은 장르",
                        }),
                        e.jsx("p", {
                          className: "text-2xl font-bold text-purple-500",
                          children: "인디록",
                        }),
                      ],
                    }),
                  ],
                }),
              }),
              e.jsx("div", {
                className:
                  "bg-white rounded-lg shadow-sm border border-gray-200 p-6",
                children: e.jsxs("div", {
                  className: "flex items-center space-x-3",
                  children: [
                    e.jsx("div", {
                      className:
                        "w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center",
                      children: e.jsx(i, { className: "w-6 h-6 text-white" }),
                    }),
                    e.jsxs("div", {
                      children: [
                        e.jsx("h3", {
                          className: "font-bold text-gray-900",
                          children: "발견한 새로운 아티스트",
                        }),
                        e.jsx("p", {
                          className: "text-2xl font-bold text-green-500",
                          children: "12명",
                        }),
                      ],
                    }),
                  ],
                }),
              }),
            ],
          }),
        ],
      }),
    ],
  });
}
export { A as default, z as meta };
