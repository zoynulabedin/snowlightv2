import { LoaderFunction } from "@remix-run/node";
import { useState } from "react";
import { getAllAlbums, getChartSongs, getLatestVideos } from "../lib/server";
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import Layout from "../components/Layout";

export const loader: LoaderFunction = async () => {
  const songs = await getChartSongs();
  const chartSongs = songs?.map((song, idx) => ({
    rank: idx + 1,
    cover: song.coverImage,
    title: song.title,
    artist: song.artists[0]?.artist?.name ?? "Unknown",
    album: song.album?.title ?? "Unknown",
  }));
  const albums = await getAllAlbums();
  type AlbumArtist = {
    artist?: {
      name?: string;
    };
  };

  type AlbumData = {
    coverImage: string | null;
    title: string | null;
    artists?: AlbumArtist[];
    releaseDate?: Date | string | null;
  };

  const chartAlbums = albums?.map((album: AlbumData, idx: number) => ({
    rank: idx + 1,
    cover: album.coverImage ?? "",
    title: album.title ?? "Unknown",
    artist:
      album.artists?.map((a: AlbumArtist) => a.artist?.name).join(", ") ??
      "Unknown",
    date: album.releaseDate
      ? new Date(album.releaseDate)
          .toISOString()
          .slice(0, 10)
          .replace(/-/g, ".")
      : "",
    updown: "", // You can add logic for up/down arrows if needed
  }));
  const videos = await getLatestVideos();

  const chartVideos = videos?.map((video, idx) => ({
    rank: idx + 1,
    cover: video.thumbnailUrl ?? "",
    title: video.title ?? "Unknown",
    artist: video.artist ?? "Unknown",
    date: video.createdAt
      ? new Date(video.createdAt).toISOString().slice(0, 10).replace(/-/g, ".")
      : "",
    updown: "", // Add logic if you have up/down info
    duration: video.duration ?? "",
    badge: video.isFeatured ? "Featured" : "",
  }));

  return json({ songs: chartSongs, albums: chartAlbums, videos: chartVideos });
};

const tabs = [
  "밸리",
  "앨범",
  "뮤직 PD 앨범",
  "이미지",
  "연결된 곡",
  "연결된 영상",
];

const filters = ["실시간", "일간", "주간"];
const videoFilters = ["Days", "weekly"];

type Song = {
  rank: number;
  cover: string;
  title: string;
  artist: string;
  album: string;
};

type Album = {
  rank: number;
  cover: string;
  title: string;
  artist: string;
  date: string;
  updown: string;
};

type Video = {
  rank: number;
  cover: string;
  title: string;
  artist: string;
  date: string;
  updown: string;
  duration: string;
  badge: string;
};

export default function SnowlightChart() {
  const { songs, albums, videos } = useLoaderData<{
    songs: Song[];
    albums: Album[];
    videos: Video[];
  }>();
  const [activeTab, setActiveTab] = useState("밸리");
  const [activeFilter, setActiveFilter] = useState("실시간");
  const albumFilters = ["Days", "weekly"];
  return (
    <Layout>
      <main className="bg-white min-h-screen">
        <header className="border-b px-8 py-4 flex items-center space-x-4">
          <h1 className="text-xl font-bold">스노우라이트차트</h1>
          <span className="text-Snowlight-pink font-semibold">| 전체 장르</span>
        </header>
        <nav className="flex space-x-6 px-8 pt-4 border-b">
          {tabs?.map((tab) => (
            <button
              key={tab}
              className={`pb-2 border-b-2 font-medium ${
                activeTab === tab
                  ? "border-Snowlight-pink text-Snowlight-pink"
                  : "border-transparent text-gray-600"
              }`}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
            </button>
          ))}
        </nav>
        {activeTab == "밸리" && (
          <section className="px-8 py-6">
            <div className="flex items-center space-x-2 mb-4">
              {filters.map((filter) => (
                <button
                  key={filter}
                  className={`px-3 py-1 rounded ${
                    activeFilter === filter
                      ? "bg-Snowlight-pink text-white"
                      : "bg-gray-100 text-gray-700"
                  }`}
                  onClick={() => setActiveFilter(filter)}
                >
                  {filter}
                </button>
              ))}
              <span className="ml-auto text-gray-500">
                {new Date().toISOString().slice(0, 16).replace("T", " ")}
              </span>
            </div>
            <div className="flex items-center space-x-2 mb-4">
              <button className="px-3 py-1 bg-red-500 text-white rounded">
                ▶ 듣기
              </button>
              <button className="px-3 py-1 bg-gray-100 rounded">
                + 플레이리스트에 추가
              </button>
              <button className="px-3 py-1 bg-gray-100 rounded">
                내 앨범에 포함
              </button>
              <button className="px-3 py-1 bg-gray-100 rounded">
                ⬇ 다운로드
              </button>
              <button className="px-3 py-1 bg-gray-100 rounded">
                ▶ 전체 듣기 (플레이리스트 추가)
              </button>
              <button className="px-3 py-1 bg-gray-100 rounded">
                ▶ 전체 듣기 (플레이리스트 교체)
              </button>
            </div>
            <table className="w-full text-left border-t">
              <thead>
                <tr className="text-gray-500 text-xs">
                  <th className="py-2 px-2">순위</th>
                  <th className="py-2 px-2">곡명</th>
                  <th className="py-2 px-2">아티스트</th>
                  <th className="py-2 px-2">앨범</th>
                  <th className="py-2 px-2">듣기</th>
                  <th className="py-2 px-2">재생목록</th>
                  <th className="py-2 px-2">내앨범</th>
                  <th className="py-2 px-2">다운</th>
                  <th className="py-2 px-2">영상</th>
                  <th className="py-2 px-2">기타</th>
                </tr>
              </thead>
              <tbody>
                {songs?.map((song) => (
                  <tr key={song.rank} className="border-b hover:bg-gray-50">
                    <td className="py-2 px-2 font-bold">{song.rank}</td>
                    <td className="py-2 px-2 flex items-center space-x-2">
                      <img
                        src={song.cover}
                        alt={song.title}
                        className="w-10 h-10 rounded"
                      />
                      <span>{song.title}</span>
                    </td>
                    <td className="py-2 px-2">{song.artist}</td>
                    <td className="py-2 px-2">{song.album}</td>
                    <td className="py-2 px-2">
                      <button className="text-Snowlight-pink">▶</button>
                    </td>
                    <td className="py-2 px-2">
                      <button className="text-gray-600">+</button>
                    </td>
                    <td className="py-2 px-2">
                      <button className="text-gray-600">📁</button>
                    </td>
                    <td className="py-2 px-2">
                      <button className="text-gray-600">⬇</button>
                    </td>
                    <td className="py-2 px-2">
                      <button className="text-gray-600">🎬</button>
                    </td>
                    <td className="py-2 px-2">
                      <button className="text-gray-600">⋯</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        )}
        {activeTab === "앨범" && (
          <section className="px-8 py-6">
            <div className="flex items-center space-x-2 mb-4">
              {albumFilters?.map((filter) => (
                <button
                  key={filter}
                  className={`px-3 py-1 rounded ${
                    activeFilter === filter
                      ? "bg-Snowlight-pink text-white"
                      : "bg-gray-100 text-gray-700"
                  }`}
                  onClick={() => setActiveFilter(filter)}
                >
                  {filter}
                </button>
              ))}
              <span className="ml-auto text-gray-700 text-lg font-semibold">
                {new Date().toISOString().slice(0, 10).replace(/-/g, ".")}
              </span>
            </div>

            <div className="grid grid-cols-7 gap-6">
              {albums?.map((album) => (
                <div
                  key={album.rank}
                  className="bg-white rounded shadow flex flex-col items-center p-2"
                >
                  <div className="relative w-full">
                    <img
                      src={album.cover}
                      alt={album.title}
                      className="w-full h-48 object-cover rounded"
                    />
                    <button className="absolute bottom-2 right-2 bg-black/60 text-white rounded-full p-2">
                      ▶
                    </button>
                  </div>
                  <div className="mt-2 w-full">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-lg">{album.rank}</span>
                      {album.updown && (
                        <span className="text-red-500 text-xs">
                          {album.updown}
                        </span>
                      )}
                    </div>
                    <div className="font-semibold truncate">{album.title}</div>
                    <div className="text-gray-500 text-sm truncate">
                      {album.artist}
                    </div>
                    <div className="text-gray-400 text-xs">{album.date}</div>
                  </div>
                  <div className="flex justify-end w-full mt-1">
                    <button className="text-gray-400 hover:text-gray-700 px-1">
                      ⋯
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
        {activeTab === "뮤직 PD 앨범" && (
          <section className="px-8 py-6">
            <div className="flex items-center space-x-2 mb-4">
              {albumFilters?.map((filter) => (
                <button
                  key={filter}
                  className={`px-3 py-1 rounded ${
                    activeFilter === filter
                      ? "bg-Snowlight-pink text-white"
                      : "bg-gray-100 text-gray-700"
                  }`}
                  onClick={() => setActiveFilter(filter)}
                >
                  {filter}
                </button>
              ))}
              <span className="ml-auto text-gray-700 text-lg font-semibold">
                {new Date().toISOString().slice(0, 10).replace(/-/g, ".")}
              </span>
            </div>

            <div className="grid grid-cols-7 gap-6">
              {albums?.map((album) => (
                <div
                  key={album.rank}
                  className="bg-white rounded shadow flex flex-col items-center p-2"
                >
                  <div className="relative w-full">
                    <img
                      src={album.cover}
                      alt={album.title}
                      className="w-full h-48 object-cover rounded"
                    />
                    <button className="absolute bottom-2 right-2 bg-black/60 text-white rounded-full p-2">
                      ▶
                    </button>
                  </div>
                  <div className="mt-2 w-full">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-lg">{album.rank}</span>
                      {album.updown && (
                        <span className="text-red-500 text-xs">
                          {album.updown}
                        </span>
                      )}
                    </div>
                    <div className="font-semibold truncate">{album.title}</div>
                    <div className="text-gray-500 text-sm truncate">
                      {album.artist}
                    </div>
                    <div className="text-gray-400 text-xs">{album.date}</div>
                  </div>
                  <div className="flex justify-end w-full mt-1">
                    <button className="text-gray-400 hover:text-gray-700 px-1">
                      ⋯
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
        {activeTab === "이미지" && (
          <section className="px-8 py-6">
            <div className="flex items-center space-x-2 mb-4">
              {albumFilters?.map((filter) => (
                <button
                  key={filter}
                  className={`px-3 py-1 rounded ${
                    activeFilter === filter
                      ? "bg-Snowlight-pink text-white"
                      : "bg-gray-100 text-gray-700"
                  }`}
                  onClick={() => setActiveFilter(filter)}
                >
                  {filter}
                </button>
              ))}
              <span className="ml-auto text-gray-700 text-lg font-semibold">
                {new Date().toISOString().slice(0, 10).replace(/-/g, ".")}
              </span>
            </div>

            <div className="grid grid-cols-7 gap-6">
              {albums?.map((album) => (
                <div
                  key={album.rank}
                  className="bg-white rounded shadow flex flex-col items-center p-2"
                >
                  <div className="relative w-full">
                    <img
                      src={album.cover}
                      alt={album.title}
                      className="w-full h-48 object-cover rounded"
                    />
                    <button className="absolute bottom-2 right-2 bg-black/60 text-white rounded-full p-2">
                      ▶
                    </button>
                  </div>
                  <div className="mt-2 w-full">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-lg">{album.rank}</span>
                      {album.updown && (
                        <span className="text-red-500 text-xs">
                          {album.updown}
                        </span>
                      )}
                    </div>
                    <div className="font-semibold truncate">{album.title}</div>
                    <div className="text-gray-500 text-sm truncate">
                      {album.artist}
                    </div>
                    <div className="text-gray-400 text-xs">{album.date}</div>
                  </div>
                  <div className="flex justify-end w-full mt-1">
                    <button className="text-gray-400 hover:text-gray-700 px-1">
                      ⋯
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
        {activeTab == "연결된 곡" && (
          <section className="px-8 py-6">
            <div className="flex items-center space-x-2 mb-4">
              {filters.map((filter) => (
                <button
                  key={filter}
                  className={`px-3 py-1 rounded ${
                    activeFilter === filter
                      ? "bg-Snowlight-pink text-white"
                      : "bg-gray-100 text-gray-700"
                  }`}
                  onClick={() => setActiveFilter(filter)}
                >
                  {filter}
                </button>
              ))}
              <span className="ml-auto text-gray-500">
                {new Date().toISOString().slice(0, 16).replace("T", " ")}
              </span>
            </div>
            <div className="flex items-center space-x-2 mb-4">
              <button className="px-3 py-1 bg-red-500 text-white rounded">
                ▶ 듣기
              </button>
              <button className="px-3 py-1 bg-gray-100 rounded">
                + 플레이리스트에 추가
              </button>
              <button className="px-3 py-1 bg-gray-100 rounded">
                내 앨범에 포함
              </button>
              <button className="px-3 py-1 bg-gray-100 rounded">
                ⬇ 다운로드
              </button>
              <button className="px-3 py-1 bg-gray-100 rounded">
                ▶ 전체 듣기 (플레이리스트 추가)
              </button>
              <button className="px-3 py-1 bg-gray-100 rounded">
                ▶ 전체 듣기 (플레이리스트 교체)
              </button>
            </div>
            <table className="w-full text-left border-t">
              <thead>
                <tr className="text-gray-500 text-xs">
                  <th className="py-2 px-2">순위</th>
                  <th className="py-2 px-2">곡명</th>
                  <th className="py-2 px-2">아티스트</th>
                  <th className="py-2 px-2">앨범</th>
                  <th className="py-2 px-2">듣기</th>
                  <th className="py-2 px-2">재생목록</th>
                  <th className="py-2 px-2">내앨범</th>
                  <th className="py-2 px-2">다운</th>
                  <th className="py-2 px-2">영상</th>
                  <th className="py-2 px-2">기타</th>
                </tr>
              </thead>
              <tbody>
                {songs?.map((song) => (
                  <tr key={song.rank} className="border-b hover:bg-gray-50">
                    <td className="py-2 px-2 font-bold">{song.rank}</td>
                    <td className="py-2 px-2 flex items-center space-x-2">
                      <img
                        src={song.cover}
                        alt={song.title}
                        className="w-10 h-10 rounded"
                      />
                      <span>{song.title}</span>
                    </td>
                    <td className="py-2 px-2">{song.artist}</td>
                    <td className="py-2 px-2">{song.album}</td>
                    <td className="py-2 px-2">
                      <button className="text-Snowlight-pink">▶</button>
                    </td>
                    <td className="py-2 px-2">
                      <button className="text-gray-600">+</button>
                    </td>
                    <td className="py-2 px-2">
                      <button className="text-gray-600">📁</button>
                    </td>
                    <td className="py-2 px-2">
                      <button className="text-gray-600">⬇</button>
                    </td>
                    <td className="py-2 px-2">
                      <button className="text-gray-600">🎬</button>
                    </td>
                    <td className="py-2 px-2">
                      <button className="text-gray-600">⋯</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        )}
        {activeTab === "연결된 영상" && (
          <section className="px-8 py-6">
            <div className="flex items-center space-x-2 mb-4">
              {videoFilters.map((filter) => (
                <button
                  key={filter}
                  className={`px-3 py-1 rounded ${
                    activeFilter === filter
                      ? "bg-Snowlight-pink text-white"
                      : "bg-gray-100 text-gray-700"
                  }`}
                  onClick={() => setActiveFilter(filter)}
                >
                  {filter}
                </button>
              ))}
              <span className="ml-auto text-gray-700 text-lg font-semibold">
                {new Date().toISOString().slice(0, 10).replace(/-/g, ".")}
              </span>
            </div>
            <div className="grid grid-cols-6 gap-6">
              {videos.map((video) => (
                <div
                  key={video.rank}
                  className="bg-white rounded shadow flex flex-col items-center p-2"
                >
                  <div className="relative w-full">
                    <img
                      src={video.cover}
                      alt={video.title}
                      className="w-full h-32 object-cover rounded"
                    />
                    <span className="absolute bottom-2 right-2 bg-black/60 text-white rounded px-2 py-1 text-xs">
                      {video.duration}
                    </span>
                  </div>
                  <div className="mt-2 w-full">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-lg">{video.rank}</span>
                      {video.updown && (
                        <span className="text-red-500 text-xs">
                          {video.updown}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center space-x-1">
                      <span className="bg-gray-200 text-green-600 text-xs px-1 rounded">
                        {video.badge}
                      </span>
                      <span className="font-semibold truncate">
                        {video.title}
                      </span>
                    </div>
                    <div className="text-gray-500 text-sm truncate">
                      {video.artist}
                    </div>
                    <div className="text-gray-400 text-xs">{video.date}</div>
                  </div>
                  <div className="flex justify-end w-full mt-1">
                    <button className="text-gray-400 hover:text-gray-700 px-1">
                      ⋯
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </main>
    </Layout>
  );
}
