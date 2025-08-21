import { j as e } from "./index-BJHAE5s4.js";
import { u as o } from "./LanguageContext-BFw3fmyY.js";
import { L as a } from "./components-BzXIzYa5.js";
import { U as l } from "./user-DTJm30ZA.js";
import { C as c } from "./calendar-CmJUhcwv.js";
import { E as r } from "./eye-DHw6EaHY.js";
import { H as n } from "./heart-Dn2OeVKi.js";
import { M as x } from "./message-circle-CUXJu09o.js";
import { S as h } from "./share-2-CWcLlN3z.js";
import "./index-CiN_UGES.js";
import "./createLucideIcon-iNHoReR6.js";
const O = () => [
  { title: "뮤직포스트 - 벅스" },
  {
    name: "description",
    content: "음악에 대한 다양한 이야기와 소식을 만나보세요",
  },
];
function E() {
  const { t: f } = o(),
    i = [
      {
        id: "1",
        title: "2025년 상반기 K-POP 트렌드 분석",
        excerpt:
          "올해 상반기 K-POP 시장의 주요 트렌드와 변화를 분석해보았습니다. 글로벌 시장에서의 K-POP의 위상과 새로운 아티스트들의 등장...",
        author: "벅스 에디터",
        date: "2025.08.08",
        category: "트렌드",
        views: 15420,
        likes: 892,
        comments: 156,
        thumbnail: "https://placehold.co/400x250/ff1493/ffffff?text=KPOP+Trend",
        featured: !0,
      },
      {
        id: "2",
        title: "인디 음악의 새로운 바람, 주목해야 할 신예 아티스트 10팀",
        excerpt:
          "최근 인디 씬에서 주목받고 있는 신예 아티스트들을 소개합니다. 각자만의 독특한 색깔과 음악적 개성을 가진 아티스트들의 이야기...",
        author: "음악 칼럼니스트 김OO",
        date: "2025.08.07",
        category: "아티스트",
        views: 8930,
        likes: 445,
        comments: 89,
        thumbnail:
          "https://placehold.co/400x250/8b5cf6/ffffff?text=Indie+Artists",
        featured: !1,
      },
      {
        id: "3",
        title: "여름 페스티벌 시즌, 놓치면 안 될 공연 라인업",
        excerpt:
          "올여름 전국 각지에서 열리는 음악 페스티벌들의 라인업을 정리했습니다. 록부터 일렉트로닉까지 다양한 장르의 아티스트들이...",
        author: "페스티벌 전문 기자",
        date: "2025.08.06",
        category: "페스티벌",
        views: 12340,
        likes: 678,
        comments: 234,
        thumbnail: "https://placehold.co/400x250/f59e0b/ffffff?text=Festival",
        featured: !1,
      },
      {
        id: "4",
        title: "스트리밍 시대의 음악 소비 패턴 변화",
        excerpt:
          "디지털 스트리밍 플랫폼의 등장으로 변화한 음악 소비 패턴을 데이터로 분석해보았습니다. MZ세대의 음악 취향과 소비 행태...",
        author: "데이터 분석팀",
        date: "2025.08.05",
        category: "분석",
        views: 6780,
        likes: 321,
        comments: 67,
        thumbnail: "https://placehold.co/400x250/10b981/ffffff?text=Streaming",
        featured: !1,
      },
    ],
    d = [
      { name: "전체", count: 156, active: !0 },
      { name: "트렌드", count: 45 },
      { name: "아티스트", count: 38 },
      { name: "페스티벌", count: 23 },
      { name: "분석", count: 28 },
      { name: "리뷰", count: 22 },
    ],
    t = i.find((s) => s.featured),
    m = i.filter((s) => !s.featured);
  return e.jsxs("div", {
    className: "space-y-8",
    children: [
      e.jsxs("div", {
        className:
          "bg-gradient-to-r from-Snowlight-pink to-purple-600 rounded-lg p-8 text-white",
        children: [
          e.jsx("h1", {
            className: "text-3xl font-bold mb-2",
            children: "뮤직포스트",
          }),
          e.jsx("p", {
            className: "text-lg opacity-90",
            children: "음악에 대한 다양한 이야기와 소식을 만나보세요",
          }),
        ],
      }),
      e.jsx("div", {
        className: "flex flex-wrap gap-2",
        children: d.map((s) =>
          e.jsxs(
            "button",
            {
              className: `px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                s.active
                  ? "bg-Snowlight-pink text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`,
              children: [s.name, " (", s.count, ")"],
            },
            s.name
          )
        ),
      }),
      t &&
        e.jsxs("section", {
          children: [
            e.jsx("h2", {
              className: "text-xl font-bold text-gray-900 mb-4",
              children: "주요 포스트",
            }),
            e.jsx("div", {
              className: "bg-white rounded-lg shadow-lg overflow-hidden",
              children: e.jsxs("div", {
                className: "md:flex",
                children: [
                  e.jsx("div", {
                    className: "md:w-1/2",
                    children: e.jsx("img", {
                      src: t.thumbnail,
                      alt: t.title,
                      className: "w-full h-64 md:h-full object-cover",
                    }),
                  }),
                  e.jsxs("div", {
                    className: "md:w-1/2 p-6",
                    children: [
                      e.jsxs("div", {
                        className: "flex items-center space-x-2 mb-3",
                        children: [
                          e.jsx("span", {
                            className:
                              "bg-Snowlight-pink text-white text-xs px-2 py-1 rounded",
                            children: t.category,
                          }),
                          e.jsx("span", {
                            className:
                              "bg-red-500 text-white text-xs px-2 py-1 rounded",
                            children: "FEATURED",
                          }),
                        ],
                      }),
                      e.jsx("h3", {
                        className:
                          "text-xl font-bold text-gray-900 mb-3 hover:text-Snowlight-pink transition-colors",
                        children: e.jsx(a, {
                          to: `/post/${t.id}`,
                          children: t.title,
                        }),
                      }),
                      e.jsx("p", {
                        className: "text-gray-600 mb-4 line-clamp-3",
                        children: t.excerpt,
                      }),
                      e.jsxs("div", {
                        className:
                          "flex items-center justify-between text-sm text-gray-500",
                        children: [
                          e.jsxs("div", {
                            className: "flex items-center space-x-4",
                            children: [
                              e.jsxs("div", {
                                className: "flex items-center space-x-1",
                                children: [
                                  e.jsx(l, { className: "w-4 h-4" }),
                                  e.jsx("span", { children: t.author }),
                                ],
                              }),
                              e.jsxs("div", {
                                className: "flex items-center space-x-1",
                                children: [
                                  e.jsx(c, { className: "w-4 h-4" }),
                                  e.jsx("span", { children: t.date }),
                                ],
                              }),
                            ],
                          }),
                          e.jsxs("div", {
                            className: "flex items-center space-x-4",
                            children: [
                              e.jsxs("div", {
                                className: "flex items-center space-x-1",
                                children: [
                                  e.jsx(r, { className: "w-4 h-4" }),
                                  e.jsx("span", {
                                    children: t.views.toLocaleString(),
                                  }),
                                ],
                              }),
                              e.jsxs("div", {
                                className: "flex items-center space-x-1",
                                children: [
                                  e.jsx(n, { className: "w-4 h-4" }),
                                  e.jsx("span", { children: t.likes }),
                                ],
                              }),
                              e.jsxs("div", {
                                className: "flex items-center space-x-1",
                                children: [
                                  e.jsx(x, { className: "w-4 h-4" }),
                                  e.jsx("span", { children: t.comments }),
                                ],
                              }),
                            ],
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
            className: "text-xl font-bold text-gray-900 mb-6",
            children: "최신 포스트",
          }),
          e.jsx("div", {
            className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6",
            children: m.map((s) =>
              e.jsxs(
                "article",
                {
                  className:
                    "bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow",
                  children: [
                    e.jsx(a, {
                      to: `/post/${s.id}`,
                      children: e.jsx("img", {
                        src: s.thumbnail,
                        alt: s.title,
                        className:
                          "w-full h-48 object-cover hover:scale-105 transition-transform duration-300",
                      }),
                    }),
                    e.jsxs("div", {
                      className: "p-4",
                      children: [
                        e.jsxs("div", {
                          className: "flex items-center justify-between mb-3",
                          children: [
                            e.jsx("span", {
                              className:
                                "bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded",
                              children: s.category,
                            }),
                            e.jsxs("div", {
                              className:
                                "flex items-center space-x-3 text-xs text-gray-500",
                              children: [
                                e.jsxs("div", {
                                  className: "flex items-center space-x-1",
                                  children: [
                                    e.jsx(r, { className: "w-3 h-3" }),
                                    e.jsx("span", {
                                      children: s.views.toLocaleString(),
                                    }),
                                  ],
                                }),
                                e.jsxs("div", {
                                  className: "flex items-center space-x-1",
                                  children: [
                                    e.jsx(n, { className: "w-3 h-3" }),
                                    e.jsx("span", { children: s.likes }),
                                  ],
                                }),
                              ],
                            }),
                          ],
                        }),
                        e.jsx("h3", {
                          className:
                            "font-bold text-gray-900 mb-2 line-clamp-2 hover:text-Snowlight-pink transition-colors",
                          children: e.jsx(a, {
                            to: `/post/${s.id}`,
                            children: s.title,
                          }),
                        }),
                        e.jsx("p", {
                          className: "text-sm text-gray-600 mb-3 line-clamp-2",
                          children: s.excerpt,
                        }),
                        e.jsxs("div", {
                          className:
                            "flex items-center justify-between text-xs text-gray-500",
                          children: [
                            e.jsxs("div", {
                              className: "flex items-center space-x-2",
                              children: [
                                e.jsx(l, { className: "w-3 h-3" }),
                                e.jsx("span", { children: s.author }),
                              ],
                            }),
                            e.jsxs("div", {
                              className: "flex items-center space-x-2",
                              children: [
                                e.jsx(c, { className: "w-3 h-3" }),
                                e.jsx("span", { children: s.date }),
                              ],
                            }),
                          ],
                        }),
                        e.jsxs("div", {
                          className:
                            "flex items-center justify-between mt-3 pt-3 border-t border-gray-100",
                          children: [
                            e.jsxs("div", {
                              className:
                                "flex items-center space-x-1 text-xs text-gray-500",
                              children: [
                                e.jsx(x, { className: "w-3 h-3" }),
                                e.jsxs("span", {
                                  children: [s.comments, " 댓글"],
                                }),
                              ],
                            }),
                            e.jsx("button", {
                              className:
                                "text-gray-400 hover:text-Snowlight-pink transition-colors",
                              children: e.jsx(h, { className: "w-4 h-4" }),
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
          children: "더 많은 포스트 보기",
        }),
      }),
    ],
  });
}
export { E as default, O as meta };
