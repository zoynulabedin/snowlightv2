import { r as n, j as e } from "./index-BJHAE5s4.js";
import { u as m } from "./LanguageContext-BFw3fmyY.js";
import { u as o } from "./AuthContext-CUPKj7Oa.js";
import { u as h } from "./index-CiN_UGES.js";
import { H as r } from "./heart-Dn2OeVKi.js";
import { C as l } from "./crown-BRMdJP8P.js";
import { c as g } from "./createLucideIcon-iNHoReR6.js";
import { U as d } from "./user-DTJm30ZA.js";
import { U as i } from "./upload-CDHKjDVa.js";
import { M as j } from "./music-CZuQgL7Q.js";
import { T as p } from "./trending-up-BpWpwtul.js";
import { S as u } from "./star-W7y2fMPn.js";
import { H as f } from "./headphones-j1A_UXWL.js";
/**
 * @license lucide-react v0.537.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ const b = [
    ["path", { d: "m16 17 5-5-5-5", key: "1bji2h" }],
    ["path", { d: "M21 12H9", key: "dn1m92" }],
    ["path", { d: "M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4", key: "1uf3rs" }],
  ],
  N = g("log-out", b);
function S() {
  const { t: y } = m(),
    { user: s, logout: c, isLoading: t } = o(),
    a = h();
  n.useEffect(() => {
    !t && !s && a("/login");
  }, [s, t, a]);
  const x = async () => {
    await c(), a("/");
  };
  return t
    ? e.jsx("div", {
        className: "min-h-screen bg-gray-50 flex items-center justify-center",
        children: e.jsxs("div", {
          className: "flex items-center space-x-2",
          children: [
            e.jsx("div", {
              className:
                "w-8 h-8 border-4 border-Snowlight-pink border-t-transparent rounded-full animate-spin",
            }),
            e.jsx("span", {
              className: "text-gray-600",
              children: "로딩 중...",
            }),
          ],
        }),
      })
    : s
    ? e.jsxs("div", {
        className: "min-h-screen bg-gray-50",
        children: [
          e.jsx("div", {
            className: "bg-white shadow-sm border-b",
            children: e.jsx("div", {
              className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8",
              children: e.jsxs("div", {
                className: "flex justify-between items-center py-4",
                children: [
                  e.jsxs("div", {
                    className: "flex items-center space-x-4",
                    children: [
                      e.jsx("a", {
                        href: "/",
                        className: "text-2xl font-bold text-Snowlight-pink",
                        children: "Snowlight!",
                      }),
                      e.jsx("span", {
                        className: "text-gray-300",
                        children: "|",
                      }),
                      e.jsx("h1", {
                        className: "text-xl font-semibold text-gray-900",
                        children: "대시보드",
                      }),
                    ],
                  }),
                  e.jsxs("div", {
                    className: "flex items-center space-x-4",
                    children: [
                      e.jsxs("div", {
                        className:
                          "flex items-center space-x-2 bg-red-50 px-3 py-1 rounded-full",
                        children: [
                          e.jsx(r, { className: "w-4 h-4 text-red-500" }),
                          e.jsx("span", {
                            className: "text-sm font-medium text-red-700",
                            children: s.hearts,
                          }),
                        ],
                      }),
                      s.isVip &&
                        e.jsxs("div", {
                          className:
                            "flex items-center space-x-2 bg-yellow-50 px-3 py-1 rounded-full",
                          children: [
                            e.jsx(l, { className: "w-4 h-4 text-yellow-500" }),
                            e.jsx("span", {
                              className: "text-sm font-medium text-yellow-700",
                              children: "VIP",
                            }),
                          ],
                        }),
                      e.jsxs("button", {
                        onClick: x,
                        className:
                          "flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors",
                        children: [
                          e.jsx(N, { className: "w-4 h-4" }),
                          e.jsx("span", {
                            className: "text-sm",
                            children: "로그아웃",
                          }),
                        ],
                      }),
                    ],
                  }),
                ],
              }),
            }),
          }),
          e.jsxs("div", {
            className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8",
            children: [
              e.jsx("div", {
                className:
                  "bg-gradient-to-r from-Snowlight-pink to-purple-600 rounded-2xl p-8 text-white mb-8",
                children: e.jsxs("div", {
                  className: "flex items-center justify-between",
                  children: [
                    e.jsxs("div", {
                      children: [
                        e.jsxs("h2", {
                          className: "text-3xl font-bold mb-2",
                          children: [
                            "안녕하세요, ",
                            s.name || s.username,
                            "님! 👋",
                          ],
                        }),
                        e.jsx("p", {
                          className: "text-purple-100 text-lg",
                          children: "오늘도 좋은 음악과 함께하세요",
                        }),
                      ],
                    }),
                    e.jsx("div", {
                      className: "hidden md:block",
                      children: e.jsx("div", {
                        className:
                          "w-24 h-24 bg-white/20 rounded-full flex items-center justify-center",
                        children: e.jsx(d, {
                          className: "w-12 h-12 text-white",
                        }),
                      }),
                    }),
                  ],
                }),
              }),
              e.jsxs("div", {
                className:
                  "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8",
                children: [
                  e.jsx("div", {
                    className: "bg-white rounded-xl p-6 shadow-sm border",
                    children: e.jsxs("div", {
                      className: "flex items-center justify-between",
                      children: [
                        e.jsxs("div", {
                          children: [
                            e.jsx("p", {
                              className: "text-sm font-medium text-gray-600",
                              children: "보유 하트",
                            }),
                            e.jsx("p", {
                              className: "text-2xl font-bold text-gray-900",
                              children: s.hearts,
                            }),
                          ],
                        }),
                        e.jsx("div", {
                          className:
                            "w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center",
                          children: e.jsx(r, {
                            className: "w-6 h-6 text-red-500",
                          }),
                        }),
                      ],
                    }),
                  }),
                  e.jsx("div", {
                    className: "bg-white rounded-xl p-6 shadow-sm border",
                    children: e.jsxs("div", {
                      className: "flex items-center justify-between",
                      children: [
                        e.jsxs("div", {
                          children: [
                            e.jsx("p", {
                              className: "text-sm font-medium text-gray-600",
                              children: "멤버십",
                            }),
                            e.jsx("p", {
                              className: "text-2xl font-bold text-gray-900",
                              children: s.isVip ? s.vipType || "VIP" : "일반",
                            }),
                          ],
                        }),
                        e.jsx("div", {
                          className:
                            "w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center",
                          children: e.jsx(l, {
                            className: "w-6 h-6 text-yellow-500",
                          }),
                        }),
                      ],
                    }),
                  }),
                  e.jsx("div", {
                    className: "bg-white rounded-xl p-6 shadow-sm border",
                    children: e.jsxs("div", {
                      className: "flex items-center justify-between",
                      children: [
                        e.jsxs("div", {
                          children: [
                            e.jsx("p", {
                              className: "text-sm font-medium text-gray-600",
                              children: "업로드한 곡",
                            }),
                            e.jsx("p", {
                              className: "text-2xl font-bold text-gray-900",
                              children: "0",
                            }),
                          ],
                        }),
                        e.jsx("div", {
                          className:
                            "w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center",
                          children: e.jsx(i, {
                            className: "w-6 h-6 text-blue-500",
                          }),
                        }),
                      ],
                    }),
                  }),
                  e.jsx("div", {
                    className: "bg-white rounded-xl p-6 shadow-sm border",
                    children: e.jsxs("div", {
                      className: "flex items-center justify-between",
                      children: [
                        e.jsxs("div", {
                          children: [
                            e.jsx("p", {
                              className: "text-sm font-medium text-gray-600",
                              children: "플레이리스트",
                            }),
                            e.jsx("p", {
                              className: "text-2xl font-bold text-gray-900",
                              children: "0",
                            }),
                          ],
                        }),
                        e.jsx("div", {
                          className:
                            "w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center",
                          children: e.jsx(j, {
                            className: "w-6 h-6 text-green-500",
                          }),
                        }),
                      ],
                    }),
                  }),
                ],
              }),
              e.jsxs("div", {
                className: "bg-white rounded-xl p-6 shadow-sm border mb-8",
                children: [
                  e.jsx("h3", {
                    className: "text-lg font-semibold text-gray-900 mb-4",
                    children: "빠른 실행",
                  }),
                  e.jsxs("div", {
                    className: "grid grid-cols-2 md:grid-cols-4 gap-4",
                    children: [
                      e.jsxs("a", {
                        href: "/upload",
                        className:
                          "flex flex-col items-center p-4 rounded-lg border-2 border-dashed border-gray-200 hover:border-Snowlight-pink hover:bg-pink-50 transition-colors",
                        children: [
                          e.jsx(i, { className: "w-8 h-8 text-gray-400 mb-2" }),
                          e.jsx("span", {
                            className: "text-sm font-medium text-gray-600",
                            children: "음악 업로드",
                          }),
                        ],
                      }),
                      e.jsxs("a", {
                        href: "/chart",
                        className:
                          "flex flex-col items-center p-4 rounded-lg border-2 border-dashed border-gray-200 hover:border-Snowlight-pink hover:bg-pink-50 transition-colors",
                        children: [
                          e.jsx(p, { className: "w-8 h-8 text-gray-400 mb-2" }),
                          e.jsx("span", {
                            className: "text-sm font-medium text-gray-600",
                            children: "차트 보기",
                          }),
                        ],
                      }),
                      e.jsxs("a", {
                        href: "/favorite",
                        className:
                          "flex flex-col items-center p-4 rounded-lg border-2 border-dashed border-gray-200 hover:border-Snowlight-pink hover:bg-pink-50 transition-colors",
                        children: [
                          e.jsx(u, { className: "w-8 h-8 text-gray-400 mb-2" }),
                          e.jsx("span", {
                            className: "text-sm font-medium text-gray-600",
                            children: "즐겨찾기",
                          }),
                        ],
                      }),
                      e.jsxs("a", {
                        href: "/heart-station",
                        className:
                          "flex flex-col items-center p-4 rounded-lg border-2 border-dashed border-gray-200 hover:border-Snowlight-pink hover:bg-pink-50 transition-colors",
                        children: [
                          e.jsx(r, { className: "w-8 h-8 text-gray-400 mb-2" }),
                          e.jsx("span", {
                            className: "text-sm font-medium text-gray-600",
                            children: "하트 충전소",
                          }),
                        ],
                      }),
                    ],
                  }),
                ],
              }),
              e.jsxs("div", {
                className: "grid grid-cols-1 lg:grid-cols-2 gap-8",
                children: [
                  e.jsxs("div", {
                    className: "bg-white rounded-xl p-6 shadow-sm border",
                    children: [
                      e.jsx("h3", {
                        className: "text-lg font-semibold text-gray-900 mb-4",
                        children: "최근 활동",
                      }),
                      e.jsxs("div", {
                        className: "space-y-4",
                        children: [
                          e.jsxs("div", {
                            className:
                              "flex items-center space-x-3 p-3 bg-gray-50 rounded-lg",
                            children: [
                              e.jsx("div", {
                                className:
                                  "w-8 h-8 bg-green-100 rounded-full flex items-center justify-center",
                                children: e.jsx(d, {
                                  className: "w-4 h-4 text-green-600",
                                }),
                              }),
                              e.jsxs("div", {
                                children: [
                                  e.jsx("p", {
                                    className:
                                      "text-sm font-medium text-gray-900",
                                    children: "계정 생성",
                                  }),
                                  e.jsx("p", {
                                    className: "text-xs text-gray-500",
                                    children: "방금 전",
                                  }),
                                ],
                              }),
                            ],
                          }),
                          e.jsxs("div", {
                            className:
                              "flex items-center space-x-3 p-3 bg-gray-50 rounded-lg",
                            children: [
                              e.jsx("div", {
                                className:
                                  "w-8 h-8 bg-red-100 rounded-full flex items-center justify-center",
                                children: e.jsx(r, {
                                  className: "w-4 h-4 text-red-600",
                                }),
                              }),
                              e.jsxs("div", {
                                children: [
                                  e.jsx("p", {
                                    className:
                                      "text-sm font-medium text-gray-900",
                                    children: "웰컴 보너스 100 하트 획득",
                                  }),
                                  e.jsx("p", {
                                    className: "text-xs text-gray-500",
                                    children: "방금 전",
                                  }),
                                ],
                              }),
                            ],
                          }),
                        ],
                      }),
                    ],
                  }),
                  e.jsxs("div", {
                    className: "bg-white rounded-xl p-6 shadow-sm border",
                    children: [
                      e.jsx("h3", {
                        className: "text-lg font-semibold text-gray-900 mb-4",
                        children: "추천 기능",
                      }),
                      e.jsxs("div", {
                        className: "space-y-4",
                        children: [
                          e.jsxs("div", {
                            className:
                              "flex items-center justify-between p-3 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg border border-yellow-200",
                            children: [
                              e.jsxs("div", {
                                className: "flex items-center space-x-3",
                                children: [
                                  e.jsx(l, {
                                    className: "w-6 h-6 text-yellow-500",
                                  }),
                                  e.jsxs("div", {
                                    children: [
                                      e.jsx("p", {
                                        className:
                                          "text-sm font-medium text-gray-900",
                                        children: "VIP 멤버십",
                                      }),
                                      e.jsx("p", {
                                        className: "text-xs text-gray-600",
                                        children: "무제한 스트리밍과 특별 혜택",
                                      }),
                                    ],
                                  }),
                                ],
                              }),
                              e.jsx("a", {
                                href: "/membership",
                                className:
                                  "px-3 py-1 bg-yellow-500 text-white text-xs font-medium rounded-full hover:bg-yellow-600 transition-colors",
                                children: "가입하기",
                              }),
                            ],
                          }),
                          e.jsxs("div", {
                            className:
                              "flex items-center justify-between p-3 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200",
                            children: [
                              e.jsxs("div", {
                                className: "flex items-center space-x-3",
                                children: [
                                  e.jsx(f, {
                                    className: "w-6 h-6 text-blue-500",
                                  }),
                                  e.jsxs("div", {
                                    children: [
                                      e.jsx("p", {
                                        className:
                                          "text-sm font-medium text-gray-900",
                                        children: "개인화 플레이리스트",
                                      }),
                                      e.jsx("p", {
                                        className: "text-xs text-gray-600",
                                        children: "취향에 맞는 음악 추천",
                                      }),
                                    ],
                                  }),
                                ],
                              }),
                              e.jsx("a", {
                                href: "/music4u",
                                className:
                                  "px-3 py-1 bg-blue-500 text-white text-xs font-medium rounded-full hover:bg-blue-600 transition-colors",
                                children: "시작하기",
                              }),
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
        ],
      })
    : null;
}
export { S as default };
