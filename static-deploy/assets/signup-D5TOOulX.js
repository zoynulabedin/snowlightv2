import { r as t, j as e } from "./index-BJHAE5s4.js";
import { u as E } from "./LanguageContext-BFw3fmyY.js";
import { u as F } from "./AuthContext-CUPKj7Oa.js";
import { u as L } from "./index-CiN_UGES.js";
import { U as g } from "./user-DTJm30ZA.js";
import { M as q, L as b, E as j } from "./mail-DF0SJfJQ.js";
import { E as w } from "./eye-DHw6EaHY.js";
import { C as D } from "./circle-alert-DukOSXm-.js";
import { C as A } from "./circle-check-big-DrBycU0f.js";
import "./createLucideIcon-iNHoReR6.js";
function J() {
  const { t: s } = E(),
    { signup: y, user: u } = F(),
    i = L(),
    [r, N] = t.useState({
      email: "",
      username: "",
      password: "",
      confirmPassword: "",
      name: "",
    }),
    [o, v] = t.useState(!1),
    [c, k] = t.useState(!1),
    [p, d] = t.useState(!1),
    [x, a] = t.useState(""),
    [h, f] = t.useState("");
  t.useEffect(() => {
    u && i("/dashboard");
  }, [u, i]);
  const n = (m) => {
      const { name: l, value: C } = m.target;
      N((S) => ({ ...S, [l]: C })), a("");
    },
    P = async (m) => {
      if (
        (m.preventDefault(),
        d(!0),
        a(""),
        f(""),
        r.password !== r.confirmPassword)
      ) {
        a("비밀번호가 일치하지 않습니다."), d(!1);
        return;
      }
      try {
        const l = await y({
          email: r.email,
          username: r.username,
          password: r.password,
          name: r.name || void 0,
        });
        l.success
          ? (f("회원가입 성공! 대시보드로 이동합니다..."),
            setTimeout(() => {
              i("/dashboard");
            }, 1e3))
          : a(l.error || "회원가입에 실패했습니다.");
      } catch {
        a("네트워크 오류가 발생했습니다.");
      } finally {
        d(!1);
      }
    };
  return e.jsx("div", {
    className:
      "min-h-screen bg-gradient-to-br from-Snowlight-pink via-purple-500 to-blue-600 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8",
    children: e.jsxs("div", {
      className: "max-w-md w-full space-y-8",
      children: [
        e.jsxs("div", {
          className: "text-center",
          children: [
            e.jsx("div", {
              className:
                "mx-auto h-12 w-12 bg-white rounded-full flex items-center justify-center mb-4",
              children: e.jsx("span", {
                className: "text-2xl font-bold text-Snowlight-pink",
                children: "B",
              }),
            }),
            e.jsx("h2", {
              className: "text-3xl font-bold text-white mb-2",
              children: s("signup.title", "벅스 회원가입"),
            }),
            e.jsx("p", {
              className: "text-purple-100",
              children: s(
                "signup.subtitle",
                "음악의 새로운 세계를 경험해보세요"
              ),
            }),
          ],
        }),
        e.jsxs("div", {
          className: "bg-white rounded-2xl shadow-2xl p-8",
          children: [
            e.jsxs("form", {
              onSubmit: P,
              className: "space-y-6",
              children: [
                e.jsxs("div", {
                  children: [
                    e.jsxs("label", {
                      htmlFor: "name",
                      className: "block text-sm font-medium text-gray-700 mb-2",
                      children: [
                        s("signup.name", "이름"),
                        " ",
                        e.jsx("span", {
                          className: "text-gray-400",
                          children: "(선택)",
                        }),
                      ],
                    }),
                    e.jsxs("div", {
                      className: "relative",
                      children: [
                        e.jsx("div", {
                          className:
                            "absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none",
                          children: e.jsx(g, {
                            className: "h-5 w-5 text-gray-400",
                          }),
                        }),
                        e.jsx("input", {
                          id: "name",
                          name: "name",
                          type: "text",
                          value: r.name,
                          onChange: n,
                          className:
                            "block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-Snowlight-pink focus:border-transparent",
                          placeholder: s(
                            "signup.namePlaceholder",
                            "이름을 입력하세요"
                          ),
                        }),
                      ],
                    }),
                  ],
                }),
                e.jsxs("div", {
                  children: [
                    e.jsx("label", {
                      htmlFor: "email",
                      className: "block text-sm font-medium text-gray-700 mb-2",
                      children: s("signup.email", "이메일"),
                    }),
                    e.jsxs("div", {
                      className: "relative",
                      children: [
                        e.jsx("div", {
                          className:
                            "absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none",
                          children: e.jsx(q, {
                            className: "h-5 w-5 text-gray-400",
                          }),
                        }),
                        e.jsx("input", {
                          id: "email",
                          name: "email",
                          type: "email",
                          required: !0,
                          value: r.email,
                          onChange: n,
                          className:
                            "block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-Snowlight-pink focus:border-transparent",
                          placeholder: s(
                            "signup.emailPlaceholder",
                            "이메일을 입력하세요"
                          ),
                        }),
                      ],
                    }),
                  ],
                }),
                e.jsxs("div", {
                  children: [
                    e.jsx("label", {
                      htmlFor: "username",
                      className: "block text-sm font-medium text-gray-700 mb-2",
                      children: s("signup.username", "사용자명"),
                    }),
                    e.jsxs("div", {
                      className: "relative",
                      children: [
                        e.jsx("div", {
                          className:
                            "absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none",
                          children: e.jsx(g, {
                            className: "h-5 w-5 text-gray-400",
                          }),
                        }),
                        e.jsx("input", {
                          id: "username",
                          name: "username",
                          type: "text",
                          required: !0,
                          value: r.username,
                          onChange: n,
                          className:
                            "block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-Snowlight-pink focus:border-transparent",
                          placeholder: s(
                            "signup.usernamePlaceholder",
                            "사용자명을 입력하세요"
                          ),
                        }),
                      ],
                    }),
                  ],
                }),
                e.jsxs("div", {
                  children: [
                    e.jsx("label", {
                      htmlFor: "password",
                      className: "block text-sm font-medium text-gray-700 mb-2",
                      children: s("signup.password", "비밀번호"),
                    }),
                    e.jsxs("div", {
                      className: "relative",
                      children: [
                        e.jsx("div", {
                          className:
                            "absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none",
                          children: e.jsx(b, {
                            className: "h-5 w-5 text-gray-400",
                          }),
                        }),
                        e.jsx("input", {
                          id: "password",
                          name: "password",
                          type: o ? "text" : "password",
                          required: !0,
                          value: r.password,
                          onChange: n,
                          className:
                            "block w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-Snowlight-pink focus:border-transparent",
                          placeholder: s(
                            "signup.passwordPlaceholder",
                            "비밀번호를 입력하세요"
                          ),
                        }),
                        e.jsx("button", {
                          type: "button",
                          onClick: () => v(!o),
                          className:
                            "absolute inset-y-0 right-0 pr-3 flex items-center",
                          children: o
                            ? e.jsx(j, {
                                className:
                                  "h-5 w-5 text-gray-400 hover:text-gray-600",
                              })
                            : e.jsx(w, {
                                className:
                                  "h-5 w-5 text-gray-400 hover:text-gray-600",
                              }),
                        }),
                      ],
                    }),
                  ],
                }),
                e.jsxs("div", {
                  children: [
                    e.jsx("label", {
                      htmlFor: "confirmPassword",
                      className: "block text-sm font-medium text-gray-700 mb-2",
                      children: s("signup.confirmPassword", "비밀번호 확인"),
                    }),
                    e.jsxs("div", {
                      className: "relative",
                      children: [
                        e.jsx("div", {
                          className:
                            "absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none",
                          children: e.jsx(b, {
                            className: "h-5 w-5 text-gray-400",
                          }),
                        }),
                        e.jsx("input", {
                          id: "confirmPassword",
                          name: "confirmPassword",
                          type: c ? "text" : "password",
                          required: !0,
                          value: r.confirmPassword,
                          onChange: n,
                          className:
                            "block w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-Snowlight-pink focus:border-transparent",
                          placeholder: s(
                            "signup.confirmPasswordPlaceholder",
                            "비밀번호를 다시 입력하세요"
                          ),
                        }),
                        e.jsx("button", {
                          type: "button",
                          onClick: () => k(!c),
                          className:
                            "absolute inset-y-0 right-0 pr-3 flex items-center",
                          children: c
                            ? e.jsx(j, {
                                className:
                                  "h-5 w-5 text-gray-400 hover:text-gray-600",
                              })
                            : e.jsx(w, {
                                className:
                                  "h-5 w-5 text-gray-400 hover:text-gray-600",
                              }),
                        }),
                      ],
                    }),
                  ],
                }),
                x &&
                  e.jsxs("div", {
                    className:
                      "flex items-center space-x-2 text-red-600 bg-red-50 p-3 rounded-lg",
                    children: [
                      e.jsx(D, { className: "h-5 w-5" }),
                      e.jsx("span", { className: "text-sm", children: x }),
                    ],
                  }),
                h &&
                  e.jsxs("div", {
                    className:
                      "flex items-center space-x-2 text-green-600 bg-green-50 p-3 rounded-lg",
                    children: [
                      e.jsx(A, { className: "h-5 w-5" }),
                      e.jsx("span", { className: "text-sm", children: h }),
                    ],
                  }),
                e.jsx("button", {
                  type: "submit",
                  disabled: p,
                  className:
                    "w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-gradient-to-r from-Snowlight-pink to-purple-600 hover:from-pink-600 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-Snowlight-pink disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200",
                  children: p
                    ? e.jsxs("div", {
                        className: "flex items-center space-x-2",
                        children: [
                          e.jsx("div", {
                            className:
                              "w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin",
                          }),
                          e.jsx("span", {
                            children: s("signup.signingUp", "가입 중..."),
                          }),
                        ],
                      })
                    : s("signup.submit", "회원가입"),
                }),
              ],
            }),
            e.jsx("div", {
              className: "mt-6 text-center space-y-2",
              children: e.jsxs("p", {
                className: "text-sm text-gray-600",
                children: [
                  s("signup.hasAccount", "이미 계정이 있으신가요?"),
                  " ",
                  e.jsx("a", {
                    href: "/login",
                    className:
                      "font-medium text-Snowlight-pink hover:text-pink-600 transition-colors",
                    children: s("signup.signIn", "로그인"),
                  }),
                ],
              }),
            }),
          ],
        }),
        e.jsxs("div", {
          className: "bg-white/10 backdrop-blur-sm rounded-2xl p-6 text-center",
          children: [
            e.jsx("h3", {
              className: "text-lg font-semibold text-white mb-2",
              children: s("signup.welcomeBonus", "가입 축하 혜택! 🎉"),
            }),
            e.jsx("p", {
              className: "text-purple-100 text-sm mb-4",
              children: s(
                "signup.bonusDescription",
                "회원가입 시 100 하트를 무료로 드려요!"
              ),
            }),
            e.jsxs("div", {
              className:
                "flex items-center justify-center space-x-2 text-white",
              children: [
                e.jsx("span", { className: "text-2xl", children: "❤️" }),
                e.jsx("span", {
                  className: "font-bold",
                  children: "100 Hearts",
                }),
              ],
            }),
          ],
        }),
      ],
    }),
  });
}
export { J as default };
