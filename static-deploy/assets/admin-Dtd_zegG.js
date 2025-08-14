import { r as b, j as e } from "./index-BJHAE5s4.js";
import { L as u } from "./Layout-BPZhSFba.js";
import { u as y, L as r } from "./components-BzXIzYa5.js";
import { U as l } from "./users-ChKsnVKg.js";
import { M as m, C as f } from "./mic-BU8MLnEI.js";
import { A as x } from "./album-BKzKNqBc.js";
import { M as i } from "./music-CZuQgL7Q.js";
import { V as o } from "./video-DgaTGqil.js";
import { U as d } from "./upload-CDHKjDVa.js";
import { S as h } from "./shield-BdUycjnX.js";
import { C as p } from "./crown-BRMdJP8P.js";
import { c as v } from "./createLucideIcon-iNHoReR6.js";
import { P as w } from "./plus-FsPOmVV4.js";
import { C as A } from "./circle-check-big-DrBycU0f.js";
import { E as M } from "./eye-DHw6EaHY.js";
import "./LanguageContext-BFw3fmyY.js";
import "./AuthContext-CUPKj7Oa.js";
import "./index-CiN_UGES.js";
import "./search-eCLJacej.js";
/**
 * @license lucide-react v0.537.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ const U = [
    ["path", { d: "M3 3v16a2 2 0 0 0 2 2h16", key: "c24i48" }],
    ["path", { d: "M18 17V9", key: "2bz60n" }],
    ["path", { d: "M13 17V5", key: "1frdt8" }],
    ["path", { d: "M8 17v-3", key: "17ska0" }],
  ],
  C = v("chart-column", U);
function H() {
  const { user: c, stats: t, recentUsers: g, recentUploads: n } = y(),
    [a, j] = b.useState("overview"),
    N = [
      {
        id: "users",
        title: "사용자 관리",
        icon: l,
        description: "사용자 계정, 역할, VIP 멤버십 관리",
        count: t.totalUsers,
        color: "bg-blue-500",
      },
      {
        id: "artists",
        title: "아티스트 관리",
        icon: m,
        description: "아티스트 프로필, 인증, 정보 관리",
        count: t.totalArtists,
        color: "bg-purple-500",
      },
      {
        id: "albums",
        title: "앨범 관리",
        icon: x,
        description: "앨범 정보, 커버, 메타데이터 관리",
        count: t.totalAlbums,
        color: "bg-green-500",
      },
      {
        id: "songs",
        title: "음악 관리",
        icon: i,
        description: "음악 파일, 가사, 메타데이터 관리",
        count: t.totalSongs,
        color: "bg-red-500",
      },
      {
        id: "videos",
        title: "비디오 관리",
        icon: o,
        description: "뮤직비디오, 라이브 영상 관리",
        count: 0,
        color: "bg-orange-500",
      },
      {
        id: "uploads",
        title: "업로드 승인",
        icon: d,
        description: "사용자 업로드 검토 및 승인",
        count: t.pendingUploads,
        color: "bg-yellow-500",
      },
    ];
  return e.jsx(u, {
    children: e.jsxs("div", {
      className: "min-h-screen bg-gray-50",
      children: [
        e.jsx("div", {
          className: "bg-gradient-to-r from-red-600 to-pink-600 text-white",
          children: e.jsx("div", {
            className: "max-w-7xl mx-auto px-4 py-6",
            children: e.jsxs("div", {
              className: "flex items-center justify-between",
              children: [
                e.jsxs("div", {
                  className: "flex items-center space-x-4",
                  children: [
                    e.jsx(h, { className: "w-8 h-8" }),
                    e.jsxs("div", {
                      children: [
                        e.jsx("h1", {
                          className: "text-2xl font-bold",
                          children: "Snowlight 관리자 대시보드",
                        }),
                        e.jsxs("p", {
                          className: "text-red-100",
                          children: [
                            "안녕하세요, ",
                            c.name || c.username,
                            "님!",
                          ],
                        }),
                      ],
                    }),
                  ],
                }),
                e.jsx("div", {
                  className: "flex items-center space-x-4",
                  children: e.jsxs("div", {
                    className:
                      "flex items-center space-x-2 bg-white/20 rounded-lg px-3 py-2",
                    children: [
                      e.jsx(p, { className: "w-5 h-5" }),
                      e.jsx("span", {
                        className: "text-sm font-medium",
                        children: "SUPER ADMIN",
                      }),
                    ],
                  }),
                }),
              ],
            }),
          }),
        }),
        e.jsx("div", {
          className: "bg-white border-b",
          children: e.jsx("div", {
            className: "max-w-7xl mx-auto px-4",
            children: e.jsx("nav", {
              className: "flex space-x-8",
              children: [
                { id: "overview", label: "개요", icon: C },
                { id: "users", label: "사용자", icon: l },
                { id: "content", label: "콘텐츠", icon: i },
                { id: "uploads", label: "업로드 승인", icon: d },
              ].map((s) =>
                e.jsxs(
                  "button",
                  {
                    onClick: () => j(s.id),
                    className: `flex items-center space-x-2 py-4 px-2 border-b-2 font-medium text-sm ${
                      a === s.id
                        ? "border-red-500 text-red-600"
                        : "border-transparent text-gray-500 hover:text-gray-700"
                    }`,
                    children: [
                      e.jsx(s.icon, { className: "w-4 h-4" }),
                      e.jsx("span", { children: s.label }),
                    ],
                  },
                  s.id
                )
              ),
            }),
          }),
        }),
        e.jsxs("div", {
          className: "max-w-7xl mx-auto px-4 py-8",
          children: [
            a === "overview" &&
              e.jsxs("div", {
                className: "space-y-8",
                children: [
                  e.jsx("div", {
                    className:
                      "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6",
                    children: N.map((s) =>
                      e.jsxs(
                        "div",
                        {
                          className: "bg-white rounded-lg shadow p-6",
                          children: [
                            e.jsxs("div", {
                              className: "flex items-center justify-between",
                              children: [
                                e.jsxs("div", {
                                  children: [
                                    e.jsx("p", {
                                      className:
                                        "text-sm font-medium text-gray-600",
                                      children: s.title,
                                    }),
                                    e.jsx("p", {
                                      className:
                                        "text-2xl font-bold text-gray-900",
                                      children: s.count.toLocaleString(),
                                    }),
                                    e.jsx("p", {
                                      className: "text-xs text-gray-500 mt-1",
                                      children: s.description,
                                    }),
                                  ],
                                }),
                                e.jsx("div", {
                                  className: `${s.color} rounded-lg p-3`,
                                  children: e.jsx(s.icon, {
                                    className: "w-6 h-6 text-white",
                                  }),
                                }),
                              ],
                            }),
                            e.jsx("div", {
                              className: "mt-4",
                              children: e.jsx(r, {
                                to: `/admin/${s.id}`,
                                className:
                                  "text-sm text-red-600 hover:text-red-800 font-medium",
                                children: "관리하기 →",
                              }),
                            }),
                          ],
                        },
                        s.id
                      )
                    ),
                  }),
                  e.jsxs("div", {
                    className: "grid grid-cols-1 lg:grid-cols-2 gap-8",
                    children: [
                      e.jsxs("div", {
                        className: "bg-white rounded-lg shadow",
                        children: [
                          e.jsx("div", {
                            className: "px-6 py-4 border-b border-gray-200",
                            children: e.jsx("h3", {
                              className: "text-lg font-medium text-gray-900",
                              children: "최근 가입 사용자",
                            }),
                          }),
                          e.jsx("div", {
                            className: "p-6",
                            children: e.jsx("div", {
                              className: "space-y-4",
                              children: g.map((s) =>
                                e.jsxs(
                                  "div",
                                  {
                                    className:
                                      "flex items-center justify-between",
                                    children: [
                                      e.jsxs("div", {
                                        children: [
                                          e.jsx("p", {
                                            className:
                                              "text-sm font-medium text-gray-900",
                                            children: s.username,
                                          }),
                                          e.jsx("p", {
                                            className: "text-xs text-gray-500",
                                            children: s.email,
                                          }),
                                        ],
                                      }),
                                      e.jsxs("div", {
                                        className:
                                          "flex items-center space-x-2",
                                        children: [
                                          s.isVip &&
                                            e.jsx("span", {
                                              className:
                                                "inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800",
                                              children: "VIP",
                                            }),
                                          e.jsx("span", {
                                            className: `inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                              s.role === "ADMIN"
                                                ? "bg-red-100 text-red-800"
                                                : s.role === "MODERATOR"
                                                ? "bg-blue-100 text-blue-800"
                                                : "bg-gray-100 text-gray-800"
                                            }`,
                                            children: s.role,
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
                      e.jsxs("div", {
                        className: "bg-white rounded-lg shadow",
                        children: [
                          e.jsx("div", {
                            className: "px-6 py-4 border-b border-gray-200",
                            children: e.jsx("h3", {
                              className: "text-lg font-medium text-gray-900",
                              children: "최근 업로드",
                            }),
                          }),
                          e.jsx("div", {
                            className: "p-6",
                            children: e.jsx("div", {
                              className: "space-y-4",
                              children: n.map((s) =>
                                e.jsxs(
                                  "div",
                                  {
                                    className:
                                      "flex items-center justify-between",
                                    children: [
                                      e.jsxs("div", {
                                        children: [
                                          e.jsx("p", {
                                            className:
                                              "text-sm font-medium text-gray-900",
                                            children: s.title,
                                          }),
                                          e.jsxs("p", {
                                            className: "text-xs text-gray-500",
                                            children: ["by ", s.user.username],
                                          }),
                                        ],
                                      }),
                                      e.jsxs("div", {
                                        className:
                                          "flex items-center space-x-2",
                                        children: [
                                          e.jsx("span", {
                                            className: `inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                              s.isApproved
                                                ? "bg-green-100 text-green-800"
                                                : "bg-yellow-100 text-yellow-800"
                                            }`,
                                            children: s.isApproved
                                              ? "승인됨"
                                              : "대기중",
                                          }),
                                          e.jsx("span", {
                                            className: `inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                              s.type === "AUDIO"
                                                ? "bg-blue-100 text-blue-800"
                                                : "bg-purple-100 text-purple-800"
                                            }`,
                                            children: s.type,
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
                    ],
                  }),
                ],
              }),
            a === "users" &&
              e.jsxs("div", {
                className: "bg-white rounded-lg shadow",
                children: [
                  e.jsxs("div", {
                    className:
                      "px-6 py-4 border-b border-gray-200 flex items-center justify-between",
                    children: [
                      e.jsx("h3", {
                        className: "text-lg font-medium text-gray-900",
                        children: "사용자 관리",
                      }),
                      e.jsxs(r, {
                        to: "/admin/users/new",
                        className:
                          "inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700",
                        children: [
                          e.jsx(w, { className: "w-4 h-4 mr-2" }),
                          "새 사용자 추가",
                        ],
                      }),
                    ],
                  }),
                  e.jsx("div", {
                    className: "p-6",
                    children: e.jsxs("div", {
                      className:
                        "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4",
                      children: [
                        e.jsxs(r, {
                          to: "/admin/users",
                          className:
                            "p-4 border border-gray-200 rounded-lg hover:bg-gray-50",
                          children: [
                            e.jsx(l, {
                              className: "w-8 h-8 text-blue-500 mb-2",
                            }),
                            e.jsx("h4", {
                              className: "font-medium",
                              children: "모든 사용자",
                            }),
                            e.jsx("p", {
                              className: "text-sm text-gray-500",
                              children: "사용자 계정 관리",
                            }),
                          ],
                        }),
                        e.jsxs(r, {
                          to: "/admin/users/roles",
                          className:
                            "p-4 border border-gray-200 rounded-lg hover:bg-gray-50",
                          children: [
                            e.jsx(h, {
                              className: "w-8 h-8 text-purple-500 mb-2",
                            }),
                            e.jsx("h4", {
                              className: "font-medium",
                              children: "역할 관리",
                            }),
                            e.jsx("p", {
                              className: "text-sm text-gray-500",
                              children: "사용자 권한 설정",
                            }),
                          ],
                        }),
                        e.jsxs(r, {
                          to: "/admin/users/vip",
                          className:
                            "p-4 border border-gray-200 rounded-lg hover:bg-gray-50",
                          children: [
                            e.jsx(p, {
                              className: "w-8 h-8 text-yellow-500 mb-2",
                            }),
                            e.jsx("h4", {
                              className: "font-medium",
                              children: "VIP 관리",
                            }),
                            e.jsx("p", {
                              className: "text-sm text-gray-500",
                              children: "VIP 멤버십 관리",
                            }),
                          ],
                        }),
                      ],
                    }),
                  }),
                ],
              }),
            a === "content" &&
              e.jsx("div", {
                className: "space-y-6",
                children: e.jsxs("div", {
                  className:
                    "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4",
                  children: [
                    e.jsxs(r, {
                      to: "/admin/artists",
                      className:
                        "bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow",
                      children: [
                        e.jsx(m, { className: "w-8 h-8 text-purple-500 mb-3" }),
                        e.jsx("h3", {
                          className: "font-medium text-gray-900",
                          children: "아티스트",
                        }),
                        e.jsx("p", {
                          className: "text-sm text-gray-500",
                          children: "아티스트 프로필 관리",
                        }),
                        e.jsx("p", {
                          className: "text-2xl font-bold text-purple-500 mt-2",
                          children: t.totalArtists,
                        }),
                      ],
                    }),
                    e.jsxs(r, {
                      to: "/admin/albums",
                      className:
                        "bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow",
                      children: [
                        e.jsx(x, { className: "w-8 h-8 text-green-500 mb-3" }),
                        e.jsx("h3", {
                          className: "font-medium text-gray-900",
                          children: "앨범",
                        }),
                        e.jsx("p", {
                          className: "text-sm text-gray-500",
                          children: "앨범 정보 관리",
                        }),
                        e.jsx("p", {
                          className: "text-2xl font-bold text-green-500 mt-2",
                          children: t.totalAlbums,
                        }),
                      ],
                    }),
                    e.jsxs(r, {
                      to: "/admin/songs",
                      className:
                        "bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow",
                      children: [
                        e.jsx(i, { className: "w-8 h-8 text-red-500 mb-3" }),
                        e.jsx("h3", {
                          className: "font-medium text-gray-900",
                          children: "음악",
                        }),
                        e.jsx("p", {
                          className: "text-sm text-gray-500",
                          children: "음악 파일 관리",
                        }),
                        e.jsx("p", {
                          className: "text-2xl font-bold text-red-500 mt-2",
                          children: t.totalSongs,
                        }),
                      ],
                    }),
                    e.jsxs(r, {
                      to: "/admin/videos",
                      className:
                        "bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow",
                      children: [
                        e.jsx(o, { className: "w-8 h-8 text-orange-500 mb-3" }),
                        e.jsx("h3", {
                          className: "font-medium text-gray-900",
                          children: "비디오",
                        }),
                        e.jsx("p", {
                          className: "text-sm text-gray-500",
                          children: "뮤직비디오 관리",
                        }),
                        e.jsx("p", {
                          className: "text-2xl font-bold text-orange-500 mt-2",
                          children: "0",
                        }),
                      ],
                    }),
                  ],
                }),
              }),
            a === "uploads" &&
              e.jsxs("div", {
                className: "bg-white rounded-lg shadow",
                children: [
                  e.jsxs("div", {
                    className: "px-6 py-4 border-b border-gray-200",
                    children: [
                      e.jsx("h3", {
                        className: "text-lg font-medium text-gray-900",
                        children: "업로드 승인 대기",
                      }),
                      e.jsx("p", {
                        className: "text-sm text-gray-500",
                        children:
                          "사용자가 업로드한 콘텐츠를 검토하고 승인하세요",
                      }),
                    ],
                  }),
                  e.jsx("div", {
                    className: "p-6",
                    children:
                      t.pendingUploads > 0
                        ? e.jsx("div", {
                            className: "space-y-4",
                            children: n
                              .filter((s) => !s.isApproved)
                              .map((s) =>
                                e.jsx(
                                  "div",
                                  {
                                    className:
                                      "border border-gray-200 rounded-lg p-4",
                                    children: e.jsxs("div", {
                                      className:
                                        "flex items-center justify-between",
                                      children: [
                                        e.jsxs("div", {
                                          children: [
                                            e.jsx("h4", {
                                              className:
                                                "font-medium text-gray-900",
                                              children: s.title,
                                            }),
                                            e.jsxs("p", {
                                              className:
                                                "text-sm text-gray-500",
                                              children: [
                                                "업로드: ",
                                                s.user.username,
                                                " • ",
                                                s.type,
                                                " • ",
                                                new Date(
                                                  s.createdAt
                                                ).toLocaleDateString(),
                                              ],
                                            }),
                                          ],
                                        }),
                                        e.jsxs("div", {
                                          className:
                                            "flex items-center space-x-2",
                                          children: [
                                            e.jsxs("button", {
                                              className:
                                                "inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700",
                                              children: [
                                                e.jsx(A, {
                                                  className: "w-4 h-4 mr-1",
                                                }),
                                                "승인",
                                              ],
                                            }),
                                            e.jsxs("button", {
                                              className:
                                                "inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700",
                                              children: [
                                                e.jsx(f, {
                                                  className: "w-4 h-4 mr-1",
                                                }),
                                                "거부",
                                              ],
                                            }),
                                            e.jsxs("button", {
                                              className:
                                                "inline-flex items-center px-3 py-1 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50",
                                              children: [
                                                e.jsx(M, {
                                                  className: "w-4 h-4 mr-1",
                                                }),
                                                "미리보기",
                                              ],
                                            }),
                                          ],
                                        }),
                                      ],
                                    }),
                                  },
                                  s.id
                                )
                              ),
                          })
                        : e.jsxs("div", {
                            className: "text-center py-8",
                            children: [
                              e.jsx(d, {
                                className:
                                  "w-12 h-12 text-gray-400 mx-auto mb-4",
                              }),
                              e.jsx("h3", {
                                className:
                                  "text-lg font-medium text-gray-900 mb-2",
                                children: "승인 대기 중인 업로드가 없습니다",
                              }),
                              e.jsx("p", {
                                className: "text-gray-500",
                                children: "모든 업로드가 처리되었습니다.",
                              }),
                            ],
                          }),
                  }),
                ],
              }),
          ],
        }),
      ],
    }),
  });
}
export { H as default };
