import { r as s, j as v } from "./index-BJHAE5s4.js";
const c = s.createContext(void 0);
function C({ children: l }) {
  const [d, n] = s.useState(null),
    [u, o] = s.useState([]),
    [f, r] = s.useState(!1),
    [P, y] = s.useState(null),
    [m, a] = s.useState(!1),
    p = {
      currentTrack: d,
      playlist: u,
      isAudioPlayerVisible: f,
      currentVideo: P,
      isVideoPlayerVisible: m,
      playTrack: (e, t) => {
        n(e), t ? o(t) : u.length === 0 && o([e]), r(!0), a(!1);
      },
      playVideo: (e) => {
        y(e), a(!0), r(!1);
      },
      addToPlaylist: (e) => {
        o((t) => (t.some((i) => i.id === e.id) ? t : [...t, e]));
      },
      removeFromPlaylist: (e) => {
        o((t) => t.filter((i) => i.id !== e));
      },
      clearPlaylist: () => {
        o([]), n(null), r(!1);
      },
      closeAudioPlayer: () => {
        r(!1);
      },
      closeVideoPlayer: () => {
        a(!1);
      },
    };
  return v.jsx(c.Provider, { value: p, children: l });
}
function j() {
  const l = s.useContext(c);
  if (l === void 0)
    throw new Error("usePlayer must be used within a PlayerProvider");
  return l;
}
const S = [
  {
    id: "1",
    title: "서우젯소리",
    artist: "사우스 카니발(South Carnival)",
    album: "서우젯소리",
    duration: 332,
    coverUrl: "https://placehold.co/300x300/ff1493/ffffff?text=서우젯소리",
    audioUrl: "https://www.soundjay.com/misc/sounds/bell-ringing-05.wav",
  },
  {
    id: "2",
    title: "Golden",
    artist: "HUNTR/X",
    album: "KPop Demon Hunters",
    duration: 245,
    coverUrl: "https://placehold.co/300x300/ff1493/ffffff?text=Golden",
    audioUrl: "https://www.soundjay.com/misc/sounds/bell-ringing-05.wav",
  },
  {
    id: "3",
    title: "뛰어(JUMP)",
    artist: "BLACKPINK",
    album: "뛰어(JUMP)",
    duration: 198,
    coverUrl: "https://placehold.co/300x300/ff1493/ffffff?text=JUMP",
    audioUrl: "https://www.soundjay.com/misc/sounds/bell-ringing-05.wav",
  },
];
export { C as P, S as m, j as u };
