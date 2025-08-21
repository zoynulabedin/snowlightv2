import { j as e } from "./index-BJHAE5s4.js";
import { u as g, m as n } from "./PlayerContext-V_k27SiC.js";
import { u as p } from "./LanguageContext-BFw3fmyY.js";
import { M as o } from "./music-CZuQgL7Q.js";
import { U as x } from "./user-DTJm30ZA.js";
import { H as r } from "./heart-Dn2OeVKi.js";
import { P as c } from "./play-xanyyhs6.js";
import { L as t } from "./components-BzXIzYa5.js";
import { P as j } from "./plus-FsPOmVV4.js";
import { D as u } from "./download-D1QhcQ9O.js";
import { E as b } from "./ellipsis-oYE1YOVG.js";
import "./createLucideIcon-iNHoReR6.js";
import "./index-CiN_UGES.js";
const R = () => [
  { title: "Favorite - 벅스" },
  { name: "description", content: "좋아하는 음악을 모아보세요" },
];
function E() {
  const { playTrack: m } = g(),
    { t: N } = p(),
    h = (s) => {
      const l = n.find((f) => f.id === s);
      l && m(l, n);
    },
    a = [
      {
        id: "1",
        title: "서우젯소리",
        artist: "사우스 카니발(South Carnival)",
        album: "서우젯소리",
        duration: "4:32",
        coverUrl: "https://placehold.co/60x60/ff1493/ffffff?text=1",
        addedDate: "2025.08.08",
      },
      {
        id: "2",
        title: "Golden",
        artist: "HUNTR/X",
        album: "KPop Demon Hunters",
        duration: "4:05",
        coverUrl: "https://placehold.co/60x60/ff1493/ffffff?text=2",
        addedDate: "2025.08.07",
      },
      {
        id: "3",
        title: "Dream",
        artist: "HANZI(한지)",
        album: "Dream",
        duration: "3:28",
        coverUrl: "https://placehold.co/60x60/ff1493/ffffff?text=3",
        addedDate: "2025.08.06",
      },
    ],
    i = [
      {
        id: "1",
        name: "사우스 카니발(South Carnival)",
        genre: "인디록",
        profileImage: "https://placehold.co/100x100/ff1493/ffffff?text=Artist1",
        followDate: "2025.08.05",
      },
      {
        id: "2",
        name: "HUNTR/X",
        genre: "일렉트로닉",
        profileImage: "https://placehold.co/100x100/ff1493/ffffff?text=Artist2",
        followDate: "2025.08.04",
      },
    ],
    d = [
      {
        id: "1",
        title: "서우젯소리",
        artist: "사우스 카니발(South Carnival)",
        coverUrl: "https://placehold.co/120x120/ff1493/ffffff?text=Album1",
        addedDate: "2025.08.03",
      },
      {
        id: "2",
        title: "KPop Demon Hunters",
        artist: "HUNTR/X",
        coverUrl: "https://placehold.co/120x120/ff1493/ffffff?text=Album2",
        addedDate: "2025.08.02",
      },
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
            children: "Favorite",
          }),
          e.jsx("p", {
            className: "text-lg opacity-90",
            children: "좋아하는 음악을 모아보세요",
          }),
          e.jsxs("div", {
            className: "flex items-center space-x-6 mt-4 text-sm",
            children: [
              e.jsxs("div", {
                className: "flex items-center space-x-2",
                children: [
                  e.jsx(o, { className: "w-4 h-4" }),
                  e.jsxs("span", { children: [a.length, "곡"] }),
                ],
              }),
              e.jsxs("div", {
                className: "flex items-center space-x-2",
                children: [
                  e.jsx(x, { className: "w-4 h-4" }),
                  e.jsxs("span", { children: [i.length, "명"] }),
                ],
              }),
              e.jsxs("div", {
                className: "flex items-center space-x-2",
                children: [
                  e.jsx(r, { className: "w-4 h-4" }),
                  e.jsx("span", { children: "나만의 컬렉션" }),
                ],
              }),
            ],
          }),
        ],
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
                  children: e.jsx(o, { className: "w-6 h-6 text-white" }),
                }),
                e.jsxs("div", {
                  children: [
                    e.jsx("h3", {
                      className: "font-bold text-gray-900",
                      children: "좋아하는 곡",
                    }),
                    e.jsx("p", {
                      className: "text-2xl font-bold text-Snowlight-pink",
                      children: a.length,
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
                  children: e.jsx(x, { className: "w-6 h-6 text-white" }),
                }),
                e.jsxs("div", {
                  children: [
                    e.jsx("h3", {
                      className: "font-bold text-gray-900",
                      children: "팔로우 아티스트",
                    }),
                    e.jsx("p", {
                      className: "text-2xl font-bold text-purple-500",
                      children: i.length,
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
                  children: e.jsx(r, { className: "w-6 h-6 text-white" }),
                }),
                e.jsxs("div", {
                  children: [
                    e.jsx("h3", {
                      className: "font-bold text-gray-900",
                      children: "좋아하는 앨범",
                    }),
                    e.jsx("p", {
                      className: "text-2xl font-bold text-green-500",
                      children: d.length,
                    }),
                  ],
                }),
              ],
            }),
          }),
        ],
      }),
      e.jsxs("section", {
        children: [
          e.jsxs("div", {
            className: "flex items-center justify-between mb-6",
            children: [
              e.jsx("h2", {
                className: "text-2xl font-bold text-gray-900",
                children: "좋아하는 곡",
              }),
              e.jsxs("button", {
                className: "Snowlight-button Snowlight-button-primary",
                children: [
                  e.jsx(c, { className: "w-4 h-4 mr-2" }),
                  "전체 재생",
                ],
              }),
            ],
          }),
          e.jsx("div", {
            className: "bg-white rounded-lg shadow-sm border border-gray-200",
            children: e.jsx("div", {
              className: "divide-y divide-gray-200",
              children: a.map((s, l) =>
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
                            children: l + 1,
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
                                e.jsx(t, {
                                  to: `/artist/${s.artist}`,
                                  className: "hover:text-Snowlight-pink",
                                  children: s.artist,
                                }),
                                e.jsx("span", { children: "•" }),
                                e.jsx(t, {
                                  to: `/album/${s.id}`,
                                  className: "hover:text-Snowlight-pink",
                                  children: s.album,
                                }),
                                e.jsx("span", { children: "•" }),
                                e.jsx("span", { children: s.duration }),
                              ],
                            }),
                            e.jsxs("p", {
                              className: "text-xs text-gray-500 mt-1",
                              children: ["추가일: ", s.addedDate],
                            }),
                          ],
                        }),
                        e.jsxs("div", {
                          className: "flex items-center space-x-2",
                          children: [
                            e.jsx("button", {
                              onClick: () => h(s.id),
                              className:
                                "p-2 text-gray-600 hover:text-Snowlight-pink hover:bg-pink-50 rounded-md transition-colors",
                              children: e.jsx(c, { className: "w-4 h-4" }),
                            }),
                            e.jsx("button", {
                              className:
                                "p-2 text-gray-600 hover:text-Snowlight-pink hover:bg-pink-50 rounded-md transition-colors",
                              children: e.jsx(j, { className: "w-4 h-4" }),
                            }),
                            e.jsx("button", {
                              className:
                                "p-2 text-red-500 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors",
                              children: e.jsx(r, {
                                className: "w-4 h-4 fill-current",
                              }),
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
            children: "팔로우 아티스트",
          }),
          e.jsx("div", {
            className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6",
            children: i.map((s) =>
              e.jsx(
                "div",
                {
                  className:
                    "bg-white rounded-lg shadow-sm border border-gray-200 p-6",
                  children: e.jsxs("div", {
                    className: "flex items-center space-x-4",
                    children: [
                      e.jsx("img", {
                        src: s.profileImage,
                        alt: s.name,
                        className: "w-16 h-16 rounded-full object-cover",
                      }),
                      e.jsxs("div", {
                        className: "flex-1 min-w-0",
                        children: [
                          e.jsx("h3", {
                            className:
                              "font-bold text-gray-900 truncate hover:text-Snowlight-pink transition-colors",
                            children: e.jsx(t, {
                              to: `/artist/${s.name}`,
                              children: s.name,
                            }),
                          }),
                          e.jsx("p", {
                            className: "text-sm text-gray-600",
                            children: s.genre,
                          }),
                          e.jsxs("p", {
                            className: "text-xs text-gray-500 mt-1",
                            children: ["팔로우: ", s.followDate],
                          }),
                        ],
                      }),
                      e.jsx("button", {
                        className:
                          "Snowlight-button Snowlight-button-secondary text-sm",
                        children: "팔로잉",
                      }),
                    ],
                  }),
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
            children: "좋아하는 앨범",
          }),
          e.jsx("div", {
            className:
              "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6",
            children: d.map((s) =>
              e.jsxs(
                "div",
                {
                  className: "group",
                  children: [
                    e.jsxs("div", {
                      className:
                        "relative aspect-square mb-3 overflow-hidden rounded-lg bg-gray-200",
                      children: [
                        e.jsx("img", {
                          src: s.coverUrl,
                          alt: s.title,
                          className:
                            "w-full h-full object-cover group-hover:scale-105 transition-transform duration-300",
                        }),
                        e.jsx("div", {
                          className:
                            "absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 flex items-center justify-center",
                          children: e.jsx("button", {
                            className:
                              "w-12 h-12 bg-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transform scale-75 group-hover:scale-100 transition-all duration-300 shadow-lg",
                            children: e.jsx(c, {
                              className: "w-5 h-5 text-Snowlight-pink ml-0.5",
                            }),
                          }),
                        }),
                        e.jsx("div", {
                          className: "absolute top-2 right-2",
                          children: e.jsx("button", {
                            className:
                              "w-8 h-8 bg-white/80 rounded-full flex items-center justify-center backdrop-blur-sm",
                            children: e.jsx(r, {
                              className: "w-4 h-4 text-red-500 fill-current",
                            }),
                          }),
                        }),
                      ],
                    }),
                    e.jsxs("div", {
                      className: "space-y-1",
                      children: [
                        e.jsx("h3", {
                          className:
                            "font-medium text-gray-900 hover:text-Snowlight-pink transition-colors line-clamp-1",
                          children: e.jsx(t, {
                            to: `/album/${s.id}`,
                            children: s.title,
                          }),
                        }),
                        e.jsx("p", {
                          className:
                            "text-sm text-gray-600 hover:text-Snowlight-pink transition-colors line-clamp-1",
                          children: e.jsx(t, {
                            to: `/artist/${s.artist}`,
                            children: s.artist,
                          }),
                        }),
                        e.jsxs("p", {
                          className: "text-xs text-gray-500",
                          children: ["추가: ", s.addedDate],
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
      a.length === 0 &&
        e.jsxs("div", {
          className: "text-center py-12",
          children: [
            e.jsx(r, { className: "w-16 h-16 mx-auto mb-4 text-gray-300" }),
            e.jsx("h2", {
              className: "text-xl font-semibold text-gray-900 mb-2",
              children: "아직 좋아하는 음악이 없습니다",
            }),
            e.jsx("p", {
              className: "text-gray-600 mb-6",
              children:
                "마음에 드는 음악에 하트를 눌러 나만의 컬렉션을 만들어보세요.",
            }),
            e.jsx(t, {
              to: "/chart",
              className: "Snowlight-button Snowlight-button-primary",
              children: "인기 차트 둘러보기",
            }),
          ],
        }),
    ],
  });
}
export { E as default, R as meta };
