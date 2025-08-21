import type { MetaFunction } from "@remix-run/node";
import { useState } from "react";
import {
  Play,
  Heart,
  Download,
  MoreHorizontal,
  TrendingUp,
  TrendingDown,
  Minus,
} from "lucide-react";
import { useLanguage } from "~/contexts/LanguageContext";
import Layout from "~/components/Layout";

export const meta: MetaFunction = () => {
  return [
    {
      title:
        "Snowlight Chart > Song Chart > Real-time > All Genres - Snowlight",
    },
    { name: "description", content: "Check out the real-time popular charts!" },
  ];
};

// Mock chart data
const chartData = [
  {
    rank: 1,
    title: "Golden",
    artist: "HUNTR/X",
    album: "KPop Demon Hunters (Soundtrack from the Netflix Fi...",
    change: "new" as const,
    coverUrl: "/api/placeholder/60/60",
  },
  {
    rank: 2,
    title: "Soda Pop",
    artist: "Saja Boys",
    album: "KPop Demon Hunters (Soundtrack from the Netflix Fi...",
    change: "up" as const,
    changeAmount: 3,
  },
  {
    rank: 3,
    title: "뛰어(JUMP)",
    artist: "BLACKPINK",
    album: "뛰어(JUMP)",
    change: "down" as const,
    changeAmount: 1,
  },
  {
    rank: 4,
    title: "FAMOUS",
    artist: "ALLDAY PROJECT",
    album: "FAMOUS",
    change: "up" as const,
    changeAmount: 2,
  },
  {
    rank: 5,
    title: "How It's Done",
    artist: "HUNTR/X",
    album: "KPop Demon Hunters (Soundtrack from the Netflix Fi...",
    change: "same" as const,
  },
  {
    rank: 6,
    title: "여름이었다",
    artist: "H1-KEY (하이키)",
    album: "H1-KEY 4th Mini Album [Lovestruck]",
    change: "up" as const,
    changeAmount: 5,
  },
  {
    rank: 7,
    title: "너에게 닿기를",
    artist: "10CM",
    album: "너에게 닿기를",
    change: "down" as const,
    changeAmount: 2,
  },
  {
    rank: 8,
    title: "like JENNIE",
    artist: "제니 (JENNIE)",
    album: "Ruby",
    change: "up" as const,
    changeAmount: 1,
  },
  {
    rank: 9,
    title: "멸종위기사랑",
    artist: "이찬혁",
    album: "EROS",
    change: "down" as const,
    changeAmount: 3,
  },
  {
    rank: 10,
    title: "서우젯소리",
    artist: "사우스 카니발(South Carnival)",
    album: "서우젯소리",
    change: "new" as const,
  },
];

const chartTypes = [
  { name: "chart.songs", active: true },
  { name: "chart.albums", active: false },
  { name: "chart.music_pd_albums", active: false },
  { name: "chart.videos", active: false },
  { name: "chart.connect_songs", active: false },
  { name: "chart.connect_videos", active: false },
];

const timePeriods = [
  { name: "chart.realtime", active: true },
  { name: "chart.daily", active: false },
  { name: "chart.weekly", active: false },
];

export default function Chart() {
  const { t } = useLanguage();
  const [selectedTracks, setSelectedTracks] = useState<number[]>([]);
  const [selectAll, setSelectAll] = useState(false);

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedTracks([]);
    } else {
      setSelectedTracks(chartData.map((item) => item.rank));
    }
    setSelectAll(!selectAll);
  };

  const handleSelectTrack = (rank: number) => {
    if (selectedTracks.includes(rank)) {
      setSelectedTracks(selectedTracks.filter((r) => r !== rank));
    } else {
      setSelectedTracks([...selectedTracks, rank]);
    }
  };

  const getChangeIcon = (change: string, amount?: number) => {
    switch (change) {
      case "up":
        return <TrendingUp className="w-4 h-4 text-red-500" />;
      case "down":
        return <TrendingDown className="w-4 h-4 text-blue-500" />;
      case "new":
        return <span className="text-xs font-bold text-orange-500">NEW</span>;
      default:
        return <Minus className="w-4 h-4 text-gray-400" />;
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <span>{t("nav.chart")}</span>
          <span>&gt;</span>
          <span>{t("chart.song_chart")}</span>
          <span>&gt;</span>
          <span>{t("chart.realtime")}</span>
          <span>&gt;</span>
          <span className="text-Snowlight-pink font-medium">
            {t("chart.all_genres")}
          </span>
        </div>

        {/* Chart Type Tabs */}
        <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg w-fit">
          {chartTypes.map((type) => (
            <button
              key={type.name}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                type.active
                  ? "bg-white text-Snowlight-pink shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              {t(type.name)}
            </button>
          ))}
        </div>

        {/* Time Period Tabs */}
        <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg w-fit">
          {timePeriods.map((period) => (
            <button
              key={period.name}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                period.active
                  ? "bg-white text-Snowlight-pink shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              {t(period.name)}
            </button>
          ))}
        </div>

        {/* Chart Info */}
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-600">
            <span className="font-medium">2025.08.08 15:00</span>{" "}
            {t("chart.based_on")}
          </div>
          <div className="text-xs text-gray-500">
            {t("chart.calculation_info")}
          </div>
        </div>

        {/* Bulk Actions */}
        <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={selectAll}
              onChange={handleSelectAll}
              className="rounded border-gray-300 text-Snowlight-pink focus:ring-Snowlight-pink"
            />
            <span className="text-sm">{t("chart.select_all")}</span>
          </label>
          <div className="flex space-x-2">
            <button className="Snowlight-button Snowlight-button-secondary text-sm">
              {t("chart.play_selected")}
            </button>
            <button className="Snowlight-button Snowlight-button-secondary text-sm">
              {t("chart.add_to_playlist")}
            </button>
            <button className="Snowlight-button Snowlight-button-secondary text-sm">
              {t("chart.add_to_album")}
            </button>
            <button className="Snowlight-button Snowlight-button-secondary text-sm">
              {t("chart.download")}
            </button>
          </div>
        </div>

        {/* Chart Table */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="grid grid-cols-12 gap-4 p-4 bg-gray-50 border-b border-gray-200 text-sm font-medium text-gray-700">
            <div className="col-span-1">{t("chart.rank")}</div>
            <div className="col-span-1"></div>
            <div className="col-span-6">{t("chart.song")}</div>
            <div className="col-span-2">{t("chart.artist")}</div>
            <div className="col-span-2">{t("chart.actions")}</div>
          </div>

          {chartData.map((track) => (
            <div
              key={track.rank}
              className="grid grid-cols-12 gap-4 p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors"
            >
              {/* Rank and Change */}
              <div className="col-span-1 flex items-center space-x-2">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={selectedTracks.includes(track.rank)}
                    onChange={() => handleSelectTrack(track.rank)}
                    className="rounded border-gray-300 text-Snowlight-pink focus:ring-Snowlight-pink"
                  />
                </label>
                <div className="text-center">
                  <div className="text-lg font-bold">{track.rank}</div>
                  <div className="flex items-center justify-center">
                    {getChangeIcon(track.change, track.changeAmount)}
                    {track.changeAmount && (
                      <span className="text-xs ml-1">{track.changeAmount}</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Album Cover */}
              <div className="col-span-1 flex items-center">
                <img
                  src={`https://placehold.co/60x60/ff1493/ffffff?text=${track.rank}`}
                  alt={track.title}
                  className="w-12 h-12 rounded-md object-cover"
                />
              </div>

              {/* Track Info */}
              <div className="col-span-6 flex items-center">
                <div>
                  <h3 className="font-medium text-gray-900 hover:text-Snowlight-pink cursor-pointer">
                    {track.title}
                  </h3>
                  <p className="text-sm text-gray-600 hover:text-Snowlight-pink cursor-pointer">
                    {track.album}
                  </p>
                </div>
              </div>

              {/* Artist */}
              <div className="col-span-2 flex items-center">
                <span className="text-gray-900 hover:text-Snowlight-pink cursor-pointer">
                  {track.artist}
                </span>
              </div>

              {/* Actions */}
              <div className="col-span-2 flex items-center space-x-2">
                <button className="p-1 hover:bg-gray-200 rounded" title="듣기">
                  <Play className="w-4 h-4 text-Snowlight-pink" />
                </button>
                <button
                  className="p-1 hover:bg-gray-200 rounded"
                  title="재생목록에 추가"
                >
                  <span className="text-xs text-gray-600">재생목록</span>
                </button>
                <button
                  className="p-1 hover:bg-gray-200 rounded"
                  title="내 앨범에 담기"
                >
                  <Heart className="w-4 h-4 text-gray-600" />
                </button>
                <button
                  className="p-1 hover:bg-gray-200 rounded"
                  title="다운로드"
                >
                  <Download className="w-4 h-4 text-gray-600" />
                </button>
                <button
                  className="p-1 hover:bg-gray-200 rounded"
                  title="기타 기능"
                >
                  <MoreHorizontal className="w-4 h-4 text-gray-600" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Chart Description */}
        <div className="text-xs text-gray-500 bg-gray-50 p-4 rounded-lg">
          <p>{t("chart.description")}</p>
        </div>
      </div>
    </Layout>
  );
}
