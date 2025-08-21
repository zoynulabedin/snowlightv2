import { r as n, j as s } from "./index-BJHAE5s4.js";
import { u as h, L as r } from "./components-BzXIzYa5.js";
import { P as i } from "./play-xanyyhs6.js";
import { H as u } from "./heart-Dn2OeVKi.js";
import { M as b } from "./message-circle-CUXJu09o.js";
import { S as g } from "./share-2-CWcLlN3z.js";
import "./index-CiN_UGES.js";
import "./createLucideIcon-iNHoReR6.js";
const S = () => [
  { title: "서우젯소리 - 벅스" },
  {
    name: "description",
    content: "사우스 카니발(South Carnival)의 앨범 서우젯소리",
  },
];
function C() {
  const { album: t } = h(),
    [a, l] = n.useState([]),
    [c, x] = n.useState(!1),
    d = () => {
      l(c ? [] : t.tracks.map((e) => e.id)), x(!c);
    },
    o = (e) => {
      a.includes(e) ? l(a.filter((m) => m !== e)) : l([...a, e]);
    };
  return s.jsxs("div", {
    className: "space-y-8",
    children: [
      s.jsxs("div", {
        className: "grid grid-cols-1 lg:grid-cols-3 gap-8",
        children: [
          s.jsx("div", {
            className: "lg:col-span-1",
            children: s.jsxs("div", {
              className:
                "relative aspect-square rounded-lg overflow-hidden bg-gray-200 group",
              children: [
                s.jsx("img", {
                  src: `https://placehold.co/400x400/ff1493/ffffff?text=${encodeURIComponent(
                    t.title
                  )}`,
                  alt: t.title,
                  className: "w-full h-full object-cover",
                }),
                s.jsx("div", {
                  className:
                    "absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 flex items-center justify-center",
                  children: s.jsx("button", {
                    className:
                      "w-16 h-16 bg-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transform scale-75 group-hover:scale-100 transition-all duration-300 shadow-lg",
                    children: s.jsx(i, {
                      className: "w-6 h-6 text-Snowlight-pink ml-1",
                    }),
                  }),
                }),
              ],
            }),
          }),
          s.jsxs("div", {
            className: "lg:col-span-2 space-y-6",
            children: [
              s.jsxs("div", {
                children: [
                  s.jsx("h1", {
                    className: "text-3xl font-bold text-gray-900 mb-2",
                    children: t.title,
                  }),
                  s.jsx(r, {
                    to: `/artist/${t.artist}`,
                    className:
                      "text-xl text-Snowlight-pink hover:text-pink-600 font-medium",
                    children: t.artist,
                  }),
                ],
              }),
              s.jsxs("div", {
                className: "grid grid-cols-1 md:grid-cols-2 gap-4 text-sm",
                children: [
                  s.jsxs("div", {
                    className: "space-y-2",
                    children: [
                      s.jsxs("div", {
                        className: "flex",
                        children: [
                          s.jsx("span", {
                            className: "w-20 text-gray-600",
                            children: "유형",
                          }),
                          s.jsx("span", { children: t.type }),
                        ],
                      }),
                      s.jsxs("div", {
                        className: "flex",
                        children: [
                          s.jsx("span", {
                            className: "w-20 text-gray-600",
                            children: "장르",
                          }),
                          s.jsx("div", {
                            className: "flex space-x-2",
                            children: t.genre.map((e) =>
                              s.jsx(
                                r,
                                {
                                  to: `/genre/${e}`,
                                  className:
                                    "text-Snowlight-pink hover:underline",
                                  children: e,
                                },
                                e
                              )
                            ),
                          }),
                        ],
                      }),
                      s.jsxs("div", {
                        className: "flex",
                        children: [
                          s.jsx("span", {
                            className: "w-20 text-gray-600",
                            children: "스타일",
                          }),
                          s.jsx("div", {
                            className: "flex space-x-2",
                            children: t.style.map((e) =>
                              s.jsx(
                                r,
                                {
                                  to: `/style/${e}`,
                                  className:
                                    "text-Snowlight-pink hover:underline",
                                  children: e,
                                },
                                e
                              )
                            ),
                          }),
                        ],
                      }),
                      s.jsxs("div", {
                        className: "flex",
                        children: [
                          s.jsx("span", {
                            className: "w-20 text-gray-600",
                            children: "발매일",
                          }),
                          s.jsx("span", { children: t.releaseDate }),
                        ],
                      }),
                    ],
                  }),
                  s.jsxs("div", {
                    className: "space-y-2",
                    children: [
                      s.jsxs("div", {
                        className: "flex",
                        children: [
                          s.jsx("span", {
                            className: "w-20 text-gray-600",
                            children: "유통사",
                          }),
                          s.jsx("span", { children: t.distributor }),
                        ],
                      }),
                      s.jsxs("div", {
                        className: "flex",
                        children: [
                          s.jsx("span", {
                            className: "w-20 text-gray-600",
                            children: "기획사",
                          }),
                          s.jsx("span", { children: t.label }),
                        ],
                      }),
                      s.jsxs("div", {
                        className: "flex",
                        children: [
                          s.jsx("span", {
                            className: "w-20 text-gray-600",
                            children: "재생 시간",
                          }),
                          s.jsx("span", { children: t.duration }),
                        ],
                      }),
                      s.jsxs("div", {
                        className: "flex",
                        children: [
                          s.jsx("span", {
                            className: "w-20 text-gray-600",
                            children: "고음질",
                          }),
                          s.jsx("span", {
                            className: "text-Snowlight-pink",
                            children: t.quality,
                          }),
                        ],
                      }),
                    ],
                  }),
                ],
              }),
              s.jsxs("div", {
                className: "flex items-center space-x-4",
                children: [
                  s.jsx("button", {
                    className: "Snowlight-button Snowlight-button-primary",
                    children: "앨범구매",
                  }),
                  s.jsxs("button", {
                    className:
                      "flex items-center space-x-2 text-gray-600 hover:text-Snowlight-pink",
                    children: [
                      s.jsx(u, { className: "w-5 h-5" }),
                      s.jsx("span", { children: "좋아 0" }),
                    ],
                  }),
                  s.jsxs("button", {
                    className:
                      "flex items-center space-x-2 text-gray-600 hover:text-Snowlight-pink",
                    children: [
                      s.jsx(b, { className: "w-5 h-5" }),
                      s.jsx("span", { children: "0개" }),
                    ],
                  }),
                  s.jsxs("button", {
                    className:
                      "flex items-center space-x-2 text-gray-600 hover:text-Snowlight-pink",
                    children: [
                      s.jsx(g, { className: "w-5 h-5" }),
                      s.jsx("span", { children: "공유" }),
                    ],
                  }),
                ],
              }),
            ],
          }),
        ],
      }),
      s.jsxs("section", {
        children: [
          s.jsxs("h2", {
            className: "text-xl font-bold text-gray-900 mb-4",
            children: ["수록곡 (", t.tracks.length, ")"],
          }),
          s.jsxs("div", {
            className:
              "flex items-center space-x-4 p-4 bg-gray-50 rounded-lg mb-4",
            children: [
              s.jsxs("label", {
                className: "flex items-center space-x-2",
                children: [
                  s.jsx("input", {
                    type: "checkbox",
                    checked: c,
                    onChange: d,
                    className:
                      "rounded border-gray-300 text-Snowlight-pink focus:ring-Snowlight-pink",
                  }),
                  s.jsx("span", {
                    className: "text-sm",
                    children: "곡 목록 전체",
                  }),
                ],
              }),
              s.jsxs("div", {
                className: "flex space-x-2",
                children: [
                  s.jsx("button", {
                    className:
                      "Snowlight-button Snowlight-button-secondary text-sm",
                    children: "선택된 곡 재생듣기",
                  }),
                  s.jsx("button", {
                    className:
                      "Snowlight-button Snowlight-button-secondary text-sm",
                    children: "재생목록에 추가",
                  }),
                  s.jsx("button", {
                    className:
                      "Snowlight-button Snowlight-button-secondary text-sm",
                    children: "내 앨범에 담기",
                  }),
                  s.jsx("button", {
                    className:
                      "Snowlight-button Snowlight-button-secondary text-sm",
                    children: "다운로드",
                  }),
                ],
              }),
              s.jsxs("div", {
                className: "flex space-x-2 ml-auto",
                children: [
                  s.jsx("button", {
                    className:
                      "Snowlight-button Snowlight-button-primary text-sm",
                    children: "전체 듣기(재생목록 추가)",
                  }),
                  s.jsx("button", {
                    className:
                      "Snowlight-button Snowlight-button-secondary text-sm",
                    children: "전체 듣기(재생목록 교체)",
                  }),
                ],
              }),
            ],
          }),
          s.jsxs("div", {
            className:
              "bg-white rounded-lg border border-gray-200 overflow-hidden",
            children: [
              s.jsxs("div", {
                className:
                  "grid grid-cols-12 gap-4 p-4 bg-gray-50 border-b border-gray-200 text-sm font-medium text-gray-700",
                children: [
                  s.jsx("div", { className: "col-span-1", children: "번호" }),
                  s.jsx("div", { className: "col-span-6", children: "곡" }),
                  s.jsx("div", {
                    className: "col-span-2",
                    children: "아티스트",
                  }),
                  s.jsx("div", {
                    className: "col-span-3",
                    children: "듣기 재생목록 내앨범 다운 영상 기타",
                  }),
                ],
              }),
              t.tracks.map((e) =>
                s.jsxs(
                  "div",
                  {
                    className:
                      "grid grid-cols-12 gap-4 p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors",
                    children: [
                      s.jsxs("div", {
                        className: "col-span-1 flex items-center space-x-2",
                        children: [
                          s.jsx("label", {
                            className: "flex items-center",
                            children: s.jsx("input", {
                              type: "checkbox",
                              checked: a.includes(e.id),
                              onChange: () => o(e.id),
                              className:
                                "rounded border-gray-300 text-Snowlight-pink focus:ring-Snowlight-pink",
                            }),
                          }),
                          s.jsxs("div", {
                            className: "text-center",
                            children: [
                              s.jsx("div", {
                                className: "text-lg font-bold",
                                children: e.number,
                              }),
                              e.isTitle &&
                                s.jsx("span", {
                                  className:
                                    "text-xs text-Snowlight-pink font-bold",
                                  children: "[타이틀곡]",
                                }),
                            ],
                          }),
                        ],
                      }),
                      s.jsx("div", {
                        className: "col-span-6 flex items-center",
                        children: s.jsxs("div", {
                          children: [
                            s.jsx("h3", {
                              className:
                                "font-medium text-gray-900 hover:text-Snowlight-pink cursor-pointer",
                              children: e.title,
                            }),
                            s.jsx("p", {
                              className: "text-sm text-gray-600",
                              children: e.duration,
                            }),
                          ],
                        }),
                      }),
                      s.jsx("div", {
                        className: "col-span-2 flex items-center",
                        children: s.jsx(r, {
                          to: `/artist/${e.artist}`,
                          className: "text-gray-900 hover:text-Snowlight-pink",
                          children: e.artist,
                        }),
                      }),
                      s.jsxs("div", {
                        className: "col-span-3 flex items-center space-x-2",
                        children: [
                          s.jsx("button", {
                            className:
                              "Snowlight-button-secondary text-xs px-2 py-1",
                            children: "곡정보",
                          }),
                          s.jsx("button", {
                            className: "p-1 hover:bg-gray-200 rounded",
                            title: "듣기",
                            children: s.jsx(i, {
                              className: "w-4 h-4 text-Snowlight-pink",
                            }),
                          }),
                          s.jsx("button", {
                            className:
                              "text-xs text-gray-600 hover:text-Snowlight-pink",
                            children: "재생목록에 추가",
                          }),
                          s.jsx("button", {
                            className:
                              "text-xs text-gray-600 hover:text-Snowlight-pink",
                            children: "내 앨범에 담기",
                          }),
                          s.jsx("button", {
                            className:
                              "text-xs text-Snowlight-pink hover:text-pink-600",
                            children: "flac 다운로드",
                          }),
                          s.jsx("button", {
                            className:
                              "text-xs text-gray-600 hover:text-Snowlight-pink",
                            children: "기타 기능",
                          }),
                        ],
                      }),
                    ],
                  },
                  e.id
                )
              ),
            ],
          }),
        ],
      }),
      t.description &&
        s.jsxs("section", {
          children: [
            s.jsx("h2", {
              className: "text-xl font-bold text-gray-900 mb-4",
              children: "앨범 소개",
            }),
            s.jsx("div", {
              className: "bg-white rounded-lg border border-gray-200 p-6",
              children: s.jsx("p", {
                className: "text-gray-700 leading-relaxed whitespace-pre-line",
                children: t.description,
              }),
            }),
          ],
        }),
      s.jsxs("section", {
        children: [
          s.jsx("h2", {
            className: "text-xl font-bold text-gray-900 mb-4",
            children: "한마디 (0)",
          }),
          s.jsxs("div", {
            className: "bg-white rounded-lg border border-gray-200 p-6",
            children: [
              s.jsxs("div", {
                className: "space-y-4",
                children: [
                  s.jsx("textarea", {
                    placeholder: "한마디 입력",
                    className:
                      "w-full p-3 border border-gray-300 rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-Snowlight-pink focus:border-transparent",
                    rows: 3,
                  }),
                  s.jsxs("div", {
                    className: "flex items-center justify-between",
                    children: [
                      s.jsx("button", {
                        className:
                          "Snowlight-button Snowlight-button-secondary text-sm",
                        children: "음악 첨부",
                      }),
                      s.jsxs("div", {
                        className: "flex items-center space-x-4",
                        children: [
                          s.jsx("span", {
                            className: "text-sm text-gray-500",
                            children: "0/300",
                          }),
                          s.jsx("button", {
                            className:
                              "Snowlight-button Snowlight-button-primary text-sm",
                            children: "등록",
                          }),
                        ],
                      }),
                    ],
                  }),
                ],
              }),
              s.jsx("div", {
                className: "mt-6 text-center text-gray-500",
                children:
                  "등록된 한마디가 없습니다. 첫 번째 한마디를 남겨보세요!",
              }),
            ],
          }),
        ],
      }),
    ],
  });
}
export { C as default, S as meta };
