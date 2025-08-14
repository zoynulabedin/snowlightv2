import { r as n, j as e } from "./index-BJHAE5s4.js";
import { u as N, m as o } from "./PlayerContext-V_k27SiC.js";
import { u as y } from "./LanguageContext-BFw3fmyY.js";
import { u as f, a as k, L as l } from "./components-BzXIzYa5.js";
import { F as w } from "./funnel-C-5Wa6A1.js";
import { P as c } from "./play-xanyyhs6.js";
import { P as S } from "./plus-FsPOmVV4.js";
import { H as T } from "./heart-Dn2OeVKi.js";
import { D as L } from "./download-D1QhcQ9O.js";
import { E as P } from "./ellipsis-oYE1YOVG.js";
import { S as $ } from "./search-eCLJacej.js";
import "./index-CiN_UGES.js";
import "./createLucideIcon-iNHoReR6.js";
const K = () => [
  { title: "검색 결과 - 벅스" },
  { name: "description", content: "벅스에서 음악을 검색하세요!" },
];
function M() {
  const { searchResults: t } = f(),
    { playTrack: d } = N(),
    { t: R } = y();
  k();
  const [a, x] = n.useState("all"),
    [m, h] = n.useState("relevance"),
    [u, g] = n.useState([]),
    p = (s) => {
      const r = o.find((i) => i.id === s);
      r && d(r, o);
    },
    b = (s) => {
      g((r) => (r.includes(s) ? r.filter((i) => i !== s) : [...r, s]));
    },
    j = [
      { id: "all", name: "전체", count: t.totalResults },
      { id: "tracks", name: "곡", count: t.tracks.length },
      { id: "artists", name: "아티스트", count: t.artists.length },
      { id: "albums", name: "앨범", count: t.albums.length },
      { id: "videos", name: "영상", count: t.videos.length },
    ],
    v = [
      { value: "relevance", label: "관련도순" },
      { value: "latest", label: "최신순" },
      { value: "popular", label: "인기순" },
      { value: "title", label: "제목순" },
    ];
  return e.jsxs("div", {
    className: "space-y-6",
    children: [
      e.jsxs("div", {
        className: "flex items-center justify-between",
        children: [
          e.jsxs("div", {
            children: [
              e.jsxs("h1", {
                className: "text-2xl font-bold text-gray-900",
                children: ["'", t.query, "' 검색 결과"],
              }),
              e.jsxs("p", {
                className: "text-gray-600 mt-1",
                children: [
                  "총 ",
                  t.totalResults.toLocaleString(),
                  "개의 결과를 찾았습니다.",
                ],
              }),
            ],
          }),
          e.jsxs("div", {
            className: "flex items-center space-x-4",
            children: [
              e.jsx("select", {
                value: m,
                onChange: (s) => h(s.target.value),
                className:
                  "border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-Snowlight-pink",
                children: v.map((s) =>
                  e.jsx(
                    "option",
                    { value: s.value, children: s.label },
                    s.value
                  )
                ),
              }),
              e.jsxs("button", {
                className:
                  "flex items-center space-x-2 px-3 py-2 border border-gray-300 rounded-md text-sm hover:bg-gray-50",
                children: [
                  e.jsx(w, { className: "w-4 h-4" }),
                  e.jsx("span", { children: "필터" }),
                ],
              }),
            ],
          }),
        ],
      }),
      e.jsx("div", {
        className: "border-b border-gray-200",
        children: e.jsx("nav", {
          className: "flex space-x-8",
          children: j.map((s) =>
            e.jsxs(
              "button",
              {
                onClick: () => x(s.id),
                className: `py-2 px-1 border-b-2 font-medium text-sm ${
                  a === s.id
                    ? "border-Snowlight-pink text-Snowlight-pink"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`,
                children: [s.name, " (", s.count, ")"],
              },
              s.id
            )
          ),
        }),
      }),
      (a === "all" || a === "tracks") &&
        t.tracks.length > 0 &&
        e.jsxs("section", {
          children: [
            e.jsx("h2", {
              className: "text-xl font-bold text-gray-900 mb-4",
              children: "곡",
            }),
            e.jsxs("div", {
              className: "bg-white rounded-lg shadow-sm border border-gray-200",
              children: [
                a === "tracks" &&
                  e.jsx("div", {
                    className: "p-4 border-b border-gray-200 bg-gray-50",
                    children: e.jsxs("div", {
                      className: "flex items-center space-x-4",
                      children: [
                        e.jsx("button", {
                          className:
                            "text-sm text-Snowlight-pink hover:text-pink-600",
                          children: "전체 선택",
                        }),
                        e.jsxs("div", {
                          className: "flex space-x-2",
                          children: [
                            e.jsx("button", {
                              className:
                                "Snowlight-button Snowlight-button-secondary text-sm",
                              children: "선택된 곡 재생",
                            }),
                            e.jsx("button", {
                              className:
                                "Snowlight-button Snowlight-button-secondary text-sm",
                              children: "재생목록에 추가",
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
                  }),
                e.jsx("div", {
                  className: "divide-y divide-gray-200",
                  children: t.tracks.map((s) =>
                    e.jsx(
                      "div",
                      {
                        className: "p-4 hover:bg-gray-50 transition-colors",
                        children: e.jsxs("div", {
                          className: "flex items-center space-x-4",
                          children: [
                            a === "tracks" &&
                              e.jsx("input", {
                                type: "checkbox",
                                checked: u.includes(s.id),
                                onChange: () => b(s.id),
                                className:
                                  "rounded border-gray-300 text-Snowlight-pink focus:ring-Snowlight-pink",
                              }),
                            e.jsx("img", {
                              src: s.coverUrl,
                              alt: s.title,
                              className: "w-12 h-12 rounded object-cover",
                            }),
                            e.jsxs("div", {
                              className: "flex-1 min-w-0",
                              children: [
                                e.jsxs("div", {
                                  className: "flex items-center space-x-2",
                                  children: [
                                    e.jsx("h3", {
                                      className:
                                        "font-medium text-gray-900 truncate",
                                      children: s.title,
                                    }),
                                    s.isTitle &&
                                      e.jsx("span", {
                                        className:
                                          "text-xs bg-Snowlight-pink text-white px-2 py-0.5 rounded",
                                        children: "타이틀곡",
                                      }),
                                  ],
                                }),
                                e.jsxs("div", {
                                  className:
                                    "flex items-center space-x-2 text-sm text-gray-600",
                                  children: [
                                    e.jsx(l, {
                                      to: `/artist/${s.artist}`,
                                      className: "hover:text-Snowlight-pink",
                                      children: s.artist,
                                    }),
                                    e.jsx("span", { children: "•" }),
                                    e.jsx(l, {
                                      to: `/album/${s.id}`,
                                      className: "hover:text-Snowlight-pink",
                                      children: s.album,
                                    }),
                                    e.jsx("span", { children: "•" }),
                                    e.jsx("span", { children: s.duration }),
                                  ],
                                }),
                              ],
                            }),
                            e.jsxs("div", {
                              className: "flex items-center space-x-2",
                              children: [
                                e.jsx("button", {
                                  onClick: () => p(s.id),
                                  className:
                                    "p-2 text-gray-600 hover:text-Snowlight-pink hover:bg-pink-50 rounded-md transition-colors",
                                  children: e.jsx(c, { className: "w-4 h-4" }),
                                }),
                                e.jsx("button", {
                                  className:
                                    "p-2 text-gray-600 hover:text-Snowlight-pink hover:bg-pink-50 rounded-md transition-colors",
                                  children: e.jsx(S, { className: "w-4 h-4" }),
                                }),
                                e.jsx("button", {
                                  className:
                                    "p-2 text-gray-600 hover:text-Snowlight-pink hover:bg-pink-50 rounded-md transition-colors",
                                  children: e.jsx(T, { className: "w-4 h-4" }),
                                }),
                                e.jsx("button", {
                                  className:
                                    "p-2 text-gray-600 hover:text-Snowlight-pink hover:bg-pink-50 rounded-md transition-colors",
                                  children: e.jsx(L, { className: "w-4 h-4" }),
                                }),
                                e.jsx("button", {
                                  className:
                                    "p-2 text-gray-600 hover:text-Snowlight-pink hover:bg-pink-50 rounded-md transition-colors",
                                  children: e.jsx(P, { className: "w-4 h-4" }),
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
                a === "all" &&
                  t.tracks.length > 3 &&
                  e.jsx("div", {
                    className: "p-4 border-t border-gray-200 text-center",
                    children: e.jsxs(l, {
                      to: `/search?q=${t.query}&tab=tracks`,
                      className:
                        "text-Snowlight-pink hover:text-pink-600 font-medium",
                      children: ["곡 더보기 (", t.tracks.length - 3, "개 더)"],
                    }),
                  }),
              ],
            }),
          ],
        }),
      (a === "all" || a === "artists") &&
        t.artists.length > 0 &&
        e.jsxs("section", {
          children: [
            e.jsx("h2", {
              className: "text-xl font-bold text-gray-900 mb-4",
              children: "아티스트",
            }),
            e.jsx("div", {
              className:
                "bg-white rounded-lg shadow-sm border border-gray-200 p-6",
              children: e.jsx("div", {
                className:
                  "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6",
                children: t.artists.map((s) =>
                  e.jsxs(
                    l,
                    {
                      to: `/artist/${s.name}`,
                      className:
                        "flex items-center space-x-4 p-4 rounded-lg hover:bg-gray-50 transition-colors",
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
                              className: "font-medium text-gray-900 truncate",
                              children: s.name,
                            }),
                            e.jsx("p", {
                              className: "text-sm text-gray-600",
                              children: s.genre,
                            }),
                            e.jsxs("p", {
                              className: "text-xs text-gray-500",
                              children: [
                                s.followers.toLocaleString(),
                                " 팔로워",
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
            }),
          ],
        }),
      (a === "all" || a === "albums") &&
        t.albums.length > 0 &&
        e.jsxs("section", {
          children: [
            e.jsx("h2", {
              className: "text-xl font-bold text-gray-900 mb-4",
              children: "앨범",
            }),
            e.jsx("div", {
              className:
                "bg-white rounded-lg shadow-sm border border-gray-200 p-6",
              children: e.jsx("div", {
                className:
                  "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6",
                children: t.albums.map((s) =>
                  e.jsxs(
                    l,
                    {
                      to: `/album/${s.id}`,
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
                                  className:
                                    "w-5 h-5 text-Snowlight-pink ml-0.5",
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
                              children: s.title,
                            }),
                            e.jsx("p", {
                              className:
                                "text-sm text-gray-600 hover:text-Snowlight-pink transition-colors line-clamp-1",
                              children: s.artist,
                            }),
                            e.jsxs("div", {
                              className:
                                "flex items-center justify-between text-xs text-gray-500",
                              children: [
                                e.jsx("span", { children: s.releaseDate }),
                                e.jsx("span", { children: s.type }),
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
            }),
          ],
        }),
      (a === "all" || a === "videos") &&
        t.videos.length > 0 &&
        e.jsxs("section", {
          children: [
            e.jsx("h2", {
              className: "text-xl font-bold text-gray-900 mb-4",
              children: "영상",
            }),
            e.jsx("div", {
              className:
                "bg-white rounded-lg shadow-sm border border-gray-200 p-6",
              children: e.jsx("div", {
                className:
                  "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6",
                children: t.videos.map((s) =>
                  e.jsxs(
                    "div",
                    {
                      className: "group cursor-pointer",
                      children: [
                        e.jsxs("div", {
                          className:
                            "relative aspect-video mb-3 overflow-hidden rounded-lg bg-gray-200",
                          children: [
                            e.jsx("img", {
                              src: s.thumbnail,
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
                                  className:
                                    "w-5 h-5 text-Snowlight-pink ml-0.5",
                                }),
                              }),
                            }),
                            e.jsx("div", {
                              className:
                                "absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded",
                              children: s.duration,
                            }),
                          ],
                        }),
                        e.jsxs("div", {
                          className: "space-y-1",
                          children: [
                            e.jsx("h3", {
                              className:
                                "font-medium text-gray-900 hover:text-Snowlight-pink transition-colors line-clamp-2",
                              children: s.title,
                            }),
                            e.jsx("p", {
                              className:
                                "text-sm text-gray-600 hover:text-Snowlight-pink transition-colors",
                              children: s.artist,
                            }),
                            e.jsxs("p", {
                              className: "text-xs text-gray-500",
                              children: [s.views.toLocaleString(), " 회 재생"],
                            }),
                          ],
                        }),
                      ],
                    },
                    s.id
                  )
                ),
              }),
            }),
          ],
        }),
      t.totalResults === 0 &&
        e.jsxs("div", {
          className: "text-center py-12",
          children: [
            e.jsx($, { className: "w-16 h-16 mx-auto mb-4 text-gray-300" }),
            e.jsx("h2", {
              className: "text-xl font-semibold text-gray-900 mb-2",
              children: "검색 결과가 없습니다",
            }),
            e.jsx("p", {
              className: "text-gray-600 mb-6",
              children: "다른 검색어로 다시 시도해보세요.",
            }),
            e.jsxs("div", {
              className: "space-y-2 text-sm text-gray-500",
              children: [
                e.jsx("p", {
                  children: "• 검색어의 철자가 정확한지 확인해보세요",
                }),
                e.jsx("p", { children: "• 더 간단한 검색어를 사용해보세요" }),
                e.jsx("p", { children: "• 다른 검색어를 사용해보세요" }),
              ],
            }),
          ],
        }),
    ],
  });
}
export { M as default, K as meta };
