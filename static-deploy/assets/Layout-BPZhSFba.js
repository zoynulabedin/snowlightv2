import { r as n, j as e } from "./index-BJHAE5s4.js";
import { u } from "./LanguageContext-BFw3fmyY.js";
import { u as w } from "./AuthContext-CUPKj7Oa.js";
import { c as m } from "./createLucideIcon-iNHoReR6.js";
import { d as k } from "./index-CiN_UGES.js";
import { L as s } from "./components-BzXIzYa5.js";
import { S } from "./search-eCLJacej.js";
/**
 * @license lucide-react v0.537.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ const C = [
    ["path", { d: "M10.268 21a2 2 0 0 0 3.464 0", key: "vwvbt9" }],
    [
      "path",
      {
        d: "M3.262 15.326A1 1 0 0 0 4 17h16a1 1 0 0 0 .74-1.673C19.41 13.956 18 12.499 18 8A6 6 0 0 0 6 8c0 4.499-1.411 5.956-2.738 7.326",
        key: "11g9vi",
      },
    ],
  ],
  b = m("bell", C);
/**
 * @license lucide-react v0.537.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ const M = [["path", { d: "m6 9 6 6 6-6", key: "qrunsl" }]],
  o = m("chevron-down", M);
/**
 * @license lucide-react v0.537.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ const A = [["path", { d: "m18 15-6-6-6 6", key: "153udz" }]],
  j = m("chevron-up", A);
/**
 * @license lucide-react v0.537.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ const F = [
    ["circle", { cx: "12", cy: "12", r: "10", key: "1mglay" }],
    [
      "path",
      { d: "M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20", key: "13o1zl" },
    ],
    ["path", { d: "M2 12h20", key: "9i4pu4" }],
  ],
  I = m("globe", F);
function L() {
  const { language: x, setLanguage: y } = u(),
    [t, d] = n.useState(!1),
    h = [
      { code: "ko", name: "한국어", flag: "🇰🇷" },
      { code: "en", name: "English", flag: "🇺🇸" },
    ],
    a = h.find((r) => r.code === x),
    i = (r) => {
      y(r), d(!1);
    };
  return e.jsxs("div", {
    className: "relative",
    children: [
      e.jsxs("button", {
        onClick: () => d(!t),
        className:
          "flex items-center space-x-2 px-3 py-2 text-sm text-gray-600 hover:text-Snowlight-pink transition-colors rounded-md hover:bg-gray-50",
        children: [
          e.jsx(I, { className: "w-4 h-4" }),
          e.jsx("span", {
            className: "hidden sm:inline",
            children: a == null ? void 0 : a.flag,
          }),
          e.jsx("span", {
            className: "hidden md:inline",
            children: a == null ? void 0 : a.name,
          }),
          e.jsx(o, {
            className: `w-3 h-3 transition-transform ${t ? "rotate-180" : ""}`,
          }),
        ],
      }),
      t &&
        e.jsxs(e.Fragment, {
          children: [
            e.jsx("div", {
              className: "fixed inset-0 z-10",
              onClick: () => d(!1),
            }),
            e.jsx("div", {
              className:
                "absolute right-0 top-full mt-1 w-40 bg-white border border-gray-200 rounded-md shadow-lg z-20",
              children: h.map((r) =>
                e.jsxs(
                  "button",
                  {
                    onClick: () => i(r.code),
                    className: `w-full flex items-center space-x-3 px-4 py-3 text-sm text-left hover:bg-gray-50 transition-colors first:rounded-t-md last:rounded-b-md ${
                      x === r.code
                        ? "bg-pink-50 text-Snowlight-pink"
                        : "text-gray-700"
                    }`,
                    children: [
                      e.jsx("span", { className: "text-lg", children: r.flag }),
                      e.jsx("span", { children: r.name }),
                      x === r.code &&
                        e.jsx("div", {
                          className:
                            "ml-auto w-2 h-2 bg-Snowlight-pink rounded-full",
                        }),
                    ],
                  },
                  r.code
                )
              ),
            }),
          ],
        }),
    ],
  });
}
function U({ children: x }) {
  const { t: y } = u(),
    { user: t, logout: d } = w();
  k();
  const [h, a] = n.useState(!1),
    [i, r] = n.useState(""),
    [l, f] = n.useState({ 기타: !1, 즐겨찾기: !1, 벅스TV: !1 }),
    p = (c) => {
      c.preventDefault(),
        i.trim() &&
          (window.location.href = `/search?q=${encodeURIComponent(i)}`);
    },
    v = async () => {
      await d(), (window.location.href = "/");
    },
    g = (c) => {
      f((N) => ({ ...N, [c]: !N[c] }));
    };
  return e.jsxs("div", {
    className: "min-h-screen bg-white",
    children: [
      e.jsx("div", {
        className:
          "bg-gradient-to-r from-blue-400 to-blue-600 text-white py-1 px-4 text-sm",
        children: e.jsxs("div", {
          className: "max-w-7xl mx-auto flex items-center justify-between",
          children: [
            e.jsx("div", {
              className: "flex items-center space-x-4",
              children: e.jsx("span", { children: "Favorite · 2025 상반기" }),
            }),
            e.jsx("button", {
              className: "text-white hover:text-gray-200",
              children: "배너닫기",
            }),
          ],
        }),
      }),
      e.jsx("div", {
        className: "bg-gray-100 border-b py-1 px-4 text-xs",
        children: e.jsxs("div", {
          className: "max-w-7xl mx-auto flex items-center justify-between",
          children: [
            e.jsxs("div", {
              className: "flex items-center space-x-4",
              children: [
                e.jsx("a", {
                  href: "#",
                  className: "text-gray-600 hover:text-gray-900",
                  children: "나를 위한 플리",
                }),
                e.jsx("a", {
                  href: "#",
                  className: "text-gray-600 hover:text-gray-900",
                  children: "essential;",
                }),
                e.jsx("a", {
                  href: "#",
                  className: "text-gray-600 hover:text-gray-900",
                  children: "웹 플레이어",
                }),
                e.jsx("a", {
                  href: "#",
                  className: "text-gray-600 hover:text-gray-900",
                  children: "벅스 플레이어",
                }),
                e.jsx("a", {
                  href: "#",
                  className: "text-gray-600 hover:text-gray-900",
                  children: "고객센터",
                }),
              ],
            }),
            e.jsxs("div", {
              className: "flex items-center space-x-4",
              children: [
                e.jsx("a", {
                  href: "#",
                  className: "text-gray-600 hover:text-gray-900",
                  children: "게임",
                }),
                e.jsx("a", {
                  href: "#",
                  className: "text-gray-600 hover:text-gray-900",
                  children: "comico",
                }),
                e.jsx("a", {
                  href: "#",
                  className: "text-gray-600 hover:text-gray-900",
                  children: "티켓링크",
                }),
                e.jsx("a", {
                  href: "#",
                  className: "text-gray-600 hover:text-gray-900",
                  children: "HANGAME",
                }),
              ],
            }),
          ],
        }),
      }),
      e.jsx("header", {
        className: "bg-white border-b border-gray-200",
        children: e.jsx("div", {
          className: "max-w-7xl mx-auto px-4 py-3",
          children: e.jsxs("div", {
            className: "flex items-center justify-between",
            children: [
              e.jsx("div", {
                className: "flex items-center",
                children: e.jsx(s, {
                  to: "/",
                  className: "text-3xl font-bold text-red-600",
                  children: "Snowlight!",
                }),
              }),
              e.jsx("div", {
                className: "flex-1 max-w-md mx-8",
                children: e.jsxs("form", {
                  onSubmit: p,
                  className: "relative",
                  children: [
                    e.jsx("input", {
                      type: "text",
                      value: i,
                      onChange: (c) => r(c.target.value),
                      placeholder: "검색어 입력",
                      className:
                        "w-full px-4 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:border-gray-400",
                    }),
                    e.jsx("button", {
                      type: "submit",
                      className:
                        "absolute right-0 top-0 h-full px-4 bg-green-500 text-white rounded-r-md hover:bg-green-600 transition-colors",
                      children: e.jsx(S, { className: "w-4 h-4" }),
                    }),
                  ],
                }),
              }),
              e.jsxs("div", {
                className: "flex items-center space-x-4 text-sm",
                children: [
                  t
                    ? e.jsxs(e.Fragment, {
                        children: [
                          e.jsxs("span", {
                            className: "text-gray-700",
                            children: [
                              "안녕하세요, ",
                              t.name || t.username,
                              "님",
                            ],
                          }),
                          e.jsx("button", {
                            className: "p-1 text-gray-400 hover:text-gray-600",
                            children: e.jsx(b, { className: "w-4 h-4" }),
                          }),
                          e.jsx("button", {
                            onClick: v,
                            className: "text-gray-600 hover:text-gray-900",
                            children: "로그아웃",
                          }),
                        ],
                      })
                    : e.jsxs(e.Fragment, {
                        children: [
                          e.jsx(s, {
                            to: "/login",
                            className: "text-gray-600 hover:text-gray-900",
                            children: "로그인 / 회원가입",
                          }),
                          e.jsx("button", {
                            className: "p-1 text-gray-400 hover:text-gray-600",
                            children: e.jsx(b, { className: "w-4 h-4" }),
                          }),
                        ],
                      }),
                  e.jsx(s, {
                    to: "/membership",
                    className: "text-red-600 hover:text-red-700 font-medium",
                    children: "벅스 VIP 멤버십 안내",
                  }),
                  e.jsx("a", {
                    href: "#",
                    className: "text-gray-600 hover:text-gray-900",
                    children: "이용권 구매",
                  }),
                  e.jsx("a", {
                    href: "#",
                    className: "text-gray-600 hover:text-gray-900",
                    children: "상품권 등록",
                  }),
                ],
              }),
            ],
          }),
        }),
      }),
      e.jsx("nav", {
        className: "bg-white border-b border-gray-200",
        children: e.jsx("div", {
          className: "max-w-7xl mx-auto px-4",
          children: e.jsxs("div", {
            className: "flex items-center space-x-8 py-2 text-sm",
            children: [
              e.jsx(s, {
                to: "/chart",
                className: "text-gray-700 hover:text-gray-900 font-medium",
                children: "벅스차트",
              }),
              e.jsx(s, {
                to: "/newest",
                className: "text-gray-700 hover:text-gray-900 font-medium",
                children: "최신 음악",
              }),
              e.jsx(s, {
                to: "/music4u",
                className: "text-gray-700 hover:text-gray-900 font-medium",
                children: "뮤직4U",
              }),
              e.jsx(s, {
                to: "/genres",
                className: "text-gray-700 hover:text-gray-900 font-medium",
                children: "장르",
              }),
              e.jsx(s, {
                to: "/musicposts",
                className: "text-gray-700 hover:text-gray-900 font-medium",
                children: "뮤직포스트",
              }),
              e.jsx(s, {
                to: "/pdalbums",
                className: "text-gray-700 hover:text-gray-900 font-medium",
                children: "뮤직PD 앨범",
              }),
              e.jsx(s, {
                to: "/reviews",
                className: "text-gray-700 hover:text-gray-900 font-medium",
                children: "추천앨범 리뷰",
              }),
              e.jsx(s, {
                to: "/by-year",
                className: "text-gray-700 hover:text-gray-900 font-medium",
                children: "연도별",
              }),
              e.jsx(s, {
                to: "/favorite",
                className: "text-gray-700 hover:text-gray-900 font-medium",
                children: "Favorite",
              }),
              e.jsx(s, {
                to: "/heart-station",
                className: "text-gray-700 hover:text-gray-900 font-medium",
                children: "하트 충전소",
              }),
              e.jsx("a", {
                href: "#",
                className: "text-gray-700 hover:text-gray-900 font-medium",
                children: "커넥트",
              }),
              e.jsx("a", {
                href: "#",
                className: "text-gray-700 hover:text-gray-900 font-medium",
                children: "라디오",
              }),
            ],
          }),
        }),
      }),
      e.jsx("div", {
        className: "max-w-7xl mx-auto px-4 py-4",
        children: e.jsxs("div", {
          className: "flex gap-4",
          children: [
            e.jsx("aside", {
              className: "w-48 flex-shrink-0",
              children: e.jsxs("div", {
                className: "space-y-2",
                children: [
                  e.jsx("div", {
                    className:
                      "bg-purple-600 text-white rounded p-2 text-center text-sm font-medium",
                    children: e.jsx(s, {
                      to: "/membership",
                      className: "block",
                      children: "벅스 VIP 멤버십 안내",
                    }),
                  }),
                  e.jsx("div", {
                    className:
                      "bg-orange-500 text-white rounded p-2 text-center text-sm font-medium",
                    children: e.jsx("a", {
                      href: "#",
                      className: "block",
                      children: "신용권 등록",
                    }),
                  }),
                  e.jsxs("div", {
                    className: "space-y-1",
                    children: [
                      e.jsx("div", {
                        className:
                          "bg-green-100 border-l-4 border-green-500 p-2",
                        children: e.jsx(s, {
                          to: "/chart",
                          className: "text-green-700 font-medium text-sm",
                          children: "벅스차트",
                        }),
                      }),
                      e.jsx("div", {
                        className: "bg-red-100 border-l-4 border-red-500 p-2",
                        children: e.jsx(s, {
                          to: "/newest",
                          className: "text-red-700 font-medium text-sm",
                          children: "최신 음악",
                        }),
                      }),
                      e.jsx("div", {
                        className: "bg-blue-100 border-l-4 border-blue-500 p-2",
                        children: e.jsx(s, {
                          to: "/music4u",
                          className: "text-blue-700 font-medium text-sm",
                          children: "뮤직4U",
                        }),
                      }),
                      e.jsx("div", {
                        className: "bg-red-100 border-l-4 border-red-500 p-2",
                        children: e.jsx(s, {
                          to: "/genres",
                          className: "text-red-700 font-medium text-sm",
                          children: "장르",
                        }),
                      }),
                      e.jsx("div", {
                        className:
                          "bg-green-100 border-l-4 border-green-500 p-2",
                        children: e.jsx(s, {
                          to: "/musicposts",
                          className: "text-green-700 font-medium text-sm",
                          children: "뮤직포스트",
                        }),
                      }),
                      e.jsx("div", {
                        className:
                          "bg-purple-100 border-l-4 border-purple-500 p-2",
                        children: e.jsx(s, {
                          to: "/pdalbums",
                          className: "text-purple-700 font-medium text-sm",
                          children: "뮤직PD 앨범",
                        }),
                      }),
                      e.jsxs("div", {
                        className: "border border-gray-200 rounded",
                        children: [
                          e.jsxs("button", {
                            onClick: () => g("기타"),
                            className:
                              "w-full flex items-center justify-between p-2 text-sm font-medium text-gray-700 hover:bg-gray-50",
                            children: [
                              "기타",
                              l.기타
                                ? e.jsx(j, { className: "w-4 h-4" })
                                : e.jsx(o, { className: "w-4 h-4" }),
                            ],
                          }),
                          l.기타 &&
                            e.jsxs("div", {
                              className:
                                "border-t border-gray-200 p-2 space-y-1",
                              children: [
                                e.jsx(s, {
                                  to: "/reviews",
                                  className:
                                    "block text-xs text-gray-600 hover:text-gray-900",
                                  children: "추천앨범 리뷰",
                                }),
                                e.jsx(s, {
                                  to: "/by-year",
                                  className:
                                    "block text-xs text-gray-600 hover:text-gray-900",
                                  children: "연도별",
                                }),
                                e.jsx(s, {
                                  to: "/upload",
                                  className:
                                    "block text-xs text-gray-600 hover:text-gray-900",
                                  children: "업로드",
                                }),
                              ],
                            }),
                        ],
                      }),
                      e.jsxs("div", {
                        className: "border border-gray-200 rounded",
                        children: [
                          e.jsxs("button", {
                            onClick: () => g("즐겨찾기"),
                            className:
                              "w-full flex items-center justify-between p-2 text-sm font-medium text-gray-700 hover:bg-gray-50",
                            children: [
                              "즐겨찾기",
                              l.즐겨찾기
                                ? e.jsx(j, { className: "w-4 h-4" })
                                : e.jsx(o, { className: "w-4 h-4" }),
                            ],
                          }),
                          l.즐겨찾기 &&
                            e.jsxs("div", {
                              className:
                                "border-t border-gray-200 p-2 space-y-1",
                              children: [
                                e.jsx(s, {
                                  to: "/favorite",
                                  className:
                                    "block text-xs text-gray-600 hover:text-gray-900",
                                  children: "Fav",
                                }),
                                e.jsx(s, {
                                  to: "/heart-station",
                                  className:
                                    "block text-xs text-gray-600 hover:text-gray-900",
                                  children: "하트 충전소",
                                }),
                                e.jsx(s, {
                                  to: "/dashboard",
                                  className:
                                    "block text-xs text-gray-600 hover:text-gray-900",
                                  children: "마이페이지",
                                }),
                              ],
                            }),
                        ],
                      }),
                      e.jsx("div", {
                        className:
                          "bg-purple-100 border-l-4 border-purple-500 p-2",
                        children: e.jsx("a", {
                          href: "#",
                          className: "text-purple-700 font-medium text-sm",
                          children: "커넥트",
                        }),
                      }),
                      e.jsx("div", {
                        className:
                          "bg-orange-100 border-l-4 border-orange-500 p-2",
                        children: e.jsx("a", {
                          href: "#",
                          className: "text-orange-700 font-medium text-sm",
                          children: "라디오",
                        }),
                      }),
                      e.jsxs("div", {
                        className: "border border-gray-200 rounded",
                        children: [
                          e.jsxs("button", {
                            onClick: () => g("벅스TV"),
                            className:
                              "w-full flex items-center justify-between p-2 text-sm font-medium text-gray-700 hover:bg-gray-50",
                            children: [
                              "벅스TV",
                              l.벅스TV
                                ? e.jsx(j, { className: "w-4 h-4" })
                                : e.jsx(o, { className: "w-4 h-4" }),
                            ],
                          }),
                          l.벅스TV &&
                            e.jsxs("div", {
                              className:
                                "border-t border-gray-200 p-2 space-y-1",
                              children: [
                                e.jsx("a", {
                                  href: "#",
                                  className:
                                    "block text-xs text-gray-600 hover:text-gray-900",
                                  children: "뮤직비디오",
                                }),
                                e.jsx("a", {
                                  href: "#",
                                  className:
                                    "block text-xs text-gray-600 hover:text-gray-900",
                                  children: "라이브",
                                }),
                                e.jsx("a", {
                                  href: "#",
                                  className:
                                    "block text-xs text-gray-600 hover:text-gray-900",
                                  children: "인터뷰",
                                }),
                              ],
                            }),
                        ],
                      }),
                      e.jsx("div", {
                        className:
                          "bg-yellow-100 border-l-4 border-yellow-500 p-2",
                        children: e.jsx("a", {
                          href: "#",
                          className: "text-yellow-700 font-medium text-sm",
                          children: "이벤트",
                        }),
                      }),
                      e.jsx("div", {
                        className:
                          "bg-indigo-100 border-l-4 border-indigo-500 p-2",
                        children: e.jsx("a", {
                          href: "#",
                          className: "text-indigo-700 font-medium text-sm",
                          children: "공지사항",
                        }),
                      }),
                      e.jsx("div", {
                        className: "bg-pink-100 border-l-4 border-pink-500 p-2",
                        children: e.jsx("a", {
                          href: "#",
                          className: "text-pink-700 font-medium text-sm",
                          children: "고객센터",
                        }),
                      }),
                      e.jsx("div", {
                        className: "border border-gray-200 rounded p-2",
                        children: e.jsx(L, {}),
                      }),
                      e.jsxs("div", {
                        className:
                          "bg-gray-100 border border-gray-200 rounded p-2",
                        children: [
                          e.jsx("div", {
                            className: "text-xs font-medium text-gray-700 mb-2",
                            children: "소셜 미디어",
                          }),
                          e.jsxs("div", {
                            className: "flex space-x-2",
                            children: [
                              e.jsx("a", {
                                href: "#",
                                className:
                                  "text-blue-600 hover:text-blue-800 text-xs",
                                children: "Facebook",
                              }),
                              e.jsx("a", {
                                href: "#",
                                className:
                                  "text-blue-400 hover:text-blue-600 text-xs",
                                children: "Twitter",
                              }),
                              e.jsx("a", {
                                href: "#",
                                className:
                                  "text-pink-600 hover:text-pink-800 text-xs",
                                children: "Instagram",
                              }),
                            ],
                          }),
                        ],
                      }),
                      e.jsxs("div", {
                        className:
                          "bg-gray-900 text-white rounded p-2 text-center",
                        children: [
                          e.jsx("div", {
                            className: "text-xs font-medium mb-1",
                            children: "벅스 앱 다운로드",
                          }),
                          e.jsxs("div", {
                            className: "flex space-x-1",
                            children: [
                              e.jsx("a", {
                                href: "#",
                                className:
                                  "text-xs bg-gray-700 px-2 py-1 rounded hover:bg-gray-600",
                                children: "iOS",
                              }),
                              e.jsx("a", {
                                href: "#",
                                className:
                                  "text-xs bg-gray-700 px-2 py-1 rounded hover:bg-gray-600",
                                children: "Android",
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
            e.jsx("main", { className: "flex-1", children: x }),
          ],
        }),
      }),
      e.jsx("footer", {
        className: "bg-gray-100 border-t border-gray-200 mt-8",
        children: e.jsxs("div", {
          className: "max-w-7xl mx-auto px-4 py-8",
          children: [
            e.jsxs("div", {
              className: "grid grid-cols-1 md:grid-cols-4 gap-8 text-sm",
              children: [
                e.jsxs("div", {
                  children: [
                    e.jsx("h3", {
                      className: "font-bold text-red-600 mb-4",
                      children: "Snowlight!",
                    }),
                    e.jsx("p", {
                      className: "text-gray-600",
                      children: "음악이 필요한 순간, 벅스와 함께하세요.",
                    }),
                  ],
                }),
                e.jsxs("div", {
                  children: [
                    e.jsx("h4", {
                      className: "font-semibold mb-4 text-gray-900",
                      children: "서비스",
                    }),
                    e.jsxs("ul", {
                      className: "space-y-2 text-gray-600",
                      children: [
                        e.jsx("li", {
                          children: e.jsx(s, {
                            to: "/chart",
                            className: "hover:text-gray-900",
                            children: "벅스차트",
                          }),
                        }),
                        e.jsx("li", {
                          children: e.jsx(s, {
                            to: "/newest",
                            className: "hover:text-gray-900",
                            children: "최신 음악",
                          }),
                        }),
                        e.jsx("li", {
                          children: e.jsx(s, {
                            to: "/music4u",
                            className: "hover:text-gray-900",
                            children: "뮤직4U",
                          }),
                        }),
                        e.jsx("li", {
                          children: e.jsx(s, {
                            to: "/membership",
                            className: "hover:text-gray-900",
                            children: "VIP 멤버십",
                          }),
                        }),
                      ],
                    }),
                  ],
                }),
                e.jsxs("div", {
                  children: [
                    e.jsx("h4", {
                      className: "font-semibold mb-4 text-gray-900",
                      children: "고객지원",
                    }),
                    e.jsxs("ul", {
                      className: "space-y-2 text-gray-600",
                      children: [
                        e.jsx("li", {
                          children: e.jsx("a", {
                            href: "#",
                            className: "hover:text-gray-900",
                            children: "공지사항",
                          }),
                        }),
                        e.jsx("li", {
                          children: e.jsx("a", {
                            href: "#",
                            className: "hover:text-gray-900",
                            children: "FAQ",
                          }),
                        }),
                        e.jsx("li", {
                          children: e.jsx("a", {
                            href: "#",
                            className: "hover:text-gray-900",
                            children: "1:1 문의",
                          }),
                        }),
                        e.jsx("li", {
                          children: e.jsx("span", {
                            children: "고객센터: 1588-2378",
                          }),
                        }),
                      ],
                    }),
                  ],
                }),
                e.jsxs("div", {
                  children: [
                    e.jsx("h4", {
                      className: "font-semibold mb-4 text-gray-900",
                      children: "회사정보",
                    }),
                    e.jsxs("ul", {
                      className: "space-y-2 text-gray-600",
                      children: [
                        e.jsx("li", {
                          children: e.jsx("a", {
                            href: "#",
                            className: "hover:text-gray-900",
                            children: "회사소개",
                          }),
                        }),
                        e.jsx("li", {
                          children: e.jsx("a", {
                            href: "#",
                            className: "hover:text-gray-900",
                            children: "이용약관",
                          }),
                        }),
                        e.jsx("li", {
                          children: e.jsx("a", {
                            href: "#",
                            className: "hover:text-gray-900",
                            children: "개인정보처리방침",
                          }),
                        }),
                        e.jsx("li", {
                          children: e.jsx("a", {
                            href: "#",
                            className: "hover:text-gray-900",
                            children: "청소년보호정책",
                          }),
                        }),
                      ],
                    }),
                  ],
                }),
              ],
            }),
            e.jsx("div", {
              className:
                "border-t border-gray-300 mt-8 pt-8 text-center text-xs text-gray-500",
              children: e.jsx("p", {
                children: "© 2024 Snowlight Music. All rights reserved.",
              }),
            }),
          ],
        }),
      }),
    ],
  });
}
export { I as G, U as L };
