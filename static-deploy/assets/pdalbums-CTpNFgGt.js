import { j as e } from "./index-BJHAE5s4.js";
import { u as x } from "./LanguageContext-BFw3fmyY.js";
import { U as a } from "./user-DTJm30ZA.js";
import { S as r } from "./star-W7y2fMPn.js";
import { M as d } from "./music-CZuQgL7Q.js";
import { P as l } from "./play-xanyyhs6.js";
import { C as m } from "./calendar-CmJUhcwv.js";
import { L as c } from "./components-BzXIzYa5.js";
import "./createLucideIcon-iNHoReR6.js";
import "./index-CiN_UGES.js";
const P = () => [
  { title: "뮤직PD 앨범 - 벅스" },
  {
    name: "description",
    content: "벅스 뮤직PD가 엄선한 특별한 앨범들을 만나보세요",
  },
];
function k() {
  const { t: h } = x(),
    i = [
      {
        id: "1",
        title: "여름밤의 감성 발라드",
        description: "무더운 여름밤, 마음을 시원하게 해줄 감성 발라드 모음",
        curator: "벅스 PD 김민수",
        coverUrl:
          "https://via.placeholder.com/300x300/ff1493/ffffff?text=Summer+Ballad",
        trackCount: 15,
        playCount: 245e4,
        rating: 4.8,
        date: "2025.08.08",
        featured: !0,
      },
      {
        id: "2",
        title: "출근길 에너지 부스터",
        description: "월요일 아침을 활기차게 시작할 수 있는 업템포 곡들",
        curator: "벅스 PD 이지은",
        coverUrl:
          "https://via.placeholder.com/300x300/3b82f6/ffffff?text=Energy+Boost",
        trackCount: 20,
        playCount: 189e4,
        rating: 4.6,
        date: "2025.08.07",
        featured: !1,
      },
      {
        id: "3",
        title: "힙합 신예들의 등장",
        description: "2025년 주목해야 할 힙합 신예 아티스트들의 대표곡",
        curator: "벅스 PD 박준호",
        coverUrl:
          "https://via.placeholder.com/300x300/374151/ffffff?text=New+Hiphop",
        trackCount: 12,
        playCount: 156e4,
        rating: 4.7,
        date: "2025.08.06",
        featured: !1,
      },
      {
        id: "4",
        title: "카페에서 듣기 좋은 재즈",
        description: "여유로운 오후 시간을 위한 모던 재즈 컬렉션",
        curator: "벅스 PD 최수진",
        coverUrl:
          "https://via.placeholder.com/300x300/10b981/ffffff?text=Cafe+Jazz",
        trackCount: 18,
        playCount: 98e4,
        rating: 4.9,
        date: "2025.08.05",
        featured: !1,
      },
      {
        id: "5",
        title: "인디 록의 새로운 물결",
        description: "독립 음악씬에서 주목받는 록 밴드들의 신곡 모음",
        curator: "벅스 PD 정민우",
        coverUrl:
          "https://via.placeholder.com/300x300/8b5cf6/ffffff?text=Indie+Rock",
        trackCount: 14,
        playCount: 123e4,
        rating: 4.5,
        date: "2025.08.04",
        featured: !1,
      },
      {
        id: "6",
        title: "K-POP 글로벌 히트곡",
        description: "전 세계를 사로잡은 K-POP 대표 히트곡들",
        curator: "벅스 PD 김하늘",
        coverUrl:
          "https://via.placeholder.com/300x300/f59e0b/ffffff?text=KPOP+Global",
        trackCount: 25,
        playCount: 345e4,
        rating: 4.8,
        date: "2025.08.03",
        featured: !1,
      },
    ],
    t = i.find((s) => s.featured),
    o = i.filter((s) => !s.featured);
  return e.jsxs("div", {
    className: "space-y-8",
    children: [
      e.jsxs("div", {
        className:
          "bg-gradient-to-r from-Snowlight-pink to-purple-600 rounded-lg p-8 text-white",
        children: [
          e.jsx("h1", {
            className: "text-3xl font-bold mb-2",
            children: "뮤직PD 앨범",
          }),
          e.jsx("p", {
            className: "text-lg opacity-90",
            children: "벅스 뮤직PD가 엄선한 특별한 앨범들을 만나보세요",
          }),
          e.jsxs("div", {
            className: "flex items-center space-x-6 mt-4 text-sm",
            children: [
              e.jsxs("div", {
                className: "flex items-center space-x-2",
                children: [
                  e.jsx(a, { className: "w-4 h-4" }),
                  e.jsx("span", { children: "전문 큐레이터" }),
                ],
              }),
              e.jsxs("div", {
                className: "flex items-center space-x-2",
                children: [
                  e.jsx(r, { className: "w-4 h-4" }),
                  e.jsx("span", { children: "엄선된 곡들" }),
                ],
              }),
              e.jsxs("div", {
                className: "flex items-center space-x-2",
                children: [
                  e.jsx(d, { className: "w-4 h-4" }),
                  e.jsx("span", { children: "매주 업데이트" }),
                ],
              }),
            ],
          }),
        ],
      }),
      t &&
        e.jsxs("section", {
          children: [
            e.jsx("h2", {
              className: "text-2xl font-bold text-gray-900 mb-6",
              children: "이주의 추천",
            }),
            e.jsx("div", {
              className: "bg-white rounded-lg shadow-lg overflow-hidden",
              children: e.jsxs("div", {
                className: "md:flex",
                children: [
                  e.jsx("div", {
                    className: "md:w-1/3",
                    children: e.jsxs("div", {
                      className: "relative aspect-square",
                      children: [
                        e.jsx("img", {
                          src: t.coverUrl,
                          alt: t.title,
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
                        e.jsx("div", {
                          className: "absolute top-4 left-4",
                          children: e.jsx("span", {
                            className:
                              "bg-red-500 text-white text-xs px-2 py-1 rounded font-medium",
                            children: "FEATURED",
                          }),
                        }),
                      ],
                    }),
                  }),
                  e.jsxs("div", {
                    className: "md:w-2/3 p-6",
                    children: [
                      e.jsx("h3", {
                        className: "text-2xl font-bold text-gray-900 mb-3",
                        children: t.title,
                      }),
                      e.jsx("p", {
                        className: "text-gray-600 mb-4 text-lg",
                        children: t.description,
                      }),
                      e.jsxs("div", {
                        className: "flex items-center space-x-6 mb-4",
                        children: [
                          e.jsxs("div", {
                            className: "flex items-center space-x-2",
                            children: [
                              e.jsx(a, { className: "w-4 h-4 text-gray-500" }),
                              e.jsx("span", {
                                className: "text-sm text-gray-600",
                                children: t.curator,
                              }),
                            ],
                          }),
                          e.jsxs("div", {
                            className: "flex items-center space-x-2",
                            children: [
                              e.jsx(m, { className: "w-4 h-4 text-gray-500" }),
                              e.jsx("span", {
                                className: "text-sm text-gray-600",
                                children: t.date,
                              }),
                            ],
                          }),
                          e.jsxs("div", {
                            className: "flex items-center space-x-2",
                            children: [
                              e.jsx(d, { className: "w-4 h-4 text-gray-500" }),
                              e.jsxs("span", {
                                className: "text-sm text-gray-600",
                                children: [t.trackCount, "곡"],
                              }),
                            ],
                          }),
                        ],
                      }),
                      e.jsxs("div", {
                        className: "flex items-center space-x-6 mb-6",
                        children: [
                          e.jsxs("div", {
                            className: "flex items-center space-x-2",
                            children: [
                              e.jsx("div", {
                                className: "flex items-center space-x-1",
                                children: [...Array(5)].map((s, n) =>
                                  e.jsx(
                                    r,
                                    {
                                      className: `w-4 h-4 ${
                                        n < Math.floor(t.rating)
                                          ? "text-yellow-400 fill-current"
                                          : "text-gray-300"
                                      }`,
                                    },
                                    n
                                  )
                                ),
                              }),
                              e.jsx("span", {
                                className: "text-sm text-gray-600",
                                children: t.rating,
                              }),
                            ],
                          }),
                          e.jsxs("div", {
                            className: "text-sm text-gray-600",
                            children: [t.playCount.toLocaleString(), " 재생"],
                          }),
                        ],
                      }),
                      e.jsxs("div", {
                        className: "flex space-x-3",
                        children: [
                          e.jsxs("button", {
                            className:
                              "Snowlight-button Snowlight-button-primary",
                            children: [
                              e.jsx(l, { className: "w-4 h-4 mr-2" }),
                              "전체 재생",
                            ],
                          }),
                          e.jsx(c, {
                            to: `/pdalbum/${t.id}`,
                            className:
                              "Snowlight-button Snowlight-button-secondary",
                            children: "자세히 보기",
                          }),
                        ],
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
          e.jsx("h2", {
            className: "text-2xl font-bold text-gray-900 mb-6",
            children: "PD 추천 앨범",
          }),
          e.jsx("div", {
            className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6",
            children: o.map((s) =>
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
                              "w-12 h-12 bg-white rounded-full flex items-center justify-center opacity-0 hover:opacity-100 transform scale-75 hover:scale-100 transition-all duration-300 shadow-lg",
                            children: e.jsx(l, {
                              className: "w-5 h-5 text-Snowlight-pink ml-0.5",
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
                            "font-bold text-gray-900 mb-2 line-clamp-1 hover:text-Snowlight-pink transition-colors",
                          children: e.jsx(c, {
                            to: `/pdalbum/${s.id}`,
                            children: s.title,
                          }),
                        }),
                        e.jsx("p", {
                          className: "text-sm text-gray-600 mb-3 line-clamp-2",
                          children: s.description,
                        }),
                        e.jsxs("div", {
                          className: "flex items-center space-x-2 mb-3",
                          children: [
                            e.jsx(a, { className: "w-3 h-3 text-gray-500" }),
                            e.jsx("span", {
                              className: "text-xs text-gray-600",
                              children: s.curator,
                            }),
                          ],
                        }),
                        e.jsxs("div", {
                          className:
                            "flex items-center justify-between text-xs text-gray-500 mb-3",
                          children: [
                            e.jsxs("div", {
                              className: "flex items-center space-x-3",
                              children: [
                                e.jsxs("span", {
                                  children: [s.trackCount, "곡"],
                                }),
                                e.jsxs("span", {
                                  children: [
                                    s.playCount.toLocaleString(),
                                    " 재생",
                                  ],
                                }),
                              ],
                            }),
                            e.jsxs("div", {
                              className: "flex items-center space-x-1",
                              children: [
                                e.jsx(r, {
                                  className:
                                    "w-3 h-3 text-yellow-400 fill-current",
                                }),
                                e.jsx("span", { children: s.rating }),
                              ],
                            }),
                          ],
                        }),
                        e.jsxs("div", {
                          className: "flex items-center justify-between",
                          children: [
                            e.jsx("span", {
                              className: "text-xs text-gray-500",
                              children: s.date,
                            }),
                            e.jsx(c, {
                              to: `/pdalbum/${s.id}`,
                              className:
                                "text-xs text-Snowlight-pink hover:text-pink-600 font-medium",
                              children: "자세히 보기",
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
      e.jsx("div", {
        className: "text-center",
        children: e.jsx("button", {
          className: "Snowlight-button Snowlight-button-secondary",
          children: "더 많은 PD 앨범 보기",
        }),
      }),
    ],
  });
}
export { k as default, P as meta };
